import express from 'express';
import { handleLoginUser, handleSignupUser } from '../controllers/userController';
import catchAsync from '../utils/catchAsync';

const router = express.Router({ mergeParams: true });

router.route('/signup').post(catchAsync(handleSignupUser));
router.route('/login').post(catchAsync(handleLoginUser));

export default router;
