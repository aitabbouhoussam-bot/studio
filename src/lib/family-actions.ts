
'use server';
/**
 * @fileOverview Server actions for family management.
 */

import { z } from 'zod';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, writeBatch, arrayUnion, serverTimestamp } from 'firebase/firestore';

const createFamilySchema = z.string().min(2, "Family name must be at least 2 characters long.");
const joinFamilySchema = z.string().min(5, "Invite code must be at least 5 characters long.").max(10, "Invalid invite code.");

const generateInviteCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export async function createFamilyAction(name: string) {
  try {
    const validatedName = createFamilySchema.parse(name);
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in to create a family.");
    }
    
    // Check if user is already in a family
    const userDocSnap = await getDocs(doc(db, "users", user.uid));
    if (userDocSnap.data()?.familyId) {
      throw new Error("You are already in a family.");
    }

    const batch = writeBatch(db);

    const familyDocRef = doc(collection(db, "families"));
    const inviteCode = generateInviteCode();

    const newFamily = {
      name: validatedName,
      ownerId: user.uid,
      inviteCode: inviteCode,
      createdAt: serverTimestamp(),
      members: [{ uid: user.uid, role: 'owner' }]
    };
    batch.set(familyDocRef, newFamily);

    const userDocRef = doc(db, "users", user.uid);
    batch.update(userDocRef, { familyId: familyDocRef.id });

    await batch.commit();

    return { success: true, data: { ...newFamily, id: familyDocRef.id } };

  } catch (error) {
    console.error('[Action Error - Create Family]', error);
    if (error instanceof z.ZodError) {
        return { success: false, error: "Invalid family name provided." };
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to create family: ${errorMessage}` };
  }
}


export async function joinFamilyAction(inviteCode: string) {
    try {
        const validatedCode = joinFamilySchema.parse(inviteCode);
        const user = auth.currentUser;

        if (!user) {
            throw new Error("You must be logged in to join a family.");
        }
        
        // Check if user is already in a family
        const userDocSnap = await getDocs(doc(db, "users", user.uid));
        if (userDocSnap.data()?.familyId) {
            throw new Error("You are already in a family.");
        }
        
        const familiesRef = collection(db, "families");
        const q = query(familiesRef, where("inviteCode", "==", validatedCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: "Invalid or expired invite code." };
        }

        const familyDoc = querySnapshot.docs[0];
        const familyData = familyDoc.data();
        
        const batch = writeBatch(db);
        
        // Add user to the family's members array
        batch.update(familyDoc.ref, {
            members: arrayUnion({ uid: user.uid, role: 'member' })
        });
        
        // Update the user's profile with the familyId
        const userDocRef = doc(db, "users", user.uid);
        batch.update(userDocRef, { familyId: familyDoc.id });

        await batch.commit();
        
        const updatedMembers = [...familyData.members, { uid: user.uid, role: 'member' }];

        return { success: true, data: { ...familyData, id: familyDoc.id, members: updatedMembers } };

    } catch (error) {
        console.error('[Action Error - Join Family]', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Invalid invite code format." };
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to join family: ${errorMessage}` };
    }
}
