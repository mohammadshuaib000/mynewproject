import rateLimit from "express-rate-limit";

// Generic rate limiter factory
export const rateLimitMiddleware = (maxRequests, windowMinutes) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    message: {
      success: false,
      message: `Too many requests, please try again after ${windowMinutes} minutes.`,
      retryAfter: windowMinutes * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: `Too many requests, please try again after ${windowMinutes} minutes.`,
        retryAfter: windowMinutes * 60,
      });
    },
  });
};

// Specific rate limiters
export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: {
    success: false,
    message: "Too many OTP requests, please try again after 1 minute.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 login attempts per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 registrations per 15 minutes
  message: {
    success: false,
    message: "Too many registration attempts, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow 100 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
