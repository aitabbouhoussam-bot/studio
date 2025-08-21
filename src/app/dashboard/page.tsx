
"use client";

import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { StatCards } from "@/components/dashboard/stat-cards";
import { useMealPlan } from "@/contexts/meal-plan-context";
import { z } from "zod";
import { generateMealPlanAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { GenerateMealPlanOutput } from "@/ai/schemas";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListTodo, PlusCircle, ArrowRight, MessageSquare, ChefHat } from "lucide-react";
import { useState } from "react";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import { AiChefAssistant } from "@/components/ai-chef-assistant";

const formSchema = z.object({
  dietaryPreferences: z.string(),
  allergies: z.string(),
  calorieIntake: z.coerce.number(),
  budgetLevel: z.number(),
  defaultServings: z.number(),
  maxCookingTimeMins: z.number(),
  dislikedIngredients: z.array(z.string()),
  preferredCuisines: z.array(z.string()),
});

export default function DashboardPage() {
  const { mealPlan, setMealPlan, isLoading, setIsLoading } = useMealPlan();
  const { toast } = useToast();
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isChefAssistantOpen, setIsChefAssistantOpen] = useState(false);

  const handleGeneratePlan = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setMealPlan(null);

    const result = await generateMealPlanAction(data);

    if (result.success && result.data) {
      setMealPlan(result.data as GenerateMealPlanOutput);
      toast({
        title: "Success!",
        description: "Your new meal plan has been generated.",
      });
    } else {
       const isQuotaError = result.error?.includes("quota has been reached");
       
       toast({
        variant: "destructive",
        title: isQuotaError ? "Monthly Limit Reached" : "Oh no! Something went wrong.",
        description: (
          <div>
            <p>{result.error || "There was a problem generating your meal plan."}</p>
            {isQuotaError && (
               <Button asChild variant="link" className="p-0 h-auto font-semibold text-destructive-foreground">
                  <Link href="/pricing">Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" /></Link>
               </Button>
            )}
          </div>
        )
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <AddRecipeModal isOpen={isAddRecipeModalOpen} onClose={() => setIsAddRecipeModalOpen(false)} />
      <AiChefAssistant isOpen={isChefAssistantOpen} onClose={() => setIsChefAssistantOpen(false)} />

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">Welcome Back, User!</h1>
              <p className="text-muted-foreground">Here's what your week looks like. Let's get planning!</p>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                  <Link href="/dashboard/shopping-list">
                      <ListTodo className="mr-2 h-4 w-4"/>
                      View Grocery List
                  </Link>
              </Button>
              <Button onClick={() => setIsAddRecipeModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Add Recipe
              </Button>
          </div>
        </div>
        
        <StatCards mealPlan={mealPlan} />
        <MealPlanForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
        <MealPlanDisplay mealPlan={mealPlan} isLoading={isLoading} />
      </div>

       <Button 
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsChefAssistantOpen(true)}
        >
            <ChefHat className="h-8 w-8" />
            <span className="sr-only">Open AI Chef Assistant</span>
        </Button>
    </>
  );
}
