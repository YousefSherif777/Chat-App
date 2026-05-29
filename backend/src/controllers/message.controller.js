// controllers/message.controller.js
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const { sendMessageSchema } = require("../validators/message.validator");
const { sendMessageService } = require("../services/message.service");

const sendMessageController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const body = sendMessageSchema.parse(req.body);
  const result = await sendMessageService(userId, body);

  return res.status(200).json({
    message: "Message sent successfully",
    ...result,
  });
});

module.exports = { sendMessageController };