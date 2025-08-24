
'use server';
/**
 * @fileOverview A flow to generate a single recipe based on a detailed user profile and prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AI_RecipeGeneration_InputSchema, AI_RecipeGeneration_OutputSchema, AI_RecipeGeneration_Input, AI_RecipeGeneration_Output } from '../schemas';

const generateRecipeWithAIPrompt = ai.definePrompt({
    name: 'generateRecipeWithAIPrompt',
    input: { schema: AI_RecipeGeneration_InputSchema },
    output: { schema: AI_RecipeGeneration_OutputSchema },
    prompt: `You are MealGenius-AI, a precision recipe engine.

You will receive a JSON input containing the user's ID, preferences, pantry items, and a specific goal. Your task is to generate a recipe that strictly adheres to all constraints.

USER'S PROMPT: {{{promptText}}}

INPUT CONTEXT:
\`\`\`json
{
  "userId": "{{userId}}",
  "prefs": {
    "diet": "{{prefs.diet}}",
    "allergens": {{#if prefs.allergens}}["{{#each prefs.allergens}}"{{this}}"{{#unless @last}}", "{{/unless}}{{/each}}"]{{else}}[]{{/if}},
    "calories": {{prefs.calories}},
    "servings": {{prefs.servings}},
    "budgetLevel": {{prefs.budgetLevel}}
  },
  "pantry": {{#if pantry}}[{{#each pantry}}{"name": "{{name}}", "grams": {{grams}}}{{#unless @last}},{{/unless}}{{/each}}]{{else}}[]{{/if}},
  "goal": "{{goal}}"
}
\`\`\`

Rules:
1. Return only **valid JSON** (no markdown fences or extraneous text).
2. The generated recipe **MUST** exclude all allergens listed in \`prefs.allergens\`. This is a critical safety requirement.
3. The recipe's calories per serving must be within ±5% of the target defined in \`prefs.calories\`, if provided.
4. The estimated cost must be appropriate for the \`prefs.budgetLevel\` (1=cheap, 5=expensive).
5. Prioritize using ingredients from the user's \`pantry\` list. Any ingredients not found in the pantry must be added to the \`shoppingList\`.
6. Recipe instructions in \`steps\` should be concise (≤ 6 sentences total).
7. All ingredients in the \`ingredients\` list must specify quantities in grams.
8. Generate a publicly accessible \`imageUrl\` for the recipe. Use 'https://placehold.co/600x400.png' as a fallback.

Produce a JSON object that conforms **exactly** to the specified output schema.
`,
    config: {
        temperature: 0.7,
    }
});


export async function generateRecipeWithAI(input: AI_RecipeGeneration_Input): Promise<AI_RecipeGeneration_Output> {
  return generateRecipeFlow(input);
}

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeWithAIFlow',
    inputSchema: AI_RecipeGeneration_InputSchema,
    outputSchema: AI_RecipeGeneration_OutputSchema,
  },
  async (input) => {
    const { output } = await generateRecipeWithAIPrompt(input);
    return output!;
  }
);
