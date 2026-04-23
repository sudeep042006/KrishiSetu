import express from 'express';
import { createChat, getUserChats, getChatMessages, deleteMessages, deleteChat } from '../controllers/message.controller.js';

const router = express.Router();

router.post("/create", createChat);
router.get("/:userId", getUserChats);
router.get("/messages/:chatId", getChatMessages);
router.post("/delete-messages", deleteMessages);
router.delete("/delete-chat/:chatId", deleteChat);

export default router;
