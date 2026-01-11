import express from 'express';
import { createNote, getNotesByLead } from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.post('/', createNote);
router.get('/lead/:leadId', getNotesByLead);

export default router;
