'use server';

/**
 * @fileOverview Summarizes feedback on an audio track using AI.
 *
 * - summarizeFeedback - A function that takes comments as input and returns a summary of the feedback.
 * - SummarizeFeedbackInput - The input type for the summarizeFeedback function, an array of comments.
 * - SummarizeFeedbackOutput - The return type for the summarizeFeedback function, a string containing the summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackInputSchema = z.array(z.object({
  text: z.string(),
  timestamp: z.number(),
  endTimestamp: z.number().optional(),
})).describe('An array of comments with their timestamps.');
export type SummarizeFeedbackInput = z.infer<typeof SummarizeFeedbackInputSchema>;

const SummarizeFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the feedback provided in the comments.'),
});
export type SummarizeFeedbackOutput = z.infer<typeof SummarizeFeedbackOutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are an audio engineering assistant. You are given a set of comments about a particular audio track, along with the timestamp or time range that the comment refers to. Your job is to summarize the feedback, and identify the main concerns and areas for improvement.

Comments:
{{#each this}}
- Time: {{timestamp}}{{#if endTimestamp}}-{{endTimestamp}}{{/if}}, Comment: {{text}}
{{/each}}`,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
