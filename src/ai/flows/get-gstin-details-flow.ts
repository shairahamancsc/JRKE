'use server';
/**
 * @fileOverview A flow to retrieve company details based on a GSTIN.
 *
 * - getGstinDetails - A function that handles fetching GSTIN details.
 * - GetGstinDetailsInput - The input type for the getGstinDetails function.
 * - GetGstinDetailsOutput - The return type for the getGstinDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// GSTIN Regex:
// 1. First 2 chars: State Code (Digits 01-37, some newer codes exist)
// 2. Next 10 chars: PAN (5 Alphas, 4 Numerics, 1 Alpha)
// 3. 13th char: Entity number of the same PAN holder in a state (1-9, A-Z excluding I and O)
// 4. 14th char: Alphabet 'Z' by default
// 5. 15th char: Checksum digit (Alpha or Numeric)
const GSTIN_REGEX_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-HJ-NP-Z]{1}Z[0-9A-Z]{1}$/;

const GetGstinDetailsInputSchema = z.object({
  gstin: z.string().length(15, "GSTIN must be 15 characters long.").regex(GSTIN_REGEX_PATTERN, "Invalid GSTIN format."),
});
export type GetGstinDetailsInput = z.infer<typeof GetGstinDetailsInputSchema>;

const GetGstinDetailsOutputSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  error: z.string().optional(),
});
export type GetGstinDetailsOutput = z.infer<typeof GetGstinDetailsOutputSchema>;

// Mock database of GSTIN details
const mockGstinDatabase: Record<string, { companyName: string; companyAddress: string }> = {
  "27AAPFU0932F1Z5": { 
    companyName: "Google India Private Limited",
    companyAddress: "3 North Avenue, Maker Maxity, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051",
  },
  "29AAAAA0000A1Z5": { 
    companyName: "Innovate Solutions Pvt Ltd",
    companyAddress: "123 Tech Park, Electronic City, Bangalore, Karnataka 560100",
  },
  "07AABCS1234D1Z2": { 
    companyName: "Delhi Trading Co.",
    companyAddress: "456 Market Lane, Chandni Chowk, New Delhi, Delhi 110006",
  }
};


export async function getGstinDetails(input: GetGstinDetailsInput): Promise<GetGstinDetailsOutput> {
  // The flow itself will validate the input against its schema.
  // If input is invalid, genkit will throw an error automatically.
  return getGstinDetailsFlow(input);
}

const getGstinDetailsFlow = ai.defineFlow(
  {
    name: 'getGstinDetailsFlow',
    inputSchema: GetGstinDetailsInputSchema,
    outputSchema: GetGstinDetailsOutputSchema,
  },
  async (input) : Promise<GetGstinDetailsOutput>=> {
    // In a real application, you would call an external GST API here using fetch.
    // This would involve handling API keys, rate limits, and actual network requests.
    // For this example, we're using a mock database.
    
    // GSTIN is already validated for format by the inputSchema.
    const details = mockGstinDatabase[input.gstin.toUpperCase()];

    if (details) {
      return {
        companyName: details.companyName,
        companyAddress: details.companyAddress,
      };
    } else {
      // If GSTIN is valid format but not in our mock database
      return {
        error: "GSTIN details not found in our records. Please ensure the GSTIN is correct and active.",
      };
    }
  }
);
