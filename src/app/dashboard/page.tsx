
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
import { ListTodo } from "lucide-react";

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
    setMealPlan(null);

    const result = await generateMealPlanAction(data);

    if (result.success && result.data) {
      setMealPlan(result.data as GenerateMealPlanOutput);
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
        </div>
      </div>
      
      <StatCards mealPlan={mealPlan} />
      <MealPlanForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
      <MealPlanDisplay mealPlan={mealPlan} isLoading={isLoading} />
    </div>
  );
}
