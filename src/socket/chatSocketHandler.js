import chatService from '../services/chatService.js';
import messageService from '../services/messageService.js';
import userService from '../services/userService.js';

class ChatSocketHandler {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map userId to socket.id
  }

  /**
   * Initialize socket handlers
   */
  initialize(socket) {
    console.log(`New client connected: ${socket.id}`);

    // Handle join chat room
    socket.on('joinChatRoom', async (data) => {
      await this.handleJoinChatRoom(socket, data);
    });

    // Handle send message
    socket.on('sendMessage', async (data) => {
      await this.handleSendMessage(socket, data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handle joinChatRoom event
   */
  async handleJoinChatRoom(socket, data) {
    try {
      const { chatId, userId } = data;

      // Validate input
      if (!chatId || !userId) {
        socket.emit('joinChatRoom', {
          success: false,
          error: 'chatId and userId are required'
        });
        return;
      }

      // Validate user exists
      const userExists = await userService.validateUser(userId);
      if (!userExists) {
        socket.emit('joinChatRoom', {
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Validate chat exists
      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        socket.emit('joinChatRoom', {
          success: false,
          error: 'Chat not found'
        });
        return;
      }

      // Validate user is member of chat
      const isMember = await chatService.isUserInChat(chatId, userId);
      if (!isMember) {
        socket.emit('joinChatRoom', {
          success: false,
          error: 'User is not a member of this chat'
        });
        return;
      }

      // Join the socket room
      socket.join(chatId);
      
      // Store user-socket mapping
      this.userSockets.set(userId, socket.id);
      socket.userId = userId;

      console.log(`User ${userId} joined chat room: ${chatId}`);

      // Send success response
      socket.emit('joinChatRoom', {
        success: true,
        joined: true
      });

    } catch (error) {
      console.error('Error in joinChatRoom:', error);
      socket.emit('joinChatRoom', {
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Handle sendMessage event
   */
  async handleSendMessage(socket, data) {
    try {
      const { chatId, senderId, message, type = 'text', file_url, file_name, file_size, mime_type } = data;

      // Validate input
      if (!chatId || !senderId) {
        socket.emit('sendMessage', {
          success: false,
          error: 'chatId and senderId are required'
        });
        return;
      }

      // Validate message type
      const validTypes = ['text', 'image', 'video', 'location', 'document', 'audio'];
      if (type && !validTypes.includes(type)) {
        socket.emit('sendMessage', {
          success: false,
          error: 'Invalid message type. Allowed: text, image, video, location, document, audio'
        });
        return;
      }

      // Validate based on message type
      if (type === 'text' && !message) {
        socket.emit('sendMessage', {
          success: false,
          error: 'message is required for text type'
        });
        return;
      }

      if (['image', 'video', 'document', 'audio'].includes(type) && !file_url) {
        socket.emit('sendMessage', {
          success: false,
          error: 'file_url is required for file-based messages'
        });
        return;
      }

      // Validate user exists
      const userExists = await userService.validateUser(senderId);
      if (!userExists) {
        socket.emit('sendMessage', {
          success: false,
          error: 'Sender not found'
        });
        return;
      }

      // Validate user is member of chat
      const isMember = await chatService.isUserInChat(chatId, senderId);
      if (!isMember) {
        socket.emit('sendMessage', {
          success: false,
          error: 'Sender is not a member of this chat'
        });
        return;
      }

      // Create and save message
      const messageData = {
        type,
        message,
        file_url,
        file_name,
        file_size,
        mime_type
      };
      const result = await messageService.createMessage(chatId, senderId, messageData);

      if (!result.success) {
        socket.emit('sendMessage', {
          success: false,
          error: result.error
        });
        return;
      }

      // Emit confirmation to sender
      socket.emit('sendMessage', {
        success: true,
        ...result.message
      });

      // Broadcast message to all users in the chat room (including sender)
      this.io.to(chatId).emit('receiveMessage', result.message);

      console.log(`Message sent in chat ${chatId} by user ${senderId}`);

    } catch (error) {
      console.error('Error in sendMessage:', error);
      socket.emit('sendMessage', {
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Handle disconnect event
   */
  handleDisconnect(socket) {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove user-socket mapping
    if (socket.userId) {
      this.userSockets.delete(socket.userId);
    }
  }
}

export default ChatSocketHandler;
