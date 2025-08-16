import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/verify', authController.verifyAuth);

export default router;
