import express from 'express';
import { generateToken } from '../controllers/livekitToken.controller.js';

const router = express.Router();

// GET /api/livekit/token?userId=123&roomName=myroom
router.get('/token', generateToken);

export default router;