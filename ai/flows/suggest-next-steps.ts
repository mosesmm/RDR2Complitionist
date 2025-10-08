'use server';

/**
 * @fileOverview AI flow to suggest the next steps for a player to achieve 100% completion in Red Dead Redemption 2.
 *
 * - suggestNextSteps - A function that suggests the next steps based on the player's current progress.
 * - SuggestNextStepsInput - The input type for the suggestNextSteps function.
 * - SuggestNextStepsOutput - The return type for the suggestNextSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextStepsInputSchema = z.object({
  mainStoryProgress: z.number().describe('Percentage completion of the main story.'),
  sideQuestsProgress: z.number().describe('Percentage completion of side quests.'),
  challengesProgress: z.number().describe('Percentage completion of challenges.'),
  collectiblesProgress: z.number().describe('Percentage completion of collectibles.'),
  miscellaneousProgress: z.number().describe('Percentage completion of miscellaneous tasks.'),
  preferredPlaystyle: z.string().optional().describe('The player’s preferred playstyle (e.g., combat, exploration, completionist).'),
});

export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

const SuggestNextStepsOutputSchema = z.object({
  suggestedNextSteps: z.array(
    z.object({
      task: z.string().describe('The suggested task or activity.'),
      category: z.string().describe('The category of the task (e.g., Main Story, Side Quest, Challenge, Collectible, Miscellaneous).'),
      priority: z.string().describe('The priority of the task (High, Medium, Low).'),
      difficulty: z.string().describe('The difficulty of the task (Easy, Medium, Hard).'),
      estimatedCompletionTime: z.string().describe('Estimated time to complete the task (e.g., 1-2 hours).'),
      rationale: z.string().describe('Why this task is suggested based on current progress and playstyle.')
    })
  ).describe('A list of suggested next steps with task details, category, priority, difficulty, estimated completion time and a rationale.'),
});

export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
  return suggestNextStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextStepsPrompt',
  input: {schema: SuggestNextStepsInputSchema},
  output: {schema: SuggestNextStepsOutputSchema},
  prompt: `You are an expert game completion assistant for Red Dead Redemption 2.

  Based on the player's current progress, suggest the most relevant or easiest missions, challenges, or collectibles to pursue next.

  Consider the following progress:
  - Main Story Completion: {{mainStoryProgress}}%
  - Side Quests Completion: {{sideQuestsProgress}}%
  - Challenges Completion: {{challengesProgress}}%
  - Collectibles Completion: {{collectiblesProgress}}%
  - Miscellaneous Completion: {{miscellaneousProgress}}%

  The player's preferred playstyle is: {{preferredPlaystyle}}

  Suggest a list of next steps (missions, challenges, collectibles etc.) to efficiently navigate towards 100% completion. Each task object in the list should include the task, the category of the task, its priority (High, Medium, Low), the difficulty (Easy, Medium, Hard), estimated completion time and most importantly, the rationale behind suggesting this specific task.
  The rationale should heavily factor in the player's preferred playstyle. For example, if the playstyle is 'Combat', suggest action-packed missions. If it's 'Exploration', suggest finding collectibles or points of interest.
  Be very detailed and include the reasoning behind the suggestions. Make sure that suggested next steps are diverse and cover all game categories and aspects.
  Do not suggest steps that have already been completed.
  `,
});

const suggestNextStepsFlow = ai.defineFlow(
  {
    name: 'suggestNextStepsFlow',
    inputSchema: SuggestNextStepsInputSchema,
    outputSchema: SuggestNextStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
