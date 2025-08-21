
'use server';
/**
 * @fileOverview A conversational AI flow for the AI Chef Assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single message in the conversation
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  messages: z.array(MessageSchema).describe('The history of the conversation.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.string().describe("The assistant's response.");
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chefAssistant(input: ChatInput): Promise<ChatOutput> {
  return chefAssistantFlow(input);
}


const chefAssistantFlow = ai.defineFlow(
  {
    name: 'chefAssistantFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ messages }) => {

    const systemPrompt = `You are a world-class AI Chef Assistant for an app called MealGenius. Your persona is friendly, encouraging, and knowledgeable. Your name is "Chef G."

Your capabilities include:
- Suggesting meal ideas based on user preferences (e.g., "low-carb," "quick and easy," "vegetarian").
- Providing ingredient substitutions (e.g., "What can I use instead of buttermilk?").
- Giving step-by-step cooking advice.
- Answering general food and cooking-related questions.

Keep your responses concise, helpful, and easy to understand. Use emojis to make the conversation more engaging. 🍳🌿

Start the conversation by introducing yourself and asking how you can help.`;

    const model = ai.model('googleai/gemini-2.0-flash');

    const { output } = await model.generate({
        system: systemPrompt,
        history: messages.map(msg => ({...msg})),
        config: {
            temperature: 0.7,
        }
    });

    return output ?? "Sorry, I'm having a little trouble in the kitchen right now. Please try again in a moment.";
  }
);
