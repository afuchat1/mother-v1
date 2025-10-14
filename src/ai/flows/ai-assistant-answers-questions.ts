'use server';

/**
 * @fileOverview An AI feature that answers user questions.
 *
 * - aiAssistantAnswersQuestions - A function that answers user questions.
 * - AiAssistantAnswersQuestionsInput - The input type for the aiAssistantAnswersQuestions function.
 * - AiAssistantAnswersQuestionsOutput - The return type for the aiAssistantAnswersQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { findUser, findProduct, browse } from '../tools/app-tools';

const AiAssistantAnswersQuestionsInputSchema = z.object({
  prompt: z.array(z.any()).describe("The multi-modal prompt for the AI model."),
});
export type AiAssistantAnswersQuestionsInput = z.infer<typeof AiAssistantAnswersQuestionsInputSchema>;

const AiAssistantAnswersQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question provided.'),
});
export type AiAssistantAnswersQuestionsOutput = z.infer<typeof AiAssistantAnswersQuestionsOutputSchema>;

export async function aiAssistantAnswersQuestions(input: AiAssistantAnswersQuestionsInput): Promise<AiAssistantAnswersQuestionsOutput> {
  const result = await aiAssistantAnswersQuestionsFlow(input);
  if ((result as any).error) {
    throw new Error((result as any).error);
  }
  return result;
}

const aiAssistantAnswersQuestionsFlow = ai.defineFlow(
  {
    name: 'aiAssistantAnswersQuestionsFlow',
    inputSchema: AiAssistantAnswersQuestionsInputSchema,
    outputSchema: AiAssistantAnswersQuestionsOutputSchema,
    tools: [findUser, findProduct, browse],
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: input.prompt,
      output: { schema: AiAssistantAnswersQuestionsOutputSchema },
    });

    if (!output) {
      throw new Error('The AI returned an empty response.');
    }
    return output;
  }
);
