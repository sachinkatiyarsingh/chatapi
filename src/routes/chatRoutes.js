import express from 'express';
import chatController from '../controllers/chatController.js';

const router = express.Router();

// GET /api/chat/history - Get previous chat with user
router.get('/history', chatController.getChatHistory.bind(chatController));

// POST /api/chat/start - Create/Start chat group
router.post('/start', chatController.startChat.bind(chatController));

// GET /api/chat/users/:userId - Get list of users with chats
router.get('/users/:userId', chatController.getChatUsersList.bind(chatController));

export default router;
