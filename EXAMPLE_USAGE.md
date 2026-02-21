# Example Usage Guide

## Setting Up Test Users

First, you need to create some test users in your MongoDB database. You can use MongoDB Compass or the mongo shell:

```javascript
// Connect to MongoDB
use chatdb

// Insert test users
db.users.insertMany([
  {
    userId: "100",
    username: "Alice",
    email: "alice@example.com",
    createdAt: new Date()
  },
  {
    userId: "200",
    username: "Bob",
    email: "bob@example.com",
    createdAt: new Date()
  },
  {
    userId: "300",
    username: "Charlie",
    email: "charlie@example.com",
    createdAt: new Date()
  }
])
```

## REST API Examples

### 1. Create a Chat Group

```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": "100",
    "members": ["100", "200", "300"]
  }'
```

**Response:**
```json
{
  "success": true,
  "chatId": "CHAT_a1b2c3d4e5f6"
}
```

### 2. Get Chat History

```bash
curl "http://localhost:3000/api/chat/history?chatId=CHAT_a1b2c3d4e5f6&limit=50&offset=0"
```

**Response:**
```json
{
  "success": true,
  "chatId": "CHAT_a1b2c3d4e5f6",
  "messages": [],
  "count": 0
}
```

## Socket.IO Client Example (HTML/JavaScript)

Create a file named `test-client.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Client Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    input, button {
      margin: 5px;
      padding: 8px;
    }
    #messages {
      height: 300px;
      overflow-y: scroll;
      border: 1px solid #ccc;
      padding: 10px;
      margin-top: 10px;
    }
    .message {
      padding: 5px;
      margin: 5px 0;
      background: #f0f0f0;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>Chat System Test Client</h1>

  <div class="section">
    <h3>1. Join Chat Room</h3>
    <input type="text" id="chatId" placeholder="Chat ID" value="CHAT_a1b2c3d4e5f6">
    <input type="text" id="userId" placeholder="User ID" value="100">
    <button onclick="joinRoom()">Join Room</button>
    <div id="joinStatus"></div>
  </div>

  <div class="section">
    <h3>2. Send Message</h3>
    <input type="text" id="messageInput" placeholder="Type your message" style="width: 60%;">
    <button onclick="sendMessage()">Send</button>
  </div>

  <div class="section">
    <h3>3. Messages</h3>
    <div id="messages"></div>
  </div>

  <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
  <script>
    const socket = io('http://localhost:3000');
    let currentChatId = '';
    let currentUserId = '';

    socket.on('connect', () => {
      console.log('Connected to server');
      document.getElementById('joinStatus').innerHTML = 
        '<span style="color: green;">✓ Connected to server</span>';
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      document.getElementById('joinStatus').innerHTML = 
        '<span style="color: red;">✗ Disconnected from server</span>';
    });

    function joinRoom() {
      currentChatId = document.getElementById('chatId').value;
      currentUserId = document.getElementById('userId').value;

      socket.emit('joinChatRoom', {
        chatId: currentChatId,
        userId: currentUserId
      });

      socket.once('joinChatRoom', (response) => {
        console.log('Join response:', response);
        if (response.success) {
          document.getElementById('joinStatus').innerHTML = 
            `<span style="color: green;">✓ Joined room ${currentChatId}</span>`;
        } else {
          document.getElementById('joinStatus').innerHTML = 
            `<span style="color: red;">✗ Error: ${response.error}</span>`;
        }
      });
    }

    function sendMessage() {
      const messageText = document.getElementById('messageInput').value;
      
      if (!messageText.trim()) {
        alert('Please enter a message');
        return;
      }

      if (!currentChatId || !currentUserId) {
        alert('Please join a room first');
        return;
      }

      socket.emit('sendMessage', {
        chatId: currentChatId,
        senderId: currentUserId,
        message: messageText
      });

      document.getElementById('messageInput').value = '';
    }

    // Listen for send confirmation
    socket.on('sendMessage', (response) => {
      console.log('Send response:', response);
      if (!response.success) {
        alert('Error sending message: ' + response.error);
      }
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      console.log('Received message:', message);
      
      const messagesDiv = document.getElementById('messages');
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.innerHTML = `
        <strong>User ${message.senderId}</strong> 
        <span style="color: #666; font-size: 0.8em;">${new Date(message.timestamp).toLocaleTimeString()}</span>
        <br>${message.message}
      `;
      
      messagesDiv.appendChild(messageElement);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  </script>
</body>
</html>
```

## Node.js Client Example

Create a file named `test-client.js`:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const chatId = 'CHAT_a1b2c3d4e5f6';
const userId = '100';

socket.on('connect', () => {
  console.log('✓ Connected to server');
  
  // Join chat room
  socket.emit('joinChatRoom', {
    chatId: chatId,
    userId: userId
  });
});

socket.on('joinChatRoom', (response) => {
  console.log('Join response:', response);
  
  if (response.success) {
    console.log('✓ Successfully joined room');
    
    // Send a test message
    setTimeout(() => {
      socket.emit('sendMessage', {
        chatId: chatId,
        senderId: userId,
        message: 'Hello from Node.js client!'
      });
    }, 1000);
  }
});

socket.on('sendMessage', (response) => {
  console.log('Send response:', response);
});

socket.on('receiveMessage', (message) => {
  console.log('📩 New message received:', message);
});

socket.on('disconnect', () => {
  console.log('✗ Disconnected from server');
});
```

Run with:
```bash
node test-client.js
```

## Complete Flow Example

1. **Start the server:**
```bash
npm start
```

2. **Create a chat group:**
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "100", "members": ["100", "200", "300"]}'
```

3. **Open the HTML test client in multiple browser tabs** (simulate different users)

4. **In each tab:**
   - Change the User ID (100, 200, 300)
   - Use the same Chat ID returned from step 2
   - Click "Join Room"

5. **Send messages from any tab** and watch them appear in all tabs

6. **Get chat history:**
```bash
curl "http://localhost:3000/api/chat/history?chatId=CHAT_xxx&limit=50&offset=0"
```

## Testing with Postman

### Create Chat
- Method: POST
- URL: `http://localhost:3000/api/chat/start`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "createdBy": "100",
  "members": ["100", "200", "300"]
}
```

### Get History
- Method: GET
- URL: `http://localhost:3000/api/chat/history?chatId=CHAT_xxx&limit=50&offset=0`

## Troubleshooting

If you get "User not found" errors:
1. Make sure you've created test users in MongoDB
2. Verify the userId values match your database

If you get "Chat not found" errors:
1. Make sure you're using a valid chatId returned from the `/api/chat/start` endpoint
2. Check MongoDB to see if the chat was created

If Socket.IO connection fails:
1. Make sure the server is running
2. Check the Socket.IO URL in your client
3. Check for CORS issues in the browser console
