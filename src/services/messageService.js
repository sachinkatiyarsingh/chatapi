import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { v4 as uuidv4 } from 'uuid';

class MessageService {
  /**
   * Create and save a new message
   * @param {string} chatId 
   * @param {string} senderId 
   * @param {string} text 
   * @returns {Promise<Object>}
   */
  async createMessage(chatId, senderId, messageData) {
    try {
      const messageId = `MSG_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
      const timestamp = new Date();

      const messageDoc = {
        messageId,
        chatId,
        senderId,
        type: messageData.type || 'text',
        timestamp
      };

      // For text messages
      if (messageData.type === 'text') {
        messageDoc.text = messageData.message || messageData.text;
      }
      // For file-based messages
      else if (['image', 'video', 'document', 'audio'].includes(messageData.type)) {
        messageDoc.fileUrl = messageData.file_url || messageData.fileUrl;
        messageDoc.fileName = messageData.file_name || messageData.fileName;
        messageDoc.fileSize = messageData.file_size || messageData.fileSize;
        messageDoc.mimeType = messageData.mime_type || messageData.mimeType;
        messageDoc.text = messageData.message || ''; // Optional caption
      }

      const message = new Message(messageDoc);

      await message.save();

      // Update chat's updatedAt timestamp
      await Chat.findOneAndUpdate(
        { chatId },
        { updatedAt: timestamp }
      );

      const responseMessage = {
        messageId: message.messageId,
        chatId: message.chatId,
        senderId: message.senderId,
        type: message.type,
        timestamp: message.timestamp
      };

      // Add text or file fields based on message type
      if (message.type === 'text') {
        responseMessage.message = message.text;
      } else if (['image', 'video', 'document', 'audio'].includes(message.type)) {
        responseMessage.file_url = message.fileUrl;
        responseMessage.file_name = message.fileName;
        responseMessage.file_size = message.fileSize;
        responseMessage.mime_type = message.mimeType;
        if (message.text) responseMessage.message = message.text;
      }

      return {
        success: true,
        message: responseMessage
      };
    } catch (error) {
      console.error('Error creating message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get chat history with pagination
   * @param {string} chatId 
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Object>}
   */
  async getChatHistory(chatId, limit = 50, offset = 0) {
    try {
      const messages = await Message.find({ chatId })
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit);

      // Reverse to get chronological order (oldest first)
      const formattedMessages = messages.reverse().map(msg => {
        const formatted = {
          messageId: msg.messageId,
          senderId: msg.senderId,
          type: msg.type,
          timestamp: msg.timestamp
        };

        if (msg.type === 'text') {
          formatted.text = msg.text;
          formatted.message = msg.text;
        } else if (['image', 'video', 'document', 'audio'].includes(msg.type)) {
          formatted.file_url = msg.fileUrl;
          formatted.file_name = msg.fileName;
          formatted.file_size = msg.fileSize;
          formatted.mime_type = msg.mimeType;
          if (msg.text) formatted.message = msg.text;
        }

        return formatted;
      });

      return {
        success: true,
        chatId,
        messages: formattedMessages,
        count: messages.length
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      return {
        success: false,
        error: error.message,
        messages: []
      };
    }
  }

  /**
   * Get total message count for a chat
   * @param {string} chatId 
   * @returns {Promise<number>}
   */
  async getMessageCount(chatId) {
    try {
      return await Message.countDocuments({ chatId });
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }
}

export default new MessageService();
