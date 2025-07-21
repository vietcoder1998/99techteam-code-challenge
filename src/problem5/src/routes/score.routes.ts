import express from 'express';
import {
  increaseScore,
  getTopScores,
  register,
  login
} from '../controllers/score.controller';
import { authenticate } from '../utils/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/increment', authenticate, increaseScore);
router.get('/top10', getTopScores);

export default router;
