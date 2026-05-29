const { z } = require('zod')

const idSchema = z.string().trim().min(1, "Invalid ID")

const sendMessageSchema = z
  .object({
    chatId: idSchema,

    content: z.string().trim().max(2000).optional(),

    image: z.string().url("Invalid image URL").optional(),

    replyToId: idSchema.optional(),
  })
  .superRefine((data, ctx) => {

    if (!data.content && !data.image) {
      ctx.addIssue({
        path: ["content"],
        message: "Message must include text or image",
        code: "custom",
      })
    }


    if (data.content && data.content.length === 0) {
      ctx.addIssue({
        path: ["content"],
        message: "Content cannot be empty",
        code: "custom",
      })
    }
  })

module.exports = { sendMessageSchema }