
"use server";

import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Check for Gemini API key on initialization
if (!process.env.GEMINI_KEY) {
    throw new Error("FATAL ERROR: GEMINI_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

export const generateRecipeWithAI = onCall({ cors: true }, async (req) => {
    logger.info("generateRecipeWithAI function triggered.");

    // 1. Authentication Check
    logger.info("Auth object:", { auth: req.auth });
    const uid = req.auth?.uid;
    if (!uid) {
        logger.error("Authentication failed: No UID provided in request.", { request: req });
        throw new Error("User not authenticated. Please log in and try again.");
    }
    logger.info(`Request received from authenticated user: ${uid}`);

    // 2. Prompt Construction
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

    // 3. Call Gemini API
    const result = await model.generateContent(JSON.stringify(prompt, null, 2));
    const text = result.response.text().trim();
    logger.info("Received raw response from Gemini.");

    // 4. JSON Parsing and Validation
    const clean = text.replace(/```json|```/g, "").trim();
    let data;
    try {
        data = JSON.parse(clean);
        logger.info("Successfully parsed JSON response from Gemini.");
    } catch (e) {
        logger.error("Failed to parse JSON response from Gemini.", { rawResponse: clean, error: e });
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    
    // 5. Firestore Database Operations
    try {
        logger.info("Starting Firestore operations...");
        const batch = db.batch();

        // Save recipe to subcollection
        const recipeRef = db.collection("users").doc(uid).collection("recipes").doc(data.recipe.id);
        batch.set(recipeRef, data.recipe);
        logger.info(`Batch: Set recipe at ${recipeRef.path}`);

        // Update shopping list on main user doc
        if (data.shoppingList?.length > 0) {
            const userRef = db.collection("users").doc(uid);
            batch.update(userRef, { shoppingList: data.shoppingList });
            logger.info(`Batch: Updated shopping list for user ${uid}`);
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

    } catch (dbError) {
        logger.error("Error during Firestore operations:", { error: dbError, data });
        throw new Error("Failed to save the generated recipe to your account.");
    }

    return data;
});
