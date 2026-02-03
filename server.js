const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for dev
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// In-memory Database
const users = []; // { id, email, password, name, bio, hub: null, connected: [], avatar: null }
const messages = {
  general: [],
  traders: [],
  creative: [],
  developers: []
}; 
// DM Messages: Key = sorted(user1Id, user2Id).join('-') -> [ { senderId, content, type, timestamp } ]
const dmMessages = {};
// Connection Requests/Status
// Key = sorted(user1Id, user2Id).join('-') -> { status: 'pending' | 'accepted', initiator: userId, msgCount: 0 }
const connections = {};

// Helper to find user
const findUser = (email) => users.find(u => u.email === email);
const findUserById = (id) => users.find(u => u.id === id);

// Auth Routes
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  if (findUser(email)) return res.status(400).json({ error: 'User already exists' });
  
  const newUser = {
    id: uuidv4(),
    email,
    password, // In real app, hash this!
    name,
    bio: '',
    hub: null,
    connected: [], // Array of userIds
    avatar: null
  };
  users.push(newUser);
  res.json({ user: newUser });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user });
});

app.post('/api/update-profile', (req, res) => {
  const { userId, bio, avatar } = req.body;
  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  res.json({ user });
});

app.post('/api/join-hub', (req, res) => {
  const { userId, hub } = req.body;
  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (user.hub && user.hub !== hub) {
    return res.status(403).json({ error: `You are already a member of ${user.hub} Hub. Other hubs are locked.` });
  }
  
  user.hub = hub;
  res.json({ user });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const { target, type } = req.body; // target = 'general' | 'dm', type = 'image' | 'voice'
  
  let scanned = false;
  if (target === 'general' && type === 'image') {
    // Mock Scan
    scanned = true;
    console.log(`Scanning image ${req.file.filename}... Safe.`);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, scanned });
});

app.get('/api/users', (req, res) => {
    // Return list of users for directory (exclude sensitive info)
    const publicUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        hub: u.hub,
        avatar: u.avatar,
        bio: u.bio
    }));
    res.json(publicUsers);
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // General & Hub Messages
  socket.on('send_message', (data) => {
    // data: { room, senderId, content, type (text/image/voice), senderName }
    const { room, senderId, content, type, senderName } = data;
    
    const msg = {
      id: uuidv4(),
      senderId,
      senderName,
      content,
      type,
      timestamp: new Date()
    };

    if (messages[room]) {
        messages[room].push(msg);
        io.to(room).emit('receive_message', msg);
    }
  });

  // DM Logic
  socket.on('send_dm', (data) => {
    const { senderId, receiverId, content, type } = data;
    const sortedIds = [senderId, receiverId].sort();
    const connKey = sortedIds.join('-');

    // Initialize connection state if not exists
    if (!connections[connKey]) {
        connections[connKey] = { status: 'pending', initiator: senderId, msgCount: 0 };
    }

    const conn = connections[connKey];
    
    // Check constraints
    if (conn.status === 'pending') {
        // If sender is NOT the initiator, they are accepting by replying? 
        // Or if they explicitly accept.
        // For now, let's implement the "3 message limit" for the initiator.
        if (conn.initiator === senderId) {
            if (conn.msgCount >= 3) {
                socket.emit('dm_error', { message: 'Connection pending. You can only send 3 messages until accepted.' });
                return;
            }
            conn.msgCount++;
        } else {
            // Receiver replied, auto-accept? Or separate accept action?
            // User said "before the person accept".
            // So receiver must accept explicitly usually, but replying might count.
            // Let's assume explicit accept is needed, but for now allow receiver to reply freely?
            // Actually, usually receiver can't reply if they haven't accepted.
        }
    }

    // Store message
    if (!dmMessages[connKey]) dmMessages[connKey] = [];
    
    const msg = {
        id: uuidv4(),
        senderId,
        content,
        type,
        timestamp: new Date()
    };
    
    dmMessages[connKey].push(msg);
    
    // Emit to both users
    const payload = { ...msg, from: senderId, receiverId };
    io.emit(`dm_${receiverId}`, payload); // Broadcast to receiver
    io.emit(`dm_${senderId}`, payload); // Echo back to sender
  });

  socket.on('accept_connection', (data) => {
      const { userId, targetId } = data;
      const sortedIds = [userId, targetId].sort();
      const connKey = sortedIds.join('-');
      
      if (connections[connKey]) {
          connections[connKey].status = 'accepted';
          
          // Update users connected lists
          const u1 = findUserById(userId);
          const u2 = findUserById(targetId);
          if (u1 && !u1.connected.includes(targetId)) u1.connected.push(targetId);
          if (u2 && !u2.connected.includes(userId)) u2.connected.push(userId);
          
          io.emit(`connection_update_${userId}`, { targetId, status: 'accepted' });
          io.emit(`connection_update_${targetId}`, { targetId: userId, status: 'accepted' });
      }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
