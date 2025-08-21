
'use server';
/**
 * @fileOverview User Profile Service
 *
 * This service is responsible for all interactions with the user's profile data
 * in Firestore. It provides functions for retrieving user preferences and
 * managing AI feature usage quotas. This is a placeholder implementation
 * and does not yet interact with a real database.
 */

// Placeholder for a more detailed UserPreferences type based on schema.
export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  dailyCalorieGoal: number;
  [key: string]: any;
}

// Mock user data for demonstration purposes.
const MOCK_USER_DATA = {
  'user123': {
    preferences: {
      dietaryRestrictions: ['vegetarian'],
      allergies: ['nuts'],
      dailyCalorieGoal: 2200,
    },
    subscription: {
      tier: 'premium',
    },
    aiUsage: {
      '202407': { mealGenerations: 2 },
    },
  },
};

/**
 * Retrieves the full profile for a given user.
 * In a real application, this would fetch data from Firestore.
 *
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the user's profile data.
 */
export async function getUserProfile(uid: string): Promise<any> {
  console.log(`[UserProfileService] Fetching profile for user: ${uid}`);
  // In a real implementation, you would fetch this from Firestore.
  // e.g., await db.collection('users').doc(uid).get();
  return MOCK_USER_DATA['user123'] || null;
}

/**
 * Retrieves the preferences for a given user.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the user's preferences.
 */
export async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
  console.log(`[UserProfileService] Fetching preferences for user: ${uid}`);
  const user = await getUserProfile(uid);
  return user?.preferences || null;
}

/**
 * Verifies if a user is within their allowed AI generation quota.
 * This is a placeholder and uses mock data.
 *
 * @param uid The user's unique ID.
 * @throws An error if the user's quota is exceeded.
 */
export async function verifyGenerationQuota(uid: string): Promise<void> {
  console.log(`[UserProfileService] Verifying quota for user: ${uid}`);
  const user = await getUserProfile(uid);

  if (!user) {
    throw new Error('User not found.');
  }

  const isPremium = user.subscription?.tier === 'premium';
  const quota = isPremium ? 999 : 5; // As per your spec

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');
  const currentUsage = user.aiUsage?.[currentMonthKey]?.mealGenerations || 0;

  console.log(`[UserProfileService] User: ${uid}, Usage: ${currentUsage}/${quota}`);

  if (currentUsage >= quota) {
    throw new Error('Monthly generation quota exceeded.');
  }
}

/**
 * Increments the user's AI usage count for the current month.
 * This is a placeholder and does not persist the data.
 *
 * @param uid The user's unique ID.
 */
export async function incrementUsageQuota(uid: string): Promise<void> {
  console.log(`[UserProfileService] Incrementing quota for user: ${uid}`);
  // In a real implementation, you would use Firestore FieldValue.increment(1)
  // to atomically update the count for the current month.
  // e.g., db.collection('users').doc(uid).update({ 'aiUsage.202407.mealGenerations': FieldValue.increment(1) });
  console.log('[UserProfileService] Usage incremented (mock).');
}
