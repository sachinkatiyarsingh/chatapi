# Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure MongoDB
Make sure MongoDB is running on your system. Update `.env` if needed:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatdb
NODE_ENV=development
```

### Step 3: Seed Sample Users
This creates 5 test users in your database:
```bash
npm run seed
```

Sample users created:
- **100**: Alice Johnson (alice@example.com)
- **200**: Bob Smith (bob@example.com)
- **300**: Charlie Brown (charlie@example.com)
- **400**: Diana Prince (diana@example.com)
- **500**: Eve Wilson (eve@example.com)

### Step 4: Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## 🧪 Testing the APIs

### 1. Create a Chat Group

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": "100",
    "members": ["100", "200", "300"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "chatId": "CHAT_a1b2c3d4e5f6"
}
```

**💡 Tip:** Save the `chatId` returned - you'll need it for the next steps!

---

### 2. Get Chat History

**Request:**
```bash
curl "http://localhost:3000/api/chat/history?chatId=CHAT_a1b2c3d4e5f6&limit=50&offset=0"
```

Replace `CHAT_a1b2c3d4e5f6` with your actual chatId.

**Expected Response (initially empty):**
```json
{
  "success": true,
  "chatId": "CHAT_a1b2c3d4e5f6",
  "messages": [],
  "count": 0
}
```

---

## 🔌 Testing Socket.IO

### Option 1: Use the HTML Test Client (Recommended)

1. **Start the server** (if not already running):
   ```bash
   npm start
   ```

2. **Open the test client**:
   - Open `test-client.html` in your browser
   - Or visit: file:///var/www/html/nodesocketsts/test-client.html

3. **Create a chat** (if you haven't already):
   ```bash
   curl -X POST http://localhost:3000/api/chat/start \
     -H "Content-Type: application/json" \
     -d '{"createdBy": "100", "members": ["100", "200", "300"]}'
   ```

4. **In the HTML client**:
   - Enter the Chat ID you received
   - Enter User ID: `100`
   - Click "Join Room"
   - Type a message and click "Send"

5. **Test with multiple users**:
   - Open the HTML file in another browser tab/window
   - Use the same Chat ID
   - Use a different User ID: `200` or `300`
   - Both clients will see messages in real-time!

---

### Option 2: Use Node.js Client

Create a file `test.js`:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Replace with your actual chatId
const CHAT_ID = 'CHAT_a1b2c3d4e5f6';
const USER_ID = '100';

socket.on('connect', () => {
  console.log('✓ Connected to server');
  
  // Join room
  socket.emit('joinChatRoom', {
    chatId: CHAT_ID,
    userId: USER_ID
  });
});

socket.on('joinChatRoom', (response) => {
  console.log('Join response:', response);
  
  if (response.success) {
    // Send a test message
    socket.emit('sendMessage', {
      chatId: CHAT_ID,
      senderId: USER_ID,
      message: 'Hello from Node.js!'
    });
  }
});

socket.on('receiveMessage', (message) => {
  console.log('📩 New message:', message);
});
```

Run with:
```bash
node test.js
```

---

## 📋 Complete Test Scenario

Follow this scenario to test all features:

### 1. Create a Chat Group
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "100", "members": ["100", "200", "300"]}'
```
**Save the chatId returned!**

### 2. Open Test Client #1
- Open `test-client.html` in Chrome
- Chat ID: `<your-chatId>`
- User ID: `100`
- Click "Join Room"

### 3. Open Test Client #2
- Open `test-client.html` in Firefox (or new Chrome window)
- Chat ID: `<same-chatId>`
- User ID: `200`
- Click "Join Room"

### 4. Send Messages
- In Client #1: Type "Hello from User 100" and send
- In Client #2: Type "Hi from User 200" and send
- **Both clients should see both messages instantly!**

### 5. Verify Chat History
```bash
curl "http://localhost:3000/api/chat/history?chatId=<your-chatId>&limit=50&offset=0"
```

You should see all messages in the response!

---

## 🔍 Troubleshooting

### "User not found" Error
**Problem:** User doesn't exist in database  
**Solution:** Run `npm run seed` to create sample users

### "Chat not found" Error
**Problem:** Invalid chatId  
**Solution:** Create a new chat using the `/api/chat/start` endpoint

### Socket.IO Connection Failed
**Problem:** Can't connect to Socket.IO server  
**Solution:** 
- Make sure server is running (`npm start`)
- Check if port 3000 is available
- Verify the URL in test client matches your server

### MongoDB Connection Error
**Problem:** Can't connect to MongoDB  
**Solution:**
- Make sure MongoDB is running: `sudo systemctl start mongodb`
- Or install MongoDB if not installed

### CORS Issues
**Problem:** Browser blocks Socket.IO connection  
**Solution:** The server is already configured with CORS enabled for all origins

---

## 📱 API Reference Summary

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/start` | Create a new chat group |
| GET | `/api/chat/history` | Get chat message history |
| GET | `/health` | Server health check |
| GET | `/` | API information |

### Socket.IO Events

| Event | Type | Description |
|-------|------|-------------|
| `joinChatRoom` | Emit | Join a chat room |
| `joinChatRoom` | Listen | Confirmation response |
| `sendMessage` | Emit | Send a message |
| `sendMessage` | Listen | Send confirmation |
| `receiveMessage` | Listen | Receive messages from room |

---

## 🎯 Next Steps

1. ✅ **Test with the HTML client** - Easiest way to see everything working
2. ✅ **Create multiple chat rooms** - Test with different chatIds
3. ✅ **Add more users** - Modify `seedUsers.js` and run again
4. ✅ **Integrate with your frontend** - Use the Socket.IO examples
5. ✅ **Add authentication** - Extend the User model and validation

---

## 💡 Pro Tips

- Use **Chrome DevTools** (F12) → Network tab → WS to see Socket.IO messages
- Keep the **server terminal open** to see real-time logs
- Test with **multiple browser windows** to simulate different users
- The HTML test client has **auto-scroll** and **sound notifications**
- Messages are **persisted in MongoDB** so history is always available

---

## 🆘 Need Help?

Check the server logs for detailed error messages. All errors are logged to the console with descriptive messages.

Common error messages:
- `"User not found"` → Run `npm run seed`
- `"Chat not found"` → Use a valid chatId from `/api/chat/start`
- `"User is not a member of this chat"` → Add user to members array when creating chat

---

Enjoy your chat system! 🚀💬
