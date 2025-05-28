
'use server';
/**
 * @fileOverview A Genkit flow to fetch details for a given GSTIN.
 * Uses a mock tool for demonstration purposes.
 * - getGstinDetails - A function that retrieves details for a GSTIN.
 * - GetGstinDetailsInputSchema - The input type for the getGstinDetails function.
 * - GetGstinDetailsOutputSchema - The return type for the getGstinDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define a mock tool for fetching GST API details
const fetchGstApiMockTool = ai.defineTool(
  {
    name: 'fetchGstApiMockTool',
    description: 'Fetches details for a given GSTIN from a mock external API.',
    inputSchema: z.object({ gstin: z.string().length(15, "GSTIN must be 15 characters") }),
    outputSchema: z.object({
      legalName: z.string().optional(),
      tradeName: z.string().optional(),
      status: z.string().optional(),
      address: z.string().optional(),
      taxpayerType: z.string().optional(),
      gstinNotFound: z.boolean().optional(), // To indicate if GSTIN was explicitly not found by mock
      error: z.string().optional(),
    }),
  },
  async (input) => {
    // Mock data based on a few known test GSTINs
    if (input.gstin === "07AAPCM1234A1Z5") { // Example Delhi GSTIN
      return {
        legalName: "MOCK COMPANY PVT LTD (DELHI)",
        tradeName: "MOCK TRADERS DELHI",
        status: "Active",
        address: "123 MOCK STREET, MOCK CITY, DELHI 110001",
        taxpayerType: "Regular",
      };
    } else if (input.gstin === "27AAPCM1234A1Z2") { // Example Maharashtra GSTIN
      return {
        legalName: "ANOTHER MOCK ENTERPRISE (MAHARASHTRA)",
        tradeName: "MOCK GOODS MAHA",
        status: "Active",
        address: "456 MOCK AVENUE, MOCK TOWN, MAHARASHTRA 400001",
        taxpayerType: "Composition",
      };
    }
    // Simulate a "not found" scenario for other GSTINs
    return { gstinNotFound: true, error: "GSTIN not found (mock response for unlisted GSTIN)." };
  }
);

export const GetGstinDetailsInputSchema = z.object({
  gstin: z.string().length(15, "GSTIN must be 15 characters").describe("The 15-character Goods and Services Tax Identification Number."),
});
export type GetGstinDetailsInput = z.infer<typeof GetGstinDetailsInputSchema>;

export const GetGstinDetailsOutputSchema = z.object({
  legalName: z.string().optional().describe("The legal name of the business."),
  tradeName: z.string().optional().describe("The trade name of the business."),
  status: z.string().optional().describe("The current status of the GSTIN (e.g., Active, Cancelled)."),
  address: z.string().optional().describe("The principal place of business address."),
  taxpayerType: z.string().optional().describe("Type of taxpayer (e.g., Regular, Composition)."),
  gstinNotFound: z.boolean().optional().describe("True if the GSTIN was specifically not found by the mock service."),
  error: z.string().optional().describe("Error message if fetching details failed."),
});
export type GetGstinDetailsOutput = z.infer<typeof GetGstinDetailsOutputSchema>;

const getGstinDetailsFlow = ai.defineFlow(
  {
    name: 'getGstinDetailsFlow',
    inputSchema: GetGstinDetailsInputSchema,
    outputSchema: GetGstinDetailsOutputSchema,
  },
  async (input) => {
    // Use a prompt to instruct the model to use the tool
    // Note: Using Gemini Flash here as it's generally available.
    // Ensure your `ai` object in `genkit.ts` is configured for a model that supports tool use.
    const llmResponse = await ai.generate({
        prompt: `Fetch details for GSTIN: ${input.gstin}. Use the provided tool to get this information. Respond with the structured output from the tool. If the tool indicates the GSTIN was not found, include that information.`,
        model: ai.getModel() || 'googleai/gemini-2.0-flash', // Use default or a fallback if available
        tools: [fetchGstApiMockTool],
        output: {
            format: 'json',
            schema: GetGstinDetailsOutputSchema,
        },
        // config: {
        //   // Lower safety settings for general queries if needed, be mindful of implications
        //   safetySettings: [
        //     { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        //     { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        //     { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        //     { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        //   ],
        // }
    });

    const toolResponse = llmResponse.toolRequests?.[0]?.output?.tool_response;

    if (toolResponse) {
        return toolResponse as GetGstinDetailsOutput;
    } else if (llmResponse.output) {
        // Sometimes the LLM might directly populate parts of the schema
        return llmResponse.output as GetGstinDetailsOutput;
    }

    return { error: "Failed to retrieve or process GSTIN details using the LLM and tool." };
  }
);

export async function getGstinDetails(input: GetGstinDetailsInput): Promise<GetGstinDetailsOutput> {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("Google AI model not available for GSTIN details. GOOGLE_API_KEY might be missing.");
    return { error: "GSTIN validation service is currently unavailable. Please check API key configuration." };
  }
  try {
    return await getGstinDetailsFlow(input);
  } catch (e) {
    console.error("Error in getGstinDetailsFlow:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred in the flow.";
    return { error: `Flow execution error: ${errorMessage}` };
  }
}
