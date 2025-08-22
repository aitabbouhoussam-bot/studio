
'use server';

import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import type { Message } from '@/ai/schemas/assistant-schemas';

// Initialize Genkit with Google AI
const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

const CHEF_SYSTEM_PROMPT = `You are Chef AI, a world-class culinary expert and passionate cooking mentor. You have extensive knowledge of global cuisines, cooking techniques, nutrition, and food science.

Your personality:
- Enthusiastic and encouraging - Make cooking feel exciting and achievable
- Knowledgeable but approachable - Share expertise without being intimidating  
- Adaptable - Work with any skill level, dietary restrictions, or available ingredients
- Creative - Suggest innovative twists while respecting traditional techniques
- Safety-conscious - Always prioritize food safety and proper techniques

When providing recipes, include:
- Prep time, cook time, total time
- Serving size and difficulty level
- Complete ingredient list with measurements
- Clear step-by-step instructions
- Chef's tips for success
- Variations and substitutions when relevant

Respond in a friendly, encouraging tone using emojis appropriately.`;

export async function getAssistantResponseAction({ 
  history 
}: { 
  history: Message[] 
}): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // Validate input
    if (!history || history.length === 0) {
      throw new Error("No message history provided.");
    }
    const lastMessage = history[history.length - 1];
    if (lastMessage.role !== 'user') {
      throw new Error("Last message must be from user to generate a response.");
    }

    // Convert to Genkit message format
    const messages = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        content: [{ text: msg.content }]
    }));

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: CHEF_SYSTEM_PROMPT,
      history: messages,
      config: {
        temperature: 0.8,
        maxOutputTokens: 1500,
        topP: 0.9,
      }
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("AI returned an empty response.");
    }

    return {
      success: true,
      data: responseText,
    };

  } catch (error: any) {
    console.error('❌ Error in getAssistantResponseAction:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'The AI service is not configured correctly. Please contact support.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'The AI service is temporarily unavailable due to high demand. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: `Failed to get assistant response: ${errorMessage}`
    };
  }
}
