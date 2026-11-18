import rateLimit from 'express-rate-limit';
import { config } from '../config/env.ts';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMaxRequests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      status: 429,
      endpoint: req.path,
      timestamp: new Date().toISOString(),
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down and try again shortly.',
      },
    });
  },
});
