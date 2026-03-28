'use server';
/**
 * @fileOverview A Genkit flow for generating an educational debriefing about the Caatinga biome.
 *
 * - educationalDebriefCaatinga - A function that triggers the AI to generate an ENEM-style summary for the Caatinga biome.
 * - EducationalDebriefCaatingaInput - The input type for the educationalDebriefCaatinga function.
 * - EducationalDebriefCaatingaOutput - The return type for the educationalDebriefCaatinga function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EducationalDebriefCaatingaInputSchema = z
  .object({})
  .describe('Input for the Caatinga educational debrief flow (currently empty as the biome is fixed).');
export type EducationalDebriefCaatingaInput = z.infer<
  typeof EducationalDebriefCaatingaInputSchema
>;

const EducationalDebriefCaatingaOutputSchema = z
  .object({
    summary: z
      .string()
      .describe('An ENEM-style educational summary of the Caatinga biome.'),
  })
  .describe('Output for the Caatinga educational debrief flow, containing the summary.');
export type EducationalDebriefCaatingaOutput = z.infer<
  typeof EducationalDebriefCaatingaOutputSchema
>;

export async function educationalDebriefCaatinga(
  input: EducationalDebriefCaatingaInput
): Promise<EducationalDebriefCaatingaOutput> {
  return educationalDebriefCaatingaFlow(input);
}

const educationalDebriefCaatingaPrompt = ai.definePrompt({
  name: 'educationalDebriefCaatingaPrompt',
  input: { schema: EducationalDebriefCaatingaInputSchema },
  output: { schema: EducationalDebriefCaatingaOutputSchema },
  prompt: `Gere um resumo educacional conciso, no estilo ENEM, especificamente sobre o bioma Caatinga.

Inclua informações sobre suas características únicas, como o fato de ser o único bioma exclusivamente brasileiro e a adaptação de suas plantas à escassez de água.

Formato da resposta:
{
  "summary": "[Seu resumo aqui]"
}`,
});

const educationalDebriefCaatingaFlow = ai.defineFlow(
  {
    name: 'educationalDebriefCaatingaFlow',
    inputSchema: EducationalDebriefCaatingaInputSchema,
    outputSchema: EducationalDebriefCaatingaOutputSchema,
  },
  async (input) => {
    const { output } = await educationalDebriefCaatingaPrompt(input);
    if (!output) {
      throw new Error('Failed to generate educational debrief summary.');
    }
    return output;
  }
);
