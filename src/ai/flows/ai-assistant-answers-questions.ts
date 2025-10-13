'use server';

/**
 * @fileOverview An AI assistant that answers user questions.
 *
 * - aiAssistantAnswersQuestions - A function that answers user questions.
 * - AiAssistantAnswersQuestionsInput - The input type for the aiAssistantAnswersQuestions function.
 * - AiAssistantAnswersQuestionsOutput - The return type for the aiAssistantAnswersQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { findUser, findProduct } from '../tools/app-tools';

const AiAssistantAnswersQuestionsInputSchema = z.object({
  question: z.string().describe('The question to be answered by the AI assistant.'),
  photoDataUri: z.string().optional().describe(
    "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type AiAssistantAnswersQuestionsInput = z.infer<typeof AiAssistantAnswersQuestionsInputSchema>;

const AiAssistantAnswersQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question provided.'),
});
export type AiAssistantAnswersQuestionsOutput = z.infer<typeof AiAssistantAnswersQuestionsOutputSchema>;

export async function aiAssistantAnswersQuestions(input: AiAssistantAnswersQuestionsInput): Promise<AiAssistantAnswersQuestionsOutput> {
  return aiAssistantAnswersQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistantAnswersQuestionsPrompt',
  input: {schema: AiAssistantAnswersQuestionsInputSchema},
  output: {schema: AiAssistantAnswersQuestionsOutputSchema},
  tools: [findUser, findProduct],
  prompt: `You are AfuAi, the helpful AI assistant for AfuChat. You are an expert on all things related to the AfuChat application. You can access information within the app using the tools provided.

The founder, CEO, and Product Manager of AfuChat is amkaweeai.

Use your tools to answer questions about users, products, or other information within the AfuChat app.

Answer the following question to the best of your ability.

Question: {{{question}}}
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}
  `,
});

const aiAssistantAnswersQuestionsFlow = ai.defineFlow(
  {
    name: 'aiAssistantAnswersQuestionsFlow',
    inputSchema: AiAssistantAnswersQuestionsInputSchema,
    outputSchema: AiAssistantAnswersQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
