import express from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  getLeadsToCallToday,
  getLeadsByAgent
} from '../controllers/lead.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Agent and Admin routes
router.get('/today', getLeadsToCallToday);
router.get('/my-leads', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);

// Admin only routes
router.get('/admin/all', authorize(UserRole.ADMIN), getLeads);
router.get('/admin/agent/:agentId', authorize(UserRole.ADMIN), getLeadsByAgent);

export default router;
