
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { useMealPlanStore } from "@/stores/meal-plan-store";

const MealPlanSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-2/3 mt-2" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export function MealPlanDisplay() {
  const { mealPlan, isLoading } = useMealPlanStore();

  if (isLoading) {
    return <MealPlanSkeleton />;
  }

  if (!mealPlan || !mealPlan.recipes || mealPlan.recipes.length === 0) {
    return (
      <Card className="mt-8 text-center">
        <CardHeader>
          <CardTitle>Your Meal Plan Awaits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fill out the form above to generate your personalized 7-day meal plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedByDay = mealPlan.recipes.reduce((acc, recipe) => {
    const day = recipe.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(recipe);
    return acc;
  }, {} as Record<string, typeof mealPlan.recipes>);

  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline mb-4">Your 7-Day Meal Plan</h2>
      <Accordion type="single" collapsible className="w-full" defaultValue="Monday">
        {orderedDays.map((day) => {
          const recipes = groupedByDay[day];
          if (!recipes) return null;

          return (
            <AccordionItem value={day} key={day}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                {day}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {recipes.map((recipe) => (
                    <Card key={recipe.title}>
                      <CardHeader>
                        <CardTitle className="font-headline text-xl flex justify-between items-center">
                          {recipe.title}
                          <Badge variant="secondary" className="capitalize">{recipe.mealType}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}
                        
                        <div>
                          <h4 className="font-semibold mb-2 text-primary">Ingredients:</h4>
                          <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                            {recipe.ingredients.map((ing, i) => <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>)}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 text-primary">Instructions:</h4>
                          <ol className="list-decimal list-inside pl-2 space-y-1 text-sm">
                            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                          </ol>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm pt-2">
                           <div className="bg-secondary/50 p-2 rounded-md text-center">
                                <p className="font-semibold">Calories</p>
                                <p>{recipe.nutrition.calories} kcal</p>
                           </div>
                           <div className="bg-secondary/50 p-2 rounded-md text-center">
                                <p className="font-semibold">Protein</p>
                                <p>{recipe.nutrition.protein}g</p>
                           </div>
                           <div className="bg-secondary/50 p-2 rounded-md text-center">
                                <p className="font-semibold">Carbs</p>
                                <p>{recipe.nutrition.carbs}g</p>
                           </div>
                           <div className="bg-secondary/50 p-2 rounded-md text-center">
                                <p className="font-semibold">Fat</p>
                                <p>{recipe.nutrition.fat}g</p>
                           </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                          <span>Prep: {recipe.prepTimeMins} mins | Cook: {recipe.cookTimeMins} mins</span>
                          <Badge variant="outline" className="capitalize">{recipe.difficulty}</Badge>
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  );
}
