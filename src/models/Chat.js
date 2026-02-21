import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  members: [{
    type: String,
    ref: 'User'
  }],
  isGroup: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ members: 1 });
chatSchema.index({ createdBy: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
