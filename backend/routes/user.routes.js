import express from 'express';
import { getUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/:userId", getUserProfile);

export default router;
