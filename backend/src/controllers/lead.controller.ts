import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { LeadStatus, LeadSource, FollowUpStatus, WorkStatus } from '@prisma/client';

// Helper function to calculate expected commission
const calculateCommission = (dealValue: number, percentage: number): number => {
  return (dealValue * percentage) / 100;
};

// Helper function to log activity
const logActivity = async (
  leadId: string,
  agentId: string,
  agentName: string,
  action: string,
  description: string,
  oldValue?: string,
  newValue?: string
) => {
  try {
    await prisma.activityLog.create({
      data: {
        leadId,
        agentId,
        agentName,
        action,
        description,
        oldValue,
        newValue
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, phone, project, location, source, status, followUpDate, followUpStatus, assignedToId,
      expectedDealValue, commissionPercentage 
    } = req.body;

    // Validation
    if (!name || !phone || !source || !followUpDate) {
      return res.status(400).json({ message: 'Name, phone, source, and followUpDate are required' });
    }

    // Follow-up date is mandatory - cannot create lead without it
    const followUp = new Date(followUpDate);
    if (isNaN(followUp.getTime())) {
      return res.status(400).json({ message: 'Invalid follow-up date' });
    }

    // If assignedToId not provided, assign to current user (agent)
    const assignedTo = assignedToId || req.userId;
    
    // Calculate commission
    const dealValue = expectedDealValue || 0;
    const commPercent = commissionPercentage || 2; // Default 2%
    const expectedCommission = calculateCommission(dealValue, commPercent);

    // Get agent name for activity log
    const agent = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true }
    });

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        project: project || null,
        location: location || null,
        source: source as LeadSource,
        status: (status as LeadStatus) || LeadStatus.NEW,
        followUpDate: followUp,
        followUpStatus: (followUpStatus as FollowUpStatus) || FollowUpStatus.PENDING,
        assignedToId: assignedTo,
        expectedDealValue: dealValue,
        commissionPercentage: commPercent,
        expectedCommission: expectedCommission,
        lastContactedDate: null
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity for lead creation
    await logActivity(
      lead.id,
      req.userId!,
      agent?.name || 'Unknown',
      'LEAD_CREATED',
      `Lead created with status ${lead.status}`,
      undefined,
      lead.status
    );

    // Automatically create a work item for this lead's follow-up
    try {
      await prisma.work.create({
        data: {
          leadId: lead.id,
          title: `Follow up with ${lead.name}`,
          description: `Follow up call/meeting scheduled for ${lead.name} (${lead.phone})`,
          dueDate: followUp,
          assignedToId: assignedTo,
          status: WorkStatus.PENDING,
          completedAt: null
        }
      });
      console.log(`[Lead Created] Work item created for lead ${lead.id} (${lead.name})`);
    } catch (workError) {
      console.error(`[Lead Created] Failed to create work item for lead ${lead.id}:`, workError);
      // Don't fail the lead creation if work creation fails
    }

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    // Agents only see their own leads
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get latest note
        }
      },
      orderBy: { followUpDate: 'asc' }
    });

    // Add isOverdue flag to each lead
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const leadsWithOverdue = leads.map(lead => ({
      ...lead,
      isOverdue: lead.followUpDate < today && 
                 lead.status !== LeadStatus.CLOSED && 
                 lead.status !== LeadStatus.LOST
    }));

    res.json(leadsWithOverdue);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const where: any = { id };

    // Agents can only access their own leads
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const lead = await prisma.lead.findFirst({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit to last 50 activities
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Add isOverdue flag
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = lead.followUpDate < today && 
                      lead.status !== LeadStatus.CLOSED && 
                      lead.status !== LeadStatus.LOST;

    res.json({ ...lead, isOverdue });
  } catch (error) {
    console.error('Get lead by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, phone, project, location, source, status, followUpDate, followUpStatus, assignedToId,
      expectedDealValue, commissionPercentage 
    } = req.body;

    // Check if lead exists and user has access
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        ...(req.userRole === 'AGENT' ? { assignedToId: req.userId } : {})
      }
    });

    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Get agent name for activity logging
    const agent = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true }
    });

    // Follow-up date is mandatory - cannot update to remove it
    if (followUpDate) {
      const followUp = new Date(followUpDate);
      if (isNaN(followUp.getTime())) {
        return res.status(400).json({ message: 'Invalid follow-up date' });
      }
    }

    const updateData: any = {};
    const activityLogs: Array<{action: string, description: string, oldValue?: string, newValue?: string}> = [];
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (project !== undefined) updateData.project = project;
    if (location !== undefined) updateData.location = location;
    if (source) updateData.source = source as LeadSource;
    
    // Handle money visibility fields
    if (expectedDealValue !== undefined) {
      updateData.expectedDealValue = expectedDealValue;
      // Recalculate commission
      const commPercent = commissionPercentage !== undefined ? commissionPercentage : (existingLead.commissionPercentage || 2);
      updateData.expectedCommission = calculateCommission(expectedDealValue, commPercent);
    }
    
    if (commissionPercentage !== undefined) {
      updateData.commissionPercentage = commissionPercentage;
      // Recalculate commission
      const dealValue = expectedDealValue !== undefined ? expectedDealValue : (existingLead.expectedDealValue || 0);
      updateData.expectedCommission = calculateCommission(dealValue, commissionPercentage);
    }
    
    let newFollowUpDate: Date | null = null;
    if (followUpDate) {
      newFollowUpDate = new Date(followUpDate);
      updateData.followUpDate = newFollowUpDate;
      
      // Log follow-up date change
      activityLogs.push({
        action: 'FOLLOWUP_UPDATE',
        description: `Follow-up date changed`,
        oldValue: existingLead.followUpDate?.toISOString().split('T')[0],
        newValue: newFollowUpDate.toISOString().split('T')[0]
      });
    }
    
    // Handle status and followUpStatus updates with bidirectional consistency
    if (status) {
      const oldStatus = existingLead.status;
      updateData.status = status as LeadStatus;
      
      // Log status change
      if (oldStatus !== status) {
        activityLogs.push({
          action: 'STATUS_CHANGE',
          description: `Status changed from ${oldStatus} to ${status}`,
          oldValue: oldStatus,
          newValue: status
        });
        
        // Update lastContactedDate when status changes (indicates interaction)
        updateData.lastContactedDate = new Date();
      }
      
      // If status is set to CLOSED, ensure followUpStatus is COMPLETED
      if (status === LeadStatus.CLOSED && existingLead.followUpStatus !== FollowUpStatus.COMPLETED) {
        updateData.followUpStatus = FollowUpStatus.COMPLETED;
        console.log(`Lead ${id} followUpStatus updated to COMPLETED because status is CLOSED`);
      }
    }
    
    if (followUpStatus !== undefined) {
      // Validate the followUpStatus value
      const validFollowUpStatuses = Object.values(FollowUpStatus);
      if (!validFollowUpStatuses.includes(followUpStatus as FollowUpStatus)) {
        console.error(`Invalid followUpStatus value: ${followUpStatus}. Valid values:`, validFollowUpStatuses);
        return res.status(400).json({ message: `Invalid follow-up status: ${followUpStatus}` });
      }
      
      const oldFollowUpStatus = existingLead.followUpStatus;
      updateData.followUpStatus = followUpStatus as FollowUpStatus;
      
      // Log follow-up status change
      if (oldFollowUpStatus !== followUpStatus) {
        activityLogs.push({
          action: 'FOLLOWUP_STATUS_CHANGE',
          description: `Follow-up status changed from ${oldFollowUpStatus || 'none'} to ${followUpStatus}`,
          oldValue: oldFollowUpStatus || undefined,
          newValue: followUpStatus
        });
        
        // Update lastContactedDate when follow-up status changes
        updateData.lastContactedDate = new Date();
      }
      
      console.log(`Updating lead ${id} followUpStatus to: ${followUpStatus}`);
      
      // Handle status changes based on followUpStatus
      // If changing FROM SITE_VISIT_DONE to something else, update the main status appropriately
      if (existingLead.followUpStatus === FollowUpStatus.SITE_VISIT_DONE && followUpStatus !== FollowUpStatus.SITE_VISIT_DONE) {
        // If currently SITE_VISIT_DONE and changing to something else, update main status
        if (followUpStatus === FollowUpStatus.COMPLETED) {
          updateData.status = LeadStatus.CLOSED;
          console.log(`Lead ${id} status updated to CLOSED because followUpStatus changed from SITE_VISIT_DONE to COMPLETED`);
        } else if (followUpStatus === FollowUpStatus.NOT_NEGOTIABLE) {
          updateData.status = LeadStatus.LOST;
          console.log(`Lead ${id} status updated to LOST because followUpStatus changed from SITE_VISIT_DONE to NOT_NEGOTIABLE`);
        } else {
          // For other statuses (Interested, Select Date, etc.), move back to CONTACTED
          updateData.status = LeadStatus.CONTACTED;
          console.log(`Lead ${id} status updated to CONTACTED because followUpStatus changed from SITE_VISIT_DONE to ${followUpStatus}`);
        }
      }
      // If follow-up status is SITE_VISIT_DONE, update lead status to SITE_VISIT_DONE
      else if (followUpStatus === FollowUpStatus.SITE_VISIT_DONE && existingLead.status !== LeadStatus.SITE_VISIT_DONE) {
        updateData.status = LeadStatus.SITE_VISIT_DONE;
        console.log(`Lead ${id} status updated to SITE_VISIT_DONE because followUpStatus is SITE_VISIT_DONE`);
      }
      // If follow-up status is COMPLETED, update lead status to CLOSED
      // Only if the current status is not already CLOSED or LOST
      else if (followUpStatus === FollowUpStatus.COMPLETED && existingLead.status !== LeadStatus.CLOSED && existingLead.status !== LeadStatus.LOST) {
        updateData.status = LeadStatus.CLOSED;
        // Prisma will automatically update updatedAt when we update the record
        console.log(`Lead ${id} status updated to CLOSED because followUpStatus is COMPLETED`);
      }
      // If follow-up status is NOT_NEGOTIABLE, update lead status to LOST
      else if (followUpStatus === FollowUpStatus.NOT_NEGOTIABLE && existingLead.status !== LeadStatus.LOST && existingLead.status !== LeadStatus.CLOSED) {
        updateData.status = LeadStatus.LOST;
        console.log(`Lead ${id} status updated to LOST because followUpStatus is NOT_NEGOTIABLE`);
      }
    }
    // Only admin can reassign leads
    if (assignedToId && req.userRole === 'ADMIN') {
      updateData.assignedToId = assignedToId;
    }

    try {
      const lead = await prisma.lead.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          notes: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // Log the updated lead for debugging
      console.log(`Lead ${id} updated successfully. Status: ${lead.status}, FollowUpStatus: ${lead.followUpStatus}, UpdatedAt: ${lead.updatedAt}`);
      
      // Handle work item creation/update when follow-up date changes
      // Only create/update work if follow-up date was updated and status is not COMPLETED/NOT_NEGOTIABLE
      const finalFollowUpStatus = updateData.followUpStatus !== undefined ? updateData.followUpStatus : existingLead.followUpStatus;
      const shouldCreateWork = finalFollowUpStatus !== FollowUpStatus.COMPLETED && 
                              finalFollowUpStatus !== FollowUpStatus.NOT_NEGOTIABLE &&
                              finalFollowUpStatus !== FollowUpStatus.SITE_VISIT_DONE;

      if (newFollowUpDate && shouldCreateWork) {
        try {
          // Check if a pending work already exists for this lead
          const existingWork = await prisma.work.findFirst({
            where: {
              leadId: id,
              status: WorkStatus.PENDING,
              completedAt: null
            }
          });

          const finalAssignedToId = updateData.assignedToId || existingLead.assignedToId;
          const finalLeadName = updateData.name || existingLead.name;

          if (existingWork) {
            // Update existing pending work
            await prisma.work.update({
              where: { id: existingWork.id },
              data: {
                title: `Follow up with ${finalLeadName}`,
                description: `Follow up call/meeting scheduled for ${finalLeadName} (${lead.phone})`,
                dueDate: newFollowUpDate,
                assignedToId: finalAssignedToId
              }
            });
            console.log(`[Lead Updated] Work item updated for lead ${id} (${finalLeadName})`);
          } else {
            // Create new work item
            await prisma.work.create({
              data: {
                leadId: id,
                title: `Follow up with ${finalLeadName}`,
                description: `Follow up call/meeting scheduled for ${finalLeadName} (${lead.phone})`,
                dueDate: newFollowUpDate,
                assignedToId: finalAssignedToId,
                status: WorkStatus.PENDING,
                completedAt: null
              }
            });
            console.log(`[Lead Updated] Work item created for lead ${id} (${finalLeadName})`);
          }
        } catch (workError) {
          console.error(`[Lead Updated] Failed to create/update work item for lead ${id}:`, workError);
          // Don't fail the lead update if work creation/update fails
        }
      }

      // If follow-up status is COMPLETED or NOT_NEGOTIABLE, mark all pending works as completed
      if (finalFollowUpStatus === FollowUpStatus.COMPLETED || finalFollowUpStatus === FollowUpStatus.NOT_NEGOTIABLE) {
        try {
          await prisma.work.updateMany({
            where: {
              leadId: id,
              status: WorkStatus.PENDING,
              completedAt: null
            },
            data: {
              status: WorkStatus.COMPLETED,
              completedAt: new Date()
            }
          });
          console.log(`[Lead Updated] All pending works marked as completed for lead ${id}`);
        } catch (workError) {
          console.error(`[Lead Updated] Failed to mark works as completed for lead ${id}:`, workError);
        }
      }
      
      // Log all activity changes
      for (const activityLog of activityLogs) {
        await logActivity(
          id,
          req.userId!,
          agent?.name || 'Unknown',
          activityLog.action,
          activityLog.description,
          activityLog.oldValue,
          activityLog.newValue
        );
      }
      
      res.json(lead);
    } catch (prismaError: any) {
      console.error('Prisma update error:', prismaError);
      console.error('Update data attempted:', JSON.stringify(updateData, null, 2));
      console.error('Error code:', prismaError.code);
      console.error('Error message:', prismaError.message);
      
      // Handle specific Prisma errors
      if (prismaError.code === 'P2002') {
        return res.status(400).json({ message: 'A lead with this information already exists' });
      }
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      return res.status(500).json({ 
        message: 'Failed to update lead', 
        error: process.env.NODE_ENV === 'development' ? prismaError.message : undefined 
      });
    }
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLeadsToCallToday = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'today' } = req.query; // 'today', 'week', 'month'
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      // This week (start of week to end of week)
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start
      startDate = new Date(today);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === 'month') {
      // This month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else {
      // Today (default)
      startDate = today;
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
    }

    const where: any = {};

    // For "today" period, show leads created today
    // For "week" and "month", show leads created in that period
    if (period === 'today') {
      where.createdAt = {
        gte: startDate,
        lt: endDate
      };
    } else {
      // For week and month, show leads created in that period
      where.createdAt = {
        gte: startDate,
        lt: endDate
      };
    }

    // Agents only see their own leads
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const leads = await prisma.lead.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        followUpDate: true,
        project: true,
        location: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' } // Show newest first
    });

    res.json(leads);
  } catch (error) {
    console.error('Get leads to call today error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLeadsByAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;

    const leads = await prisma.lead.findMany({
      where: { assignedToId: agentId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { followUpDate: 'asc' }
    });

    res.json(leads);
  } catch (error) {
    console.error('Get leads by agent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
