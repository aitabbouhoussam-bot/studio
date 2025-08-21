
"use client";

import { useState } from "react";
import { CreateFamilyForm } from "@/components/family/create-family-form";
import { FamilyView } from "@/components/family/family-view";
import { useToast } from "@/hooks/use-toast";

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
    // In a real app, you would call a server action here to create the family
    console.log("Creating family:", name);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newFamily = {
        id: `fam_${Math.random().toString(36).substring(2, 9)}`,
        name: name,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [
            { uid: 'user1', displayName: 'You', role: 'owner', photoURL: 'https://placehold.co/40x40.png' },
        ]
    };

    setFamily(newFamily);
    toast({
      title: "Family Created!",
      description: `Your family "${name}" has been created.`,
    });
    setIsLoading(false);
  };
  
    const handleJoinFamily = async (inviteCode: string) => {
    setIsLoading(true);
    // In a real app, you would call a server action here to join a family
    console.log("Joining family with code:", inviteCode);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For this mock, we'll just create a sample family.
    const joinedFamily = {
      id: `fam_${Math.random().toString(36).substring(2, 9)}`,
      name: "The Sampletons",
      inviteCode: inviteCode,
      members: [
        { uid: 'user_owner', displayName: 'Owner', role: 'owner', photoURL: 'https://placehold.co/40x40.png' },
        { uid: 'user_you', displayName: 'You', role: 'member', photoURL: 'https://placehold.co/40x40.png' }
      ]
    };

    setFamily(joinedFamily);
    toast({
      title: "Successfully Joined Family!",
      description: "You are now a member of The Sampletons.",
    });
    setIsLoading(false);
  };

  if (family) {
    return <FamilyView family={family} />;
  }

  return <CreateFamilyForm onCreate={handleCreateFamily} onJoin={handleJoinFamily} isLoading={isLoading} />;
}
