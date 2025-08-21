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

const RecipeSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(z.string()),
  nutrition: NutritionInfoSchema,
  prepTimeMins: z.number(),
  cookTimeMins: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).optional(),
});

const GenerateMealPlanOutputSchema = z.object({
  recipes: z.array(RecipeSchema),
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

The meal plan should include breakfast, lunch, and dinner for each day of the week (Monday to Sunday). For each meal, provide a detailed recipe.

Ensure that the meal plan is diverse, delicious, and easy to follow. Be creative and incorporate a variety of flavors and cuisines.

Strictly adhere to all listed dietary restrictions and allergies. If there is any ambiguity, err on the side of caution.

Output the meal plan as a JSON object that conforms to the output schema. Ensure all fields are filled, including detailed recipes, ingredients, instructions, and nutritional information for each meal.
The 'day' field for each recipe should be one of 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'.
The 'mealType' should be one of 'breakfast', 'lunch', or 'dinner'. You can optionally include 'snack' type meals.`,
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
