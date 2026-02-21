import chatService from '../services/chatService.js';
import messageService from '../services/messageService.js';
import userService from '../services/userService.js';
import userChatService from '../services/userChatService.js';

class ChatController {
  /**
   * GET /api/chat/history
   * Get previous chat history with pagination
   */
  async getChatHistory(req, res) {
    try {
      const { chatId } = req.query;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Validate chatId
      if (!chatId) {
        return res.status(400).json({
          success: false,
          error: 'chatId is required'
        });
      }

      // Validate chat exists
      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found'
        });
      }

      // Get chat history
      const result = await messageService.getChatHistory(chatId, limit, offset);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/chat/start
   * Create a new chat/group
   */
  async startChat(req, res) {
    try {
      const { createdBy, members } = req.body;

      // Validate input
      if (!createdBy || !members || !Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          error: 'createdBy and members array are required'
        });
      }

      if (members.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one member is required'
        });
      }

      // Validate creator exists
      const creatorExists = await userService.validateUser(createdBy);
      if (!creatorExists) {
        return res.status(400).json({
          success: false,
          error: 'Creator user not found'
        });
      }

      // Validate all members exist
      const validation = await userService.validateUsers(members);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid users',
          invalidUsers: validation.invalidUsers
        });
      }

      // Create chat
      const result = await chatService.createChat(createdBy, members);

      if (result.success) {
        return res.status(201).json({
          success: true,
          chatId: result.chatId
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in startChat:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/chat/users/:userId
   * Get list of users with whom current user has chats
   */
  async getChatUsersList(req, res) {
    try {
      const { userId } = req.params;

      // Validate userId
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      // Validate user exists
      const userExists = await userService.validateUser(userId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get chat users list
      const chatUsers = await userChatService.getChatUsersList(userId);

      return res.status(200).json(chatUsers);
    } catch (error) {
      console.error('Error in getChatUsersList:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new ChatController();
