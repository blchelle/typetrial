import express from 'express';
import { handleGetRace } from '../controllers/raceController';
import catchAsync from '../utils/catchAsync';

// Routes requests for race data: FR12

const router = express.Router({ mergeParams: true });

router.route('/get/:raceId(\\d+)').get(catchAsync(handleGetRace));

export default router;
