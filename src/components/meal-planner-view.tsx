
"use client";

import { useMealPlanStore } from "@/stores/meal-plan-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CalendarDays, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import type { Recipe } from "@/ai/schemas";
import { RecipeDetailModal } from "./recipe-detail-modal";
import { Skeleton } from "./ui/skeleton";


const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PlannerSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-start">
        {dayOrder.map(day => (
            <Card key={day} className="h-full">
                <CardHeader className="p-4">
                    <CardTitle className="font-headline text-lg text-center">{day}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        ))}
    </div>
)

export function MealPlannerView() {
  const { mealPlan, isLoading } = useMealPlanStore();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const groupedByDay = mealPlan?.recipes.reduce((acc, recipe) => {
    const day = recipe.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(recipe);
    return acc;
  }, {} as Record<string, typeof mealPlan.recipes>);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Weekly Meal Planner</h1>
            <p className="text-muted-foreground">Click on a recipe to see the details.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" disabled>Previous Week</Button>
            <Button variant="outline" disabled>Next Week</Button>
        </div>
      </div>
      
      {isLoading && <PlannerSkeleton /> }

      {!isLoading && !mealPlan && (
         <Alert>
            <CalendarDays className="h-4 w-4" />
            <AlertTitle>No Meal Plan Generated</AlertTitle>
            <AlertDescription>
              Generate a meal plan from the dashboard to start planning your week.
            </AlertDescription>
          </Alert>
      )}

      {!isLoading && mealPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-start">
            {dayOrder.map(day => (
                <Card key={day} className="h-full">
                    <CardHeader className="p-4">
                        <CardTitle className="font-headline text-lg text-center">{day}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2">
                        {groupedByDay && groupedByDay[day] ? (
                             groupedByDay[day]
                             .sort((a, b) => {
                                const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
                                return mealOrder[a.mealType] - mealOrder[b.mealType];
                              })
                             .map(recipe => (
                                <div 
                                    key={recipe.title} 
                                    className="bg-secondary/50 p-2 rounded-md border text-sm cursor-pointer hover:bg-secondary transition-colors"
                                    onClick={() => setSelectedRecipe(recipe)}
                                >
                                    <p className="font-semibold text-primary/90 capitalize">{recipe.mealType}</p>
                                    <p className="text-muted-foreground">{recipe.title}</p>
                                </div>
                             ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4 text-xs">No meals planned.</div>
                        )}
                         <Button variant="ghost" size="sm" className="w-full mt-2" disabled>
                            <PlusCircle className="h-4 w-4 mr-2"/>
                            Add Meal
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal 
            recipe={selectedRecipe}
            isOpen={!!selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
