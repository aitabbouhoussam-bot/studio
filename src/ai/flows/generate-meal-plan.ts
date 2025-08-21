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

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z
    .string()
    .describe('A 7-day meal plan, with each day including breakfast, lunch, and dinner, and the recipes for each meal.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are a personal meal plan assistant. Please create a personalized 7-day meal plan based on the following user preferences, allergies, and desired calorie intake.

Dietary Preferences: {{{dietaryPreferences}}}
Allergies: {{{allergies}}}
Calorie Intake: {{{calorieIntake}}}

The meal plan should include breakfast, lunch, and dinner for each day. Provide detailed recipes and instructions for each meal, including ingredients and cooking directions.

Ensure that the meal plan is diverse, delicious, and easy to follow. Be creative and incorporate a variety of flavors and cuisines.

Strictly adhere to all listed dietary restrictions and allergies.  If there is any ambiguity, err on the side of caution.

Output the meal plan in a human-readable format. Also include the total daily calories for each day in the plan.`,
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
