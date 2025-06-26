import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import compression from 'compression';

// Security configuration object
export const securityConfig = {
  // Rate limiting configurations
  rateLimits: {
    // General API rate limit
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60, // seconds
      },
      standardHeaders: true,
      legacyHeaders: false,
    },

    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 auth requests per windowMs
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    },

    // OTP endpoints
    otp: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 OTP requests per hour
      message: {
        success: false,
        message: 'Too many OTP requests, please try again later.',
        retryAfter: 60 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    },

    // Password reset
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 password reset requests per hour
      message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
        retryAfter: 60 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  // Helmet security headers configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"], // add external script URLs if needed here
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },

  // CORS configuration
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins =
        process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || [
          'http://localhost:3000',
        ];

      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours in seconds
  },

  // Compression configuration
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        // Will not compress responses with this header
        return false;
      }
      return compression.filter(req, res);
    },
  },

  // Body parser limits
  bodyParser: {
    json: { limit: '16kb' },
    urlencoded: { extended: true, limit: '16kb' },
  },

  // JWT configuration
  jwt: {
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    issuer: 'sajawat-sarees-api',
    audience: 'sajawat-sarees-users',
  },

  // Password policy
  password: {
    minLength: 6,
    maxLength: 128,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
    saltRounds: 12,
  },

  // Session configuration
  session: {
    name: 'sajawat.sid',
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  },

  // File upload security
  fileUpload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },

  // Input validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 5,
  },
};

// Create rate limiters
export const createRateLimiters = () => {
  const limiters = {};

  Object.keys(securityConfig.rateLimits).forEach((key) => {
    limiters[key] = rateLimit(securityConfig.rateLimits[key]);
  });

  return limiters;
};

// Security middleware factory
export const createSecurityMiddleware = () => {
  return {
    helmet: helmet(securityConfig.helmet),
    hpp: hpp(),
    xss: xss(),
    compression: compression(securityConfig.compression),
    rateLimiters: createRateLimiters(),
  };
};

// Input sanitization helpers
export const sanitizeInput = {
  string: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  },

  email: (email) => {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
  },

  phone: (phone) => {
    if (typeof phone !== 'string') return '';
    return phone.replace(/\D/g, '');
  },

  alphanumeric: (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9]/g, '');
  },
};

// Security headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export default securityConfig;
