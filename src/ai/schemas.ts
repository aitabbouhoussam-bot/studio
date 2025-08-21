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

export const GenerateMealPlanOutputSchema = z.object({
  recipes: z.array(RecipeSchema),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;
