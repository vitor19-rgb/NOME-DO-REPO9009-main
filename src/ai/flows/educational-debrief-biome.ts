
'use server';
/**
 * @fileOverview A Genkit flow for generating an educational debriefing about a specific Brazilian biome.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EducationalDebriefInputSchema = z
  .object({
    biomeName: z.string().describe('The name of the Brazilian biome to summarize.'),
  })
  .describe('Input for the educational debrief flow.');
export type EducationalDebriefInput = z.infer<typeof EducationalDebriefInputSchema>;

const EducationalDebriefOutputSchema = z
  .object({
    summary: z.string().describe('An ENEM-style educational summary of the biome.'),
  })
  .describe('Output for the educational debrief flow.');
export type EducationalDebriefOutput = z.infer<typeof EducationalDebriefOutputSchema>;

export async function educationalDebrief(
  input: EducationalDebriefInput
): Promise<EducationalDebriefOutput> {
  return educationalDebriefFlow(input);
}

const educationalDebriefPrompt = ai.definePrompt({
  name: 'educationalDebriefPrompt',
  input: { schema: EducationalDebriefInputSchema },
  output: { schema: EducationalDebriefOutputSchema },
  prompt: `Gere um resumo educacional conciso, no estilo ENEM, sobre o bioma: {{{biomeName}}}.

Inclua informações sobre suas características geográficas, vegetação predominante, clima e importância ecológica.

Formato da resposta:
{
  "summary": "[Seu resumo aqui]"
}`,
});

const educationalDebriefFlow = ai.defineFlow(
  {
    name: 'educationalDebriefFlow',
    inputSchema: EducationalDebriefInputSchema,
    outputSchema: EducationalDebriefOutputSchema,
  },
  async (input) => {
    const { output } = await educationalDebriefPrompt(input);
    if (!output) {
      throw new Error('Failed to generate educational debrief summary.');
    }
    return output;
  }
);
