import express from 'express';
import {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  getCollegesToFollowUpToday,
  getCollegesByAgent,
  getCollegeStats
} from '../controllers/college.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Agent and Admin routes
router.get('/stats', getCollegeStats);
router.get('/today', getCollegesToFollowUpToday);
router.get('/my-colleges', getColleges);
router.get('/:id', getCollegeById);
router.post('/', createCollege);
router.put('/:id', updateCollege);

// Admin only routes
router.get('/admin/all', authorize(UserRole.ADMIN), getColleges);
router.get('/admin/agent/:agentId', authorize(UserRole.ADMIN), getCollegesByAgent);

export default router;
