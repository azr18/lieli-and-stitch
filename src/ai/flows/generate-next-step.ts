// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating the next step in a text-based adventure game.
 *
 * The flow takes the current game state and the player's choice as input and generates the next snippet of the story.
 * It features interactions with characters like Angel and Leroy to make the game feel unique and responsive to player actions.
 *
 * @Exported Members:
 *   - `generateNextStep`: The main function to call to generate the next step of the story.
 *   - `GenerateNextStepInput`: The input type for the `generateNextStep` function.
 *   - `GenerateNextStepOutput`: The output type for the `generateNextStep` function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the input schema
const GenerateNextStepInputSchema = z.object({
  gameState: z.string().describe('The current state of the game, including player inventory, location, and other relevant information.'),
  playerChoice: z.string().describe('The player\u2019s choice or action in the previous step.'),
});
export type GenerateNextStepInput = z.infer<typeof GenerateNextStepInputSchema>;

// Define the output schema
const GenerateNextStepOutputSchema = z.object({
  nextStorySnippet: z.string().describe('The next snippet of the story, generated based on the player\u2019s choice and the current game state.'),
  availableChoices: z.array(z.string()).describe('A list of available choices for the player to choose from.'),
});
export type GenerateNextStepOutput = z.infer<typeof GenerateNextStepOutputSchema>;

// Define the main function that uses the flow
export async function generateNextStep(input: GenerateNextStepInput): Promise<GenerateNextStepOutput> {
  return generateNextStepFlow(input);
}

const generateChoices = ai.defineTool({
  name: 'generateChoices',
  description: 'Generates a list of possible choices for the player in the game.',
  inputSchema: z.object({
    gameState: z.string().describe('The current state of the game.'),
    playerChoice: z.string().describe('The player\u2019s choice.'),
    storySnippet: z.string().optional().describe('The story snippet which resulted from the player choice'),
  }),
  outputSchema: z.array(z.string()).describe('A list of possible choices for the player.'),
}, async (input) => {
  // Mock implementation to return some choices. In reality, this could use an LLM.
  return [
    'Explore the jungle',
    'Go back to the beach',
    'Talk to Stitch',
    'Look for Angel',
  ];
});

// Define the prompt
const generateNextStepPrompt = ai.definePrompt({
  name: 'generateNextStepPrompt',
  tools: [generateChoices],
  input: {
    schema: z.object({
      gameState: z.string().describe('The current state of the game.'),
      playerChoice: z.string().describe('The player\u2019s choice.'),
    }),
  },
  output: {
    schema: z.object({
      nextStorySnippet: z.string().describe('The next snippet of the story.'),
    }),
  },
  prompt: `You are a text-based adventure game writer. Generate the next snippet of the story based on the player's choice and the current game state.

Current Game State:
{{gameState}}

Player's Choice:
{{playerChoice}}

Write a creative and engaging next snippet of the story, taking into account the player's choice and the current game state. The story should dynamically adjust based on the player's actions, and may involve interactions with characters like Angel and Leroy. After generating the snippet, use the generateChoices tool to create a list of available choices for the player.
`,
});

// Define the flow
const generateNextStepFlow = ai.defineFlow<
  typeof GenerateNextStepInputSchema,
  typeof GenerateNextStepOutputSchema
>({
  name: 'generateNextStepFlow',
  inputSchema: GenerateNextStepInputSchema,
  outputSchema: GenerateNextStepOutputSchema,
}, async input => {
  const {output} = await generateNextStepPrompt(input);
  const choices = await generateChoices({gameState: input.gameState, playerChoice: input.playerChoice, storySnippet: output?.nextStorySnippet});
  return {
    nextStorySnippet: output!.nextStorySnippet,
    availableChoices: choices,
  };
});
