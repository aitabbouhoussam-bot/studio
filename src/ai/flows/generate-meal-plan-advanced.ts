
'use server';
/**
 * @fileOverview DEPRECATED: This flow is no longer used for recipe generation.
 *
 * This flow was previously used to generate meal plans, but the recipe generation
 * part of the application has been moved to a dedicated Firebase Cloud Function
 * in `functions/src/index.ts`. This file is kept for historical context on the
 * meal plan generation logic but should not be used for generating individual recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  verifyGenerationQuota,
  incrementUsageQuota,
} from '@/lib/services/user-profile-service';
import {
  checkPlanCache,
  cachePlan,
  saveMealPlanToFirestore,
  generateCacheKey,
} from '@/lib/services/meal-plan-service';
import { GenerateMealPlanOutput, GenerateMealPlanOutputSchema, UserPreferencesSchema, UserPreferences } from '../schemas';


// Define the input schema for the main exported function
const GenerateMealPlanAdvancedInputSchema = z.object({
  userId: z.string().describe("The ID of the user requesting the meal plan."),
  preferences: UserPreferencesSchema.describe("The user's meal plan preferences object."),
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


const FlowInputSchema = z.object({
    preferences: UserPreferencesSchema,
    servings: z.number(),
});

const mealPlanPrompt = ai.definePrompt({
    name: 'generateMealPlanAdvancedPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: GenerateMealPlanOutputSchema },
    prompt: `You are a professional nutritionist and chef creating a personalized 7-day meal plan.

USER REQUIREMENTS:
- Dietary restrictions: {{#if preferences.dietaryRestrictions}}{{#each preferences.dietaryRestrictions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
- Allergies: {{#if preferences.allergies}}{{#each preferences.allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
- Daily calorie target: {{{preferences.dailyCalorieGoal}}} calories
- Maximum cooking time per meal: {{{preferences.maxCookingTimeMins}}} minutes
- Budget level: {{{preferences.budgetLevel}}}/5 (1=very budget-friendly, 5=premium ingredients)
- Servings per recipe: {{{servings}}}
- Disliked ingredients: {{#if preferences.dislikedIngredients}}{{#each preferences.dislikedIngredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
- Preferred cuisines: {{#if preferences.preferredCuisines}}{{#each preferences.preferredCuisines}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Varied{{/if}}

CRITICAL REQUIREMENTS:
1. Generate exactly 7 days of meals (Monday-Sunday)
2. Each day must include breakfast, lunch, and dinner (snacks optional)
3. For each recipe, provide a valid and publicly accessible \`imageUrl\` of the finished dish. Use placeholder services if needed.
4. Respect ALL dietary restrictions and allergies absolutely. For example, if 'gluten-free' is requested, do not use wheat flour. If 'vegetarian' is requested, do not include any meat or fish.
5. Keep cooking times within the specified limit
6. Provide accurate nutritional information for each recipe
7. Use ingredients appropriate for the budget level
8. Ensure variety in cuisines and cooking methods
9. All ingredients must specify exact quantities, units, and a valid category
10. Instructions must be clear, step-by-step, and easy to follow
11. The 'difficulty' field must be 'easy', 'medium', or 'hard'
12. Categorize each ingredient correctly for shopping list generation. Use one of: 'produce', 'protein', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages'.

NUTRITION ACCURACY: Ensure all calorie and macronutrient calculations are accurate. This information affects user health decisions.

Generate the complete meal plan following the provided JSON output schema exactly.`,
    config: {
        temperature: 0.7,
    }
});


/**
 * This is the internal Genkit flow that directly interacts with the AI model.
 * It's responsible for the core generation task.
 */
const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'advancedMealPlanGeneratorFlow',
    inputSchema: FlowInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await mealPlanPrompt(input);
    return output!;
  }
);
