
// This is a server-side file.
'use server';

/**
 * @fileOverview Provides functionality to summarize total advance payments paid to labour.
 *
 * - summarizeAdvancePayments - A function that summarizes total advances paid to labour.
 * - SummarizeAdvancePaymentsInput - The input type for the summarizeAdvancePayments function.
 * - SummarizeAdvancePaymentsOutput - The return type for the summarizeAdvancePayments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAdvancePaymentsInputSchema = z.object({
  labourDetails: z.string().describe('Details of the labours, including names.'),
  advancePayments: z.string().describe('A list of advance payments, including labour name, date, and amount.'),
  query: z.string().describe('The specific query about total advances paid to labour.'),
});

export type SummarizeAdvancePaymentsInput = z.infer<typeof SummarizeAdvancePaymentsInputSchema>;

const SummarizeAdvancePaymentsOutputSchema = z.object({
  summary: z.string().describe('A summary of the total advances paid to labour, based on the query.'),
});

export type SummarizeAdvancePaymentsOutput = z.infer<typeof SummarizeAdvancePaymentsOutputSchema>;

export async function summarizeAdvancePayments(input: SummarizeAdvancePaymentsInput): Promise<SummarizeAdvancePaymentsOutput> {
  return summarizeAdvancePaymentsFlow(input);
}

const summarizeAdvancePaymentsPrompt = ai.definePrompt({
  name: 'summarizeAdvancePaymentsPrompt',
  input: {schema: SummarizeAdvancePaymentsInputSchema},
  output: {schema: SummarizeAdvancePaymentsOutputSchema},
  prompt: `You are an AI assistant helping a manager summarize advance payments paid to labour.

  You are given the following information:

  Labour Details: {{{labourDetails}}}
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
