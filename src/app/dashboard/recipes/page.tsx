
"use client";

import { useMealPlan } from "@/contexts/meal-plan-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecipesPage() {
  const { mealPlan } = useMealPlan();

  if (!mealPlan || !mealPlan.recipes || mealPlan.recipes.length === 0) {
    return (
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertTitle>No Recipes Found</AlertTitle>
        <AlertDescription>
          Your recipe library is empty. Generate a meal plan to start populating it with new recipes.
        </AlertDescription>
      </Alert>
    );
  }

  // To avoid showing duplicate recipes if they appear on multiple days
  const uniqueRecipes = Array.from(new Map(mealPlan.recipes.map(recipe => [recipe.title, recipe])).values());

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Recipe Library</h1>
            <p className="text-muted-foreground">Browse and manage all your saved recipes.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button disabled>
                Add New Recipe
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueRecipes.map((recipe, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{recipe.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">{recipe.description}</p>
               <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="capitalize">{recipe.difficulty}</Badge>
                  <Badge variant="secondary">{recipe.cookTimeMins + recipe.prepTimeMins} min</Badge>
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" disabled>View Recipe</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
