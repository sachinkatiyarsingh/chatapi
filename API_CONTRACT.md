# 📡 Complete API & Socket Contract

## 🌐 REST API Endpoints

### Base URL
```
http://localhost:3000
```

---

### 1. 📋 Get Chat History

**Endpoint:**
```
GET /api/chat/history
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chatId` | String | ✅ Yes | Unique chat identifier |
| `limit` | Number | ❌ No | Max messages to return (default: 50) |
| `offset` | Number | ❌ No | Skip N messages (default: 0) |

**Example Request:**
```bash
curl "http://localhost:3000/api/chat/history?chatId=CHAT_abc123&limit=50&offset=0"
```

**Success Response (200):**
```json
{
  "success": true,
  "chatId": "CHAT_abc123",
  "messages": [
    {
      "messageId": "MSG_xyz789",
      "senderId": "100",
      "text": "Hello everyone!",
      "timestamp": "2025-12-03T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**

**400 Bad Request** - Missing chatId:
```json
{
  "success": false,
  "error": "chatId is required"
}
```

**404 Not Found** - Chat doesn't exist:
```json
{
  "success": false,
  "error": "Chat not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### 2. 🚀 Create/Start Chat Group

**Endpoint:**
```
POST /api/chat/start
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `createdBy` | String | ✅ Yes | User ID of chat creator |
| `members` | Array<String> | ✅ Yes | Array of user IDs (including creator) |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": "100",
    "members": ["100", "200", "300"]
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "chatId": "CHAT_abc123def456"
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "error": "createdBy and members array are required"
}
```

**400 Bad Request** - Empty members:
```json
{
  "success": false,
  "error": "At least one member is required"
}
```

**400 Bad Request** - Creator not found:
```json
{
  "success": false,
  "error": "Creator user not found"
}
```

**400 Bad Request** - Invalid members:
```json
{
  "success": false,
  "error": "Invalid users",
  "invalidUsers": ["999"]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### 3. ❤️ Health Check

**Endpoint:**
```
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-03T12:00:00.000Z"
}
```

---

### 4. ℹ️ API Information

**Endpoint:**
```
GET /
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chat Backend API",
  "version": "1.0.0",
  "endpoints": {
    "rest": {
      "GET /api/chat/history": "Get chat history",
      "POST /api/chat/start": "Start new chat"
    },
    "socket": {
      "joinChatRoom": "Join a chat room",
      "sendMessage": "Send a message",
      "receiveMessage": "Receive messages (broadcast)"
    }
  }
}
```

---

## 🔌 Socket.IO Events

### Connection URL
```
http://localhost:3000
```

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

---

### 1. 🚪 Join Chat Room

**Event Name:** `joinChatRoom`

**Direction:** Client → Server

**Emit Payload:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chatId` | String | ✅ Yes | Unique chat identifier |
| `userId` | String | ✅ Yes | User ID joining the room |

**Example Emit:**
```javascript
socket.emit('joinChatRoom', {
  chatId: 'CHAT_abc123',
  userId: '100'
});
```

**Response Event:** `joinChatRoom`

**Direction:** Server → Client

**Success Response:**
```json
{
  "success": true,
  "joined": true
}
```

**Error Responses:**

Missing fields:
```json
{
  "success": false,
  "error": "chatId and userId are required"
}
```

User not found:
```json
{
  "success": false,
  "error": "User not found"
}
```

Chat not found:
```json
{
  "success": false,
  "error": "Chat not found"
}
```

Not a member:
```json
{
  "success": false,
  "error": "User is not a member of this chat"
}
```

**Listen for Response:**
```javascript
socket.on('joinChatRoom', (response) => {
  if (response.success) {
    console.log('Successfully joined room');
  } else {
    console.error('Error:', response.error);
  }
});
```

---

### 2. 📤 Send Message

**Event Name:** `sendMessage`

**Direction:** Client → Server

**Emit Payload:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chatId` | String | ✅ Yes | Unique chat identifier |
| `senderId` | String | ✅ Yes | User ID sending the message |
| `message` | String | ✅ Yes | Message text content |

**Example Emit:**
```javascript
socket.emit('sendMessage', {
  chatId: 'CHAT_abc123',
  senderId: '100',
  message: 'Hello everyone!'
});
```

**Response Event:** `sendMessage`

**Direction:** Server → Client (to sender only)

**Success Response:**
```json
{
  "success": true,
  "chatId": "CHAT_abc123",
  "senderId": "100",
  "messageId": "MSG_xyz789",
  "message": "Hello everyone!",
  "timestamp": "2025-12-03T12:00:00.000Z"
}
```

**Error Responses:**

Missing fields:
```json
{
  "success": false,
  "error": "chatId, senderId, and message are required"
}
```

Sender not found:
```json
{
  "success": false,
  "error": "Sender not found"
}
```

Not a member:
```json
{
  "success": false,
  "error": "Sender is not a member of this chat"
}
```

**Listen for Response:**
```javascript
socket.on('sendMessage', (response) => {
  if (response.success) {
    console.log('Message sent:', response.messageId);
  } else {
    console.error('Error:', response.error);
  }
});
```

---

### 3. 📥 Receive Message (Broadcast)

**Event Name:** `receiveMessage`

**Direction:** Server → All Clients in Room

**Automatic:** This event is automatically sent to all users in a chat room when any user sends a message.

**Payload:**
```json
{
  "chatId": "CHAT_abc123",
  "senderId": "100",
  "messageId": "MSG_xyz789",
  "message": "Hello everyone!",
  "timestamp": "2025-12-03T12:00:00.000Z"
}
```

**Listen for Messages:**
```javascript
socket.on('receiveMessage', (message) => {
  console.log('New message received:', message);
  
  // Display message in UI
  displayMessage(
    message.senderId,
    message.message,
    message.timestamp
  );
});
```

**Notes:**
- All users in the room receive this event
- Includes the sender (they get it via broadcast too)
- No need to emit this - server handles it automatically
- Real-time delivery to all connected clients

---

## 🔄 Complete Flow Examples

### Example 1: Two Users Chatting

**Step 1:** User 100 creates a chat
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "100", "members": ["100", "200"]}'

# Response: {"success": true, "chatId": "CHAT_abc123"}
```

**Step 2:** User 100 connects and joins
```javascript
const socket1 = io('http://localhost:3000');

socket1.emit('joinChatRoom', {
  chatId: 'CHAT_abc123',
  userId: '100'
});

socket1.on('joinChatRoom', (res) => {
  console.log('User 100 joined:', res.success);
});
```

**Step 3:** User 200 connects and joins
```javascript
const socket2 = io('http://localhost:3000');

socket2.emit('joinChatRoom', {
  chatId: 'CHAT_abc123',
  userId: '200'
});

socket2.on('joinChatRoom', (res) => {
  console.log('User 200 joined:', res.success);
});
```

**Step 4:** Both listen for messages
```javascript
socket1.on('receiveMessage', (msg) => {
  console.log('User 100 received:', msg.message);
});

socket2.on('receiveMessage', (msg) => {
  console.log('User 200 received:', msg.message);
});
```

**Step 5:** User 100 sends a message
```javascript
socket1.emit('sendMessage', {
  chatId: 'CHAT_abc123',
  senderId: '100',
  message: 'Hi User 200!'
});
```

**Result:** Both socket1 and socket2 receive the message via `receiveMessage` event! 🎉

---

### Example 2: Group Chat (3+ Users)

**Step 1:** Create group
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "100", "members": ["100", "200", "300"]}'
```

**Step 2:** All users join
```javascript
// User 100
socket1.emit('joinChatRoom', {chatId: 'CHAT_xyz', userId: '100'});

// User 200
socket2.emit('joinChatRoom', {chatId: 'CHAT_xyz', userId: '200'});

// User 300
socket3.emit('joinChatRoom', {chatId: 'CHAT_xyz', userId: '300'});
```

**Step 3:** Any user sends message
```javascript
socket2.emit('sendMessage', {
  chatId: 'CHAT_xyz',
  senderId: '200',
  message: 'Hello everyone!'
});
```

**Result:** All three users (socket1, socket2, socket3) receive the message! 🎉

---

### Example 3: Get Chat History

**Step 1:** Send some messages (via Socket.IO)
```javascript
socket.emit('sendMessage', {
  chatId: 'CHAT_abc123',
  senderId: '100',
  message: 'Message 1'
});

socket.emit('sendMessage', {
  chatId: 'CHAT_abc123',
  senderId: '100',
  message: 'Message 2'
});
```

**Step 2:** Fetch history (via REST API)
```bash
curl "http://localhost:3000/api/chat/history?chatId=CHAT_abc123&limit=50&offset=0"
```

**Result:** Get all messages with timestamps! 📜

---

## 🔐 Validation Rules

### User Validation
- ✅ User must exist in database
- ✅ Checked on all operations
- ✅ Returns error if not found

### Chat Validation
- ✅ Chat must exist
- ✅ User must be member to join
- ✅ User must be member to send

### Message Validation
- ✅ All fields required
- ✅ Text cannot be empty
- ✅ Sender must be valid user

---

## 📊 Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST (chat created) |
| 400 | Bad Request | Invalid input or validation error |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## 🌐 CORS Configuration

CORS is enabled for all origins:
```javascript
io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
```

---

## 🎯 Rate Limiting

Currently: **No rate limiting** (for development)

For production, add:
- Rate limit on REST APIs
- Socket connection limits
- Message send limits
- IP-based throttling

---

## 🔧 Environment Configuration

```env
PORT=3000                              # Server port
MONGODB_URI=mongodb://localhost:27017/chatdb  # Database URL
NODE_ENV=development                   # Environment mode
```

---

## 📝 Notes

1. **Socket.IO Transport**: Uses WebSocket with polling fallback
2. **Message Order**: Guaranteed in order of send
3. **Persistence**: All messages saved to MongoDB
4. **Room Isolation**: Messages only sent to room members
5. **Connection State**: Server tracks active connections
6. **Reconnection**: Socket.IO handles auto-reconnect

---

## 🎉 Ready to Use!

All endpoints and events are fully implemented and tested.

Use the HTML test client (`test-client.html`) for visual testing or integrate with your own frontend! 🚀
