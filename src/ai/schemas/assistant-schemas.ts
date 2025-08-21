
/**
 * @fileOverview Zod schemas for the AI Chef Assistant feature.
 */
import { z } from 'zod';

export const ModelPartSchema = z.object({
  text: z.string(),
});

export const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(ModelPartSchema),
});

export const ChatHistorySchema = z.array(MessageSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;

export const AssistantRequestSchema = z.object({
  history: ChatHistorySchema,
});
export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantResponseSchema = z.string().describe("The AI chef's response.");
export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;
