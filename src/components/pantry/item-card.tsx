
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";

export interface PantryItem {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'beverages' | 'spices';
  quantity: number;
  unit: string;
  expirationDate: Date;
  imageUrl?: string;
  isExpiring: boolean;
  isExpired: boolean;
}

interface ItemCardProps {
  item: PantryItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const getStatusClass = () => {
    if (item.isExpired) return "border-l-4 border-red-500";
    if (item.isExpiring) return "border-l-4 border-yellow-500";
    return "border-l-4 border-green-500";
  };

  const getExpiryText = () => {
    if (item.isExpired) {
        return `Expired ${formatDistanceToNow(item.expirationDate)} ago`;
    }
    return `Expires in ${formatDistanceToNow(item.expirationDate)}`;
  }

  return (
    <Card className={cn("flex flex-col hover:shadow-md transition-shadow", getStatusClass())}>
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
                <CardDescription className={cn(
                    "text-xs",
                    item.isExpired && "text-red-600",
                    item.isExpiring && "text-yellow-600"
                )}>
                    {getExpiryText()}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="font-bold text-lg">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground -mt-1">{item.unit}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
             <div className="relative w-24 h-24">
                <Image 
                    src={item.imageUrl || "https://placehold.co/100x100.png"}
                    alt={item.name}
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="food item"
                />
             </div>
        </CardContent>
         <CardFooter className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full justify-center text-xs text-muted-foreground">
                <MoreVertical className="h-3.5 w-3.5 mr-1" />
                Details
            </Button>
        </CardFooter>
    </Card>
  );
}
