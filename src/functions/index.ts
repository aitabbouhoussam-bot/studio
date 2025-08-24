
"use server";

import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

// Step 2: Initialize Firebase Admin SDK safely
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// Step 1: Validate Environment for Gemini API Key
if (!process.env.GEMINI_KEY) {
    logger.error("FATAL ERROR: GEMINI_KEY environment variable is not set.");
    throw new Error("FATAL ERROR: GEMINI_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

export const generateRecipeWithAI = onCall({ cors: true }, async (req) => {
    logger.info("--- generateRecipeWithAI function triggered ---");

    // Step 4: Authentication Check
    const uid = req.auth?.uid;
    if (!uid) {
        logger.error("Authentication failed: No UID provided in request.", { request: req });
        // Step 5: Return Structured Error
        return { success: false, error: "User not authenticated. Please log in and try again." };
    }
    logger.info(`Request received from authenticated user: ${uid}`);

    // Prompt Construction
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
        }
    });

    const prompt = {
        ...req.data,
        system: "Follow schema strictly. Return only JSON."
    };
    logger.info("Constructed prompt for Gemini:", { prompt });

    let data;
    try {
        // Call Gemini API
        const result = await model.generateContent(JSON.stringify(prompt, null, 2));
        const text = result.response.text().trim();
        logger.info("Received raw response from Gemini.", { gptResponse: text });

        // Step 3: Wrap Gemini Response Handling
        const clean = text.replace(/```json|```/g, "").trim();
        try {
            data = JSON.parse(clean);
            logger.info("Successfully parsed JSON response from Gemini.");
        } catch (e) {
            logger.error("Failed to parse JSON response from Gemini.", { rawResponse: clean, error: e });
            return { success: false, error: "The AI returned an invalid response. Please try again." };
        }
    } catch (apiError) {
        logger.error("Error calling the Gemini API.", { error: apiError });
        return { success: false, error: "There was an issue contacting the AI service." };
    }
    
    // Step 4: Firestore Writes
    try {
        logger.info("Starting Firestore operations...");
        const batch = db.batch();

        // Save recipe to subcollection
        if (data.recipe && data.recipe.id) {
            const recipeRef = db.collection("users").doc(uid).collection("recipes").doc(data.recipe.id);
            batch.set(recipeRef, data.recipe);
            logger.info(`Batch: Set recipe at ${recipeRef.path}`);
        }

        // Update shopping list on main user doc
        if (data.shoppingList?.length > 0) {
            const userRef = db.collection("users").doc(uid);
            batch.set(userRef, { shoppingList: data.shoppingList }, { merge: true });
            logger.info(`Batch: Merged shopping list for user ${uid}`);
        }

        // If weekly plan, store it in its own subcollection
        if (data.weeklyPlan?.length > 0) {
            const planRef = db.collection("users").doc(uid).collection("mealPlans").doc(); // Auto-generate ID
            batch.set(planRef, {
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                plan: data.weeklyPlan
            });
            logger.info(`Batch: Set new weekly plan at ${planRef.path}`);
        }

        await batch.commit();
        logger.info("Firestore batch commit successful.");

    } catch (dbError: any) {
        logger.error("Error during Firestore operations:", { error: dbError, dataForDb: data });
        // Step 5: Return Structured Error
        return { success: false, error: "Failed to save the generated recipe to your account." };
    }

    logger.info("--- Function execution completed successfully ---");
    return { success: true, data: data };
});
