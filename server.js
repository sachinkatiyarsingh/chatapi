import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import chatRoutes from './src/routes/chatRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import ChatSocketHandler from './src/socket/chatSocketHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// REST API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chat Backend API',
    version: '1.0.0',
    endpoints: {
      rest: {
        'GET /api/chat/history': 'Get chat history',
        'POST /api/chat/start': 'Start new chat'
      },
      socket: {
        'joinChatRoom': 'Join a chat room',
        'sendMessage': 'Send a message',
        'receiveMessage': 'Receive messages (broadcast)'
      }
    }
  });
});

// Socket.IO connection handling
const chatSocketHandler = new ChatSocketHandler(io);

io.on('connection', (socket) => {
  chatSocketHandler.initialize(socket);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📡 Socket.IO is active
🔗 MongoDB connection established
  
REST API Endpoints:
  - GET  http://localhost:${PORT}/api/chat/history
  - POST http://localhost:${PORT}/api/chat/start
  
Socket.IO Events:
  - joinChatRoom
  - sendMessage
  - receiveMessage
  `);
});

export default app;
