import express from 'express';
import {
  createCollegeWork,
  getCollegeWorks,
  getCollegeWorkStats,
  updateCollegeWork,
  completeCollegeWork,
  deleteCollegeWork
} from '../controllers/collegeWork.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createCollegeWork);
router.get('/', getCollegeWorks);
router.get('/stats', getCollegeWorkStats);
router.put('/:id', updateCollegeWork);
router.patch('/:id/complete', completeCollegeWork);
router.delete('/:id', deleteCollegeWork);

export default router;
