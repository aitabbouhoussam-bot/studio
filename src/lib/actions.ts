"use server";

import { generateMealPlan } from "@/ai/flows/generate-meal-plan";
import { z } from "zod";

const formSchema = z.object({
  dietaryPreferences: z.string(),
  allergies: z.string(),
  calorieIntake: z.coerce.number(),
});

export async function generateMealPlanAction(
  input: z.infer<typeof formSchema>
) {
  "use server";
  try {
    const validatedInput = formSchema.parse(input);
    const result = await generateMealPlan(validatedInput);
    return { success: true, data: result.mealPlan };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    return { success: false, error: "Failed to generate meal plan." };
  }
}
