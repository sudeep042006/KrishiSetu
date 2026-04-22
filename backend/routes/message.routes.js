import express from 'express';
import { createChat, getUserChats, getChatMessages } from '../controllers/message.controller.js';

const router = express.Router();

router.post("/create", createChat);
router.get("/:userId", getUserChats);
router.get("/messages/:chatId", getChatMessages);

export default router;
