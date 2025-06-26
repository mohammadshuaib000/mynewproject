import { client, verifyServiceSid } from "../config/twilio.js";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const otpStore = new Map();

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send OTP via Twilio or Email
export const sendOTP = asyncHandler(async ({ phone, email }) => {
  if (phone) {
    return client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: "sms" });
  } else if (email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await transporter.sendMail({
      to: email,
      subject: "Your OTP Code - Sajawat Sarees",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 30px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://your-company-logo-url.com/logo.png" alt="Sajawat Sarees" style="height: 50px;" />
            <h2 style="color: #2c3e50; margin-top: 20px;">One-Time Password (OTP)</h2>
          </div>

          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your OTP code is:</p>

          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; color: #2c3e50; letter-spacing: 10px; padding: 15px 30px; background-color: #f0f0f0; border-radius: 8px; border: 1px solid #ccc;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 14px; color: #777;">
            This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
          </p>

          <p style="font-size: 14px; color: #777;">
            If you did not request this code, you can safely ignore this email.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="text-align: center; font-size: 12px; color: #aaa;">
            &copy; ${new Date().getFullYear()} Sajawat Sarees. All rights reserved.
          </p>
        </div>
      `,
    });

    return new ApiResponse(200, { status: "sent", method: "email" }, "OTP sent to email.");
  } else {
    throw new ApiError(400, "Phone or email is required to send OTP");
  }
});

// ✅ Verify OTP
export const verifyOTP = asyncHandler(async ({ phone, email, code }) => {
  if (phone) {
    try {
      const verificationCheck = await client.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: phone, code });

      if (verificationCheck.status === "approved") {
        return new ApiResponse(200, { status: "approved", method: "phone" }, "OTP verified successfully");
      } else {
        throw new ApiError(401, "Invalid or expired OTP for phone");
      }
    } catch (error) {
      throw new ApiError(500, "Twilio OTP verification failed", [error.message]);
    }
  } else if (email) {
    const entry = otpStore.get(email);
    if (!entry || entry.otp !== code || entry.expiresAt < Date.now()) {
      throw new ApiError(401, "Invalid or expired OTP for email");
    }

    otpStore.delete(email);
    return new ApiResponse(200, { status: "approved", method: "email" }, "OTP verified successfully");
  } else {
    throw new ApiError(400, "Phone or email is required to verify OTP");
  }
});
