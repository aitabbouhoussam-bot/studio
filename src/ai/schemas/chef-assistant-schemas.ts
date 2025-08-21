
/**
 * @fileOverview Shared Zod schemas for the AI Chef Assistant.
 */

import { z } from 'genkit';

// Define the schema for a single message in the conversation
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  messages: z
    .array(MessageSchema)
    .describe('The history of the conversation.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.string().describe("The assistant's response.");
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
