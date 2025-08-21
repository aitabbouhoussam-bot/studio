'use server';

/**
 * @fileOverview Generates a personalized 7-day meal plan based on user preferences.
 *
 * - generateMealPlan - A function that generates a meal plan.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateMealPlanOutput, GenerateMealPlanOutputSchema } from '../schemas';

const GenerateMealPlanInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe(
      'Dietary preferences (e.g., vegetarian, vegan, gluten-free, keto).' + 'Separate multiple preferences with commas.'
    ),
  allergies: z
    .string()
    .describe('Allergies to consider when generating the meal plan (e.g., peanuts, dairy, soy). Separate multiple allergies with commas.'),
  calorieIntake: z.number().describe('Desired daily calorie intake.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

export type { GenerateMealPlanOutput };

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are a professional nutritionist and chef creating a personalized 7-day meal plan.

USER REQUIREMENTS:
- Dietary restrictions: {{{dietaryPreferences}}}
- Allergies: {{{allergies}}}
- Daily calorie target: {{{calorieIntake}}} calories

CRITICAL REQUIREMENTS:
1. Generate exactly 7 days of meals (Monday-Sunday)
2. Each day must include breakfast, lunch, and dinner (snacks optional)
3. For each recipe, provide a valid and publicly accessible \`imageUrl\` of the finished dish. Use placeholder services if needed.
4. Respect ALL dietary restrictions and allergies absolutely
5. Provide accurate nutritional information for each recipe
6. Ensure variety in cuisines and cooking methods
7. All ingredients must specify exact quantities, units, and a valid category
8. Instructions must be clear, step-by-step, and easy to follow
9. The 'difficulty' field must be 'easy', 'medium', 'hard'

NUTRITION ACCURACY: Ensure all calorie and macronutrient calculations are accurate. This information affects user health decisions.

Generate the complete meal plan following the provided JSON output schema exactly.`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
