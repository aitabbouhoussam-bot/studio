
"use server";

import { generateMealPlan } from "@/ai/flows/generate-meal-plan-advanced";
import { z } from "zod";

const formSchema = z.object({
  dietaryPreferences: z.string(),
  allergies: z.string(),
  calorieIntake: z.coerce.number(),
  // Adding the extra fields from the new form
  budgetLevel: z.number(),
  defaultServings: z.number(),
  maxCookingTimeMins: z.number(),
  dislikedIngredients: z.array(z.string()),
  preferredCuisines: z.array(z.string()),
});

export async function generateMealPlanAction(
  input: z.infer<typeof formSchema>
) {
  "use server";
  try {
    const validatedInput = formSchema.parse(input);

    const fullPreferences = {
        dietaryRestrictions: validatedInput.dietaryPreferences.split(',').map(s => s.trim()).filter(Boolean),
        allergies: validatedInput.allergies.split(',').map(s => s.trim()).filter(Boolean),
        dailyCalorieGoal: validatedInput.calorieIntake,
        budgetLevel: validatedInput.budgetLevel,
        maxCookingTimeMins: validatedInput.maxCookingTimeMins,
        dislikedIngredients: validatedInput.dislikedIngredients,
        preferredCuisines: validatedInput.preferredCuisines,
    };
    
    // In a real app, userId would come from the authenticated session
    const mockUserId = 'user123'; 

    const result = await generateMealPlan({
        userId: mockUserId,
        preferences: fullPreferences,
        servings: validatedInput.defaultServings,
        // In a real app, this would be determined by user/family context
        owner: { type: 'user', id: mockUserId }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("[Action Error: generateMealPlanAction]", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input provided. Please check the form fields." };
    }
    // Check for specific, user-friendly error messages from the service layer
    if (error instanceof Error && error.message.includes('quota')) {
        return { success: false, error: error.message };
    }
    
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to generate meal plan: ${errorMessage}` };
  }
}
