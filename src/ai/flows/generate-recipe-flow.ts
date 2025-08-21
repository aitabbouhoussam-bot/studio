
'use server';
/**
 * @fileOverview A flow to generate a single recipe based on a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  category: z.enum(['produce', 'protein', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages']),
});

const NutritionInfoSchema = z.object({
  calories: z.number(),
  protein: z.number().describe('in grams'),
  carbs: z.number().describe('in grams'),
  fat: z.number().describe('in grams'),
});

const GeneratedRecipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().describe("A URL to a high-quality, vibrant, and appetizing photo of the finished dish."),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(z.string()),
  nutrition: NutritionInfoSchema,
  prepTimeMins: z.number(),
  cookTimeMins: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).optional(),
});
export type GeneratedRecipe = z.infer<typeof GeneratedRecipeSchema>;

export async function generateRecipe(promptText: string): Promise<GeneratedRecipe> {
  return generateRecipeFlow(promptText);
}

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: z.string(),
    outputSchema: GeneratedRecipeSchema,
  },
  async (promptText) => {
    
    const prompt = ai.definePrompt({
        name: 'generateRecipePrompt',
        input: { schema: z.string() },
        output: { schema: GeneratedRecipeSchema },
        prompt: `You are a creative chef. A user wants a recipe based on this idea: "${promptText}".

CRITICAL REQUIREMENTS:
1.  Generate exactly ONE creative, delicious, and easy-to-follow recipe.
2.  Provide a valid and publicly accessible \`imageUrl\` of the finished dish. Use the placeholder service 'https://placehold.co/600x400.png' if a real image is not available.
3.  Provide accurate nutritional information.
4.  All ingredients must specify exact quantities, units, and a valid category.
5.  Instructions must be clear, step-by-step, and easy to follow.
6.  The 'difficulty' field must be 'easy', 'medium', or 'hard'.
7.  Categorize each ingredient correctly: 'produce', 'protein', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages'.

Generate the single recipe following the provided JSON output schema exactly.`,
        config: {
            temperature: 0.8,
        }
    });

    const { output } = await prompt(promptText);
    return output!;
  }
);
