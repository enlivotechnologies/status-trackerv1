import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, content } = req.body;

    if (!leadId || !content) {
      return res.status(400).json({ message: 'Lead ID and content are required' });
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

    const note = await prisma.note.create({
      data: {
        leadId,
        content
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNotesByLead = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;

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

    const notes = await prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    console.error('Get notes by lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
