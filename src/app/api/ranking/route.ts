import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, limit, where, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
                limit(1) // 🔥 Só precisa do melhor score
            );
        } else {
            // Busca geral - pega os melhores de cada jogador
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
            
            // 🔥 Agora só pega o melhor de cada dificuldade
            // Busca separadamente por dificuldade
            for (const diff of ['easy', 'medium', 'hard']) {
                const diffQuery = query(
                    rankingRef,
                    where('name', '==', name),
                    where('mode', '==', mode),
                    where('difficulty', '==', diff),
                    orderBy('score', 'desc'),
                    limit(1)
                );
                const diffSnapshot = await getDocs(diffQuery);
                if (!diffSnapshot.empty) {
                    scores[diff as keyof typeof scores] = diffSnapshot.docs[0].data().score || 0;
                }
            }
            
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
// MÉTODO POST: Salva a pontuação no Firebase (APENAS MELHOR SCORE)
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
        const newScore = Math.round(score);
        const userName = name.trim();
        const userMode = mode.trim();
        const userDifficulty = difficulty || null;

        // 🔥 BUSCA SE JÁ EXISTE UM SCORE PARA ESTE JOGADOR + MODO + DIFICULDADE
        const existingQuery = query(
            rankingRef,
            where('name', '==', userName),
            where('mode', '==', userMode),
            where('difficulty', '==', userDifficulty),
            limit(1)
        );
        
        const existingSnapshot = await getDocs(existingQuery);

        // ============================================================ //
        // SE JÁ EXISTE, VERIFICA SE O NOVO SCORE É MAIOR
        // ============================================================ //
        if (!existingSnapshot.empty) {
            const docRef = existingSnapshot.docs[0].ref;
            const currentData = existingSnapshot.docs[0].data();
            const currentScore = currentData.score || 0;
            
            console.log(`📊 Score atual: ${currentScore}, Novo score: ${newScore}`);
            
            // 🔥 SÓ ATUALIZA SE O NOVO SCORE FOR MAIOR
            if (newScore > currentScore) {
                await updateDoc(docRef, {
                    score: newScore,
                    date: date || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                
                console.log('✅ Score atualizado com sucesso! (Novo recorde)');
                return NextResponse.json({
                    success: true,
                    updated: true,
                    message: '🎉 Novo recorde!',
                    previousScore: currentScore,
                    newScore: newScore
                });
            }
            
            // 🔥 SCORE MENOR OU IGUAL - NÃO SALVA
            console.log('⏭️ Score menor ou igual ao atual, NÃO salvo');
            return NextResponse.json({
                success: false,
                updated: false,
                message: 'Score menor que o recorde atual',
                currentBest: currentScore,
                attempted: newScore
            });
        }

        // ============================================================ //
        // NÃO EXISTE - CRIA NOVO DOCUMENTO
        // ============================================================ //
        const docData = {
            name: userName,
            score: newScore,
            mode: userMode,
            difficulty: userDifficulty,
            date: date || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('💾 Criando novo documento (primeira partida):', docData);

        const docRef = await addDoc(rankingRef, docData);
        console.log('✅ Documento criado com ID:', docRef.id);

        return NextResponse.json({
            success: true,
            created: true,
            message: '🏆 Primeira partida salva!',
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