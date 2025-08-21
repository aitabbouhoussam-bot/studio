
'use server';
/**
 * @fileOverview Server actions for family management.
 */

import { z } from 'zod';

const createFamilySchema = z.string().min(2, "Family name must be at least 2 characters.");
const joinFamilySchema = z.string().min(5, "Invite code must be at least 5 characters.");

// Mock "database" for demonstration
const MOCK_FAMILIES_DB = {
    'ABCDE': {
        id: 'fam_existing',
        name: 'The Sampletons',
        inviteCode: 'ABCDE',
        members: [
             { uid: 'user_owner', displayName: 'Owner User', role: 'owner', photoURL: 'https://placehold.co/40x40.png' },
        ]
    }
};


export async function createFamilyAction(name: string) {
  try {
    const validatedName = createFamilySchema.parse(name);
    // In a real app, you would get the authenticated user's ID
    const userId = 'user123'; // Mock user ID

    console.log(`[FamilyAction] Creating family "${validatedName}" for user ${userId}`);

    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newFamily = {
      id: `fam_${Math.random().toString(36).substring(2, 9)}`,
      name: validatedName,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      members: [
        { uid: userId, displayName: 'You', role: 'owner' as const, photoURL: 'https://placehold.co/40x40.png' },
      ],
    };

    // Save to our mock DB
    // @ts-ignore
    MOCK_FAMILIES_DB[newFamily.inviteCode] = newFamily;

    return { success: true, data: newFamily };
  } catch (error) {
    console.error('[FamilyAction Error - Create]', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to create family: ${errorMessage}` };
  }
}


export async function joinFamilyAction(inviteCode: string) {
    try {
        const validatedCode = joinFamilySchema.parse(inviteCode);
        const userId = 'user_joiner_456'; // Mock user ID for the joiner

        console.log(`[FamilyAction] User ${userId} attempting to join family with code "${validatedCode}"`);

        // Simulate database operation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // @ts-ignore
        const familyToJoin = MOCK_FAMILIES_DB[validatedCode.toUpperCase()];

        if (!familyToJoin) {
            return { success: false, error: "Invalid invite code." };
        }

        // Add new member
        familyToJoin.members.push({
            uid: userId,
            displayName: 'You',
            role: 'member' as const,
            photoURL: 'https://placehold.co/40x40.png'
        });

        return { success: true, data: familyToJoin };

    } catch (error) {
        console.error('[FamilyAction Error - Join]', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to join family: ${errorMessage}` };
    }
}
