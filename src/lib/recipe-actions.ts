
"use server";

import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required."),
});

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  ingredients: z.array(ingredientSchema).min(1, "Please add at least one ingredient."),
  instructions: z.string().min(10, "Instructions must be at least 10 characters long."),
  calories: z.coerce.number().positive().optional(),
  protein: z.coerce.number().positive().optional(),
  carbs: z.coerce.number().positive().optional(),
  fat: z.coerce.number().positive().optional(),
});


export async function addRecipeAction(values: z.infer<typeof recipeSchema>) {
  try {
    const validatedData = recipeSchema.parse(values);

    // In a real app, you would get the authenticated user's ID
    const userId = "user123"; // Mock user ID

    console.log(`[RecipeAction] Saving recipe for user: ${userId}`);
    console.log("[RecipeAction] Recipe Data:", validatedData);

    // Here you would implement the logic to save to Firestore, e.g.:
    // const recipeCollection = collection(db, 'users', userId, 'recipes');
    // const docRef = await addDoc(recipeCollection, {
    //   ...validatedData,
    //   createdAt: serverTimestamp(),
    // });
    
    // Simulate a database operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    const recipeId = `recipe_${Date.now()}`;

    // After saving, you might need to revalidate the path to update cached data
    // revalidatePath('/dashboard/recipes');

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
