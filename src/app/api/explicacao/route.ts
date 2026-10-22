// app/api/explicacao/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// ============================================================================ //
// MODELOS COMPETIDORES DA CORRIDA DE VELOCIDADE (SPECULATIVE RACE PATTERN)
// Disparamos as IAs em paralelo e pegamos imediatamente a que responder primeiro!
// ============================================================================ //
const FAST_GEMINI_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest'
];

async function callGeminiCandidate(
    genAI: GoogleGenerativeAI, 
    modelName: string, 
    prompt: string
): Promise<{ text: string; provider: string }> {
    const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
            maxOutputTokens: 95, // Saída compacta (1 a 2 frases) para resposta quase instantânea
            temperature: 0.3,   // Baixa temperatura = geração mais rápida e direta
        }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();
    if (!text) {
        throw new Error(`[${modelName}] Resposta vazia.`);
    }

    return { text, provider: modelName };
}

async function callGroqCandidate(
    apiKey: string, 
    prompt: string
): Promise<{ text: string; provider: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout máximo

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen/qwen3.8-27b',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um professor de Geografia do ENEM. Responda em no máximo 2 frases curtas e amigáveis, sem entregar a resposta correta, focando em fazer o aluno refletir.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 95,
                temperature: 0.3
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Groq status ${response.status}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (!text) {
            throw new Error('Groq resposta vazia');
        }

        return { text, provider: 'groq (qwen-27b)' };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

async function callDeepSeekCandidate(
    apiKey: string, 
    prompt: string
): Promise<{ text: string; provider: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um professor de Geografia do ENEM. Responda em no máximo 2 frases curtas e amigáveis, sem entregar a resposta correta, focando em fazer o aluno refletir.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 95,
                temperature: 0.3
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`DeepSeek status ${response.status}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (!text) {
            throw new Error('DeepSeek resposta vazia');
        }

        return { text, provider: 'deepseek' };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// ============================================================================ //
// ROTA ULTRA RÁPIDA: POST /api/explicacao
// ============================================================================ //
export async function POST(request: Request) {
    let tema = 'Geografia';
    const t0 = Date.now();

    try {
        const body = await request.json();
        tema = body.tema || 'Geografia';
        const { pergunta, respostaErrada, respostaCorreta } = body;

        const prompt = `Você é um professor especialista em Geografia, focado na preparação de alunos para o ENEM. 
Regra inquebrável 1: Suas explicações devem ser estritamente sobre Geografia. Não utilize argumentos de História.
Regra inquebrável 2: Seja extremamente breve e direto ao ponto (máximo de 2 frases curtas).
Regra inquebrável 3: NUNCA dê a resposta correta diretamente ao aluno. O objetivo é fazê-lo pensar.

O aluno está no meio de um simulado gamificado.
Tema geral: ${tema}
A pergunta do ENEM foi: "${pergunta}"
O aluno escolheu a alternativa INCORRETA: "${respostaErrada}"
A alternativa CORRETA que ele deve descobrir é: "${respostaCorreta}" (USE ESTA INFORMAÇÃO APENAS PARA CRIAR A DICA, NÃO REVELE A RESPOSTA AO ALUNO!).

Sua tarefa:
1. Explique de forma amigável (MÁXIMO DE 1 FRASE) por que a alternativa que ele escolheu está errada.
2. Faça uma pergunta reflexiva ou dê uma pequena dica (MÁXIMO DE 1 FRASE) que guie o raciocínio do aluno em direção à resposta correta, sem jamais entregar o conceito final de bandeja.`;

        // ⚡ DISPARO PARALELO (RACE PATTERN): Todas as IAs disparam juntas ao mesmo tempo
        const racePromises: Promise<{ text: string; provider: string }>[] = [];

        // 1. Modelos leves do Gemini (Plano A)
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            for (const model of FAST_GEMINI_MODELS) {
                racePromises.push(callGeminiCandidate(genAI, model, prompt));
            }
        }

        // 2. Groq (Plano B Gratuito e Ultrarrápido)
        const groqApiKey = process.env.GROQ_API_KEY;
        if (groqApiKey) {
            racePromises.push(callGroqCandidate(groqApiKey, prompt));
        }

        // 3. DeepSeek (Caso haja saldo)
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
        if (deepseekApiKey) {
            racePromises.push(callDeepSeekCandidate(deepseekApiKey, prompt));
        }

        if (racePromises.length === 0) {
            throw new Error('Nenhuma chave de IA configurada');
        }

        // 🏁 O primeiro que terminar com sucesso vence a corrida e responde imediatamente!
        const winner = await Promise.any(racePromises);
        const elapsedMs = Date.now() - t0;
        console.log(`⚡ [RACE WINNER] Resposta mais rápida entregue em ${elapsedMs}ms por: ${winner.provider}`);

        return NextResponse.json({ 
            explicacao: winner.text,
            provedor: winner.provider,
            tempoMs: elapsedMs
        });

    } catch (error: any) {
        const elapsedMs = Date.now() - t0;
        console.warn(`⚠️ Todas as IAs da corrida falharam após ${elapsedMs}ms:`, error?.message || error);

        // Fallback pedagógico gracioso se todas as IAs falharem
        const dicaReserva = `Dica da Professora de Geografia: A alternativa escolhida desvia dos fatores geográficos centrais analisados nesta questão de ${tema}. Observe com cuidado as relações espaciais e os conceitos-chave no enunciado!`;

        return NextResponse.json({ 
            explicacao: dicaReserva,
            fallbackAtivo: true,
            tempoMs: elapsedMs
        });
    }
}
