import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters"),
});

export const createConversationSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
