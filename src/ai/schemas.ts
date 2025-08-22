
/**
 * @fileOverview Shared Zod schemas for AI flows.
 *
 * This file contains Zod schemas that are used across multiple Genkit flows
 * to ensure consistent data structures for inputs and outputs. It does not
 * contain the 'use server' directive, so it can safely export non-function
 * objects like Zod schemas.
 */

import { z } from 'zod';

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

export const RecipeSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
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

