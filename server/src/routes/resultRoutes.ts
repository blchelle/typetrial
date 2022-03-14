import express from 'express';
import { handleGetResult, handleGetUserResults } from '../controllers/resultController';
import catchAsync from '../utils/catchAsync';

const router = express.Router({ mergeParams: true });

router.route('/get/:resultId(\\d+)').get(catchAsync(handleGetResult));
router.route('/user/:userId(\\d+)').get(catchAsync(handleGetUserResults));

export default router;
