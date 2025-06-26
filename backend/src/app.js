// server.js or app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import xss from 'xss-clean';



// Import middlewares
import { generalLimiter } from "./middlewares/rateLimitMiddleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Import and initialize Cloudinary
import { initializeCloudinary } from "./config/cloudinary.js";

const app = express();

// Initialize Cloudinary
initializeCloudinary();

// Security Middlewares
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(hpp());
app.use(xss());

// General rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Sajawat Sarees Backend API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.use("/api/v1/auth/admin", AdminRoute);
app.use("/api/v1/auth/user", CustomerAuthRoute);


// 404 handler for undefined routes
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});

// Global error handling middleware
app.use(errorHandler);

export { app };
