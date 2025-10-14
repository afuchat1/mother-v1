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
  audioDataUri: z.string().optional().describe(
    "An audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  prompt: `You are an AI feature integrated into a chat application. Your purpose is to provide direct, comprehensive answers and access real-time information using available tools.

- To find user profiles and their products, use the findUser tool.
- To search for products, use the findProduct tool.
- To get information from a website, use the browse tool.
- If a tool returns no results, clearly state that the information could not be found. Do not invent information.

Analyze any images or audio provided.

{{#if chatHistory}}
Use this chat history for context:
{{#each chatHistory}}
- {{this.sender}}: {{this.text}}
{{/each}}
{{/if}}

{{#if repliedToMessage}}
You are replying to: "{{repliedToMessage.text}}" from {{repliedToMessage.sender}}.
{{/if}}

Answer the user's question.

Question: {{{question}}}
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}
  {{#if audioDataUri}}
  Audio: {{media url=audioDataUri}}
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
