/* eslint-disable no-console */
import morgan from 'morgan';

export const logger = {
  info: (message: string, ...meta: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...meta);
  },
  warn: (message: string, ...meta: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...meta);
  },
  error: (message: string, ...meta: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...meta);
  },
  debug: (message: string, ...meta: any[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...meta);
    }
  },
};

export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms'
);
