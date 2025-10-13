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
  question: z.string().describe('The question to be answered by the AI.'),
  photoDataUri: z.string().optional().describe(
    "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
   repliedToMessage: z.object({
    sender: z.string(),
    text: z.string(),
  }).optional().describe('The message being replied to, for context.'),
  chatHistory: z.array(z.object({
    sender: z.string(),
    text: z.string(),
  })).optional().describe('The last few messages in the chat for context.'),
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
  prompt: `You are a powerful AI feature within the AfuChat application. Your purpose is to provide direct, comprehensive answers and access real-time information using the available tools.

When asked to find a user, use the findUser tool to get all their profile information. Your answer should be a detailed summary, including their bio and a full list of all products they sell, if any.

When asked to find products, use the findProduct tool. Provide a comprehensive list of all matching products, including their names, descriptions, and prices.

If a question requires information from the internet (e.g., current events, facts, website content), use the browse tool to fetch the information from a given URL.

If a tool returns no results (e.g., the user or product is not found, or a website can't be accessed), you MUST inform the user clearly that the requested information is not available or could not be found. Do not invent information.

You can analyze any images provided.

{{#if chatHistory}}
Here is the recent chat history for context. Use it to understand the flow of the conversation and ensure your response is relevant to the topic. Do not bring up unrelated subjects.
{{#each chatHistory}}
- {{this.sender}}: {{this.text}}
{{/each}}
{{/if}}

{{#if repliedToMessage}}
You are replying to a message from {{repliedToMessage.sender}} that said: "{{repliedToMessage.text}}".
Use this context to inform your answer to the user's question.
{{/if}}

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
      throw new Error('The AI returned an empty response.');
    }
    return output;
  }
);
