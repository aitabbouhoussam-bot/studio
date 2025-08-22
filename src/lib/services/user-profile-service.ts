
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
      tier: 'free', // Let's make the mock user a free user to test the quota
    },
    aiUsage: {
      // Use a dynamic key for the current month, e.g., '202407'
      [new Date().toISOString().slice(0, 7).replace('-', '')]: { mealGenerations: 0 },
    },
  },
   'pro_user_456': {
    preferences: {
      dietaryRestrictions: [],
      allergies: [],
      dailyCalorieGoal: 2000,
    },
    subscription: {
      tier: 'premium',
    },
    aiUsage: {
      [new Date().toISOString().slice(0, 7).replace('-', '')]: { mealGenerations: 50 }, // well over the free limit
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
  return MOCK_USER_DATA[uid as keyof typeof MOCK_USER_DATA] || null;
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

  // Pro users have unlimited generations
  if (user.subscription?.tier === 'premium') {
    console.log(`[UserProfileService] User ${uid} is Premium. Skipping quota check.`);
    return;
  }

  // Free users are limited to 5 generations per month
  const quota = 5; 

  const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');
  const currentUsage = user.aiUsage?.[currentMonthKey]?.mealGenerations || 0;

  console.log(`[UserProfileService] User: ${uid}, Plan: Free, Usage: ${currentUsage}/${quota}`);

  if (currentUsage >= quota) {
    throw new Error('Your monthly generation quota has been reached. Please upgrade to Pro for unlimited generations.');
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
  
  // This mock implementation is not persistent but demonstrates the logic.
  const user = MOCK_USER_DATA[uid as keyof typeof MOCK_USER_DATA];
  if (user) {
      const currentMonthKey = new Date().toISOString().slice(0, 7).replace('-', '');
      if (!user.aiUsage) user.aiUsage = {};
      if (!user.aiUsage[currentMonthKey]) user.aiUsage[currentMonthKey] = { mealGenerations: 0 };
      user.aiUsage[currentMonthKey].mealGenerations += 1;
      console.log(`[UserProfileService] Usage incremented (mock). New count: ${user.aiUsage[currentMonthKey].mealGenerations}`);
  }
}
