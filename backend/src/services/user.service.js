import UserModel from "../models/user.model";


// Get all users except current user
export const getUsersService = async (userId) => {
  const users = await UserModel.find({
    _id: { $ne: userId }, // not equal to current user
  }).select("-password");

  return users;
};