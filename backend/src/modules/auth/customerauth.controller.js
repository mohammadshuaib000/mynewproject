import * as otpService from "../../services/otpService.js";
import * as userService from "../../services/userService.js";
import { validateEmail, validatePhone, sanitizeInput, formatPhoneToE164, validateOTP } from "../../utils/validation.js";
import { UserAuth } from "./userauth.model.js";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import jwt from "jsonwebtoken";

// ✅ Send OTP
const sendOTP = asyncHandler(async (req, res) => {
    let { phone, email } = req.body;

    // Sanitize inputs
    phone = sanitizeInput(phone);
    email = sanitizeInput(email);

    if (!phone && !email) {
        throw new ApiError(400, "Phone or Email is required");
    }

    // Validate formats
    if (phone && !validatePhone(phone)) {
        throw new ApiError(400, "Invalid phone number format");
    }

    if (email && !validateEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Format phone number to E.164 format for Twilio
    if (phone) {
        phone = formatPhoneToE164(phone);
    }

    try {
        // Check if user exists for better UX messaging
        const user = await userService.findUserByPhoneOrEmail(phone, email);
        const result = await otpService.sendOTP({ phone, email });

        const response = new ApiResponse(200, {
            result,
            userExists: !!user,
            isNewUser: !user,
        }, "OTP sent successfully");

        res.status(200).json(response);

    } catch (error) {
        throw new ApiError(500, "Failed to send OTP", [], error.stack);
    }
});



export {
    sendOTP
};
