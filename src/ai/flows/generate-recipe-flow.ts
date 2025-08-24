
'use server';
/**
 * @fileOverview DEPRECATED: This flow has been replaced by a dedicated Firebase Cloud Function.
 * The new logic resides in `functions/src/index.ts` in the `generateRecipeWithAI` function.
 * This file is kept for historical purposes and should not be used.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AI_RecipeGeneration_InputSchema, AI_RecipeGeneration_OutputSchema, AI_RecipeGeneration_Input, AI_RecipeGeneration_Output } from '../schemas';

const generateRecipeWithAIPrompt = ai.definePrompt({
    name: 'DEPRECATED_generateRecipeWithAIPrompt',
    input: { schema: AI_RecipeGeneration_InputSchema },
    output: { schema: AI_RecipeGeneration_OutputSchema },
    prompt: `This prompt is deprecated.`,
});


export async function generateRecipeWithAI(input: AI_RecipeGeneration_Input): Promise<AI_RecipeGeneration_Output> {
  throw new Error("This Genkit flow is deprecated and should not be called. Use the 'generateRecipeWithAI' Firebase Function instead.");
}

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'DEPRECATED_generateRecipeWithAIFlow',
    inputSchema: AI_RecipeGeneration_InputSchema,
    outputSchema: AI_RecipeGeneration_OutputSchema,
  },
  async (input) => {
    throw new Error("This Genkit flow is deprecated and should not be called. Use the 'generateRecipeWithAI' Firebase Function instead.");
  }
);
