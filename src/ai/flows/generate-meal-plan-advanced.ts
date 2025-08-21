
'use server';
/**
 * @fileOverview An advanced meal plan generation flow.
 *
 * This flow takes detailed user preferences, verifies their generation quota,
 * checks a cache for an existing plan, and then calls the AI model to generate
 * a highly structured and validated 7-day meal plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  UserPreferences,
  verifyGenerationQuota,
  incrementUsageQuota,
} from '@/lib/services/user-profile-service';
import {
  checkPlanCache,
  cachePlan,
  saveMealPlanToFirestore,
  generateCacheKey,
} from '@/lib/services/meal-plan-service';
import { GenerateMealPlanOutput, GenerateMealPlanOutputSchema } from './generate-meal-plan';


// Define the input schema for the main exported function
const GenerateMealPlanAdvancedInputSchema = z.object({
  userId: z.string().describe("The ID of the user requesting the meal plan."),
  preferences: z.any().describe("The user's meal plan preferences object."), // Using any() to avoid circular deps with user-profile-service
  servings: z.number().positive().describe("The number of servings for each recipe."),
  owner: z.object({
    type: z.enum(['user', 'family']),
    id: z.string(),
  }).describe("The entity that will own the meal plan."),
});
export type GenerateMealPlanAdvancedInput = z.infer<typeof GenerateMealPlanAdvancedInputSchema>;


/**
 * The primary exported function that orchestrates the meal plan generation.
 * It handles business logic like authentication, caching, and quota management.
 */
export async function generateMealPlan(input: GenerateMealPlanAdvancedInput): Promise<GenerateMealPlanOutput> {
  const { userId, preferences, servings, owner } = input;
  
  // 1. Verify user permissions and quota
  await verifyGenerationQuota(userId);

  // 2. Determine the start of the upcoming week (next Monday)
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date();
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const weekStart = nextMonday.toISOString().split('T')[0];

  // 3. Check cache for existing plan
  const cacheKey = await generateCacheKey(preferences, weekStart, servings);
  const cachedPlan = await checkPlanCache(cacheKey);
  if (cachedPlan) {
    return cachedPlan;
  }

  // 4. If cache miss, call the Genkit flow to generate a new plan
  const generatedPlan = await generateMealPlanFlow({
      preferences,
      servings,
  });

  // 5. Save the new plan to the database
  await saveMealPlanToFirestore(generatedPlan, {
    ownerType: owner.type,
    ownerId: owner.id,
    generatedBy: userId,
    servings,
    preferences
  });

  // 6. Update usage quota
  await incrementUsageQuota(userId);

  // 7. Cache the new plan
  await cachePlan(cacheKey, generatedPlan);
  
  return generatedPlan;
}


/**
 * Builds the detailed prompt for the AI model based on user preferences.
 */
function buildMealPlanPrompt(preferences: UserPreferences, servings: number): string {
  return `You are a professional nutritionist and chef creating a personalized 7-day meal plan.

USER REQUIREMENTS:
- Dietary restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Allergies: ${preferences.allergies.join(', ') || 'None'}
- Daily calorie target: ${preferences.dailyCalorieGoal} calories
- Maximum cooking time per meal: ${preferences.maxCookingTimeMins || 45} minutes
- Budget level: ${preferences.budgetLevel || 3}/5 (1=very budget-friendly, 5=premium ingredients)
- Servings per recipe: ${servings}
- Disliked ingredients: ${preferences.dislikedIngredients?.join(', ') || 'None'}
- Preferred cuisines: ${preferences.preferredCuisines?.join(', ') || 'Varied'}

CRITICAL REQUIREMENTS:
1. Generate exactly 7 days of meals (Monday-Sunday)
2. Each day must include breakfast, lunch, and dinner (snacks optional)
3. Respect ALL dietary restrictions and allergies absolutely
4. Keep cooking times within the specified limit
5. Provide accurate nutritional information for each recipe
6. Use ingredients appropriate for the budget level
7. Ensure variety in cuisines and cooking methods
8. All ingredients must specify exact quantities, units, and a valid category
9. Instructions must be clear, step-by-step, and easy to follow
10. The 'difficulty' field must be 'easy', 'medium', or 'hard'
11. Categorize each ingredient correctly for shopping list generation. Use one of: 'produce', 'protein', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages'.

NUTRITION ACCURACY: Ensure all calorie and macronutrient calculations are accurate. This information affects user health decisions.

Generate the complete meal plan following the provided JSON output schema exactly.`;
}


/**
 * This is the internal Genkit flow that directly interacts with the AI model.
 * It's responsible for the core generation task.
 */
const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'advancedMealPlanGeneratorFlow',
    inputSchema: z.object({
        preferences: z.any(),
        servings: z.number(),
    }),
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async ({ preferences, servings }) => {
    const prompt = ai.definePrompt({
        name: 'generateMealPlanAdvancedPrompt',
        input: { schema: z.any() },
        output: { schema: GenerateMealPlanOutputSchema },
        prompt: buildMealPlanPrompt(preferences, servings),
        config: {
            temperature: 0.7,
        }
    });

    const { output } = await prompt(preferences);
    return output!;
  }
);
