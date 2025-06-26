import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/ApiError.js";

// Cloudinary configuration
const configureCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });

        console.log("✅ Cloudinary configured successfully");
        return cloudinary;  // Return instance for use elsewhere if needed
    } catch (error) {
        console.error("❌ Cloudinary configuration failed:", error);
        return null;
    }
};

// Validate Cloudinary environment variables
const validateCloudinaryConfig = () => {
    const requiredVars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new ApiError(
            500,
            `Missing Cloudinary environment variables: ${missingVars.join(', ')}`
        );
    }

    return true;
};


// Initialize Cloudinary on module load
const initializeCloudinary = () => {
    try {
        validateCloudinaryConfig();
        configureCloudinary();

        console.log("🚀 Cloudinary initialization completed");
        return true;
    } catch (error) {
        console.error("❌ Cloudinary initialization failed:", error.message);
        return false;
    }
};

export {
    configureCloudinary,
    validateCloudinaryConfig,
    initializeCloudinary
};
