
/**
 * @fileOverview Shared Zod schemas for AI flows.
 *
 * This file contains Zod schemas that are used across multiple Genkit flows
 * to ensure consistent data structures for inputs and outputs. It does not
 * contain the 'use server' directive, so it can safely export non-function
 * objects like Zod schemas.
 */

import { z } from 'zod';

// =================================================================================
// DEPRECATED SCHEMAS (To be removed once all flows are updated)
// =================================================================================

const OldIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  category: z.enum(['produce', 'protein', 'dairy', 'pantry', 'frozen', 'bakery', 'beverages']),
});

const OldNutritionInfoSchema = z.object({
  calories: z.number(),
  protein: z.number().describe('in grams'),
  carbs: z.number().describe('in grams'),
  fat: z.number().describe('in grams'),
});

export const RecipeSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().describe("A URL to a high-quality, vibrant, and appetizing photo of the finished dish."),
  ingredients: z.array(OldIngredientSchema),
  instructions: z.array(z.string()),
  nutrition: OldNutritionInfoSchema,
  prepTimeMins: z.number(),
  cookTimeMins: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).optional(),
});
export type Recipe = z.infer<typeof RecipeSchema>;


export const GenerateMealPlanOutputSchema = z.object({
  recipes: z.array(RecipeSchema),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;


export const UserPreferencesSchema = z.object({
    dietaryRestrictions: z.array(z.string()).describe("e.g., ['vegetarian', 'gluten-free']"),
    allergies: z.array(z.string()).describe("e.g., ['peanuts', 'dairy']"),
    dailyCalorieGoal: z.number().positive().describe("Target daily calorie intake."),
    budgetLevel: z.number().min(1).max(5).describe("Budget level from 1 (low) to 5 (premium)."),
    maxCookingTimeMins: z.number().positive().describe("Maximum cooking time in minutes per meal."),
    dislikedIngredients: z.array(z.string()).optional().describe("e.g., ['cilantro', 'mushrooms']"),
    preferredCuisines: z.array(z.string()).optional().describe("e.g., ['Italian', 'Mexican']"),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;


export const RecipeInputSchema = z.object({
    preferences: UserPreferencesSchema.describe("The user's meal plan preferences object."),
    servings: z.number().positive().describe("The number of servings for the recipe."),
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    mealType: z.enum(['breakfast', 'lunch', 'dinner']),
});


// =================================================================================
// PRODUCTION-GRADE SCHEMAS (Based on new design brief)
// =================================================================================

// -------- Input Schemas --------

const AIPrefsSchema = z.object({
    diet: z.string().optional(),
    allergens: z.array(z.string()).optional(),
    calories: z.number().optional(),
    servings: z.number().positive(),
    budgetLevel: z.number().min(1).max(5),
});

const AIPantryItemSchema = z.object({
    name: z.string(),
    grams: z.number(),
});

export const AI_RecipeGeneration_InputSchema = z.object({
    userId: z.string(),
    prefs: AIPrefsSchema,
    pantry: z.array(AIPantryItemSchema).optional(),
    goal: z.enum(['single-recipe', 'weekly-plan']),
    promptText: z.string().describe("The user's text prompt, e.g., 'a spicy vegan noodle soup'.")
});
export type AI_RecipeGeneration_Input = z.infer<typeof AI_RecipeGeneration_InputSchema>;


// -------- Output Schemas --------

const AIMacrosSchema = z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
});

const AIIngredientSchema = z.object({
    name: z.string(),
    grams: z.number(),
});

const AIShoppingListItemSchema = z.object({
    name: z.string(),
    grams: z.number(),
    aisle: z.string(),
});

export const AIRecipeSchema = z.object({
    id: z.string(),
    name: z.string(),
    servings: z.number(),
    caloriesPerServing: z.number(),
    macros: AIMacrosSchema,
    ingredients: z.array(AIIngredientSchema),
    steps: z.array(z.string()),
    costUSD: z.number(),
    timeMinutes: z.number(),
    imageUrl: z.string().url().describe("A URL to a high-quality, vibrant, and appetizing photo of the finished dish. Use `https://placehold.co/600x400.png` as a fallback.").optional(),
});
export type AIRecipe = z.infer<typeof AIRecipeSchema>;


const AIWeeklyPlanSchema = z.object({
    // Define structure if goal is "weekly-plan"
    // For now, we can leave it empty as per the prompt example
});

export const AI_RecipeGeneration_OutputSchema = z.object({
    recipe: AIRecipeSchema.optional().describe("The generated recipe. This is the primary output for a 'single-recipe' goal."),
    shoppingList: z.array(AIShoppingListItemSchema),
    weeklyPlan: z.array(AIWeeklyPlanSchema), // Assuming an array for weekly plan
});
export type AI_RecipeGeneration_Output = z.infer<typeof AI_RecipeGeneration_OutputSchema>;
