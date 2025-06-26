import express from 'express';
import { sendOTP } from '../auth/customerauth.controller.js';

const router = express.Router();

// Route to send OTP via phone or email
router.post('/send-otp', sendOTP);

export default router;
