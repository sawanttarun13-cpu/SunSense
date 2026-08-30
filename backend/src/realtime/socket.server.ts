import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'node:http';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { socketAuthMiddleware } from './socket.auth';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './socket.types';

// The single, centralized instance of the Socket.IO server
let io: SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

/**
 * Initializes the Socket.IO server on top of the provided HTTP server.
 * Ensures exactly one instance is created.
 */
export const initSocketServer = (httpServer: HttpServer) => {
  if (io) {
    logger.warn('Socket.IO server is already initialized.');
    return;
  }

  // Set up the Socket.IO server with the same CORS origin as the REST API
  io = new SocketServer(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Apply authentication middleware to all incoming connections
  io.use(socketAuthMiddleware);

  // Handle successful connections
  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    // Securely join the server-assigned user room for multi-user isolation
    // The client is NEVER allowed to request to join a room.
    socket.join(`user:${userId}`);

    logger.info(`Socket connected [ID: ${socket.id}, User: ${userId}]`);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected [ID: ${socket.id}, Reason: ${reason}]`);
    });
  });

  logger.info('Socket.IO server initialized successfully');
};

/**
 * Retrieves the initialized Socket.IO instance for event emission.
 * Throws an error if called before initSocketServer().
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO server has not been initialized. Call initSocketServer() first.');
  }
  return io;
};
