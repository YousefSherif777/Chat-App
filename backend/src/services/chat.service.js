// services/chat.service.js
const ChatModel    = require('../models/chat.model')
const MessageModel = require('../models/message.model')
const UserModel    = require('../models/user.model')
const { BadRequestException, NotFoundException } = require('../utils/appError')
const { emitNewChatToParticipants } = require('../lib/socket')

const createChatService = async (userId, body) => {
  const { participantId, isGroup, participants, groupName } = body
  let chat
  let allParticipantIds = []

  // GROUP CHAT
  if (isGroup && participants?.length && groupName) {
    allParticipantIds = [userId, ...participants]  // add creator to the group

    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup:      true,
      groupName,
      createdBy:    userId,
    })

  // PRIVATE CHAT
  } else if (participantId) {

    // check the other user exists
    const otherUser = await UserModel.findById(participantId)
    if (!otherUser) throw new NotFoundException('User not found')

    allParticipantIds = [userId, participantId]

    // check if chat already exists between these 2 users
    const existingChat = await ChatModel.findOne({
      participants: {
        $all:  allParticipantIds,  // must have BOTH users
        $size: 2,                  // must have EXACTLY 2 users (no group chats)
      },
    }).populate('participants', 'name avatar')

    if (existingChat) return existingChat  // don't create duplicate, return existing
    
    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup:      false,
      createdBy:    userId,
    })
  }

  // populate participants to get name and avatar
  const populatedChat = await chat?.populate('participants', 'name avatar')

  // get list of participant IDs as strings for socket
  const participantIdStrings = populatedChat?.participants?.map(p => p._id.toString())

  // notify all participants via websocket that a new chat was created
  emitNewChatToParticipants(participantIdStrings, populatedChat)

  return chat
}


const getUserChatsService = async (userId) => {
  const chats = await ChatModel.find({
    participants: { $in: [userId] }  // find chats where user is a participant
  })
    .populate('participants', 'name avatar')  // get participant details
    .populate({
      path: 'lastMessage',      // get last message details
      populate: {
        path:   'sender',       // also get the sender of that message
        select: 'name avatar',
      },
    })
    .sort({ updatedAt: -1 })    // most recently active chats first

  return chats
}



const getSingleChatService = async (chatId, userId) => {

  // find chat — but only if this user is a participant
  const chat = await ChatModel.findOne({
    _id:          chatId,
    participants: { $in: [userId] }  // security check
  }).populate('participants', 'name avatar')

  if (!chat) throw new BadRequestException('Chat not found or you are not authorized')

  // get all messages in this chat
  const messages = await MessageModel.find({ chatId })
    .populate('sender', 'name avatar')  // who sent each message
    .populate({
      path:   'replyTo',                // if it's a reply, get original message
      select: 'content image sender',
      populate: {
        path:   'sender',               // also get the original sender's details
        select: 'name avatar',
      },
    })
    .sort({ createdAt: 1 })             // oldest messages first

  return { chat, messages }
}


const validateChatParticipant = async (chatId, userId) => {
  const chat = await ChatModel.findOne({
    _id:          chatId,
    participants: { $in: [userId] }  // user must be in participants
  })

  if (!chat) throw new BadRequestException('User not a participant in chat')

  return chat
}



module.exports = {
  createChatService,
  getUserChatsService,
  getSingleChatService,
  validateChatParticipant,
}