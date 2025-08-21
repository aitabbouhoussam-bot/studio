"use client";

import { useMealPlan } from "@/contexts/meal-plan-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ListChecks } from "lucide-react";
import { useMemo } from "react";

interface Meal {
  name: string;
  ingredients: string[];
}

interface DailyPlan {
  day: string;
  meals: Meal[];
}

export function ShoppingListView() {
  const { mealPlan } = useMealPlan();

  const shoppingList: DailyPlan[] = useMemo(() => {
    if (!mealPlan) return [];

    const parsedPlan: DailyPlan[] = [];
    const daySections = mealPlan.split(/\bDay \d+:/).slice(1);

    daySections.forEach((dayContent, index) => {
      const dailyPlan: DailyPlan = {
        day: `Day ${index + 1}`,
        meals: [],
      };

      const mealSections = dayContent.split(/(Breakfast:|Lunch:|Dinner:)/).slice(1);

      for (let i = 0; i < mealSections.length; i += 2) {
        const mealName = mealSections[i].replace(":", "").trim();
        const mealContent = mealSections[i + 1];

        const ingredientsMatch = mealContent.match(/Ingredients:\s*([\s\S]*?)(?:Instructions:|Directions:|$)/i);
        
        let ingredients: string[] = [];
        if (ingredientsMatch && ingredientsMatch[1]) {
          ingredients = ingredientsMatch[1]
            .split("\n")
            .map(line => line.replace(/^-/, '').trim())
            .filter(line => line.length > 0);
        }
        
        if (ingredients.length > 0) {
            dailyPlan.meals.push({ name: mealName, ingredients });
        }
      }
      if (dailyPlan.meals.length > 0) {
        parsedPlan.push(dailyPlan);
      }
    });

    return parsedPlan;
  }, [mealPlan]);

  if (!mealPlan) {
    return (
      <Alert>
        <ListChecks className="h-4 w-4" />
        <AlertTitle>No Meal Plan Found</AlertTitle>
        <AlertDescription>
          Please generate a meal plan first to see your shopping list.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {shoppingList.map((dailyPlan) => (
        <Card key={dailyPlan.day} className="animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{dailyPlan.day}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {dailyPlan.meals.map((meal) => (
              <div key={meal.name}>
                <h3 className="font-semibold text-lg text-primary">{meal.name}</h3>
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-primary/50">
                  {meal.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Checkbox id={`${dailyPlan.day}-${meal.name}-${index}`} />
                      <label
                        htmlFor={`${dailyPlan.day}-${meal.name}-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {ingredient}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
       {shoppingList.length === 0 && (
         <Alert>
          <ListChecks className="h-4 w-4" />
          <AlertTitle>Could Not Generate Shopping List</AlertTitle>
          <AlertDescription>
            We couldn't automatically extract ingredients from your meal plan. You can still view the full plan and manually create your list.
          </AlertDescription>
        </Alert>
       )}
    </div>
  );
}
