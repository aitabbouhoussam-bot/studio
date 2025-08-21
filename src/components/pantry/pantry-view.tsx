
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategorySection } from "./category-section";

// Mock data based on your detailed schema
const mockPantryItems = [
  // Produce
  { id: '1', name: 'Apples', category: 'produce', quantity: 5, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() + 7)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Avocado', category: 'produce', quantity: 2, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() + 2)), isExpiring: true, isExpired: false, imageUrl: 'https://placehold.co/40x40.png' },
  // Dairy
  { id: '3', name: 'Milk', category: 'dairy', quantity: 1, unit: 'gallons', expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Eggs', category: 'dairy', quantity: 12, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() + 20)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/40x40.png' },
  { id: '5', name: 'Yogurt', category: 'dairy', quantity: 1, unit: 'pieces', expirationDate: new Date(new Date().setDate(new Date().getDate() - 1)), isExpiring: false, isExpired: true, imageUrl: 'https://placehold.co/40x40.png' },
  // Pantry
  { id: '6', name: 'All-Purpose Flour', category: 'pantry', quantity: 1, unit: 'bags', expirationDate: new Date(new Date().setDate(new Date().getDate() + 365)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/40x40.png' },
  { id: '7', name: 'Olive Oil', category: 'pantry', quantity: 1, unit: 'liters', expirationDate: new Date(new Date().setDate(new Date().getDate() + 730)), isExpiring: false, isExpired: false, imageUrl: 'https://placehold.co/40x40.png' },
];

const categoryConfig = {
  produce: { name: "Produce", icon: "🍎" },
  dairy: { name: "Dairy & Eggs", icon: "🥚" },
  pantry: { name: "Pantry", icon: "🥫" },
  meat: { name: "Meat & Poultry", icon: "🍗" },
  frozen: { name: "Frozen", icon: "❄️" },
};


export function PantryView() {
  const groupedItems = mockPantryItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof mockPantryItems>);

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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <CategorySection 
            key={category} 
            // @ts-ignore
            title={categoryConfig[category]?.name || 'Other'}
            // @ts-ignore
            icon={categoryConfig[category]?.icon || '📦'}
            items={items}
          />
        ))}
      </div>

    </div>
  );
}
