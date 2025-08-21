
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemCard, PantryItem } from "./item-card";

interface CategorySectionProps {
  title: string;
  icon: string;
  items: PantryItem[];
}

export function CategorySection({ title, icon, items }: CategorySectionProps) {
  return (
    <section>
      <h2 className="text-xl font-headline font-semibold flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
