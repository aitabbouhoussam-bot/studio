
import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI, GoogleGenerativeAIError } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

// Initialize Firebase Admin SDK safely
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const generateRecipeWithAI = onCall({ cors: true }, async (request) => {
  logger.info("🚀 --- generateRecipeWithAI function triggered ---");

  // 🔥 Top-level try/catch: CATCH ALL
  try {
    // ✅ Step 0: Environment Variable Check inside the handler
    if (!process.env.GEMINI_KEY) {
        logger.error("❌ Function called but GEMINI_KEY is not set.");
        return { success: false, error: "AI service is temporarily unavailable due to a configuration error." };
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    // ✅ Step 1: Authentication Check
    const uid = request.auth?.uid;
    if (!uid) {
      logger.error("❌ Authentication failed: No UID provided in request.", { request });
      return { success: false, error: "User not authenticated. Please log in and try again." };
    }
    logger.info(`✅ Authentication successful for user: ${uid}`);
    
    // ✅ Step 1.5: Rate Limiting
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const lastCall = userData?.lastRecipeRequest;

    if (lastCall && Date.now() - lastCall.toDate().getTime() < 10000) {
        logger.warn(`User ${uid} rate limited.`);
        return { success: false, error: "Please wait a moment before requesting another recipe." };
    }


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
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are MealGenius-AI, a precision recipe engine.

Input you receive
------------------
${JSON.stringify(request.data, null, 2)}

Rules
-----
1. Return only **valid JSON** (no markdown fences).
2. Must exclude all allergens.
3. Calories/macros within ±5% of target.
4. Cost ≤ budgetLevel.
5. Use pantry items first; missing → shopping list.
6. Steps ≤ 6 sentences; all ingredients include grams.

Output JSON schema
------------------
{
  "recipe": {
    "id": "spinach-feta-quinoa-bowl",
    "name": "Spinach & Feta Quinoa Bowl",
    "servings": 2,
    "caloriesPerServing": 495,
    "macros": { "protein": 18, "carbs": 52, "fat": 22 },
    "ingredients": [
      { "name": "quinoa", "grams": 150 },
      { "name": "spinach", "grams": 100 },
      { "name": "feta", "grams": 50 },
      { "name": "olive oil", "grams": 10 }
    ],
    "steps": [
      "Rinse quinoa and cook in 300 ml water for 15 min.",
      "Sauté spinach with olive oil until wilted.",
      "Mix quinoa, spinach, and crumbled feta.",
      "Season with salt & pepper and serve."
    ],
    "costUSD": 2.85,
    "timeMinutes": 20
  },
  "shoppingList": [
    { "name": "olive oil", "grams": 10, "aisle": "Pantry" }
  ],
  "weeklyPlan": []
}`;

    logger.info("🤖 Constructed prompt for Gemini:", { prompt: prompt.substring(0, 500) + "..." });

    // ✅ Step 4: Call Gemini API and Parse Response
    logger.info("🤖 Calling Gemini API...");
    const result = await model.generateContent(prompt);
    
    // Check for safety blocks BEFORE trying to access the text
    logger.info("🛡️ Gemini safety ratings", {
        safety: result.response.candidates?.[0]?.safetyRatings,
    });
    if (result.response.usageMetadata) {
        logger.info("📊 Token usage", { usage: result.response.usageMetadata });
    }
    if (!result.response.candidates?.length) {
        logger.error("❌ No candidates returned from Gemini. Likely blocked content.", { response: result.response });
        return { success: false, error: "No response generated. The request may have been blocked for safety reasons. Try rephrasing your request." };
    }

    let text: string;
    try {
        text = result.response.text().trim();
        logger.info("🤖 Gemini raw response received.", { gptResponse: text });
    } catch (textError: any) {
        logger.error("❌ Failed to extract text from Gemini response. This usually happens if the response was empty or blocked.", { 
            errorMessage: textError.message,
            response: result.response 
        });
        return { success: false, error: "AI response was empty or blocked. Please adjust your input and try again." };
    }

    const clean = text.replace(/```json|```/g, "").trim();
    logger.info("🤖 Cleaned Gemini response.", { cleanedResponse: clean });

    let data;
    try {
      data = JSON.parse(clean);
      logger.info("✅ Successfully parsed JSON response from Gemini.");
    } catch (parseError: any) {
      logger.error("❌ Failed to parse JSON response from Gemini.", {
        rawResponse: clean,
        error: parseError.message,
      });
      return {
        success: false,
        error: "The AI returned an invalid response. Please try again.",
      };
    }

    // ✅ Step 5: Firestore Writes
    logger.info("💾 Starting Firestore operations...");
    const batch = db.batch();

    // Update the rate limit timestamp
    batch.update(userDocRef, { lastRecipeRequest: admin.firestore.FieldValue.serverTimestamp() });
    logger.info(`💾 Batch: Updated rate limit timestamp for user ${uid}`);


    if (data && data.recipe && data.recipe.id) {
      const recipeRef = db.collection("users").doc(uid).collection("recipes").doc(data.recipe.id);
      batch.set(recipeRef, data.recipe);
      logger.info(`💾 Batch: Set recipe at ${recipeRef.path}`);
    } else {
      logger.warn("🤔 No recipe data found in AI response to save.");
    }

    if (data && data.shoppingList && Array.isArray(data.shoppingList) && data.shoppingList.length > 0) {
      batch.set(userDocRef, { shoppingList: data.shoppingList }, { merge: true });
      logger.info(`💾 Batch: Merged shopping list for user ${uid}`);
    } else {
      logger.info("🤔 No shopping list data in AI response to save.");
    }

    if (data && data.weeklyPlan && Array.isArray(data.weeklyPlan) && data.weeklyPlan.length > 0) {
      const planRef = db.collection("users").doc(uid).collection("mealPlans").doc();
      batch.set(planRef, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        plan: data.weeklyPlan,
      });
      logger.info(`💾 Batch: Set new weekly plan at ${planRef.path}`);
    } else {
      logger.info("🤔 No weekly plan data in AI response to save.");
    }

    await batch.commit();
    logger.info("✅ Firestore batch commit successful.");

    logger.info("🎉 --- Function execution completed successfully ---");
    return { success: true, data: data };
  } catch (error: any) {
    // 🔥 This is the global catch block — must never throw
    logger.error("❌ Unhandled error in generateRecipeWithAI", {
      errorMessage: error.message,
      errorStack: error.stack,
      requestData: request.data,
      uid: request.auth?.uid,
    });

    return {
      success: false,
      error: "An unexpected server error occurred. Please try again later.",
    };
  }
});
