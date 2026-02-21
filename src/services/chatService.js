import Chat from '../models/Chat.js';
import { v4 as uuidv4 } from 'uuid';

class ChatService {
  /**
   * Create a new chat/group
   * @param {string} createdBy 
   * @param {Array<string>} members 
   * @returns {Promise<Object>}
   */
  async createChat(createdBy, members) {
    try {
      // Ensure creator is in members list
      if (!members.includes(createdBy)) {
        members.push(createdBy);
      }

      const chatId = `CHAT_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
      
      const chat = new Chat({
        chatId,
        createdBy,
        members,
        isGroup: members.length > 2
      });

      await chat.save();
      
      return {
        success: true,
        chatId: chat.chatId,
        chat
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get chat by chatId
   * @param {string} chatId 
   * @returns {Promise<Object|null>}
   */
  async getChatById(chatId) {
    try {
      return await Chat.findOne({ chatId });
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  /**
   * Check if user is member of chat
   * @param {string} chatId 
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  async isUserInChat(chatId, userId) {
    try {
      const chat = await Chat.findOne({ chatId, members: userId });
      return !!chat;
    } catch (error) {
      console.error('Error checking chat membership:', error);
      return false;
    }
  }

  /**
   * Get all chats for a user
   * @param {string} userId 
   * @returns {Promise<Array>}
   */
  async getUserChats(userId) {
    try {
      return await Chat.find({ members: userId }).sort({ updatedAt: -1 });
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  }
}

export default new ChatService();
