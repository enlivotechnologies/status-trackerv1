import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { WorkStatus } from '@prisma/client';

export const createCollegeWork = async (req: AuthRequest, res: Response) => {
  try {
    const { collegeId, title, description, dueDate } = req.body;

    if (!collegeId || !title || !dueDate) {
      return res.status(400).json({ message: 'College ID, title, and due date are required' });
    }

    // Verify the college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId }
    });

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Agents can only add work to their own colleges
    if (req.userRole === 'AGENT' && college.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const work = await prisma.collegeWork.create({
      data: {
        collegeId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        assignedToId: college.assignedToId,
        status: WorkStatus.PENDING
      },
      include: {
        college: {
          select: {
            id: true,
            collegeName: true,
            contactPerson: true
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
    console.error('Create college work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollegeWorks = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    // Agents only see their own works
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const works = await prisma.collegeWork.findMany({
      where,
      include: {
        college: {
          select: {
            id: true,
            collegeName: true,
            contactPerson: true,
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
    console.error('Get college works error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollegeWorkStats = async (req: AuthRequest, res: Response) => {
  try {
    const where: any = {};

    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [totalWorks, completedWorks, pendingWorks, worksDueToday] = await Promise.all([
      prisma.collegeWork.count({ where }),
      prisma.collegeWork.count({ where: { ...where, status: WorkStatus.COMPLETED } }),
      prisma.collegeWork.count({ where: { ...where, status: WorkStatus.PENDING } }),
      prisma.collegeWork.count({
        where: {
          ...where,
          status: WorkStatus.PENDING,
          dueDate: { gte: startOfDay, lt: endOfDay }
        }
      })
    ]);

    const recentCompletedWorks = await prisma.collegeWork.findMany({
      where: { ...where, status: WorkStatus.COMPLETED },
      include: {
        college: {
          select: {
            id: true,
            collegeName: true,
            contactPerson: true
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 5
    });

    const pendingWorksList = await prisma.collegeWork.findMany({
      where: { ...where, status: WorkStatus.PENDING },
      include: {
        college: {
          select: {
            id: true,
            collegeName: true,
            contactPerson: true,
            phone: true
          }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    });

    res.json({
      totalWorks,
      completedWorks,
      pendingWorks,
      worksDueToday,
      recentCompletedWorks,
      pendingWorksList
    });
  } catch (error) {
    console.error('Get college work stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCollegeWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;

    const work = await prisma.collegeWork.findUnique({
      where: { id }
    });

    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    // Agents can only update their own works
    if (req.userRole === 'AGENT' && work.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = new Date(dueDate);
    if (status !== undefined) {
      data.status = status as WorkStatus;
      if (status === WorkStatus.COMPLETED) {
        data.completedAt = new Date();
      }
    }

    const updatedWork = await prisma.collegeWork.update({
      where: { id },
      data,
      include: {
        college: {
          select: {
            id: true,
            collegeName: true,
            contactPerson: true
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

    res.json(updatedWork);
  } catch (error) {
    console.error('Update college work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeCollegeWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const work = await prisma.collegeWork.findUnique({
      where: { id }
    });

    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    // Agents can only complete their own works
    if (req.userRole === 'AGENT' && work.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedWork = await prisma.collegeWork.update({
      where: { id },
      data: {
        status: WorkStatus.COMPLETED,
        completedAt: new Date()
      },
      include: {
        college: {
          select: {
            id: true,
            collegeName: true,
            contactPerson: true
          }
        }
      }
    });

    res.json(updatedWork);
  } catch (error) {
    console.error('Complete college work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCollegeWork = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const work = await prisma.collegeWork.findUnique({
      where: { id }
    });

    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    // Agents can only delete their own works
    if (req.userRole === 'AGENT' && work.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.collegeWork.delete({
      where: { id }
    });

    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Delete college work error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
