// controllers/user.controller.js
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { getUsersService } = require("../services/user.service");

const getUsersController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const users = await getUsersService(userId);

  return res.status(200).json({
    message: "Users retrieved successfully",
    users,
  });
});

module.exports = { getUsersController };