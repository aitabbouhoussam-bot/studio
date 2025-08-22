
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/ai/schemas";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { ListPlus, Pencil, X } from "lucide-react";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeDetailModal({ recipe, isOpen, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{recipe.title}</DialogTitle>
          {recipe.description && (
            <DialogDescription>{recipe.description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="relative h-64 w-full rounded-md overflow-hidden border">
                 <Image
                    src={recipe.imageUrl || "https://placehold.co/600x400.png"}
                    fill
                    className="object-cover"
                    alt={recipe.title}
                    data-ai-hint="recipe food"
                />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-headline text-lg mb-2 text-primary">Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
                        ))}
                    </ul>
                </div>
                <div>
                     <h3 className="font-headline text-lg mb-2 text-primary">Nutrition Facts</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-secondary/50 p-2 rounded-md">
                            <p className="font-semibold">Calories</p>
                            <p className="text-muted-foreground">{recipe.nutrition.calories} kcal</p>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded-md">
                            <p className="font-semibold">Protein</p>
                            <p className="text-muted-foreground">{recipe.nutrition.protein}g</p>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded-md">
                            <p className="font-semibold">Carbs</p>
                            <p className="text-muted-foreground">{recipe.nutrition.carbs}g</p>
                        </div>
                         <div className="bg-secondary/50 p-2 rounded-md">
                            <p className="font-semibold">Fat</p>
                            <p className="text-muted-foreground">{recipe.nutrition.fat}g</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-headline text-lg mb-2 text-primary">Cooking Instructions</h3>
                <ol className="list-decimal list-inside space-y-2">
                    {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
            </div>
        </div>
        
        <DialogFooter className="sm:justify-between !justify-between">
            <div>
                 <Button variant="outline" disabled>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Recipe
                 </Button>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" disabled>
                    <ListPlus className="mr-2 h-4 w-4" />
                    Add to Grocery List
                </Button>
                <Button onClick={onClose}>
                    <X className="mr-2 h-4 w-4" />
                     Close
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
