import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// ============================================================================ //
// Esta rota guarda o PROGRESSO em andamento do Simulado (fila de questões,
// score parcial, streak, medalhas, questão atual) em uma coleção separada
// da tabela de ranking. O documento é indexado pelo userId da CONTA, e não
// pelo navegador/localStorage — por isso o progresso sobrevive a logout,
// troca de dispositivo ou limpeza de cache.
// ============================================================================ //

const COLLECTION_NAME = 'simulado_progress';

// ============================================================================ //
// MÉTODO GET: Busca o progresso salvo de um usuário
// ============================================================================ //
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId é obrigatório' },
                { status: 400 }
            );
        }

        if (!db) {
            console.error('❌ Firebase não inicializado!');
            return NextResponse.json(
                { error: 'Banco de dados não disponível' },
                { status: 500 }
            );
        }

        const progressRef = doc(db, COLLECTION_NAME, userId);
        const snapshot = await getDoc(progressRef);

        if (!snapshot.exists()) {
            return NextResponse.json({ progress: null });
        }

        return NextResponse.json({ progress: snapshot.data() });

    } catch (error) {
        console.error('❌ Erro ao buscar progresso do simulado:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar progresso: ' + (error as Error).message },
            { status: 500 }
        );
    }
}

// ============================================================================ //
// MÉTODO POST: Salva/atualiza o progresso em andamento de um usuário
// ============================================================================ //
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            userId,
            playerName,
            questionQueue,
            skippedQuestions,
            currentQuestion,
            score,
            streak,
            medals
        } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId é obrigatório' },
                { status: 400 }
            );
        }

        if (!db) {
            console.error('❌ Firebase não inicializado!');
            return NextResponse.json(
                { error: 'Banco de dados não disponível' },
                { status: 500 }
            );
        }

        const progressRef = doc(db, COLLECTION_NAME, userId);

        await setDoc(progressRef, {
            userId,
            playerName: playerName || '',
            questionQueue: questionQueue || [],
            skippedQuestions: skippedQuestions || [],
            currentQuestion: currentQuestion || null,
            score: typeof score === 'number' ? score : 0,
            streak: typeof streak === 'number' ? streak : 0,
            medals: medals || [],
            updatedAt: serverTimestamp()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Erro ao salvar progresso do simulado:', error);
        return NextResponse.json(
            { error: 'Erro ao salvar progresso: ' + (error as Error).message },
            { status: 500 }
        );
    }
}

// ============================================================================ //
// MÉTODO DELETE: Remove o progresso salvo (chamado quando o simulado termina)
// ============================================================================ //
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId é obrigatório' },
                { status: 400 }
            );
        }

        if (!db) {
            console.error('❌ Firebase não inicializado!');
            return NextResponse.json(
                { error: 'Banco de dados não disponível' },
                { status: 500 }
            );
        }

        const progressRef = doc(db, COLLECTION_NAME, userId);
        await deleteDoc(progressRef);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Erro ao remover progresso do simulado:', error);
        return NextResponse.json(
            { error: 'Erro ao remover progresso: ' + (error as Error).message },
            { status: 500 }
        );
    }
}