
'use server';

import { runChefAssistant } from '@/ai/flows/chef-assistant-flow';
import {
  AssistantRequest,
  AssistantRequestSchema,
} from '@/ai/schemas/assistant-schemas';
import { z } from 'zod';

export async function getAssistantResponse(input: AssistantRequest) {
  'use server';
  try {
    const validatedInput = AssistantRequestSchema.parse(input);
    const response = await runChefAssistant(validatedInput);
    return { success: true, data: response };
  } catch (error) {
    console.error('[Assistant Action Error]', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input.' };
    }
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: `Failed to get assistant response: ${errorMessage}`,
    };
  }
}
