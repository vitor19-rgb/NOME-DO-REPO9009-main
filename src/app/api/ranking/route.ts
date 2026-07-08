import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, limit, where, doc, getDoc, setDoc } from 'firebase/firestore';

// ============================================================================ //
// MÉTODO GET: Busca os dados do Firebase
// ============================================================================ //
export async function GET(request: Request) {
    try {
        console.log('🔍 GET /api/ranking - Iniciando busca...');
        
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const mode = searchParams.get('mode');

        console.log('📋 Parâmetros:', { name, mode });

        // Verifica se o db está disponível
        if (!db) {
            console.error('❌ Firebase não inicializado!');
            return NextResponse.json(
                { error: 'Banco de dados não disponível' },
                { status: 500 }
            );
        }

        const rankingRef = collection(db, 'ranking');
        
        let q;
        if (name && mode) {
            // Busca específica por nome e modo
            console.log('🔍 Filtrando por:', { name, mode });
            q = query(
                rankingRef, 
                where('name', '==', name),
                where('mode', '==', mode),
                orderBy('score', 'desc'),
                limit(200)
            );
        } else {
            // Busca geral
            q = query(rankingRef, orderBy('score', 'desc'), limit(200));
        }
        
        const querySnapshot = await getDocs(q);
        console.log(`📊 Encontrados ${querySnapshot.size} documentos`);

        const leaderboard: any[] = [];
        querySnapshot.forEach((doc) => {
            leaderboard.push({ id: doc.id, ...doc.data() });
        });

        // Se for busca específica, retorna os scores agrupados por dificuldade
        if (name && mode) {
            const scores = {
                easy: 0,
                medium: 0,
                hard: 0
            };
            
            leaderboard.forEach((entry) => {
                if (entry.difficulty && scores[entry.difficulty as keyof typeof scores] !== undefined) {
                    const currentScore = scores[entry.difficulty as keyof typeof scores] || 0;
                    if (entry.score > currentScore) {
                        scores[entry.difficulty as keyof typeof scores] = entry.score;
                    }
                }
            });
            
            console.log('✅ Scores retornados:', scores);
            return NextResponse.json({ scores });
        }

        console.log('✅ Ranking completo retornado:', leaderboard.length, 'itens');
        return NextResponse.json(leaderboard);

    } catch (error) {
        console.error("❌ Erro interno ao buscar o ranking:", error);
        return NextResponse.json(
            { error: 'Erro ao buscar o ranking: ' + (error as Error).message },
            { status: 500 }
        );
    }
}

// ============================================================================ //
// MÉTODO POST: Salva a pontuação no Firebase
// ============================================================================ //
export async function POST(request: Request) {
    try {
        console.log('💾 POST /api/ranking - Iniciando salvamento...');
        
        const body = await request.json();
        const { name, score, mode, difficulty, date } = body;

        console.log('📦 Dados recebidos:', { name, score, mode, difficulty });

        // Validação
        if (!name || score === undefined || !mode) {
            console.error('❌ Dados incompletos:', { name, score, mode });
            return NextResponse.json(
                { error: 'Dados incompletos: name, score e mode são obrigatórios' },
                { status: 400 }
            );
        }

        if (typeof score !== 'number' || isNaN(score) || score < 0) {
            console.error('❌ Score inválido:', score);
            return NextResponse.json(
                { error: 'Score deve ser um número válido e positivo' },
                { status: 400 }
            );
        }

        // Verifica se o db está disponível
        if (!db) {
            console.error('❌ Firebase não inicializado!');
            return NextResponse.json(
                { error: 'Banco de dados não disponível' },
                { status: 500 }
            );
        }

        const rankingRef = collection(db, 'ranking');
        
        // Cria o documento
        const docData = {
            name: name.trim(),
            score: Math.round(score),
            mode: mode.trim(),
            difficulty: difficulty || null,
            date: date || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        console.log('💾 Salvando no Firebase:', docData);

        const docRef = await addDoc(rankingRef, docData);
        console.log('✅ Documento criado com ID:', docRef.id);

        return NextResponse.json({
            success: true,
            message: 'Pontuação salva com sucesso!',
            id: docRef.id
        });

    } catch (error) {
        console.error("❌ Erro interno ao salvar pontuação:", error);
        return NextResponse.json(
            { error: 'Erro ao salvar a pontuação: ' + (error as Error).message },
            { status: 500 }
        );
    }
}