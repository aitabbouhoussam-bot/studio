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
  prompt: `You are a professional nutritionist and chef creating a personalized 7-day meal plan.

USER REQUIREMENTS:
- Dietary restrictions: {{{dietaryPreferences}}}
- Allergies: {{{allergies}}}
- Daily calorie target: {{{calorieIntake}}} calories

CRITICAL REQUIREMENTS:
1. Generate exactly 7 days of meals (Monday-Sunday)
2. Each day must include breakfast, lunch, and dinner (snacks optional)
3. Respect ALL dietary restrictions and allergies absolutely
4. Provide accurate nutritional information for each recipe
5. Ensure variety in cuisines and cooking methods
6. All ingredients must specify exact quantities, units, and a valid category
7. Instructions must be clear, step-by-step, and easy to follow
8. The 'difficulty' field must be 'easy', 'medium', or 'hard'

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
