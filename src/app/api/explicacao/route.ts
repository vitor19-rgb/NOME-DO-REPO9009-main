// app/api/explicacao/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. Verificação de segurança da Chave API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("A chave da API não foi encontrada. Verifique o arquivo .env.local e reinicie o servidor.");
        }

        // 2. Inicializa a IA
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 3. Mantemos o modelo FLASH: gratuito e super rápido
        const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

        // 4. Recebemos os dados enviados pelo seu jogo
        const body = await request.json();
        const { tema, pergunta, respostaErrada, respostaCorreta } = body;

        // 5. PROMPT MESTRE ATUALIZADO (Foco em guiar e não em dar a resposta)
        const prompt = `Você é um professor especialista em Geografia, focado na preparação de alunos para o ENEM. 
        Regra inquebrável 1: Suas explicações devem ser estritamente sobre Geografia. Não utilize argumentos de História.
        Regra inquebrável 2: Seja extremamente breve e direto ao ponto.
        Regra inquebrável 3: NUNCA dê a resposta correta diretamente ao aluno. O objetivo é fazê-lo pensar.

        O aluno está no meio de um simulado gamificado.
        Tema geral: ${tema}
        A pergunta do ENEM foi: "${pergunta}"
        O aluno escolheu a alternativa INCORRETA: "${respostaErrada}"
        A alternativa CORRETA que ele deve descobrir é: "${respostaCorreta}" (USE ESTA INFORMAÇÃO APENAS PARA CRIAR A DICA, NÃO REVELE A RESPOSTA AO ALUNO!).

        Sua tarefa:
        1. Explique de forma amigável (MÁXIMO DE 1 FRASE) por que a alternativa que ele escolheu está errada.
        2. Faça uma pergunta reflexiva ou dê uma pequena dica (MÁXIMO DE 1 FRASE) que guie o raciocínio do aluno em direção à resposta correta, sem jamais entregar o conceito final de bandeja.`;

        // 6. Envia para o Google e aguarda a resposta
        const result = await model.generateContent(prompt);
        const respostaIA = result.response.text();

        return NextResponse.json({ explicacao: respostaIA });

    } catch (error: any) {
        console.error("❌ ERRO NO SERVIDOR:", error.message || error);

        return NextResponse.json(
            { error: error.message || "Erro desconhecido de comunicação com o Gemini." },
            { status: 500 }
        );
    }
}