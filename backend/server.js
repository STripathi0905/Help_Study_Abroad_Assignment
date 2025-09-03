require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const boardRoutes = require('./routes/boards');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/users', userRoutes);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  let currentBoardId = null;
  let userData = null;

  socket.on('join-board', (data) => {
    const { boardId, userData: userInfo } = data;
    currentBoardId = boardId;
    userData = userInfo || { id: socket.id, name: 'Anonymous' };

    if (!activeUsers[boardId]) {
      activeUsers[boardId] = [];
    }

    userData.socketId = socket.id;
    activeUsers[boardId].push(userData);
    
    socket.join(boardId);
    console.log(`User ${socket.id} joined board: ${boardId}`);
 
    socket.to(boardId).emit('user-joined', userData);

    io.to(boardId).emit('active-users', activeUsers[boardId]);
  });

  socket.on('leave-board', (data) => {
    const { boardId } = data;
    if (activeUsers[boardId]) {
      activeUsers[boardId] = activeUsers[boardId].filter(user => user.socketId !== socket.id);
      
      socket.to(boardId).emit('user-left', userData);

      io.to(boardId).emit('active-users', activeUsers[boardId]);
    }
    
    socket.leave(boardId);
    console.log(`User ${socket.id} left board: ${boardId}`);
  });

  socket.on('get-active-users', (boardId) => {
    if (activeUsers[boardId]) {
      socket.emit('active-users', activeUsers[boardId]);
    } else {
      socket.emit('active-users', []);
    }
  });

  socket.on('user-typing', (data) => {
    const { boardId } = data;
    socket.to(boardId).emit('user-typing', userData);
  });

  socket.on('task-moved', (data) => {
    socket.to(data.boardId).emit('task-updated', data);
  });

  socket.on('task-created', (data) => {
    socket.to(data.boardId).emit('new-task', data.task);
  });

  socket.on('task-updated', (data) => {
    socket.to(data.boardId).emit('update-task', data.task);
  });

  socket.on('task-deleted', (data) => {
    socket.to(data.boardId).emit('delete-task', data.taskId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
 
    if (currentBoardId && activeUsers[currentBoardId]) {
      activeUsers[currentBoardId] = activeUsers[currentBoardId].filter(user => user.socketId !== socket.id);

      socket.to(currentBoardId).emit('user-left', userData);

      io.to(currentBoardId).emit('active-users', activeUsers[currentBoardId]);
    }
  });
});

const connectDB = async () => {
  try {
    // Comment out MongoDB connection for testing
    // await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban');
    console.log('MongoDB connection skipped for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process for testing
    // process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };