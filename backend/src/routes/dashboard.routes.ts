import express from 'express';
import { getDashboardStats, getAgentOverview } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/agents/overview', getAgentOverview);

export default router;
