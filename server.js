const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const ROOM = 'global';
const users = new Map();
const typingUsers = new Set();

app.use(express.static(path.join(__dirname, 'public')));

const getTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getTypingNames = () =>
  Array.from(typingUsers)
    .map((socketId) => users.get(socketId))
    .filter(Boolean);

const emitUsersUpdate = () => {
  const onlineUsers = Array.from(users.values()).sort((a, b) => a.localeCompare(b));
  io.to(ROOM).emit('users:update', onlineUsers);
};

const emitTypingUpdate = () => {
  io.to(ROOM).emit('typing:update', { users: getTypingNames() });
};

io.on('connection', (socket) => {
  socket.on('join', (rawName, callback) => {
    const name = String(rawName || '').trim().slice(0, 32);

    if (!name) {
      if (typeof callback === 'function') {
        callback({ ok: false, error: 'Display name is required.' });
      }
      return;
    }

    users.set(socket.id, name);
    socket.join(ROOM);

    socket.emit('join:success', { name, timestamp: getTimestamp() });
    socket.to(ROOM).emit('system:message', {
      text: `${name} joined the chat.`,
      timestamp: getTimestamp(),
    });

    emitUsersUpdate();

    if (typeof callback === 'function') {
      callback({ ok: true, name });
    }
  });

  socket.on('chat:message', (rawMessage) => {
    const name = users.get(socket.id);
    if (!name) {
      return;
    }

    const text = String(rawMessage || '').trim().slice(0, 1000);
    if (!text) {
      return;
    }

    io.to(ROOM).emit('chat:message', {
      name,
      text,
      timestamp: getTimestamp(),
    });
  });

  socket.on('typing', (isTyping) => {
    const name = users.get(socket.id);
    if (!name) {
      return;
    }

    if (isTyping) {
      typingUsers.add(socket.id);
    } else {
      typingUsers.delete(socket.id);
    }

    emitTypingUpdate();
  });

  socket.on('disconnect', () => {
    const name = users.get(socket.id);

    users.delete(socket.id);
    typingUsers.delete(socket.id);

    if (name) {
      socket.to(ROOM).emit('system:message', {
        text: `${name} left the chat.`,
        timestamp: getTimestamp(),
      });
    }

    emitUsersUpdate();
    emitTypingUpdate();
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
