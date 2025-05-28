
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
 
const plugins = [];
let model: string | undefined = undefined;

if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
  model = 'googleai/gemini-2.0-flash';
} else {
  // This console.warn will appear in your Vercel server logs if the key is missing.
  console.warn(
    "GOOGLE_API_KEY environment variable not set. Google AI plugin will not be initialized. " +
    "AI features requiring this plugin (like GSTIN details lookup) may not work or will be disabled."
  );
  // If no Google AI, Genkit will be initialized without a model that depends on it.
  // Code using ai.generate() for a googleai model will likely fail if this key is missing.
}

export const ai = genkit({
  plugins: plugins,
  ...(model ? { model: model } : {}), // Conditionally set the model if Google AI plugin is active
});
