// services/message.service.js
const mongoose     = require('mongoose')
const cloudinary   = require('../config/cloudinary.config')
const ChatModel    = require('../models/chat.model')
const MessageModel = require('../models/message.model')
const { BadRequestException, NotFoundException } = require('../utils/appError')
const { emitNewMessageToChatRoom, emitLastMessageToParticipants } = require('../lib/socket')

const sendMessageService = async (userId, body) => {
  const { chatId, content, image, replyToId } = body

  // 1. check chat exists AND user is a participant
  const chat = await ChatModel.findOne({
    _id:          chatId,
    participants: { $in: [userId] }
  })
  if (!chat) throw new BadRequestException('Chat not found or unauthorized')

  // 2. if replying, check the original message exists in this chat
  if (replyToId) {
    const replyMessage = await MessageModel.findOne({
      _id:    replyToId,
      chatId,             // must be in the same chat
    })
    if (!replyMessage) throw new NotFoundException('Reply message not found')
  }

  // 3. if image — upload to cloudinary and get the URL
  let imageUrl
  if (image) {
    const uploadRes = await cloudinary.uploader.upload(image)
    imageUrl = uploadRes.secure_url  // "https://res.cloudinary.com/..."
  }

  // 4. create the message in DB
  const newMessage = await MessageModel.create({
    chatId,
    sender:  userId,
    content,
    image:   imageUrl,          // cloudinary URL or undefined
    replyTo: replyToId || null,
  })

  // 5. populate sender and replyTo with full details
  await newMessage.populate([
    {
      path:   'sender',
      select: 'name avatar',
    },
    {
      path:   'replyTo',
      select: 'content image sender',
      populate: {
        path:   'sender',
        select: 'name avatar',
      },
    },
  ])

  // 6. update the chat's lastMessage
  chat.lastMessage = newMessage._id
  await chat.save()

  // 7. notify the chat room — everyone in the chat sees the new message
  emitNewMessageToChatRoom(userId, chatId, newMessage)

  // 8. notify each participant's personal room — updates their chat list preview
  const allParticipantIds = chat.participants.map(id => id.toString())
  emitLastMessageToParticipants(allParticipantIds, chatId, newMessage)

  return {
    userMessage: newMessage,
    chat,
  }
}

module.exports = { sendMessageService }