import { Role } from '@prisma/client';
import express from 'express';
import {
  handleGetMe,
  handleLoginUser, handleLogoutUser, handleResetPassword, handleResetPasswordEmail, handleSignupUser,
} from '../controllers/userController';
import { protectRoute } from '../middlewares/authMiddleware';
import catchAsync from '../utils/catchAsync';

// Routes requests for user data and management : FR1, FR2, FR3

const router = express.Router({ mergeParams: true });

router.route('/signup').post(catchAsync(handleSignupUser));
router.route('/login').post(catchAsync(handleLoginUser));
router.route('/logout').get(handleLogoutUser);
router.route('/password-reset-email').post(catchAsync(handleResetPasswordEmail));
router.route('/password-reset').post(catchAsync(handleResetPassword));

router.use(catchAsync(protectRoute(Role.USER)));
router.route('/me').get(catchAsync(handleGetMe));

export default router;
