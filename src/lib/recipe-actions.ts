
"use server";

import { z } from "zod";
import { generateRecipeWithAI } from "@/ai/flows/generate-recipe-flow";
import type { AI_RecipeGeneration_Output, Recipe as MealPlanRecipe } from "@/ai/schemas";

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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate a potential error
    if (validatedData.title.toLowerCase().includes("error")) {
        throw new Error("Simulated database error saving recipe.");
    }

    const recipeId = `recipe_${Date.now()}`;

    return { success: true, recipeId: recipeId };
  } catch (error) {
    console.error("[Action Error: addManualRecipeAction]", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data provided. Please check the form." };
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to save recipe: ${errorMessage}` };
  }
}

const generateRecipeSchema = z.object({
    prompt: z.string().min(5, "Please enter a more descriptive recipe idea."),
});

// This action now acts as an adapter between the simple UI prompt and the complex AI flow input
export async function generateRecipeAction(values: z.infer<typeof generateRecipeSchema>): Promise<{success: boolean; data?: AI_RecipeGeneration_Output; error?: string}> {
    try {
        const validatedData = generateRecipeSchema.parse(values);
        
        // Construct the detailed input for the new flow using mock/default data
        const inputForAI = {
            userId: "user123", // Mock user ID
            prefs: {
                diet: "vegetarian",
                allergens: [],
                calories: 2000, // This is total daily, AI should adjust for a single meal
                servings: 2,
                budgetLevel: 3,
            },
            pantry: [ // Mock pantry data
                { name: "quinoa", grams: 300 },
                { name: "spinach", grams: 200 },
            ],
            goal: 'single-recipe' as const,
            promptText: validatedData.prompt,
        };

        const result = await generateRecipeWithAI(inputForAI);
        
        if (!result || !result.recipe) {
            throw new Error("The AI failed to generate a valid recipe structure.");
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("[Action Error: generateRecipeAction]", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid prompt provided." };
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: `Failed to generate recipe: ${errorMessage}` };
    }
}

// The data saved to the meal plan store needs to be converted
// from the AI output format to the format the UI components expect.
const convertAIRecipeToMealPlanRecipe = (aiRecipe: AI_RecipeGeneration_Output['recipe']): MealPlanRecipe => {
    if (!aiRecipe) throw new Error("Cannot convert null AI recipe");
    
    return {
        day: 'Monday', // Default value
        mealType: 'dinner', // Default value
        title: aiRecipe.name,
        description: `A delicious ${aiRecipe.name} with ${aiRecipe.caloriesPerServing} calories per serving.`,
        imageUrl: aiRecipe.imageUrl || "https://placehold.co/600x400.png",
        ingredients: aiRecipe.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.grams,
            unit: 'g', // AI schema uses grams
            category: 'pantry', // Default category
        })),
        instructions: aiRecipe.steps,
        nutrition: {
            calories: aiRecipe.caloriesPerServing,
            protein: aiRecipe.macros.protein,
            carbs: aiRecipe.macros.carbs,
            fat: aiRecipe.macros.fat,
        },
        prepTimeMins: Math.floor(aiRecipe.timeMinutes * 0.4), // Estimate
        cookTimeMins: Math.floor(aiRecipe.timeMinutes * 0.6), // Estimate
        difficulty: 'medium', // Default
        tags: [aiRecipe.id],
    };
}


export async function saveGeneratedRecipeAction(recipeOutput: AI_RecipeGeneration_Output) {
    try {
        const userId = "user123";
        console.log(`[RecipeAction] Saving generated recipe for user: ${userId}`);
        
        if (!recipeOutput || !recipeOutput.recipe) {
            throw new Error("Invalid recipe data provided.");
        }
        
        console.log("[RecipeAction] Recipe Data:", recipeOutput.recipe.name);

        await new Promise(resolve => setTimeout(resolve, 1000));
        const recipeId = `recipe_${Date.now()}`;
        
        const convertedRecipe = convertAIRecipeToMealPlanRecipe(recipeOutput.recipe);

        return { success: true, recipeId, convertedRecipe };
    } catch (error) {
        console.error("[Action Error: saveGeneratedRecipeAction]", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: `Failed to save recipe: ${errorMessage}` };
    }
}
