
"use client";

import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-lora">Welcome back, {userProfile?.displayName || 'User'}!</h1>
            <p className="text-muted-foreground">Ready to start planning your week?</p>
        </div>

        {/* Placeholder for the new 7-day horizontal meal planner */}
        <div className="w-full h-96 bg-card rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">New Meal Planner Experience Coming Soon</p>
        </div>

        {/* Placeholder for recipe suggestions */}
        <div className="space-y-4">
             <h2 className="text-2xl font-bold font-lora">Smart Suggestions</h2>
              <div className="w-full h-48 bg-card rounded-lg border flex items-center justify-center">
                <p className="text-muted-foreground">Recipe suggestions based on your pantry will appear here.</p>
            </div>
        </div>
    </div>
  );
}
