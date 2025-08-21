"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MealPlanContextType {
  mealPlan: string;
  setMealPlan: (plan: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
  const [mealPlan, setMealPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <MealPlanContext.Provider value={{ mealPlan, setMealPlan, isLoading, setIsLoading }}>
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
