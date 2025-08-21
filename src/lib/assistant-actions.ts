
"use server";

import { z } from "zod";
import { chefAssistant, ChatInputSchema, ChatOutput } from "@/ai/flows/chef-assistant-flow";
import type { Message } from "@/components/ai-chef-assistant";

export async function chatWithAssistant(
  messages: Message[]
): Promise<{ success: boolean; data?: ChatOutput; error?: string }> {
  "use server";
  try {
    // The role in our component is 'assistant', but the model expects 'model'
    // We map this before validation and sending to the flow.
    const mappedMessages = messages.map(m => ({
        ...m,
        // The first message is a system prompt, let's keep it as assistant
        role: m.role === 'assistant' ? 'assistant' : 'user'
    }));

    const validatedInput = ChatInputSchema.parse({ messages: mappedMessages });
    
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
