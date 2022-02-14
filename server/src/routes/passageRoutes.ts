import { Role } from '@prisma/client';
import express from 'express';

import { handleCreatePassage } from '../controllers/passageController';
import { protectRoute } from '../middlewares/authMiddleware';

const router = express.Router({ mergeParams: true });

router.use(protectRoute(Role.ADMIN));
router.route('/').post(handleCreatePassage);

export default router;
