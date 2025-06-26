import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const CustomerAuthSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);


const AdminAuthSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            default: 'flipart@email.com',
        },
        password: {
            type: String,
            required: true,
            default: 'flipkart@123', // Will be hashed before saving
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String
        }
    },
    { timestamps: true }
);

// Hash password before saving
AdminAuthSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

export const AdminAuth = mongoose.model('AdminAuth', AdminAuthSchema);
export const CustomerAuth = mongoose.model('CustomerAuth', CustomerAuthSchema);
