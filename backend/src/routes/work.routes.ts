import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createWork,
  getWorks,
  getPendingWorksFromYesterday,
  getWorkStats,
  updateWork,
  completeWork,
  deleteWork
} from '../controllers/work.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createWork);
router.get('/', getWorks);
router.get('/pending-yesterday', getPendingWorksFromYesterday);
router.get('/stats', getWorkStats);
router.put('/:id', updateWork);
router.patch('/:id/complete', completeWork);
router.delete('/:id', deleteWork);

export default router;
