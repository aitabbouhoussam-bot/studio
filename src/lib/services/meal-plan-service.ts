
'use server';
/**
 * @fileOverview Meal Plan Service
 *
 * This service handles the business logic related to meal plans, such as
 * caching and saving them to the database. This is a placeholder
 * implementation and does not yet interact with a real database.
 */

import type { GenerateMealPlanOutput } from '@/ai/flows/generate-meal-plan';
import type { UserPreferences } from './user-profile-service';
import { createHash } from 'crypto';


// A simple in-memory cache for demonstration purposes.
const planCache = new Map<string, GenerateMealPlanOutput>();

/**
 * Generates a consistent hash key from user preferences to use for caching.
 * @param preferences The user's preferences object.
 * @param weekStart The starting date of the meal plan week.
 * @param servings The number of servings for the plan.
 * @returns A unique SHA-256 hash key.
 */
export async function generateCacheKey(
  preferences: UserPreferences,
  weekStart: string,
  servings: number
): Promise<string> {
  const prefString = JSON.stringify(preferences, Object.keys(preferences).sort());
  const hash = createHash('sha256');
  hash.update(prefString + weekStart + servings);
  return hash.digest('hex');
}

/**
 * Checks the cache for an existing meal plan.
 * @param key The cache key generated from user preferences.
 * @returns A promise that resolves to the cached plan or null if not found.
 */
export async function checkPlanCache(key: string): Promise<GenerateMealPlanOutput | null> {
  console.log(`[MealPlanService] Checking cache for key: ${key.substring(0, 10)}...`);
  const cachedPlan = planCache.get(key);
  if (cachedPlan) {
    console.log('[MealPlanService] Cache hit!');
    return cachedPlan;
  }
  console.log('[MealPlanService] Cache miss.');
  return null;
}

/**
 * Stores a new meal plan in the cache.
 * @param key The cache key.
 * @param plan The meal plan to cache.
 */
export async function cachePlan(key: string, plan: GenerateMealPlanOutput): Promise<void> {
  console.log(`[MealPlanService] Caching plan for key: ${key.substring(0, 10)}...`);
  planCache.set(key, plan);
}

/**
 * Saves a validated meal plan to the database.
 * This is a placeholder and does not persist data.
 *
 * @param plan The meal plan data.
 * @param metadata Additional metadata for the plan document.
 * @returns A promise that resolves to the new plan's ID.
 */
export async function saveMealPlanToFirestore(
  plan: GenerateMealPlanOutput,
  metadata: { ownerType: string; ownerId: string; generatedBy: string; servings: number, preferences: UserPreferences }
): Promise<string> {
  const planId = `plan_${Date.now()}`;
  console.log(`[MealPlanService] Saving plan ${planId} to Firestore (mock).`);
  console.log('[MealPlanService] Metadata:', metadata);
  // In a real implementation, you would write to Firestore here,
  // potentially in a transaction to create the main plan document
  // and all the recipe sub-collection documents.
  return planId;
}
