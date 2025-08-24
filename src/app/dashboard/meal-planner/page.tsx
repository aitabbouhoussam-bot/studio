"use client";

import { useAuth } from "@/contexts/auth-context";
import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { generateMealPlanAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useMealPlanStore } from "@/stores/meal-plan-store";
import { z } from "zod";

const formSchema = z.object({
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  budgetLevel: z.number(),
  dailyCalorieGoal: z.coerce.number(),
  defaultServings: z.coerce.number(),
  maxCookingTimeMins: z.number(),
  dislikedIngredients: z.array(z.string()),
  preferredCuisines: z.array(z.string()),
});

export default function MealPlannerPage() {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const { setMealPlan, setIsLoading, isLoading } = useMealPlanStore();


    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setMealPlan(null); // Clear previous plan

        const result = await generateMealPlanAction(values);

        if (result.success && result.data) {
            setMealPlan(result.data);
            toast({
                title: "Meal Plan Generated!",
                description: "Your personalized 7-day meal plan is ready.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: result.error || "An unknown error occurred while generating the meal plan.",
            });
        }

        setIsLoading(false);
    }

    return (
        <div className="space-y-8">
            <MealPlanForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                userProfilePreferences={userProfile?.preferences}
            />
            <MealPlanDisplay />
        </div>
    );
}
