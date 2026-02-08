import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
const authController = new AuthController();
// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
// Protected routes
router.get('/me', authenticate, (req, res) => authController.me(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
export default router;
//# sourceMappingURL=authRoutes.js.map