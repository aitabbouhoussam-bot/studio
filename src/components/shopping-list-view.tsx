"use client";

import { useMealPlan } from "@/contexts/meal-plan-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ListChecks } from "lucide-react";
import { useMemo } from "react";
import type { GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";

interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
  recipes: string[];
}

interface CategorizedList {
  [category: string]: AggregatedIngredient[];
}

export function ShoppingListView() {
  const { mealPlan } = useMealPlan();

  const shoppingList: CategorizedList = useMemo(() => {
    if (!mealPlan?.recipes) return {};

    const aggregated: { [key: string]: AggregatedIngredient } = {};

    for (const recipe of mealPlan.recipes) {
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
        if (aggregated[key]) {
          aggregated[key].quantity += ingredient.quantity;
          if (!aggregated[key].recipes.includes(recipe.title)) {
            aggregated[key].recipes.push(recipe.title);
          }
        } else {
          aggregated[key] = {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            recipes: [recipe.title],
          };
        }
      }
    }
    
    const categorized: CategorizedList = {};
    for(const recipe of mealPlan.recipes) {
      for (const ingredient of recipe.ingredients) {
        if (!categorized[ingredient.category]) {
          categorized[ingredient.category] = [];
        }
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
        if(aggregated[key]) {
            // Find if already added to prevent duplicates
            if(!categorized[ingredient.category].find(i => i.name === aggregated[key].name && i.unit === aggregated[key].unit)){
                 categorized[ingredient.category].push(aggregated[key]);
            }
        }
      }
    }

    return categorized;
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

  const categories = Object.keys(shoppingList).sort();

  if (categories.length === 0) {
      return (
         <Alert>
          <ListChecks className="h-4 w-4" />
          <AlertTitle>Could Not Generate Shopping List</AlertTitle>
          <AlertDescription>
            We couldn't automatically extract ingredients from your meal plan. You can still view the full plan and manually create your list.
          </AlertDescription>
        </Alert>
      )
  }

  return (
    <div className="space-y-8">
      <Card className="animate-in fade-in duration-500">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Shopping List</CardTitle>
            <CardDescription>Aggregated from your 7-day meal plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {categories.map((category) => (
                <div key={category}>
                    <h3 className="font-semibold text-lg text-primary capitalize">{category}</h3>
                     <div className="mt-2 space-y-2 pl-2 border-l-2 border-primary/50">
                        {shoppingList[category].map((item, index) => (
                             <div key={index} className="flex items-center space-x-3">
                                <Checkbox id={`${category}-${index}`} />
                                <label
                                    htmlFor={`${category}-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {item.quantity} {item.unit} {item.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
