
"use client";

import { useMealPlan } from "@/contexts/meal-plan-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ListChecks, ShoppingCart } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { GenerateMealPlanOutput } from "@/ai/schemas";
import { Progress } from "./ui/progress";

interface AggregatedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  recipes: string[];
}

interface CategorizedList {
  [category: string]: AggregatedIngredient[];
}

export function ShoppingListView() {
  const { mealPlan } = useMealPlan();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset checked items when meal plan changes
    setCheckedItems({});
  }, [mealPlan]);

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
            category: ingredient.category || 'other',
            recipes: [recipe.title],
          };
        }
      }
    }
    
    const categorized: CategorizedList = {};
    for(const item of Object.values(aggregated)) {
      const categoryKey = item.category || 'other';
      if (!categorized[categoryKey]) {
        categorized[categoryKey] = [];
      }
      categorized[categoryKey].push(item);
    }

    // Sort items within each category alphabetically
    for (const category in categorized) {
      categorized[category].sort((a, b) => a.name.localeCompare(b.name));
    }


    return categorized;
  }, [mealPlan]);

  const handleToggleItem = (itemName: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

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

  const categoryOrder = ['produce', 'protein', 'dairy', 'bakery', 'pantry', 'frozen', 'beverages', 'other'];
  const allItems = Object.values(shoppingList).flat();
  const sortedCategories = Object.keys(shoppingList).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.toLowerCase());
    const bIndex = categoryOrder.indexOf(b.toLowerCase());
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const totalItemsCount = allItems.length;
  const checkedItemsCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = totalItemsCount > 0 ? (checkedItemsCount / totalItemsCount) * 100 : 0;

  if (totalItemsCount === 0) {
      return (
         <Alert>
          <ListChecks className="h-4 w-4" />
          <AlertTitle>Your Shopping List is Empty</AlertTitle>
          <AlertDescription>
            We couldn't find any ingredients in your current meal plan. Try generating a new plan.
          </AlertDescription>
        </Alert>
      )
  }

  return (
    <div className="space-y-8">
      <Card className="animate-in fade-in duration-500">
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <ShoppingCart />
              Your Shopping List
            </CardTitle>
            <CardDescription>Aggregated from your 7-day meal plan. Check items off as you shop!</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold">Shopping Progress</h3>
                    <span className="text-sm text-muted-foreground font-medium">
                        {checkedItemsCount}/{totalItemsCount} completed
                    </span>
                </div>
                <Progress value={progressPercentage} />
            </div>
            <div className="space-y-6">
                {sortedCategories.map((category) => (
                    <div key={category}>
                        <h3 className="font-semibold text-lg text-primary capitalize border-b-2 border-primary/20 pb-1 mb-3">{category}</h3>
                        <div className="space-y-3 pl-2">
                            {shoppingList[category].map((item, index) => {
                                const isChecked = !!checkedItems[item.name];
                                return (
                                <div 
                                    key={index} 
                                    className={`flex items-center space-x-3 transition-opacity ${isChecked ? 'opacity-50' : ''}`}
                                >
                                    <Checkbox 
                                        id={`${category}-${index}`} 
                                        checked={isChecked}
                                        onCheckedChange={() => handleToggleItem(item.name)}
                                    />
                                    <label
                                        htmlFor={`${category}-${index}`}
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isChecked ? 'line-through' : ''}`}
                                    >
                                        {item.quantity} {item.unit} {item.name}
                                    </label>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
