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

const aiAssistantAnswersQuestionsFlow = ai.defineFlow(
  {
    name: 'aiAssistantAnswersQuestionsFlow',
    inputSchema: AiAssistantAnswersQuestionsInputSchema,
    outputSchema: AiAssistantAnswersQuestionsOutputSchema,
    tools: [findUser, findProduct, browse],
  },
  async (input) => {
    const { question, photoDataUri, audioDataUri, chatHistory, repliedToMessage } = input;

    let promptText = `You are a helpful AI assistant. Use the available tools to answer questions.`;

    if (audioDataUri) {
      promptText += `\nAnalyze the attached audio. This is the primary context.`;
    }
    if (photoDataUri) {
      promptText += `\nThis is the photo.`;
    }

    if (chatHistory && chatHistory.length > 0) {
      promptText += '\n\nHere is the recent chat history for additional context:\n';
      promptText += chatHistory.map(m => `- ${m.sender}: ${m.text}`).join('\n');
    }

    if (repliedToMessage) {
        promptText += `\n\nYou are replying to "${repliedToMessage.text}" from ${repliedToMessage.sender}.`;
    }

    promptText += `\n\nNow, answer the user's question: ${question}`;

    const promptParts: any[] = [{ text: promptText }];
    if (photoDataUri) {
      promptParts.push({ media: { url: photoDataUri } });
    }
    if (audioDataUri) {
        promptParts.push({ media: { url: audioDataUri } });
    }

    const { output } = await ai.generate({
      prompt: promptParts,
      output: { schema: AiAssistantAnswersQuestionsOutputSchema },
    });

    if (!output) {
      throw new Error('The AI returned an empty response.');
    }
    return output;
  }
);
