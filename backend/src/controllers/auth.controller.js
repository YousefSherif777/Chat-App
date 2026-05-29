// controllers/auth.controller.js
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { loginSchema, registerSchema } = require("../validators/auth.validator");
const { loginService, registerService } = require("../services/auth.service");
const { clearJwtAuthCookie, setJwtAuthCookie } = require("../utils/cookie");

const registerController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const user = await registerService(body);
  const userId = user._id;

  return setJwtAuthCookie({ res, userId })
    .status(201)
    .json({
      message: "User created & login successfully",
      user,
    });
});

const loginController = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await loginService(body);
  const userId = user._id;

  return setJwtAuthCookie({ res, userId })
    .status(200)
    .json({
      message: "User login successfully",
      user,
    });
});

const logoutController = asyncHandler(async (req, res) => {
  return clearJwtAuthCookie(res).status(200).json({
    message: "User logout successfully",
  });
});

const authStatusController = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    message: "Authenticated User",
    user,
  });
});

module.exports = {
  registerController,
  loginController,
  logoutController,
  authStatusController,
};