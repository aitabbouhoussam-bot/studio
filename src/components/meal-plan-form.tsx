"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Icons } from "./icons";

const formSchema = z.object({
  dietaryPreferences: z.string().min(1, {
    message: "Please enter at least one dietary preference.",
  }),
  allergies: z.string().default("None"),
  calorieIntake: z.coerce
    .number({ invalid_type_error: "Please enter a valid number." })
    .positive({ message: "Calorie intake must be a positive number." })
    .min(1000, { message: "Calorie intake should be at least 1000." })
    .max(5000, { message: "Calorie intake should not exceed 5000." }),
});

interface MealPlanFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export function MealPlanForm({ onSubmit, isLoading }: MealPlanFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: "Vegetarian",
      allergies: "None",
      calorieIntake: 2000,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create Your Meal Plan</CardTitle>
        <CardDescription>
          Tell us your preferences and we'll generate a personalized meal plan just for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Vegetarian, Vegan, Keto"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple preferences with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Peanuts, Dairy, Soy"
                        {...field}
                         disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      List any allergies, separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="calorieIntake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Daily Calorie Intake</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2000" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Meal Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
