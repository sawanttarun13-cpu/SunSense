import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { morganMiddleware } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/device.routes';
import readingsRoutes from './routes/readings/readings.routes';
import sunscreenRoutes from './routes/sunscreen/sunscreen.routes';
import dashboardRoutes from './routes/dashboard/dashboard.routes';
import analyticsRoutes from './routes/analytics/analytics.routes';
import historyRoutes from './routes/history/history.routes';
import alertsRoutes from './routes/alerts/alerts.routes';
import profileRoutes from './routes/profile/profile.routes';
import settingsRoutes from './routes/settings/settings.routes';
import { config } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morganMiddleware);
app.use(globalLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/device', deviceRoutes);
app.use('/api/v1/readings', readingsRoutes);
app.use('/api/v1/sunscreen', sunscreenRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1', healthRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
