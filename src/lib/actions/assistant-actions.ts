'use server';

import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import type { Message } from '@/ai/schemas/assistant-schemas';

// Initialize Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()],
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
    console.log('🔍 Starting assistant action...');
    console.log('📝 Message history length:', history.length);
    
    // Validate input
    if (!history || history.length === 0) {
      return {
        success: false,
        error: 'No message history provided'
      };
    }

    // Get the latest user message
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return {
        success: false,
        error: 'Last message must be from user'
      };
    }

    console.log('📤 User message:', lastMessage.content);

    // Convert to Genkit message format
    const messages = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: [{ text: msg.content }]
    }));


    console.log('🤖 Calling Genkit AI...');

    // Call Genkit with proper error handling
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

    console.log('📊 AI Response received');
    
    const responseText = response.text;

    // Validate response content
    if (!responseText || typeof responseText !== 'string' || responseText.trim() === '') {
      console.log('❌ Empty or invalid response text');
      return {
        success: false,
        error: 'AI returned empty response'
      };
    }

    console.log('✅ Success! Response length:', responseText.length);

    return {
      success: true,
      data: responseText.trim()
    };

  } catch (error: any) {
    console.error('❌ Error in getAssistantResponseAction:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API key configuration error';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network connection error';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}
