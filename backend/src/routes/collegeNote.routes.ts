import express from 'express';
import {
  createCollegeNote,
  getCollegeNotes,
  deleteCollegeNote
} from '../controllers/collegeNote.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createCollegeNote);
router.get('/college/:collegeId', getCollegeNotes);
router.delete('/:id', deleteCollegeNote);

export default router;
