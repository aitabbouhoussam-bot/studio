"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface MealPlanDisplayProps {
  mealPlan: string;
  isLoading: boolean;
}

const MealPlanSkeleton = () => (
  <div className="space-y-4">
    {[...Array(7)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
      </Card>
    ))}
  </div>
);

export function MealPlanDisplay({ mealPlan, isLoading }: MealPlanDisplayProps) {
  if (isLoading) {
    return <MealPlanSkeleton />;
  }

  if (!mealPlan) {
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

  const parseMealPlan = (plan: string) => {
    const days = plan.split(/\bDay \d+:/).slice(1);
    return days.map((dayContent, index) => {
      return {
        day: `Day ${index + 1}`,
        content: dayContent.trim(),
      };
    });
  };

  const dailyPlans = parseMealPlan(mealPlan);

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold font-headline mb-4">Your 7-Day Meal Plan</h2>
      <Accordion type="single" collapsible className="w-full" defaultValue="Day 1">
        {dailyPlans.map(({ day, content }) => (
          <AccordionItem value={day} key={day}>
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              {day}
            </AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap p-4 bg-secondary/50 rounded-md">
                {content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
