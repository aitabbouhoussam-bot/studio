
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
      const updatedRecipes = state.mealPlan
        ? [...state.mealPlan.recipes, newRecipe]
        : [newRecipe];
      return { mealPlan: { ...state.mealPlan, recipes: updatedRecipes } };
    }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
