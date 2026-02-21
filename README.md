# Chat Backend API - Node.js + Express + Socket.IO

A complete chat system backend with REST APIs and real-time Socket.IO communication.

## 🏗 Project Structure

```
/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── chatController.js    # REST API controllers
│   ├── routes/
│   │   └── chatRoutes.js        # REST API routes
│   ├── services/
│   │   ├── userService.js       # User validation service
│   │   ├── chatService.js       # Chat management service
│   │   └── messageService.js    # Message handling service
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Chat.js              # Chat model
│   │   └── Message.js           # Message model
│   └── socket/
│       └── chatSocketHandler.js # Socket.IO event handlers
├── server.js                     # Main server file
├── package.json
├── .env
└── README.md
```

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatdb
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

## 🚀 Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 🟦 REST API Endpoints

### 1. Get Previous Chat History

**Endpoint:** `GET /api/chat/history`

**Query Parameters:**
```json
{
  "chatId": "CHAT_123456",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "chatId": "CHAT_123456",
  "messages": [
    {
      "messageId": "MSG_555",
      "senderId": "100",
      "text": "Hello",
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

**Example cURL:**
```bash
curl "http://localhost:3000/api/chat/history?chatId=CHAT_123456&limit=50&offset=0"
```

### 2. Create / Start Chat Group

**Endpoint:** `POST /api/chat/start`

**Request Body:**
```json
{
  "createdBy": "100",
  "members": ["100", "200", "300"]
}
```

**Response:**
```json
{
  "success": true,
  "chatId": "CHAT_987654"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": "100",
    "members": ["100", "200", "300"]
  }'
```

## 🔵 Socket.IO Events

### Connection

Connect to Socket.IO server:
```javascript
const socket = io('http://localhost:3000');
```

### 1. Join Chat Room

**Event:** `joinChatRoom`

**Emit:**
```javascript
socket.emit('joinChatRoom', {
  chatId: 'CHAT_987654',
  userId: '100'
});
```

**Response:**
```javascript
socket.on('joinChatRoom', (response) => {
  console.log(response);
  // { success: true, joined: true }
});
```

### 2. Send Message

**Event:** `sendMessage`

**Emit:**
```javascript
socket.emit('sendMessage', {
  chatId: 'CHAT_987654',
  senderId: '100',
  message: 'Hello everyone!'
});
```

**Response:**
```javascript
socket.on('sendMessage', (response) => {
  console.log(response);
  // {
  //   success: true,
  //   chatId: 'CHAT_987654',
  //   senderId: '100',
  //   messageId: 'MSG_555',
  //   message: 'Hello everyone!',
  //   timestamp: '2025-01-01T12:00:00Z'
  // }
});
```

### 3. Receive Message (Broadcast)

**Event:** `receiveMessage`

All users in the same chat room will automatically receive this event:

**Listen:**
```javascript
socket.on('receiveMessage', (message) => {
  console.log(message);
  // {
  //   chatId: 'CHAT_987654',
  //   senderId: '100',
  //   messageId: 'MSG_555',
  //   message: 'Hello everyone!',
  //   timestamp: '2025-01-01T12:00:00Z'
  // }
});
```

## 🗄 Database Models

### User Model
```javascript
{
  userId: String,      // Unique user identifier
  username: String,
  email: String,
  createdAt: Date,
  timestamps: true
}
```

### Chat Model
```javascript
{
  chatId: String,      // Unique chat identifier (CHAT_xxxx)
  createdBy: String,   // User ID of creator
  members: [String],   // Array of user IDs
  isGroup: Boolean,
  createdAt: Date,
  updatedAt: Date,
  timestamps: true
}
```

### Message Model
```javascript
{
  messageId: String,   // Unique message identifier (MSG_xxxx)
  chatId: String,      // Reference to chat
  senderId: String,    // User ID of sender
  text: String,        // Message content
  timestamp: Date,
  timestamps: true
}
```

## 🔐 User Validation

All APIs and socket events validate:
- User existence in the database
- User membership in chats
- Valid chat IDs

## 📝 Client Example (Socket.IO)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Join a chat room
socket.emit('joinChatRoom', {
  chatId: 'CHAT_987654',
  userId: '100'
});

// Listen for join confirmation
socket.on('joinChatRoom', (response) => {
  if (response.success) {
    console.log('Successfully joined room');
  }
});

// Send a message
socket.emit('sendMessage', {
  chatId: 'CHAT_987654',
  senderId: '100',
  message: 'Hello everyone!'
});

// Listen for incoming messages
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
});
```

## 🧪 Testing

You can test the APIs using:
- cURL (see examples above)
- Postman
- Thunder Client (VS Code extension)
- Any Socket.IO client library

## 🔧 Dependencies

- **express**: Web framework
- **socket.io**: Real-time communication
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variables
- **cors**: CORS middleware
- **uuid**: Unique ID generation

## 📄 License

ISC

## 👨‍💻 Features

✅ Clean architecture with separation of concerns  
✅ User validation for all operations  
✅ Real-time message broadcasting  
✅ Chat history with pagination  
✅ Group chat support  
✅ ES6+ syntax  
✅ Async/await throughout  
✅ Error handling  
✅ MongoDB indexes for performance  
✅ Socket room management  
✅ Unique message and chat IDs
