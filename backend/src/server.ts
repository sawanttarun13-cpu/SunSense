/**
 * --------------------------------------------------------
 * File: server.ts
 * Layer: Entry Point
 *
 * Purpose:
 * Boots the Express HTTP server on the configured port.
 * This is the application's main entry point — it imports
 * the fully configured Express app and starts listening
 * for incoming connections.
 *
 * Startup Sequence:
 * 1. Import the Express app from app.ts
 * 2. Read the port from environment configuration
 * 3. Start listening on that port
 * 4. Log confirmation to the console
 * 5. Exit the process if startup fails
 * --------------------------------------------------------
 */
import { createServer } from 'node:http';
import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { initSocketServer } from './realtime/socket.server';

/**
 * Starts the HTTP server and Socket.IO realtime server.
 *
 * Wrapped in a try/catch so that any fatal startup errors
 * (e.g., port already in use) are logged clearly before
 * the process exits rather than producing a cryptic crash.
 */
const startServer = () => {
  try {
    const httpServer = createServer(app);
    
    // Initialize realtime WebSockets on the same HTTP server
    initSocketServer(httpServer);

    httpServer.listen(config.port, () => {
      logger.info(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
