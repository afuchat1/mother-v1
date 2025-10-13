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
import { findUser, findProduct, browse } from '../tools/app-tools';

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
  const result = await aiAssistantAnswersQuestionsFlow(input);
  if ((result as any).error) {
    throw new Error((result as any).error);
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'aiAssistantAnswersQuestionsPrompt',
  input: {schema: AiAssistantAnswersQuestionsInputSchema},
  output: {schema: AiAssistantAnswersQuestionsOutputSchema},
  tools: [findUser, findProduct, browse],
  prompt: `You are AfuAi, the helpful and comprehensive AI assistant for AfuChat. You are an expert on all things related to the AfuChat application and have the ability to access real-time information from the internet. Your goal is to provide the most detailed and complete answers possible, using the tools provided.

The founder, CEO, and Product Manager of AfuChat is amkaweeai.

When asked to find a user, use the findUser tool to get all their profile information. Your answer should be a detailed summary, including their bio and a full list of all products they sell, if any.

When asked to find products, use the findProduct tool. Provide a comprehensive list of all matching products, including their names, descriptions, and prices.

If a question requires information from the internet (e.g., current events, facts, website content), use the browse tool to fetch the information from a given URL.

If a tool returns no results (e.g., the user or product is not found, or a website can't be accessed), you MUST inform the user clearly that the requested information is not available or could not be found. Do not invent information.

You have no limits on the amount of information you can provide. Be as thorough as possible in your responses. You can also analyze any images provided to you.

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
    if (!output) {
      throw new Error('The AI assistant returned an empty response.');
    }
    return output;
  }
);
