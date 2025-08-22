
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { GenerateMealPlanOutput, Recipe } from "@/ai/schemas";

// This context is a simple example.
// For more complex state, consider libraries like Zustand or Redux.

interface MealPlanContextType {
  mealPlan: GenerateMealPlanOutput | null;
  setMealPlan: (plan: GenerateMealPlanOutput | null) => void;
  addRecipe: (recipe: Recipe) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
  const [mealPlan, setMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addRecipe = (newRecipe: Recipe) => {
    setMealPlan(currentPlan => {
        const updatedRecipes = currentPlan ? [...currentPlan.recipes, newRecipe] : [newRecipe];
        return { ...currentPlan, recipes: updatedRecipes };
    });
  }

  return (
    <MealPlanContext.Provider value={{ mealPlan, setMealPlan, addRecipe, isLoading, setIsLoading }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error("useMealPlan must be used within a MealPlanProvider");
  }
  return context;
};
