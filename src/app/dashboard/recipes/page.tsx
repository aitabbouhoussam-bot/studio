
"use client";

import { useMealPlanStore } from "@/stores/meal-plan-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, PlusCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import { GenerateRecipeModal } from "@/components/generate-recipe-modal";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import type { Recipe } from "@/ai/schemas";

export default function RecipesPage() {
  const { mealPlan } = useMealPlanStore();
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isGenerateRecipeModalOpen, setIsGenerateRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };


  if (!mealPlan || !mealPlan.recipes || mealPlan.recipes.length === 0) {
    return (
        <>
        <GenerateRecipeModal isOpen={isGenerateRecipeModalOpen} onClose={() => setIsGenerateRecipeModalOpen(false)} />
        <AddRecipeModal isOpen={isAddRecipeModalOpen} onClose={() => setIsAddRecipeModalOpen(false)} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Recipe Library</h1>
                <p className="text-muted-foreground">Browse and manage all your saved recipes.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsAddRecipeModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Manually
                </Button>
                <Button onClick={() => setIsGenerateRecipeModalOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4"/>
                    Generate with AI
                </Button>
            </div>
        </div>
        <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>No Recipes Found</AlertTitle>
            <AlertDescription>
            Your recipe library is empty. Generate a meal plan or add a new recipe to get started.
            </AlertDescription>
        </Alert>
      </>
    );
  }

  // To avoid showing duplicate recipes if they appear on multiple days
  const uniqueRecipes = Array.from(new Map(mealPlan.recipes.map(recipe => [recipe.title, recipe])).values());

  return (
    <>
    <GenerateRecipeModal isOpen={isGenerateRecipeModalOpen} onClose={() => setIsGenerateRecipeModalOpen(false)} />
    <AddRecipeModal isOpen={isAddRecipeModalOpen} onClose={() => setIsAddRecipeModalOpen(false)} />
    {selectedRecipe && <RecipeDetailModal recipe={selectedRecipe} isOpen={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Recipe Library</h1>
            <p className="text-muted-foreground">Browse and manage all your saved recipes.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsAddRecipeModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Manually
            </Button>
            <Button onClick={() => setIsGenerateRecipeModalOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4"/>
                Generate with AI
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueRecipes.map((recipe, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                    <Image
                        src={recipe.imageUrl || "https://placehold.co/600x400.png"}
                        alt={recipe.title}
                        fill
                        className="object-cover rounded-t-lg"
                        data-ai-hint="recipe food"
                    />
                </div>
              <div className="p-6">
                <CardTitle className="font-headline text-xl">{recipe.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">{recipe.description}</p>
               <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="capitalize">{recipe.difficulty}</Badge>
                  <Badge variant="secondary">{recipe.cookTimeMins + recipe.prepTimeMins} min</Badge>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button variant="outline" className="w-full" onClick={() => handleViewRecipe(recipe)}>View Recipe</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
