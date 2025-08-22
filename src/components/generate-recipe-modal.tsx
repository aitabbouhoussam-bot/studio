
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "./icons";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { generateRecipeAction, saveGeneratedRecipeAction } from "@/lib/recipe-actions";
import type { GeneratedRecipe } from "@/ai/flows/generate-recipe-flow";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Sparkles, Save, Redo } from "lucide-react";
import { useMealPlanStore } from "@/stores/meal-plan-store";
import type { Recipe } from "@/ai/schemas";
import { Skeleton } from "./ui/skeleton";


const formSchema = z.object({
  prompt: z.string().min(5, "Please enter a more descriptive recipe idea."),
});

type GenerateFormValues = z.infer<typeof formSchema>;

interface GenerateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-md" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
        </div>
    </div>
);


export function GenerateRecipeModal({ isOpen, onClose }: GenerateRecipeModalProps) {
  const { toast } = useToast();
  const { addRecipe } = useMealPlanStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleGenerate = async (values: GenerateFormValues) => {
    setIsLoading(true);
    setGeneratedRecipe(null);
    const result = await generateRecipeAction(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setGeneratedRecipe(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error generating recipe",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  const handleSave = async () => {
    if (!generatedRecipe) return;
    setIsSaving(true);
    
    // Convert GeneratedRecipe to the meal plan Recipe schema
    const recipeForPlan: Recipe = {
      ...generatedRecipe,
      day: 'Monday', // Assign a default day, user can change later
      mealType: 'dinner', // Assign a default meal type
    };
    
    // Add to our front-end state
    addRecipe(recipeForPlan);

    // Also call the "backend" action which just simulates a save
    const result = await saveGeneratedRecipeAction(generatedRecipe);
    setIsSaving(false);

     if (result.success) {
      toast({
        title: "Recipe Saved!",
        description: `"${generatedRecipe.title}" has been saved to your library.`,
      });
      handleClose();
    } else {
      toast({
        variant: "destructive",
        title: "Error saving recipe",
        description: result.error || "An unknown error occurred.",
      });
    }
  }
  
  const handleClose = () => {
    form.reset();
    setGeneratedRecipe(null);
    onClose();
  }

  const handleRegenerate = () => {
    const currentPrompt = form.getValues("prompt");
    if (currentPrompt) {
        handleGenerate({ prompt: currentPrompt });
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Generate New Recipe with AI</DialogTitle>
          <DialogDescription>
            Have an idea for a dish? Describe it below and let AI create the recipe for you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="flex items-start gap-2">
                <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormControl>
                        <Input placeholder="e.g., 'a quick and healthy salmon dish with asparagus'" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate
                </Button>
            </form>
        </Form>
        </div>

        <ScrollArea className="max-h-[55vh] p-1 pr-4">
            {isLoading && <LoadingSkeleton /> }
            
            {generatedRecipe && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="relative h-64 w-full rounded-md overflow-hidden border">
                        <Image
                            src={generatedRecipe.imageUrl || "https://placehold.co/600x400.png"}
                            layout="fill"
                            objectFit="cover"
                            alt={generatedRecipe.title}
                            data-ai-hint="recipe food"
                        />
                    </div>
                    <h3 className="text-2xl font-bold font-headline">{generatedRecipe.title}</h3>
                     {generatedRecipe.description && (
                        <p className="text-muted-foreground">{generatedRecipe.description}</p>
                    )}
                     <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">{generatedRecipe.difficulty}</Badge>
                        <Badge variant="secondary">{generatedRecipe.cookTimeMins + generatedRecipe.prepTimeMins} min</Badge>
                        {generatedRecipe.tags?.map(tag => <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-headline text-lg mb-2 text-primary">Ingredients</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {generatedRecipe.ingredients.map((ing, i) => (
                                <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-headline text-lg mb-2 text-primary">Nutrition Facts</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p><strong>Calories:</strong> {generatedRecipe.nutrition.calories} kcal</p>
                                <p><strong>Protein:</strong> {generatedRecipe.nutrition.protein}g</p>
                                <p><strong>Carbs:</strong> {generatedRecipe.nutrition.carbs}g</p>
                                <p><strong>Fat:</strong> {generatedRecipe.nutrition.fat}g</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-headline text-lg mb-2 text-primary">Cooking Instructions</h4>
                        <ol className="list-decimal list-inside space-y-2">
                            {generatedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                </div>
            )}

            {!isLoading && !generatedRecipe && (
                <Alert className="text-center">
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Ready to Cook?</AlertTitle>
                    <AlertDescription>
                        Your generated recipe will appear here.
                    </AlertDescription>
                </Alert>
            )}

        </ScrollArea>
        
        <DialogFooter className="pt-6">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleClose}>
                    Close
                </Button>
            </DialogClose>
            {generatedRecipe && (
                 <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleRegenerate} disabled={isLoading}>
                         {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Redo className="mr-2 h-4 w-4" />}
                        Regenerate
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Recipe
                    </Button>
                 </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
