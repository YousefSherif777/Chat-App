// models/User.js
const mongoose = require('mongoose')
const { hashValue, compareValue } = require('../utils/bcrypt')

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar:   { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, resJSON) => {
        delete resJSON.password
        return resJSON
      }
    }
  }
)


userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await hashValue(this.password)
  }
  next()
})


userSchema.methods.comparePassword = async function (val) {
  return compareValue(val, this.password)
}

const UserModel = mongoose.model('User', userSchema)
module.exports = UserModel