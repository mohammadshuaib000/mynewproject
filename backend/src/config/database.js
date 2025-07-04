import mongoose from 'mongoose';
import { DB_NAME } from '../constants/common.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`✅ MongoDB connected! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection FAILED', error);
    process.exit(1);
  }
};

export default connectDB;
