
import { body, validationResult } from 'express-validator';
import { ApiError } from './ApiError.js';

export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  // Accept both formats: +918004000703 or 8004000703
  const e164Regex = /^\+91[6-9]\d{9}$/; // E.164 format for India
  const localRegex = /^[6-9]\d{9}$/; // Local Indian format
  return e164Regex.test(phone) || localRegex.test(phone);
};

export const formatPhoneToE164 = (phone) => {
  // If already in E.164 format, return as is
  if (phone.startsWith('+91')) {
    return phone;
  }
  // If local Indian number, add +91 prefix
  if (/^[6-9]\d{9}$/.test(phone)) {
    return `+91${phone}`;
  }
  // Return as is for other formats (let Twilio handle the error)
  return phone;
};

export const validateOTP = (otp) => {
  const otpRegex = /^\d{4,6}$/; // Support 4-6 digit OTPs
  return otpRegex.test(otp);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const validateRequired = (fields, data) => {
  const missing = [];
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      missing.push(field);
    }
  });
  return missing;
};

// Password validation
export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
};


// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    throw new ApiError(400, 'Validation failed', errorMessages);
  }

  next();
};

// Check if at least one contact method is provided
export const validateContactMethod = (req, res, next) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    throw new ApiError(400, 'Either email or phone number is required');
  }

  next();
};

