'use server';
/**
 * @fileOverview A flow for converting speech to text.
 *
 * - speechToText - A function that transcribes audio data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const SpeechToTextInputSchema = z.string().describe(
  "Audio data as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
);

const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});

export async function speechToText(audioDataUri: string): Promise<{ text: string }> {
  const result = await speechToTextFlow(audioDataUri);
  return result;
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (audioDataUri) => {
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { text: 'Transcribe the following audio:' },
        { media: { url: audioDataUri } },
      ],
    });
    return { text: text! };
  }
);
