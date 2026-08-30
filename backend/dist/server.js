"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const node_http_1 = require("node:http");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const socket_server_1 = require("./realtime/socket.server");
/**
 * Starts the HTTP server and Socket.IO realtime server.
 *
 * Wrapped in a try/catch so that any fatal startup errors
 * (e.g., port already in use) are logged clearly before
 * the process exits rather than producing a cryptic crash.
 */
const startServer = () => {
    try {
        const httpServer = (0, node_http_1.createServer)(app_1.default);
        // Initialize realtime WebSockets on the same HTTP server
        (0, socket_server_1.initSocketServer)(httpServer);
        httpServer.listen(env_1.config.port, () => {
            logger_1.logger.info(`Server is running in ${env_1.config.nodeEnv} mode on port ${env_1.config.port}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
