import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { SocketData } from './socket.types';

/**
 * Socket.IO middleware for authenticating connections using JWT.
 * 
 * Rejects connections with an Error if:
 * - Token is missing
 * - Token is invalid or expired
 * - User no longer exists in the DB
 * 
 * Sets socket.data.userId upon success.
 */
export const socketAuthMiddleware = async (
  socket: Socket<any, any, any, SocketData>,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized - No token provided'));
    }

    // Verify token using the same logic as requireAuth middleware
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    // Confirm the user still exists in the DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true }
    });

    if (!user) {
      return next(new Error('Unauthorized - User not found'));
    }

    // Attach user identity to socket data
    socket.data.userId = user.id;
    next();
  } catch (error) {
    // Catch jwt errors (expired, invalid signature, etc)
    return next(new Error('Unauthorized - Invalid token'));
  }
};
