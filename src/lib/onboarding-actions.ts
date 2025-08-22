
'use server';

import { z } from "zod";
import { auth, db } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const onboardingSchema = z.object({
  dietaryPreferences: z.array(z.string()).min(1, "Please select at least one dietary preference."),
  familySize: z.object({
    adults: z.coerce.number().min(1, "There must be at least one adult.").default(1),
    kids: z.coerce.number().min(0).default(0),
  }),
  allergies: z.array(z.string()).default([]),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export async function saveOnboardingDataAction(data: OnboardingData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("You must be logged in to save preferences.");
        }

        const validatedData = onboardingSchema.parse(data);

        const userDocRef = doc(db, "users", user.uid);
        
        await updateDoc(userDocRef, {
            preferences: {
                dietaryRestrictions: validatedData.dietaryPreferences,
                allergies: validatedData.allergies,
            },
            family: {
                adults: validatedData.familySize.adults,
                kids: validatedData.familySize.kids,
            },
            onboardingCompleted: true,
        });

        return { success: true };

    } catch (error) {
        console.error("[Action Error: saveOnboardingDataAction]", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid data provided. Please check the form." };
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: `Failed to save preferences: ${errorMessage}` };
    }
}
