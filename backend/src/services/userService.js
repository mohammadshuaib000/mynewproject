import { UserAuth } from "../modules/auth/auth.model.js";


// Basic user queries
export const findUserById = (userId) => UserAuth.findById(userId);
export const findUserByPhone = (phone) => UserAuth.findOne({ phone });
export const findUserByEmail = (email) => UserAuth.findOne({ email });

// Combined query using $or
export const findUserByPhoneOrEmail = (phone, email) => {
  const query = [];
  if (phone) query.push({ phone });
  if (email) query.push({ email });

  return UserAuth.findOne({ $or: query });
};

// User creation
export const createUser = ({ phone, email, password, fullName, refreshToken }) => {
  const userData = {
    phone,
    email,
    refreshToken,
    role,
    isVerified: false, // Change to true if already verified
  };

  const user = new UserAuth(userData);
  return user.save();
};

// User updates
export const updateUser = (userId, updateData) => {
  return UserAuth.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
};

// User deletion
export const deleteUser = (userId) => UserAuth.findByIdAndDelete(userId);
