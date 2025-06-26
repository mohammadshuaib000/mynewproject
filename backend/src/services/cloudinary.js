import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    try {
        if (!localFilePath) {
            throw new ApiError(400, "No file path provided");
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            throw new ApiError(400, "File does not exist");
        }

        // Default upload options
        const uploadOptions = {
            resource_type: "auto",
            folder: options.folder || "sajawat-sarees",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            ...options
        };

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

        // Remove the locally saved temporary file after successful upload
        fs.unlinkSync(localFilePath);

        return {
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            width: response.width,
            height: response.height,
            format: response.format,
            bytes: response.bytes,
            createdAt: response.created_at
        };

    } catch (error) {
        // Remove the locally saved temporary file if upload failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.error("Cloudinary upload error:", error);
        throw new ApiError(500, `Failed to upload image: ${error.message}`);
    }
};

// Upload profile image with specific settings
const uploadProfileImage = async (localFilePath, userId) => {
    try {
        const options = {
            folder: "sajawat-sarees/profiles",
            public_id: `profile_${userId}_${Date.now()}`,
            transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto", fetch_format: "auto" }
            ]
        };

        return await uploadOnCloudinary(localFilePath, options);
    } catch (error) {
        throw new ApiError(500, `Failed to upload profile image: ${error.message}`);
    }
};



// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new ApiError(400, "No public ID provided");
        }

        const response = await cloudinary.uploader.destroy(publicId);

        return {
            success: response.result === 'ok',
            result: response.result
        };
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new ApiError(500, `Failed to delete image: ${error.message}`);
    }
};



// Generate optimized image URL
const generateOptimizedUrl = (publicId, options = {}) => {
    try {
        if (!publicId) {
            throw new ApiError(400, "No public ID provided");
        }

        const defaultOptions = {
            quality: "auto",
            fetch_format: "auto"
        };

        const transformOptions = { ...defaultOptions, ...options };

        return cloudinary.url(publicId, transformOptions);
    } catch (error) {
        console.error("Cloudinary URL generation error:", error);
        throw new ApiError(500, `Failed to generate optimized URL: ${error.message}`);
    }
};



export {
    uploadOnCloudinary,
    uploadProfileImage,
    deleteFromCloudinary,
    generateOptimizedUrl,
};