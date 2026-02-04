import express, { Request, Response, NextFunction } from 'express';
import { login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Async error wrapper
const asyncHandler = (fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Async handler error:', err);
      next(err);
    });
  };
};

router.post('/login', asyncHandler(login));
router.get('/profile', authenticate, asyncHandler(getProfile));

export default router;
