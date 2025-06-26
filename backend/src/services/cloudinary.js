import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { ApiError } from "../utils/ApiError.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary and delete local file after upload
 * @param {string} localFilePath - Path to local file
 * @param {object} options - Cloudinary upload options
 * @returns {object} Upload result details
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    if (!localFilePath) throw new ApiError(400, "No file path provided");

    try {
        await fs.access(localFilePath); // Check file existence asynchronously

        const uploadOptions = {
            resource_type: "auto",
            folder: options.folder || "sajawat-sarees",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            ...options,
        };

        const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

        await fs.unlink(localFilePath); // Async remove local file

        return {
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            width: response.width,
            height: response.height,
            format: response.format,
            bytes: response.bytes,
            createdAt: response.created_at,
        };
    } catch (error) {
        // Attempt to remove local file if it exists, ignore errors here
        try {
            await fs.unlink(localFilePath);
        } catch {}

        console.error("Cloudinary upload error:", error);
        throw new ApiError(500, `Failed to upload image: ${error.message}`);
    }
};

/**
 * Upload profile image with specific transformation options
 * @param {string} localFilePath 
 * @param {string|number} userId 
 * @returns {object} Upload result
 */
const uploadProfileImage = async (localFilePath, userId) => {
    if (!userId) throw new ApiError(400, "User ID is required");

    const options = {
        folder: "sajawat-sarees/profiles",
        public_id: `profile_${userId}_${Date.now()}`,
        transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
        ],
    };

    return uploadOnCloudinary(localFilePath, options);
};

/**
 * Delete image from Cloudinary by public ID
 * @param {string} publicId 
 * @returns {object} Result of deletion
 */
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) throw new ApiError(400, "No public ID provided");

    try {
        const response = await cloudinary.uploader.destroy(publicId);
        return {
            success: response.result === "ok",
            result: response.result,
        };
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new ApiError(500, `Failed to delete image: ${error.message}`);
    }
};

/**
 * Generate optimized image URL from public ID
 * @param {string} publicId 
 * @param {object} options - Transformation options
 * @returns {string} Cloudinary image URL
 */
const generateOptimizedUrl = (publicId, options = {}) => {
    if (!publicId) throw new ApiError(400, "No public ID provided");

    try {
        const defaultOptions = {
            quality: "auto",
            fetch_format: "auto",
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
