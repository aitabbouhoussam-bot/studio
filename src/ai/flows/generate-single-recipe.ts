
'use server';
/**
 * @fileOverview A flow to generate a single recipe for a specific meal slot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeSchema, RecipeInputSchema, UserPreferences } from '../schemas';


export type GenerateSingleRecipeInput = z.infer<typeof RecipeInputSchema>;
export type GenerateSingleRecipeOutput = z.infer<typeof RecipeSchema>;


export async function generateSingleRecipe(input: GenerateSingleRecipeInput): Promise<GenerateSingleRecipeOutput> {
    return generateSingleRecipeFlow(input);
}


function buildSingleRecipePrompt(preferences: UserPreferences, servings: number, day: string, mealType: string): string {
    return `You are a professional nutritionist and chef creating a single personalized recipe for a meal plan.

USER REQUIREMENTS:
- Dietary restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Allergies: ${preferences.allergies.join(', ') || 'None'}
- Daily calorie target: ${preferences.dailyCalorieGoal} calories (generate a recipe appropriate for a single meal within this budget)
- Maximum cooking time per meal: ${preferences.maxCookingTimeMins || 45} minutes
- Budget level: ${preferences.budgetLevel || 3}/5 (1=very budget-friendly, 5=premium ingredients)
- Servings per recipe: ${servings}
- Disliked ingredients: ${preferences.dislikedIngredients?.join(', ') || 'None'}
- Preferred cuisines: ${preferences.preferredCuisines?.join(', ') || 'Varied'}

TARGETED MEAL SLOT:
- Day: ${day}
- Meal Type: ${mealType}

CRITICAL REQUIREMENTS:
1. Generate exactly ONE recipe.
2. Provide a valid and publicly accessible \`imageUrl\` of the finished dish. Use placeholder services if needed.
3. The recipe must be appropriate for the specified Day and Meal Type.
4. Respect ALL dietary restrictions and allergies absolutely.
5. Keep cooking times within the specified limit.
6. Provide accurate nutritional information for the recipe.
7. Use ingredients appropriate for the budget level.
8. All ingredients must specify exact quantities, units, and a valid category.
9. Instructions must be clear, step-by-step, and easy to follow.
10. The 'difficulty' field must be 'easy', 'medium', or 'hard'.
11. Categorize each ingredient correctly for shopping list generation. Use one of: 'produce', 'protein', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages'.

NUTRITION ACCURACY: Ensure all calorie and macronutrient calculations are accurate. This information affects user health decisions.

Generate the single recipe following the provided JSON output schema exactly. The 'day' and 'mealType' fields in the output must match the targeted meal slot.`;
}


const generateSingleRecipeFlow = ai.defineFlow(
  {
    name: 'generateSingleRecipeFlow',
    inputSchema: RecipeInputSchema,
    outputSchema: RecipeSchema,
  },
  async ({ preferences, servings, day, mealType }) => {
    
    const prompt = ai.definePrompt({
        name: 'generateSingleRecipePrompt',
        input: { schema: z.any() },
        output: { schema: RecipeSchema },
        prompt: buildSingleRecipePrompt(preferences, servings, day, mealType),
        config: {
            temperature: 0.8, // Slightly higher temp for more variety in single recipes
        }
    });

    const { output } = await prompt({ preferences, servings, day, mealType });
    return output!;
  }
);
