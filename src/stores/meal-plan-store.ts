
import { create } from 'zustand';
import type { GenerateMealPlanOutput, Recipe } from "@/ai/schemas";

interface MealPlanState {
  mealPlan: GenerateMealPlanOutput | null;
  isLoading: boolean;
  setMealPlan: (plan: GenerateMealPlanOutput | null) => void;
  addRecipe: (recipe: Recipe) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useMealPlanStore = create<MealPlanState>((set) => ({
  mealPlan: null,
  isLoading: false,
  setMealPlan: (plan) => set({ mealPlan: plan }),
  addRecipe: (newRecipe) =>
    set((state) => {
      // Create a default meal plan structure if it doesn't exist
      const currentPlan = state.mealPlan || { recipes: [] };
      const updatedRecipes = [...currentPlan.recipes, newRecipe];
      return { mealPlan: { ...currentPlan, recipes: updatedRecipes } };
    }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
