
"use client";

import { useState } from "react";
import { CreateFamilyForm } from "@/components/family/create-family-form";
import { FamilyView } from "@/components/family/family-view";
import { useToast } from "@/hooks/use-toast";
import { createFamilyAction, joinFamilyAction } from "@/lib/family-actions";

// Mock data, in a real app this would come from your backend/context
const mockFamily = null; 
// const mockFamily = {
//   id: 'family123',
//   name: 'The Smiths',
//   inviteCode: 'SMT3H',
//   members: [
//     { uid: 'user1', displayName: 'John Smith', role: 'owner', photoURL: 'https://placehold.co/40x40.png' },
//     { uid: 'user2', displayName: 'Jane Smith', role: 'admin', photoURL: 'https://placehold.co/40x40.png' },
//     { uid: 'user3', displayName: 'Junior Smith', role: 'member', photoURL: 'https://placehold.co/40x40.png' },
//   ]
// };


export default function FamilyPage() {
  const [family, setFamily] = useState(mockFamily);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async (name: string) => {
    setIsLoading(true);
    const result = await createFamilyAction(name);
    setIsLoading(false);

    if (result.success && result.data) {
        setFamily(result.data);
        toast({
            title: "Family Created!",
            description: `Your family "${name}" has been created.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Error Creating Family",
            description: result.error || "An unknown error occurred.",
        });
    }
  };
  
  const handleJoinFamily = async (inviteCode: string) => {
    setIsLoading(true);
    const result = await joinFamilyAction(inviteCode);
    setIsLoading(false);
    
    if (result.success && result.data) {
        setFamily(result.data);
        toast({
            title: "Successfully Joined Family!",
            description: `You are now a member of "${result.data.name}".`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Error Joining Family",
            description: result.error || "Could not join the family. Please check the code and try again.",
        });
    }
  };

  if (family) {
    return <FamilyView family={family} />;
  }

  return <CreateFamilyForm onCreate={handleCreateFamily} onJoin={handleJoinFamily} isLoading={isLoading} />;
}
