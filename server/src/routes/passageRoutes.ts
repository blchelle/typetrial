import express from 'express';
import { handleCreatePassage } from '../controllers/passageController';

const router = express.Router({ mergeParams: true });

router.route('/').post(handleCreatePassage);

export default router;
