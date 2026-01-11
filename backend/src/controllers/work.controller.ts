import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { WorkStatus, FollowUpStatus } from '@prisma/client';

export const createWork = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, title, description, dueDate } = req.body;

    if (!leadId || !title || !dueDate) {
      return res.status(400).json({ message: 'Lead ID, title, and due date are required' });
    }

    // Verify lead exists and user has access
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        ...(req.userRole === 'AGENT' ? { assignedToId: req.userId } : {})
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const work = await prisma.work.create({
      data: {
        leadId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        assignedToId: req.userId,
        status: WorkStatus.PENDING,
        completedAt: null // Explicitly set to null for consistency
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(work);
  } catch (error) {
    console.error('Create work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorks = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    // Agents only see their own works
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const works = await prisma.work.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(works);
  } catch (error) {
    console.error('Get works error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPendingWorksFromYesterday = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get works that were due on previous days (before today) and are still pending
    // Exclude works where the lead's followUpStatus is COMPLETED or NOT_NEGOTIABLE
    const baseWhere: any = {
      status: WorkStatus.PENDING,
      completedAt: null,
      dueDate: {
        lt: today // Only works due before today (all previous days)
      }
    };

    // Agents only see their own pending work
    if (req.userRole === 'AGENT') {
      baseWhere.assignedToId = req.userId;
    }

    // Fetch all works matching the date criteria
    let allWorks = [];
    try {
      allWorks = await prisma.work.findMany({
        where: baseWhere,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              followUpStatus: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { dueDate: 'asc' } // Order by due date, oldest first
      });
    } catch (error) {
      console.error('[Work Controller] Error fetching pending works from previous days:', error);
      allWorks = [];
    }

    // Filter out works where lead's followUpStatus is COMPLETED or NOT_NEGOTIABLE
    const works = allWorks.filter(work => {
      // Safety check: if lead doesn't exist, include the work (shouldn't happen but be safe)
      if (!work || !work.lead) {
        return true;
      }
      const followUpStatus = work.lead.followUpStatus;
      return followUpStatus !== FollowUpStatus.COMPLETED && 
             followUpStatus !== FollowUpStatus.NOT_NEGOTIABLE;
    });

    console.log(`Pending works from previous days for user ${req.userId}: ${works.length}`);
    res.json(works);
  } catch (error: any) {
    console.error('Get pending works from yesterday error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

export const updateWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status, completedAt } = req.body;

    // Check if work exists and user has access
    const existingWork = await prisma.work.findFirst({
      where: {
        id,
        ...(req.userRole === 'AGENT' ? { assignedToId: req.userId } : {})
      }
    });

    if (!existingWork) {
      return res.status(404).json({ message: 'Work not found' });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status) {
      updateData.status = status as WorkStatus;
      // Ensure consistency: if status is COMPLETED, set completedAt
      if (status === WorkStatus.COMPLETED && !existingWork.completedAt) {
        updateData.completedAt = new Date();
      }
      // If status is PENDING, clear completedAt
      if (status === WorkStatus.PENDING && existingWork.completedAt) {
        updateData.completedAt = null;
      }
    }
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
      // If marking as completed, update status
      if (completedAt) {
        updateData.status = WorkStatus.COMPLETED;
      } else if (existingWork.status === WorkStatus.COMPLETED) {
        // If clearing completedAt, set status back to PENDING
        updateData.status = WorkStatus.PENDING;
      }
    }

    const work = await prisma.work.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log the update for debugging
    console.log(`[Work Update] Work ${id} updated. Status: ${work.status}, CompletedAt: ${work.completedAt}, AssignedToId: ${work.assignedToId}`);

    res.json(work);
  } catch (error) {
    console.error('Update work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if work exists and user has access
    const existingWork = await prisma.work.findFirst({
      where: {
        id,
        ...(req.userRole === 'AGENT' ? { assignedToId: req.userId } : {})
      }
    });

    if (!existingWork) {
      return res.status(404).json({ message: 'Work not found' });
    }

    const work = await prisma.work.update({
      where: { id },
      data: {
        status: WorkStatus.COMPLETED,
        completedAt: new Date()
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log the completion for debugging
    console.log(`[Work Complete] Work ${id} completed. Status: ${work.status}, CompletedAt: ${work.completedAt}, AssignedToId: ${work.assignedToId}`);

    res.json(work);
  } catch (error) {
    console.error('Complete work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if work exists and user has access
    const existingWork = await prisma.work.findFirst({
      where: {
        id,
        ...(req.userRole === 'AGENT' ? { assignedToId: req.userId } : {})
      }
    });

    if (!existingWork) {
      return res.status(404).json({ message: 'Work not found' });
    }

    await prisma.work.delete({
      where: { id }
    });

    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Delete work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
