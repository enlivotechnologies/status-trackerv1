import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { CollegeStatus, CollegeFollowUpStatus, WorkStatus, SeminarStatus } from '@prisma/client';

// Helper function to log activity
const logCollegeActivity = async (
  collegeId: string,
  agentId: string,
  agentName: string,
  action: string,
  description: string,
  oldValue?: string,
  newValue?: string
) => {
  try {
    await prisma.collegeActivityLog.create({
      data: {
        collegeId,
        agentId,
        agentName,
        action,
        description,
        oldValue,
        newValue
      }
    });
  } catch (error) {
    console.error('Failed to log college activity:', error);
  }
};

export const createCollege = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      collegeName, contactPerson, phone, email, address, city,
      seminarDate, seminarStatus, followUpDate, status, followUpStatus, assignedToId
    } = req.body;

    // Validation
    if (!collegeName || !contactPerson || !phone || !followUpDate) {
      return res.status(400).json({ 
        message: 'College name, contact person, phone, and follow-up date are required' 
      });
    }

    // Follow-up date is mandatory
    const followUp = new Date(followUpDate);
    if (isNaN(followUp.getTime())) {
      return res.status(400).json({ message: 'Invalid follow-up date' });
    }

    // Parse seminar date if provided
    let seminar = null;
    if (seminarDate) {
      seminar = new Date(seminarDate);
      if (isNaN(seminar.getTime())) {
        return res.status(400).json({ message: 'Invalid seminar date' });
      }
    }

    // If assignedToId not provided, assign to current user (agent)
    const assignedTo = assignedToId || req.userId;

    // Get agent name for activity log
    const agent = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true }
    });

    const college = await prisma.college.create({
      data: {
        collegeName,
        contactPerson,
        phone,
        email: email || null,
        address: address || null,
        city: city || null,
        seminarDate: seminar,
        seminarStatus: (seminarStatus as SeminarStatus) || SeminarStatus.NOT_YET_SCHEDULED,
        followUpDate: followUp,
        status: (status as CollegeStatus) || CollegeStatus.NEW,
        followUpStatus: (followUpStatus as CollegeFollowUpStatus) || CollegeFollowUpStatus.PENDING,
        assignedToId: assignedTo,
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

    // Log activity for college creation
    await logCollegeActivity(
      college.id,
      req.userId!,
      agent?.name || 'Unknown',
      'COLLEGE_CREATED',
      `College created with status ${college.status}`,
      undefined,
      college.status
    );

    // Automatically create a work item for this college's follow-up
    try {
      await prisma.collegeWork.create({
        data: {
          collegeId: college.id,
          title: `Follow up with ${college.collegeName}`,
          description: `Follow up call/meeting scheduled for ${college.collegeName} (${college.contactPerson})`,
          dueDate: followUp,
          assignedToId: assignedTo,
          status: WorkStatus.PENDING,
          completedAt: null
        }
      });
      console.log(`[College Created] Work item created for college ${college.id} (${college.collegeName})`);
    } catch (workError) {
      console.error(`[College Created] Failed to create work item for college ${college.id}:`, workError);
    }

    res.status(201).json(college);
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getColleges = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    // Agents only see their own colleges
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const colleges = await prisma.college.findMany({
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
          take: 1
        }
      },
      orderBy: { followUpDate: 'asc' }
    });

    res.json(colleges);
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollegeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({
      where: { id },
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
        works: {
          orderBy: { dueDate: 'asc' }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Agents can only view their own colleges
    if (req.userRole === 'AGENT' && college.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(college);
  } catch (error) {
    console.error('Get college by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCollege = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get current college data for comparison
    const currentCollege = await prisma.college.findUnique({
      where: { id }
    });

    if (!currentCollege) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Agents can only update their own colleges
    if (req.userRole === 'AGENT' && currentCollege.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get agent name for activity log
    const agent = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true }
    });

    // Prepare update data
    const data: any = {};

    if (updateData.collegeName !== undefined) data.collegeName = updateData.collegeName;
    if (updateData.contactPerson !== undefined) data.contactPerson = updateData.contactPerson;
    if (updateData.phone !== undefined) data.phone = updateData.phone;
    if (updateData.email !== undefined) data.email = updateData.email;
    if (updateData.address !== undefined) data.address = updateData.address;
    if (updateData.city !== undefined) data.city = updateData.city;
    
    if (updateData.seminarDate !== undefined) {
      data.seminarDate = updateData.seminarDate ? new Date(updateData.seminarDate) : null;
    }
    
    if (updateData.followUpDate !== undefined) {
      data.followUpDate = new Date(updateData.followUpDate);
    }
    
    if (updateData.status !== undefined) {
      data.status = updateData.status as CollegeStatus;
    }
    
    if (updateData.followUpStatus !== undefined) {
      data.followUpStatus = updateData.followUpStatus as CollegeFollowUpStatus;
    }

    // Update lastContactedDate when status changes to CONTACTED or beyond
    if (updateData.status && updateData.status !== 'NEW') {
      data.lastContactedDate = new Date();
    }

    const college = await prisma.college.update({
      where: { id },
      data,
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

    // Log status change
    if (updateData.status && updateData.status !== currentCollege.status) {
      await logCollegeActivity(
        college.id,
        req.userId!,
        agent?.name || 'Unknown',
        'STATUS_CHANGE',
        `Status changed from ${currentCollege.status} to ${updateData.status}`,
        currentCollege.status,
        updateData.status
      );
    }

    // Log follow-up status change
    if (updateData.followUpStatus && updateData.followUpStatus !== currentCollege.followUpStatus) {
      await logCollegeActivity(
        college.id,
        req.userId!,
        agent?.name || 'Unknown',
        'FOLLOWUP_STATUS_CHANGE',
        `Follow-up status changed from ${currentCollege.followUpStatus} to ${updateData.followUpStatus}`,
        currentCollege.followUpStatus || undefined,
        updateData.followUpStatus
      );
    }

    // Log seminar date change
    if (updateData.seminarDate && updateData.seminarDate !== currentCollege.seminarDate?.toISOString()) {
      await logCollegeActivity(
        college.id,
        req.userId!,
        agent?.name || 'Unknown',
        'SEMINAR_DATE_CHANGE',
        `Seminar date scheduled for ${new Date(updateData.seminarDate).toLocaleDateString()}`,
        currentCollege.seminarDate?.toISOString(),
        updateData.seminarDate
      );
    }

    // Create/update work item if follow-up date changed
    if (updateData.followUpDate) {
      const newFollowUpDate = new Date(updateData.followUpDate);
      
      // Find existing pending work for this college
      const existingWork = await prisma.collegeWork.findFirst({
        where: {
          collegeId: college.id,
          status: WorkStatus.PENDING,
          title: { contains: 'Follow up with' }
        }
      });

      if (existingWork) {
        await prisma.collegeWork.update({
          where: { id: existingWork.id },
          data: { dueDate: newFollowUpDate }
        });
      } else {
        await prisma.collegeWork.create({
          data: {
            collegeId: college.id,
            title: `Follow up with ${college.collegeName}`,
            description: `Follow up call/meeting scheduled`,
            dueDate: newFollowUpDate,
            assignedToId: college.assignedToId,
            status: WorkStatus.PENDING
          }
        });
      }
    }

    res.json(college);
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollegesToFollowUpToday = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'today' } = req.query;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let endDate: Date;

    switch (period) {
      case 'week':
        endDate = new Date(startOfDay);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate = new Date(startOfDay);
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      default: // today
        endDate = new Date(startOfDay);
        endDate.setDate(endDate.getDate() + 1);
    }

    const where: any = {
      followUpDate: {
        gte: startOfDay,
        lt: endDate
      },
      status: {
        notIn: [CollegeStatus.CONVERTED, CollegeStatus.NOT_INTERESTED]
      }
    };

    // Agents only see their own colleges
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const colleges = await prisma.college.findMany({
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
          take: 1
        }
      },
      orderBy: { followUpDate: 'asc' }
    });

    res.json(colleges);
  } catch (error) {
    console.error('Get colleges to follow up today error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollegesByAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;

    const colleges = await prisma.college.findMany({
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

    res.json(colleges);
  } catch (error) {
    console.error('Get colleges by agent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// College Stats for Dashboard
export const getCollegeStats = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    // Agents only see their own stats
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [
      totalColleges,
      followUpsToday,
      seminarsScheduled,
      seminarsDone,
      converted,
      pendingWorks
    ] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.count({
        where: {
          ...where,
          followUpDate: { gte: startOfDay, lt: endOfDay },
          status: { notIn: [CollegeStatus.CONVERTED, CollegeStatus.NOT_INTERESTED] }
        }
      }),
      prisma.college.count({
        where: { ...where, status: CollegeStatus.SEMINAR_SCHEDULED }
      }),
      prisma.college.count({
        where: { ...where, status: CollegeStatus.SEMINAR_DONE }
      }),
      prisma.college.count({
        where: { ...where, status: CollegeStatus.CONVERTED }
      }),
      prisma.collegeWork.count({
        where: {
          status: WorkStatus.PENDING,
          ...(req.userRole === 'AGENT' ? { assignedToId: req.userId } : {})
        }
      })
    ]);

    res.json({
      totalColleges,
      followUpsToday,
      seminarsScheduled,
      seminarsDone,
      converted,
      pendingWorks
    });
  } catch (error) {
    console.error('Get college stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
