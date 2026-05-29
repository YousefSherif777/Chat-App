const { z } = require('zod')

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email format")
  .toLowerCase()

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password too long")
  .regex(/[a-z]/, "Must include lowercase letter")
  .regex(/[A-Z]/, "Must include uppercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^a-zA-Z0-9]/, "Must include a special character")

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name too short")
  .max(50, "Name too long")

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  avatar: z.string().url("Invalid avatar URL").optional(),
})

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
})

module.exports = { registerSchema, loginSchema }