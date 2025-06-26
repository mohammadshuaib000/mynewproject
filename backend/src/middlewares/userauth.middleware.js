import jwt from 'jsonwebtoken';
import { UserAuth } from '../modules/auth/userauth.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from './asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request - Access token is required");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await UserAuth.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token - User not found");
        }

        if (!user.isActive) {
            throw new ApiError(401, "User account is deactivated");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid access token");
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Access token expired");
        } else if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(401, "Token verification failed");
        }
    }
});

// Middleware to check if user is verified
export const verifyUserStatus = asyncHandler(async (req, res, next) => {
    if (!req.user.isVerified) {
        throw new ApiError(403, "Please verify your account to access this resource");
    }
    next();
});

// Middleware to check user role
export const checkRole = (roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied - Insufficient permissions");
        }
        next();
    });
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await UserAuth.findById(decodedToken?._id).select("-password -refreshToken");

        if (user && user.isActive) {
            req.user = user;
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
    }

    next();
});
