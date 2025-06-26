import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import { app } from './src/app.js';

dotenv.config({
  path: './.env',
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express Server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running on port: http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

startServer(); // 🚨 You MUST have this
