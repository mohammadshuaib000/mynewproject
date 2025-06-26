import jwt from 'jsonwebtoken';
import { UserAuth } from '../modules/auth/userauth.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from './asyncHandler.js';

// Extract token helper
const extractToken = (req) => {
  return req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
};

// Middleware to verify JWT and attach user
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, "Unauthorized request - Access token is required");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Use the correct key for user ID from the token
    const userId = decodedToken?._id || decodedToken?.id;
    if (!userId) {
      throw new ApiError(401, "Invalid token payload - Missing user ID");
    }

    const user = await UserAuth.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token - User not found");
    }

    if (user.isActive === false) {
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
  if (!req.user?.isVerified) {
    throw new ApiError(403, "Please verify your account to access this resource");
  }
  next();
});

// Middleware to check user role(s)
export const checkRole = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, "Access denied - Insufficient permissions");
    }
    next();
  });
};

// Optional authentication - attach user if token valid, else null
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedToken?._id || decodedToken?.id;
    if (!userId) {
      req.user = null;
      return next();
    }

    const user = await UserAuth.findById(userId).select("-password -refreshToken");

    req.user = user && user.isActive !== false ? user : null;
  } catch {
    req.user = null;
  }

  next();
});
