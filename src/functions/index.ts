
"use server";

import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";

admin.initializeApp();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
const db = admin.firestore();

export const generateRecipeWithAI = onCall({ cors: true }, async (req) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    }
  });

  // Build structured prompt
  const prompt = {
    ...req.data,
    system: "Follow schema strictly. Return only JSON."
  };

  const result = await model.generateContent(JSON.stringify(prompt, null, 2));
  const text = result.response.text().trim();

  // Clean possible code fences
  const clean = text.replace(/```json|```/g, "").trim();

  let data;
  try {
    data = JSON.parse(clean);
  } catch (e) {
    throw new Error("Gemini returned invalid JSON: " + clean);
  }

  const uid = req.auth?.uid;
  if (!uid) throw new Error("Not authenticated");

  // Save recipe
  await db.collection("users").doc(uid).collection("recipes").doc(data.recipe.id).set(data.recipe);

  // Update shopping list
  if (data.shoppingList?.length > 0) {
    await db.collection("users").doc(uid).update({ shoppingList: data.shoppingList });
  }

  // If weekly plan, store it separately
  if (data.weeklyPlan?.length > 0) {
    await db.collection("users").doc(uid).collection("mealPlans").add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      plan: data.weeklyPlan
    });
  }

  return data;
});

