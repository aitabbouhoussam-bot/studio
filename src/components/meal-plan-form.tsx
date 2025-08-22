
"use client";

import { Controller, useForm } from "react-hook-form";
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
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sparkles } from "lucide-react";

const dietaryOptions = ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'gluten-free'];
const allergyOptions = ['nuts', 'dairy', 'shellfish', 'eggs', 'soy', 'wheat'];

const formSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  budgetLevel: z.number().min(1).max(5).default(3),
  dailyCalorieGoal: z.coerce.number().positive().min(1000).max(5000).default(2000),
  defaultServings: z.coerce.number().positive().default(2),
  maxCookingTimeMins: z.number().default(45),
  dislikedIngredients: z.array(z.string()).default([]),
  preferredCuisines: z.array(z.string()).default([]),
});


interface MealPlanFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void; 
  isLoading: boolean;
}

export function MealPlanForm({ onSubmit, isLoading }: MealPlanFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        dietaryRestrictions: [],
        allergies: [],
        budgetLevel: 3,
        dailyCalorieGoal: 2000,
        defaultServings: 2,
        maxCookingTimeMins: 45,
        dislikedIngredients: [],
        preferredCuisines: [],
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
            
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Dietary Preferences</FormLabel>
                    <FormDescription>
                      Select any dietary protocols you follow.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dietaryOptions.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="dietaryRestrictions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">
                              {item}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Allergies & Intolerances</FormLabel>
                     <FormDescription>
                      Select any ingredients you need to avoid completely.
                    </FormDescription>
                  </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allergyOptions.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="allergies"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">
                              {item}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="dailyCalorieGoal"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Daily Calorie Goal</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 2000" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="defaultServings"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Number of Servings</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select number of servings" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {[1,2,3,4,5,6].map(i => <SelectItem key={i} value={String(i)}>{i} person{i > 1 ? 's' : ''}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="budgetLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Level: <span className="font-bold">{field.value} / 5</span></FormLabel>
                   <FormControl>
                     <Controller
                        name="budgetLevel"
                        control={form.control}
                        render={({ field: { onChange, value }}) => (
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                defaultValue={[value]}
                                onValueChange={(vals) => onChange(vals[0])}
                            />
                        )}
                        />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Budget-friendly</span>
                    <span>Premium ingredients</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Plan My Week
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
