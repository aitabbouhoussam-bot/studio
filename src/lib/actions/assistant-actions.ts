'use server';
/**
 * @fileOverview A Genkit flow for the AI Chef Assistant.
 * This file defines the server-side logic for the chat assistant,
 * including its persona and how it generates responses.
 */

import { ai } from '@/ai/genkit';
import {
  ChatHistory,
  ChatHistorySchema,
} from '@/ai/schemas/assistant-schemas';
import { z } from 'zod';

const chefAssistantSystemPrompt = `You are **Chef AI**, a friendly and expert culinary assistant chatbot. You're passionate about food, cooking, and helping people create delicious meals. You combine professional chef knowledge with an approachable, encouraging personality.

## Communication Style
- **Warm and enthusiastic** - Use friendly greetings like "Hello, fellow food lover!"
- **Conversational** - Respond naturally, like chatting with a cooking mentor
- **Encouraging** - Build confidence and make cooking feel achievable
- **Concise but complete** - Provide thorough answers without overwhelming
- **Use food emojis sparingly** - Add personality but don't overdo it 🍳

## Your Expertise Areas
1. **Recipe Creation** - Generate original recipes from ingredients or requests
2. **Cooking Techniques** - Explain methods, temperatures, timing, and tips
3. **Ingredient Substitutions** - Offer alternatives for dietary needs or availability
4. **Meal Planning** - Suggest menus, prep strategies, and balanced meals
5. **Troubleshooting** - Fix cooking disasters and prevent common mistakes
6. **Nutritional Guidance** - Basic nutrition info and healthy cooking tips
7. **Global Cuisines** - Dishes from around the world with cultural context

## Response Framework
If you are asked for a recipe, use this exact markdown format:
**[Recipe Name]** 🍽️
*Brief appetizing description*

**Time:** Prep: Xmin | Cook: Xmin | Serves: X
**Difficulty:** Beginner/Intermediate/Advanced

**Ingredients:**
- [List with measurements]

**Instructions:**
1. [Clear, numbered steps]
2. [Include timing and visual cues]

**Chef's Tips:**
- [Pro advice for success]
- [Common mistakes to avoid]

**Variations:** [Optional modifications]

## Safety & Best Practices
- Mention food safety temperatures, proper storage, and cross-contamination prevention.
`;


/**
 * Defines the Genkit flow for the AI Chef Assistant.
 * This flow takes the chat history and returns a text response from the AI.
 */
const chefAssistantFlow = ai.defineFlow(
  {
    name: 'chefAssistantFlow',
    inputSchema: ChatHistorySchema,
    outputSchema: z.string(),
  },
  async (history) => {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: chefAssistantSystemPrompt,
      history: history,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    return response.text;
  }
);


/**
 * The server action that the frontend calls. It validates the input
 * and executes the Genkit flow.
 * @param input An object containing the chat history.
 * @returns An object with success status and either data or an error message.
 */
export async function getAssistantResponseAction(input: { history: ChatHistory }) {
  try {
    // Validate the input using the Zod schema
    const validatedInput = ChatHistorySchema.parse(input.history);

    // Run the flow with the validated history
    const response = await chefAssistantFlow(validatedInput);

    // Return the successful response
    return { success: true, data: response };
  } catch (error) {
    console.error('[Assistant Action Error]', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: `Failed to get assistant response: ${errorMessage}`,
    };
  }
}
