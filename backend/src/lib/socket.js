// lib/socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { validateChatParticipant } = require("../services/chat.service");

let io = null;
const onlineUsers = new Map();

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      const token = rawCookie?.split("=")?.[1]?.trim();
      if (!token) return next(new Error("Unauthorized"));

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodedToken) return next(new Error("Unauthorized"));

      socket.userId = decodedToken.userId;
      next();
    } catch (error) {
      next(new Error("Internal server error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    const newSocketId = socket.id;

    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }

    // register socket for the user
    onlineUsers.set(userId, newSocketId);

    // broadcast online users to all sockets
    io.emit("online:users", Array.from(onlineUsers.keys()));

    // create personal room for user
    socket.join(`user:${userId}`);

    socket.on("chat:join", async (chatId, callback) => {
      try {
        await validateChatParticipant(chatId, userId);
        socket.join(`chat:${chatId}`);
        console.log(`User ${userId} join room chat:${chatId}`);
        callback?.();
      } catch (error) {
        callback?.("Error joining chat");
      }
    });

    socket.on("chat:leave", (chatId) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`User ${userId} left room chat:${chatId}`);
      }
    });

    socket.on("disconnect", () => {
      if (onlineUsers.get(userId) === newSocketId) {
        if (userId) onlineUsers.delete(userId);
        io.emit("online:users", Array.from(onlineUsers.keys()));
        console.log("socket disconnected", { userId, newSocketId });
      }
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

const emitNewChatToParticipants = (participantIds = [], chat) => {
  const io = getIO();
  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:new", chat);
  }
};

const emitNewMessageToChatRoom = (senderId, chatId, message) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId?.toString());

  console.log(senderId, "senderId");
  console.log(senderSocketId, "sender socketid exist");
  console.log("All online users:", Object.fromEntries(onlineUsers));

  if (senderSocketId) {
    io.to(`chat:${chatId}`).except(senderSocketId).emit("message:new", message);
  } else {
    io.to(`chat:${chatId}`).emit("message:new", message);
  }
};

const emitLastMessageToParticipants = (participantIds, chatId, lastMessage) => {
  const io = getIO();
  const payload = { chatId, lastMessage };
  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:update", payload);
  }
};

module.exports = {
  initializeSocket,
  emitNewChatToParticipants,
  emitNewMessageToChatRoom,
  emitLastMessageToParticipants,
};