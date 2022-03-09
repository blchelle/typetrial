import express from 'express';
import {
  handleLoginUser, handleResetPassword, handleResetPasswordEmail, handleSignupUser,
} from '../controllers/userController';
import catchAsync from '../utils/catchAsync';

const router = express.Router({ mergeParams: true });

router.route('/signup').post(catchAsync(handleSignupUser));
router.route('/login').post(catchAsync(handleLoginUser));

router.route('/password-reset-email').post(catchAsync(handleResetPasswordEmail));
router.route('/password-reset').post(catchAsync(handleResetPassword));

export default router;
