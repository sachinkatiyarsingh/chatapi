import User from '../models/User.js';

class UserService {
  /**
   * Validate if user exists by userId
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  async validateUser(userId) {
    try {
      const user = await User.findOne({ userId });
      return !!user;
    } catch (error) {
      console.error('Error validating user:', error);
      return false;
    }
  }

  /**
   * Validate multiple users
   * @param {Array<string>} userIds 
   * @returns {Promise<{valid: boolean, invalidUsers: Array<string>}>}
   */
  async validateUsers(userIds) {
    try {
      const users = await User.find({ userId: { $in: userIds } });
      const foundUserIds = users.map(user => user.userId);
      const invalidUsers = userIds.filter(id => !foundUserIds.includes(id));
      
      return {
        valid: invalidUsers.length === 0,
        invalidUsers
      };
    } catch (error) {
      console.error('Error validating users:', error);
      return {
        valid: false,
        invalidUsers: userIds
      };
    }
  }

  /**
   * Get user by userId
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    try {
      return await User.findOne({ userId });
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}

export default new UserService();
