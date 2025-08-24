
import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

// Initialize Firebase Admin SDK safely
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// Validate Environment for Gemini API Key
if (!process.env.GEMINI_KEY) {
    logger.error("❌ FATAL ERROR: GEMINI_KEY environment variable is not set.");
    throw new Error("FATAL ERROR: GEMINI_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

export const generateRecipeWithAI = onCall({ cors: true }, async (request) => {
    logger.info("🚀 --- generateRecipeWithAI function triggered ---");

    // ✅ Step 1: Authentication Check
    const uid = request.auth?.uid;
    if (!uid) {
        logger.error("❌ Authentication failed: No UID provided in request.", { request });
        return { success: false, error: "User not authenticated. Please log in and try again." };
    }
    logger.info(`✅ Authentication successful for user: ${uid}`);

    // ✅ Step 2: Input Validation
    const { goal, promptText, prefs } = request.data;
    logger.info("📋 Received data from client:", { data: request.data });
    if (!goal || !promptText || !prefs) {
        logger.error("❌ Invalid request data: Missing required fields.", { data: request.data });
        return { success: false, error: "Invalid request: Missing required parameters." };
    }
    logger.info("✅ Input validation successful.");


    // ✅ Step 3: Prompt Construction
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
        }
    });

    const prompt = {
        ...request.data,
        system: "You are MealGenius-AI, a precision recipe engine. Follow schema strictly. Return only valid JSON (no markdown fences)."
    };
    logger.info("🤖 Constructed prompt for Gemini:", { prompt: JSON.stringify(prompt).substring(0, 500) + '...' });

    let data;
    try {
        // ✅ Step 4: Call Gemini API
        logger.info("🤖 Calling Gemini API...");
        const result = await model.generateContent(JSON.stringify(prompt, null, 2));
        const text = result.response.text().trim();
        logger.info("🤖 Gemini raw response received.", { gptResponse: text });

        const clean = text.replace(/```json|```/g, "").trim();
        logger.info("🤖 Cleaned Gemini response.", { cleanedResponse: clean });

        // ✅ Step 5: Parse JSON response
        try {
            data = JSON.parse(clean);
            logger.info("✅ Successfully parsed JSON response from Gemini.");
        } catch (e: any) {
            logger.error("❌ Failed to parse JSON response from Gemini.", { rawResponse: clean, error: e.message });
            return { success: false, error: "The AI returned an invalid response. Please try again." };
        }
    } catch (apiError: any) {
        logger.error("❌ Error calling the Gemini API.", { error: apiError.message, details: apiError.details });
        return { success: false, error: "There was an issue contacting the AI service." };
    }
    
    // ✅ Step 6: Firestore Writes
    try {
        logger.info("💾 Starting Firestore operations...");
        const batch = db.batch();

        // Validate data structure before accessing
        if (data && data.recipe && data.recipe.id) {
            const recipeRef = db.collection("users").doc(uid).collection("recipes").doc(data.recipe.id);
            batch.set(recipeRef, data.recipe);
            logger.info(`💾 Batch: Set recipe at ${recipeRef.path}`);
        } else {
             logger.warn("🤔 No recipe data found in AI response to save.");
        }

        if (data && data.shoppingList && Array.isArray(data.shoppingList) && data.shoppingList.length > 0) {
            const userRef = db.collection("users").doc(uid);
            batch.set(userRef, { shoppingList: data.shoppingList }, { merge: true });
            logger.info(`💾 Batch: Merged shopping list for user ${uid}`);
        } else {
            logger.info("🤔 No shopping list data in AI response to save.");
        }


        if (data && data.weeklyPlan && Array.isArray(data.weeklyPlan) && data.weeklyPlan.length > 0) {
            const planRef = db.collection("users").doc(uid).collection("mealPlans").doc(); // Auto-generate ID
            batch.set(planRef, {
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                plan: data.weeklyPlan
            });
            logger.info(`💾 Batch: Set new weekly plan at ${planRef.path}`);
        } else {
            logger.info("🤔 No weekly plan data in AI response to save.");
        }

        await batch.commit();
        logger.info("✅ Firestore batch commit successful.");

    } catch (dbError: any) {
        logger.error("❌ Error during Firestore operations:", { error: dbError.message, dataForDb: data });
        return { success: false, error: "Failed to save the generated recipe to your account." };
    }

    logger.info("🎉 --- Function execution completed successfully ---");
    return { success: true, data: data };
});

