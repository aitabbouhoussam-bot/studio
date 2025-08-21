
"use server";

import { z } from "zod";
import chefAssistant from "@/ai/flows/chef-assistant-flow";
import {
  ChatInputSchema,
  type ChatOutput,
} from "@/ai/schemas/chef-assistant-schemas";
import type { Message } from "@/components/ai-chef-assistant";

export async function chatWithAssistant(
  messages: Message[]
): Promise<{ success: boolean; data?: ChatOutput; error?: string }> {
  "use server";
  try {
    // The role in our component is 'assistant', but the model expects 'model' or 'assistant'
    // The first message is the intro prompt which we don't want to include in history.
    const conversationHistory = messages.slice(1).map(m => ({
        ...m,
        role: m.role === 'assistant' ? 'assistant' : 'user'
    }));

    const validatedInput = ChatInputSchema.parse({ messages: conversationHistory });
    
    const result = await chefAssistant(validatedInput);

    return { success: true, data: result };
  } catch (error) {
    console.error("[Assistant Action Error]", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid chat history format." };
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to get response from assistant: ${errorMessage}` };
  }
}
