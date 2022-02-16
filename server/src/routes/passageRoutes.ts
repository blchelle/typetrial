import { Role } from '@prisma/client';
import express from 'express';

import { handleCreatePassage } from '../controllers/passageController';
import { protectRoute } from '../middlewares/authMiddleware';
import catchAsync from '../utils/catchAsync';

const router = express.Router({ mergeParams: true });

router.use(protectRoute(Role.ADMIN));
router.route('/').post(catchAsync(handleCreatePassage));

export default router;
