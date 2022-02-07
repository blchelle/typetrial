import express from 'express';
import { handleLoginUser, handleSignupUser } from '../controllers/userController';

const router = express.Router({ mergeParams: true });

router.route('/signup').post(handleSignupUser);
router.route('/login').post(handleLoginUser);

export default router;
