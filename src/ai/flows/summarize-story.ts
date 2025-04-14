// Summarizes the story's progress and key decisions for the player.
'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const SummarizeStoryInputSchema = z.object({
  storySoFar: z
    .string()
    .describe(
      'A detailed narrative of the story including key decisions made by the player.'
    ),
});
export type SummarizeStoryInput = z.infer<typeof SummarizeStoryInputSchema>;

const SummarizeStoryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the player journey and key decisions.'),
});
export type SummarizeStoryOutput = z.infer<typeof SummarizeStoryOutputSchema>;

export async function summarizeStory(input: SummarizeStoryInput): Promise<SummarizeStoryOutput> {
  return summarizeStoryFlow(input);
}

const summarizeStoryPrompt = ai.definePrompt({
  name: 'summarizeStoryPrompt',
  input: {
    schema: z.object({
      storySoFar: z
        .string()
        .describe(
          'A detailed narrative of the story including key decisions made by the player.'
        ),
    }),
  },
  output: {
    schema: z.object({
      summary: z
        .string()
        .describe('A concise summary of the player journey and key decisions.'),
    }),
  },
  prompt: `You are an expert summarizer, able to distill long stories into concise and engaging summaries.

  Please provide a summary of the following story, highlighting the key decisions and events:

  {{{storySoFar}}}
  `,
});

const summarizeStoryFlow = ai.defineFlow<
  typeof SummarizeStoryInputSchema,
  typeof SummarizeStoryOutputSchema
>({
  name: 'summarizeStoryFlow',
  inputSchema: SummarizeStoryInputSchema,
  outputSchema: SummarizeStoryOutputSchema,
},
async input => {
  const { output } = await summarizeStoryPrompt(input);
  return output!;
});