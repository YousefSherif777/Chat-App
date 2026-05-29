// services/auth.service.js
const UserModel = require('../models/user.model')
const { NotFoundException, UnauthorizedException } = require('../utils/appError')

const registerService = async (body) => {
  const {name,email,password,avatar} = body

  // check if user already exists
  const existingUser = await UserModel.findOne({ email })
  if (existingUser) {
    throw new UnauthorizedException('User already exists')
  }

  const newUser = new UserModel({name,email,password,avatar})

  await newUser.save()   
  return newUser        
}

const loginService = async (body) => {
  const { email, password } = body


  const user = await UserModel.findOne({ email })
  if (!user) throw new NotFoundException('Email not found')
  
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password')

  return user
}

module.exports = { registerService, loginService }