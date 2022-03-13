import express from 'express';
import { handleGetRace } from '../controllers/raceController';
import catchAsync from '../utils/catchAsync';

const router = express.Router({ mergeParams: true });

router.route('/get/:raceId(\\d+)').get(catchAsync(handleGetRace));

export default router;
