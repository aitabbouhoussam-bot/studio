
"use client";

import { useEffect, useState } from "react";
import { CreateFamilyForm } from "@/components/family/create-family-form";
import { FamilyView } from "@/components/family/family-view";
import { useToast } from "@/hooks/use-toast";
import { createFamilyAction, joinFamilyAction } from "@/lib/family-actions";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";


export default function FamilyPage() {
  const { user, userProfile } = useAuth();
  const [family, setFamily] = useState<any | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userProfile) return;

    // If user profile has a familyId, fetch the family data
    if (userProfile.familyId) {
      const familyDocRef = doc(db, 'families', userProfile.familyId);
      const unsubscribe = onSnapshot(familyDocRef, async (doc) => {
        if (doc.exists()) {
          const familyData = doc.data();
          
          // Fetch member profiles
          const memberPromises = familyData.members.map(async (member: any) => {
            const userDoc = await getDoc(doc(db, 'users', member.uid));
            return userDoc.exists() ? { ...userDoc.data(), ...member } : member;
          });
          const membersWithProfiles = await Promise.all(memberPromises);
          
          setFamily({ ...familyData, id: doc.id, members: membersWithProfiles });
        } else {
          // This might happen if a family is deleted but user profile isn't updated
          setFamily(null);
        }
        setPageLoading(false);
      });
      return () => unsubscribe();
    } else {
      // User is not in a family
      setFamily(null);
      setPageLoading(false);
    }
  }, [userProfile]);

  const handleCreateFamily = async (name: string) => {
    setFormIsLoading(true);
    const result = await createFamilyAction(name);
    setFormIsLoading(false);

    if (result.success && result.data) {
        // The onSnapshot listener should pick up the change
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
    setFormIsLoading(true);
    const result = await joinFamilyAction(inviteCode);
    setFormIsLoading(false);
    
    if (result.success && result.data) {
       // The onSnapshot listener should pick up the change
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
  
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  if (family) {
    return <FamilyView family={family} />;
  }

  return <CreateFamilyForm onCreate={handleCreateFamily} onJoin={handleJoinFamily} isLoading={formIsLoading} />;
}
