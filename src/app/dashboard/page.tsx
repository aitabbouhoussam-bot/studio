
"use client";

import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { StatCards } from "@/components/dashboard/stat-cards";
import { useMealPlanStore } from "@/stores/meal-plan-store";
import { z } from "zod";
import { generateMealPlanAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { GenerateMealPlanOutput } from "@/ai/schemas";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListTodo, PlusCircle, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { GenerateRecipeModal } from "@/components/generate-recipe-modal";
import { AddRecipeModal } from "@/components/add-recipe-modal";
import { Icons } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  dailyCalorieGoal: z.coerce.number(),
  budgetLevel: z.number(),
  defaultServings: z.number(),
  maxCookingTimeMins: z.number(),
  dislikedIngredients: z.array(z.string()),
  preferredCuisines: z.array(z.string()),
});

export default function DashboardPage() {
  const { mealPlan, setMealPlan, isLoading, setIsLoading } = useMealPlanStore();
  const { toast } = useToast();
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const { userProfile } = useAuth();


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
       const isQuotaError = result.error?.includes("quota");
       
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
        ),
        duration: isQuotaError ? 10000 : 5000,
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <AddRecipeModal isOpen={isAddRecipeModalOpen} onClose={() => setIsAddRecipeModalOpen(false)} />
      
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">Welcome Back, {userProfile?.displayName || 'User'}!</h1>
              <p className="text-muted-foreground">Here's what your week looks like. Let's get planning!</p>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                  <Link href="/dashboard/shopping-list">
                      <ListTodo className="mr-2 h-4 w-4"/>
                      View Grocery List
                  </Link>
              </Button>
               <Button variant="outline" onClick={() => setIsAddRecipeModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Add Manually
              </Button>
          </div>
        </div>
        
        <StatCards />
        <MealPlanForm 
          onSubmit={handleGeneratePlan} 
          isLoading={isLoading} 
          // @ts-ignore
          userProfilePreferences={userProfile?.preferences}
        />
        <MealPlanDisplay />
      </div>
    </>
  );
}
