import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chatId: {
    type: String,
    required: true,
    ref: 'Chat',
    index: true
  },
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  text: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'location', 'document', 'audio'],
    default: 'text',
    required: true
  },
  fileUrl: {
    type: String,
    required: function() {
      return ['image', 'video', 'document', 'audio'].includes(this.type);
    }
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
messageSchema.index({ chatId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
