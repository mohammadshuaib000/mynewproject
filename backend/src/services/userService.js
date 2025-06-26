import { CustomerAuth } from "../modules/auth/auth.model.js";

// Basic user queries
export const findUserById = (userId) => CustomerAuth.findById(userId);
export const findUserByPhone = (phone) => CustomerAuth.findOne({ phone });
export const findUserByEmail = (email) => CustomerAuth.findOne({ email });

// Combined query using $or
export const findUserByPhoneOrEmail = (phone, email) => {
  const query = [];
  if (phone) query.push({ phone });
  if (email) query.push({ email });

  return CustomerAuth.findOne({ $or: query });
};

// User creation
export const createUser = ({ phone, email, refreshToken }) => {
  const userData = {
    phone,
    email,
    refreshToken,
    isVerified: false, // Default to false until verified
  };

  const user = new CustomerAuth(userData);
  return user.save();
};

// User updates
export const updateUser = (userId, updateData) => {
  return CustomerAuth.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
};

// User deletion
export const deleteUser = (userId) => CustomerAuth.findByIdAndDelete(userId);
