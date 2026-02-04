import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createCollegeNote = async (req: AuthRequest, res: Response) => {
  try {
    const { collegeId, content } = req.body;

    if (!collegeId || !content) {
      return res.status(400).json({ message: 'College ID and content are required' });
    }

    // Verify the college exists and user has access
    const college = await prisma.college.findUnique({
      where: { id: collegeId }
    });

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Agents can only add notes to their own colleges
    if (req.userRole === 'AGENT' && college.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const note = await prisma.collegeNote.create({
      data: {
        collegeId,
        content
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create college note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCollegeNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { collegeId } = req.params;

    // Verify the college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId }
    });

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Agents can only view notes for their own colleges
    if (req.userRole === 'AGENT' && college.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notes = await prisma.collegeNote.findMany({
      where: { collegeId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    console.error('Get college notes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCollegeNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await prisma.collegeNote.findUnique({
      where: { id },
      include: { college: true }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Agents can only delete notes for their own colleges
    if (req.userRole === 'AGENT' && note.college.assignedToId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.collegeNote.delete({
      where: { id }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete college note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
