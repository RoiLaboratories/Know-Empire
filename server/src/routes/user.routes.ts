import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile/:username', userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.get('/products/:username', userController.getUserProducts);
router.get('/orders', authMiddleware, userController.getUserOrders);
router.get('/stats/:username', userController.getUserStats);

export default router;
