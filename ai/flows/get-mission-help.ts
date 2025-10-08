
'use server';

/**
 * @fileOverview AI flow to provide a general guide and tips for a specific mission in Red Dead Redemption 2.
 *
 * - getMissionHelp - A function that provides a guide for a mission.
 * - GetMissionHelpInput - The input type for the getMissionHelp function.
 * - GetMissionHelpOutput - The return type for the getMissionHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMissionHelpInputSchema = z.object({
  taskName: z.string().describe('The name of the mission or task the player needs help with.'),
});

export type GetMissionHelpInput = z.infer<typeof GetMissionHelpInputSchema>;

const GetMissionHelpOutputSchema = z.object({
  assistance: z.string().describe('A detailed, helpful guide providing tips, strategies, or a walkthrough for the specified mission. The advice should be clear, actionable, and encouraging.'),
});

export type GetMissionHelpOutput = z.infer<typeof GetMissionHelpOutputSchema>;

export async function getMissionHelp(input: GetMissionHelpInput): Promise<GetMissionHelpOutput> {
  return getMissionHelpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMissionHelpPrompt',
  input: {schema: GetMissionHelpInputSchema},
  output: {schema: GetMissionHelpOutputSchema},
  prompt: `You are an expert guide for Red Dead Redemption 2, specializing in providing mission walkthroughs. Your tone should be helpful and direct.

  A player needs a guide for the following mission:
  - Mission/Task: {{taskName}}

  Please provide a detailed, helpful, and encouraging guide for this mission. Give them specific, actionable strategies, tips, and walkthrough steps to complete it successfully.
  
  Crucially, include advice on how to achieve all Gold Medal objectives for this mission. Break down the best approach for each objective.
  
  For example, if they need to complete a shootout under a time limit, suggest good cover spots, weapon loadouts, and tactics.
  
  Format your response clearly. Use markdown for lists or to emphasize key points if it makes the advice easier to understand.
  `,
});

const getMissionHelpFlow = ai.defineFlow(
  {
    name: 'getMissionHelpFlow',
    inputSchema: GetMissionHelpInputSchema,
    outputSchema: GetMissionHelpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
