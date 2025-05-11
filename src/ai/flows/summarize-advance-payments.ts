// This is a server-side file.
'use server';

/**
 * @fileOverview Provides functionality to summarize total advance payments paid to labor.
 *
 * - summarizeAdvancePayments - A function that summarizes total advances paid to labor.
 * - SummarizeAdvancePaymentsInput - The input type for the summarizeAdvancePayments function.
 * - SummarizeAdvancePaymentsOutput - The return type for the summarizeAdvancePayments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAdvancePaymentsInputSchema = z.object({
  laborDetails: z.string().describe('Details of the laborers, including names.'),
  advancePayments: z.string().describe('A list of advance payments, including laborer name, date, and amount.'),
  query: z.string().describe('The specific query about total advances paid to labor.'),
});

export type SummarizeAdvancePaymentsInput = z.infer<typeof SummarizeAdvancePaymentsInputSchema>;

const SummarizeAdvancePaymentsOutputSchema = z.object({
  summary: z.string().describe('A summary of the total advances paid to labor, based on the query.'),
});

export type SummarizeAdvancePaymentsOutput = z.infer<typeof SummarizeAdvancePaymentsOutputSchema>;

export async function summarizeAdvancePayments(input: SummarizeAdvancePaymentsInput): Promise<SummarizeAdvancePaymentsOutput> {
  return summarizeAdvancePaymentsFlow(input);
}

const summarizeAdvancePaymentsPrompt = ai.definePrompt({
  name: 'summarizeAdvancePaymentsPrompt',
  input: {schema: SummarizeAdvancePaymentsInputSchema},
  output: {schema: SummarizeAdvancePaymentsOutputSchema},
  prompt: `You are an AI assistant helping a manager summarize advance payments paid to labor.

  You are given the following information:

  Labor Details: {{{laborDetails}}}
  Advance Payments: {{{advancePayments}}}

  Based on this information, please answer the following query: {{{query}}}
  Ensure the summary is accurate and easy to understand.
  `,
});

const summarizeAdvancePaymentsFlow = ai.defineFlow(
  {
    name: 'summarizeAdvancePaymentsFlow',
    inputSchema: SummarizeAdvancePaymentsInputSchema,
    outputSchema: SummarizeAdvancePaymentsOutputSchema,
  },
  async input => {
    const {output} = await summarizeAdvancePaymentsPrompt(input);
    return output!;
  }
);
