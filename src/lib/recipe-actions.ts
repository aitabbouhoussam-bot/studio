
"use server";

import { z } from "zod";
import { generateRecipe } from "@/ai/flows/generate-recipe-flow";
import type { GeneratedRecipe } from "@/ai/flows/generate-recipe-flow";

const manualRecipeIngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required."),
});

const manualRecipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  ingredients: z.array(manualRecipeIngredientSchema).min(1, "Please add at least one ingredient."),
  instructions: z.string().min(10, "Instructions must be at least 10 characters long."),
  calories: z.coerce.number().positive().optional(),
  protein: z.coerce.number().positive().optional(),
  carbs: z.coerce.number().positive().optional(),
  fat: z.coerce.number().positive().optional(),
});


export async function addManualRecipeAction(values: z.infer<typeof manualRecipeSchema>) {
  try {
    const validatedData = manualRecipeSchema.parse(values);

    const userId = "user123";

    console.log(`[RecipeAction] Saving manual recipe for user: ${userId}`);
    console.log("[RecipeAction] Recipe Data:", validatedData);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const recipeId = `recipe_${Date.now()}`;

    return { success: true, recipeId: recipeId };
  } catch (error) {
    console.error("Error adding recipe:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data provided." };
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to save recipe: ${errorMessage}` };
  }
}

const generateRecipeSchema = z.object({
    prompt: z.string().min(5, "Please enter a more descriptive recipe idea."),
});

export async function generateRecipeAction(values: z.infer<typeof generateRecipeSchema>): Promise<{success: boolean; data?: GeneratedRecipe; error?: string}> {
    try {
        const validatedData = generateRecipeSchema.parse(values);
        const recipe = await generateRecipe(validatedData.prompt);
        return { success: true, data: recipe };
    } catch (error) {
        console.error("Error generating recipe:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid data provided." };
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: `Failed to generate recipe: ${errorMessage}` };
    }
}

export async function saveGeneratedRecipeAction(recipe: GeneratedRecipe) {
    try {
        const userId = "user123";
        console.log(`[RecipeAction] Saving generated recipe for user: ${userId}`);
        console.log("[RecipeAction] Recipe Data:", recipe);

        await new Promise(resolve => setTimeout(resolve, 1000));
        const recipeId = `recipe_${Date.now()}`;

        return { success: true, recipeId };
    } catch (error) {
        console.error("Error saving generated recipe:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: `Failed to save recipe: ${errorMessage}` };
    }
}
