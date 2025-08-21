"use client";

import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { useMealPlan } from "@/contexts/meal-plan-context";
import { z } from "zod";
import { generateMealPlanAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  dietaryPreferences: z.string().min(1),
  allergies: z.string().default("None"),
  calorieIntake: z.coerce.number().positive(),
});

export default function DashboardPage() {
  const { mealPlan, setMealPlan, isLoading, setIsLoading } = useMealPlan();
  const { toast } = useToast();

  const handleGeneratePlan = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setMealPlan("");

    const result = await generateMealPlanAction(data);

    if (result.success && result.data) {
      setMealPlan(result.data);
      toast({
        title: "Success!",
        description: "Your new meal plan has been generated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: result.error || "There was a problem generating your meal plan.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <MealPlanForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
      <MealPlanDisplay mealPlan={mealPlan} isLoading={isLoading} />
    </div>
  );
}
