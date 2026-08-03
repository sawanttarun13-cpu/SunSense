import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { RegisterSchema, LoginSchema } from '../models/validators';
import { requireAuth } from '../middleware/requireAuth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

router.post('/register', authLimiter, validateRequest(RegisterSchema), authController.register);
router.post('/login', authLimiter, validateRequest(LoginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
