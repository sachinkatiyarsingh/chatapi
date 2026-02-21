import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

class UserChatService {
  /**
   * Get list of users with whom the current user has chats
   * @param {string} userId - Current user ID
   * @returns {Promise<Array>}
   */
  async getChatUsersList(userId) {
    try {
      // Find all chats where user is a member
      const chats = await Chat.find({ members: userId }).lean();

      if (!chats || chats.length === 0) {
        return [];
      }

      // Get chat IDs
      const chatIds = chats.map(chat => chat.chatId);

      // Get last message for each chat
      const chatUsersData = await Promise.all(
        chats.map(async (chat) => {
          // Get the last message in this chat
          const lastMessage = await Message.findOne({ chatId: chat.chatId })
            .sort({ timestamp: -1 })
            .lean();

          // Get other users in the chat (exclude current user)
          const otherUserIds = chat.members.filter(id => id !== userId);

          // For group chats, we'll return all other users
          // For one-on-one, return the single other user
          const otherUsersData = await Promise.all(
            otherUserIds.map(async (otherUserId) => {
              const user = await User.findOne({ userId: otherUserId }).lean();
              
              // Format last message based on type
              let lastMessageText = 'No messages yet';
              if (lastMessage) {
                if (lastMessage.type === 'text') {
                  lastMessageText = lastMessage.text;
                } else if (lastMessage.type === 'image') {
                  lastMessageText = '📷 Image';
                } else if (lastMessage.type === 'video') {
                  lastMessageText = '🎥 Video';
                } else if (lastMessage.type === 'document') {
                  lastMessageText = '📄 Document';
                } else if (lastMessage.type === 'audio') {
                  lastMessageText = '🎵 Audio';
                } else if (lastMessage.type === 'location') {
                  lastMessageText = '📍 Location';
                }
              }
              
              return {
                user_id: otherUserId,
                profile_pic: user?.profilePic || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`,
                time: lastMessage?.timestamp || chat.updatedAt,
                last_message: lastMessageText,
                chat_id: chat.chatId,
                username: user?.username || 'Unknown User'
              };
            })
          );

          return otherUsersData;
        })
      );

      // Flatten the array and sort by time (most recent first)
      const flattenedData = chatUsersData.flat();
      
      // Remove duplicates based on user_id and keep the most recent chat
      const uniqueUsers = new Map();
      flattenedData.forEach(user => {
        const existing = uniqueUsers.get(user.user_id);
        if (!existing || new Date(user.time) > new Date(existing.time)) {
          uniqueUsers.set(user.user_id, user);
        }
      });

      // Convert map to array and sort by time
      const result = Array.from(uniqueUsers.values()).sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );

      return result;
    } catch (error) {
      console.error('Error getting chat users list:', error);
      return [];
    }
  }

  /**
   * Get detailed chat info including all participants
   * @param {string} chatId 
   * @returns {Promise<Object>}
   */
  async getChatDetails(chatId) {
    try {
      const chat = await Chat.findOne({ chatId }).lean();
      if (!chat) return null;

      const usersData = await Promise.all(
        chat.members.map(async (userId) => {
          const user = await User.findOne({ userId }).lean();
          return {
            userId: userId,
            username: user?.username || 'Unknown',
            profilePic: user?.profilePic || `https://ui-avatars.com/api/?name=${user?.username || 'User'}`
          };
        })
      );

      return {
        chatId: chat.chatId,
        isGroup: chat.isGroup,
        members: usersData,
        createdAt: chat.createdAt
      };
    } catch (error) {
      console.error('Error getting chat details:', error);
      return null;
    }
  }
}

export default new UserChatService();
