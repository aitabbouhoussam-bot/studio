
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMealPlanStore } from "@/stores/meal-plan-store";
import { Utensils, Wheat, ShoppingCart, Activity } from "lucide-react";

export function StatCards() {
    const mealPlan = useMealPlanStore((state) => state.mealPlan);

    const calculateStats = () => {
        if (!mealPlan || !mealPlan.recipes) {
            return {
                mealsPlanned: 0,
                totalRecipes: 0,
                groceryItems: 0,
                planStatus: "Not Generated",
            };
        }

        const uniqueRecipes = new Set(mealPlan.recipes.map(r => r.title));
        const totalIngredients = mealPlan.recipes.reduce((acc, recipe) => acc + recipe.ingredients.length, 0);

        return {
            mealsPlanned: mealPlan.recipes.length,
            totalRecipes: uniqueRecipes.size,
            groceryItems: totalIngredients,
            planStatus: "Generated",
        }
    }

    const stats = calculateStats();

    const statItems = [
        {
            title: "Meals Planned",
            value: stats.mealsPlanned,
            icon: Utensils,
            description: "For this week"
        },
        {
            title: "Total Recipes",
            value: stats.totalRecipes,
            icon: Wheat,
            description: "In current plan"
        },
        {
            title: "Grocery Items",
            value: stats.groceryItems,
            icon: ShoppingCart,
            description: "To buy this week"
        },
        {
            title: "Plan Status",
            value: stats.planStatus,
            icon: Activity,
            description: "Current state"
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.title}
                        </CardTitle>
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
