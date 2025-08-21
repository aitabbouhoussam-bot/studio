'use server';

/**
 * @fileOverview Flow for improving an existing meal plan based on user feedback.
 *
 * - improveMealPlan - A function that takes an existing meal plan and feedback, and returns an improved meal plan.
 * - ImproveMealPlanInput - The input type for the improveMealPlan function.
 * - ImproveMealPlanOutput - The return type for the improveMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveMealPlanInputSchema = z.object({
  mealPlan: z.string().describe('The existing 7-day meal plan to improve.'),
  feedback: z.string().describe('The user feedback to apply to the meal plan, e.g., \'more vegetarian meals\' or \'fewer carbs\'.'),
});
export type ImproveMealPlanInput = z.infer<typeof ImproveMealPlanInputSchema>;

const ImproveMealPlanOutputSchema = z.string().describe('The improved 7-day meal plan.');
export type ImproveMealPlanOutput = z.infer<typeof ImproveMealPlanOutputSchema>;

export async function improveMealPlan(input: ImproveMealPlanInput): Promise<ImproveMealPlanOutput> {
  return improveMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveMealPlanPrompt',
  input: {schema: ImproveMealPlanInputSchema},
  output: {schema: ImproveMealPlanOutputSchema},
  prompt: `You are an AI meal plan assistant. The user has provided an existing meal plan and some feedback on how to improve it.  Your task is to generate a new meal plan that incorporates that feedback.

Existing Meal Plan:
{{mealPlan}}

Feedback:
{{feedback}}

Improved Meal Plan:`,
});

const improveMealPlanFlow = ai.defineFlow(
  {
    name: 'improveMealPlanFlow',
    inputSchema: ImproveMealPlanInputSchema,
    outputSchema: ImproveMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
