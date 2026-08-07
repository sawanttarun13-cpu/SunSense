/**
 * --------------------------------------------------------
 * File: logger.ts
 * Layer: Utility
 *
 * Purpose:
 * Provides a lightweight structured logger and a Morgan
 * HTTP request logging middleware. All application-level
 * logging is routed through this module instead of calling
 * console.log directly, making it easy to swap the
 * implementation for a production logger (e.g., Winston,
 * Pino) in the future without touching business logic.
 *
 * Log Levels (in ascending severity):
 * debug → info → warn → error
 *
 * The `debug` level is only active when LOG_LEVEL=debug is
 * set in the environment, preventing verbose output in
 * production.
 * --------------------------------------------------------
 */
/* eslint-disable no-console */
import morgan from 'morgan';

/**
 * Application-level structured logger.
 *
 * Each method prefixes the message with a level tag and
 * an ISO 8601 timestamp so log entries can be sorted and
 * filtered in any log aggregation system.
 */
export const logger = {
  /**
   * Logs an informational message.
   * Use for significant lifecycle events (server start, migration complete).
   *
   * @param message - The message to log.
   * @param meta    - Optional additional data to include in the log.
   */
  info: (message: string, ...meta: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...meta);
  },

  /**
   * Logs a warning message.
   * Use for non-fatal issues that may need attention (deprecated usage, fallback triggered).
   *
   * @param message - The warning message.
   * @param meta    - Optional additional data.
   */
  warn: (message: string, ...meta: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...meta);
  },

  /**
   * Logs an error message.
   * Use for exceptions, failed operations, and unhandled rejections.
   *
   * @param message - The error message.
   * @param meta    - Optional additional data (e.g., the caught error object).
   */
  error: (message: string, ...meta: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...meta);
  },

  /**
   * Logs a debug message.
   * Only emitted when LOG_LEVEL=debug in the environment.
   * Use during development for detailed tracing.
   *
   * @param message - The debug message.
   * @param meta    - Optional additional data.
   */
  debug: (message: string, ...meta: any[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...meta);
    }
  },
};

/**
 * Morgan HTTP request logging middleware.
 *
 * Logs every incoming HTTP request in the format:
 * METHOD URL STATUS bytes - responseTimeMs
 *
 * Example:
 * GET /api/v1/health 200 42 - 3.5 ms
 *
 * Mount this middleware early in the Express pipeline (before routes)
 * so that every request, including ones that hit the 404 handler, is logged.
 */
export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms'
);
