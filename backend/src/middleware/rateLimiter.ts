import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
});
