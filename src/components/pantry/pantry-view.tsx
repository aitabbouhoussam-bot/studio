
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategorySection } from "./category-section";
import { usePantryStore } from "@/stores/pantry-store";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Refrigerator } from "lucide-react";

// Mock data has been removed. The component will now use the pantry store.

const categoryConfig = {
  produce: { name: "Produce", icon: "🍎" },
  dairy: { name: "Dairy & Eggs", icon: "🥚" },
  meat: { name: "Meat & Poultry", icon: "🍗" },
  pantry: { name: "Pantry", icon: "🥫" },
  frozen: { name: "Frozen", icon: "❄️" },
  beverages: { name: "Beverages", icon: "🥤" },
  spices: { name: "Spices & Seasoning", icon: "🌶️" },
  other: { name: "Other", icon: "📦" },
};


export function PantryView() {
  const { items, initializePantry } = usePantryStore();

  // In a real app, we would fetch from Firestore here.
  // For now, we'll initialize with some default data to simulate this.
  useEffect(() => {
    initializePantry();
  }, [initializePantry]);

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">My Pantry</h1>
          <p className="text-muted-foreground">Keep track of your kitchen inventory.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search pantry..." className="pl-10" />
            </div>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      {items.length === 0 ? (
        <Alert>
            <Refrigerator className="h-4 w-4" />
            <AlertTitle>Your Pantry is Empty</AlertTitle>
            <AlertDescription>
              Add items to your pantry to start tracking your inventory and get smart recipe suggestions.
            </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <CategorySection 
                key={category} 
                // @ts-ignore
                title={categoryConfig[category]?.name || 'Other'}
                // @ts-ignore
                icon={categoryConfig[category]?.icon || '📦'}
                items={categoryItems}
            />
            ))}
        </div>
      )}

    </div>
  );
}
