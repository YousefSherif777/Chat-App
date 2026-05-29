const { z } = require('zod')

const idSchema = z.string().trim().min(1, "Invalid ID")

const createChatSchema = z
  .object({
    isGroup: z.boolean().default(false),

    participantId: idSchema.optional(),

    participants: z.array(idSchema).optional(),
    groupName: z.string().trim().min(2).max(50).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isGroup) {
      if (!data.participants || data.participants.length < 2) {
        ctx.addIssue({
          path: ["participants"],
          message: "Group chat must have at least 2 participants",
          code: "custom",
        })
      }

      if (!data.groupName) {
        ctx.addIssue({
          path: ["groupName"],
          message: "Group name is required",
          code: "custom",
        })
      }
    }

    if (!data.isGroup) {
      if (!data.participantId) {
        ctx.addIssue({
          path: ["participantId"],
          message: "participantId is required for private chat",
          code: "custom",
        })
      }
    }
  })

const chatIdSchema = z.object({
  id: idSchema,
})

module.exports = { createChatSchema, chatIdSchema }