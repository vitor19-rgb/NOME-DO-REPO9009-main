"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    CheckCircle2, XCircle, BookOpen, ArrowRight, Info,
    User, HelpCircle, ArrowLeft, AlertTriangle, RefreshCw, 
    MousePointerClick, BrainCircuit, Flame, Award, Medal, Trophy, Star, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// 1. IMPORTAÇÃO DO SEU JSON
import simuladoData from '@/lib/geografia_simulado.json';

interface CorridaPendularGameProps {
    playerName: string;
    userId?: string;
    onComplete?: () => void;
    onSaveScore?: (score: number) => void;
}

// 2. PREPARANDO TODAS AS QUESTÕES
const TODAS_QUESTOES = Object.values(simuladoData).flat();

console.log('📚 Total de questões carregadas:', TODAS_QUESTOES.length);

const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- FUNÇÃO PARA SALVAR NO BANCO DE DADOS ---
const saveSimuladoScore = async (playerName: string, userId: string | undefined, score: number): Promise<boolean> => {
    console.log('💾 Salvando pontuação do Simulado:', { playerName, userId, score });

    const finalUserId = userId || '';

    let saved = false;

    // 1. SALVAR NO LOCAL STORAGE
    try {
        if (typeof window !== 'undefined') {
            const leaderboardKey = 'bioguesser_leaderboard';
            let leaderboard: any[] = [];
            
            try {
                const existingData = localStorage.getItem(leaderboardKey);
                if (existingData) {
                    const parsed = JSON.parse(existingData);
                    if (Array.isArray(parsed)) {
                        leaderboard = parsed;
                    }
                }
            } catch (parseError) {
                console.warn('⚠️ Erro ao parsear localStorage');
                leaderboard = [];
            }

            const existingIndex = leaderboard.findIndex(
                (entry: any) => 
                    entry && 
                    ((entry.userId && entry.userId === finalUserId) || 
                     (entry.name === playerName && entry.mode === 'Trilha do Simulado Enem'))
            );
            
            if (existingIndex !== -1 && leaderboard[existingIndex]) {
                const currentScore = leaderboard[existingIndex].score || 0;
                if (score > currentScore) {
                    leaderboard[existingIndex].score = score;
                    leaderboard[existingIndex].date = new Date().toISOString();
                    if (finalUserId) leaderboard[existingIndex].userId = finalUserId;
                    saved = true;
                } else {
                    return true;
                }
            } else {
                const newEntry: any = {
                    name: playerName,
                    score: score,
                    mode: 'Trilha do Simulado Enem',
                    date: new Date().toISOString()
                };
                if (finalUserId) newEntry.userId = finalUserId;
                leaderboard.push(newEntry);
                saved = true;
            }
            
            leaderboard.sort((a: any, b: any) => (b?.score || 0) - (a?.score || 0));
            localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
            console.log('✅ Pontuação salva no localStorage!');
        }
    } catch (localError) {
        console.error('❌ Erro ao salvar no localStorage:', localError);
    }

    if (!saved) {
        console.log('ℹ️ Pontuação não é recorde, pulando API');
        return true;
    }

    // 2. TENTAR SALVAR NO BANCO DE DADOS
    try {
        console.log('🌐 Salvando novo recorde no banco de dados...');
        
        const response = await fetch('/api/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: playerName,
                userId: finalUserId,
                score: score,
                mode: 'Trilha do Simulado Enem',
                date: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            console.warn('⚠️ API retornou erro:', await response.text());
            return true;
        }

        console.log('✅ Novo recorde salvo no banco de dados!');
        return true;

    } catch (error) {
        console.warn('⚠️ Erro ao salvar no banco:', error);
        return true;
    }
};

// --- FUNÇÕES DE PROGRESSO (BANCO DE DADOS, NÃO LOCALSTORAGE) ---
// O progresso em andamento (fila de questões, score parcial, streak, medalhas)
// é salvo na coleção `simulado_progress`, indexado pelo userId da CONTA.
// Isso garante que ao sair e entrar novamente (mesmo em outro dispositivo),
// o simulado é restaurado exatamente de onde parou.
const loadProgressFromDatabase = async (userId: string): Promise<any | null> => {
    try {
        const response = await fetch(`/api/simulado-progress?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) {
            console.warn('⚠️ Falha ao buscar progresso no banco de dados:', await response.text());
            return null;
        }
        const data = await response.json();
        return data.progress || null;
    } catch (error) {
        console.error('❌ Erro ao buscar progresso no banco de dados:', error);
        return null;
    }
};

const saveProgressToDatabase = async (userId: string, payload: {
    playerName: string;
    questionQueue: any[];
    skippedQuestions: any[];
    currentQuestion: any | null;
    score: number;
    streak: number;
    medals: string[];
}): Promise<void> => {
    try {
        const response = await fetch('/api/simulado-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...payload }),
        });
        if (!response.ok) {
            console.warn('⚠️ Falha ao salvar progresso no banco de dados:', await response.text());
        }
    } catch (error) {
        console.error('❌ Erro ao salvar progresso no banco de dados:', error);
    }
};

const clearProgressFromDatabase = async (userId: string): Promise<void> => {
    try {
        await fetch(`/api/simulado-progress?userId=${encodeURIComponent(userId)}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('❌ Erro ao limpar progresso no banco de dados:', error);
    }
};

// --- COMPONENTE DE IMAGEM ---
const QuestionImage = ({ url }: { url: string }) => {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className="my-3 p-3 rounded-lg border border-red-500/40 bg-red-900/20 text-red-300 text-xs">
                <p className="font-bold mb-1">⚠️ Não foi possível carregar a imagem:</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline break-all">{url}</a>
            </div>
        );
    }

    return (
        <img
            src={url}
            alt="Imagem da questão"
            className="my-3 max-w-full rounded-lg border border-slate-700/50 mx-auto block"
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
};

// --- RENDERIZADOR DE CONTEXTO ---
const renderContextWithImages = (text: string) => {
    if (!text) return null;

    const imageRegex = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
    const parts: (string | { url: string })[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = imageRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push({ url: match[1] });
        lastIndex = imageRegex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    if (parts.length === 1 && typeof parts[0] === 'string') {
        return text;
    }

    return parts.map((part, i) => {
        if (typeof part === 'string') {
            if (!part.trim()) return null;
            return <span key={i} className="whitespace-pre-wrap">{part}</span>;
        }
        return <QuestionImage key={i} url={part.url} />;
    });
};

// --- SISTEMA DE RANKS ---
const getPlayerRank = (currentScore: number) => {
    if (currentScore >= 5000) return { title: "Geógrafo Master", color: "text-red-400 bg-red-900/30 border-red-500/50", icon: <Star size={16} className="text-red-400"/> };
    if (currentScore >= 2500) return { title: "Lenda da Geografia", color: "text-fuchsia-400 bg-fuchsia-900/30 border-fuchsia-500/50", icon: <Star size={16} className="text-fuchsia-400"/> };
    if (currentScore >= 1000) return { title: "Especialista Regional", color: "text-purple-400 bg-purple-900/30 border-purple-500/50", icon: <Medal size={16} className="text-purple-400"/> };
    if (currentScore >= 500) return { title: "Geógrafo Intermediário", color: "text-blue-400 bg-blue-900/30 border-blue-500/50", icon: <Award size={16} className="text-blue-400"/> };
    if (currentScore >= 250) return { title: "Iniciante Avançado", color: "text-cyan-400 bg-cyan-900/30 border-cyan-500/50", icon: <Award size={16} className="text-cyan-400"/> };
    if (currentScore >= 100) return { title: "Iniciante", color: "text-emerald-400 bg-emerald-900/30 border-emerald-500/50", icon: <Award size={16} className="text-emerald-400"/> };
    return { title: "Explorador Novato", color: "text-slate-400 bg-slate-800/50 border-slate-600", icon: <BookOpen size={16} className="text-slate-400"/> };
};

export default function CorridaPendularGame({ playerName, userId, onComplete, onSaveScore }: CorridaPendularGameProps) {
    const [isLoaded, setIsLoaded] = useState(false); 
    const [status, setStatus] = useState<'intro' | 'playing' | 'feedback' | 'victory'>('intro');
    
    const [questionQueue, setQuestionQueue] = useState<any[]>([]);
    const [skippedQuestions, setSkippedQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
    
    const [score, setScore] = useState(0); 
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    
    const [iaFeedback, setIaFeedback] = useState<string | null>(null);
    const [isLoadingIA, setIsLoadingIA] = useState(false);

    const [streak, setStreak] = useState(0); 
    const [medals, setMedals] = useState<string[]>([]); 
    const [bestScore, setBestScore] = useState(0);
    
    const [isSaving, setIsSaving] = useState(false);
    const [scoreSaved, setScoreSaved] = useState(false);

    // Controla o debounce de gravação do progresso no banco de dados,
    // evitando um POST a cada re-render.
    const progressSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentRank = getPlayerRank(score);

    // 3. CARREGAMENTO INICIAL
    useEffect(() => {
        console.log('🔍 Iniciando carregamento do simulado...');
        console.log('📚 Total de questões disponíveis:', TODAS_QUESTOES.length);
        
        if (TODAS_QUESTOES.length === 0) {
            console.error('❌ NENHUMA QUESTÃO CARREGADA! Verifique o arquivo JSON.');
            toast({
                title: "Erro ao carregar questões",
                description: "Não foi possível carregar o simulado. Tente novamente.",
                variant: "destructive"
            });
            return;
        }

        const loadData = async () => {
            // Recorde pessoal (best score) — mantém a leitura do cache local do ranking
            const leaderboardData = localStorage.getItem('bioguesser_leaderboard');
            if (leaderboardData) {
                try {
                    const leaderboard = JSON.parse(leaderboardData);
                    const myEntry = leaderboard.find((entry: any) => 
                        (entry.userId && entry.userId === userId) || 
                        (entry.name === playerName && entry.mode === 'Trilha do Simulado Enem')
                    );
                    if (myEntry) {
                        setBestScore(myEntry.score);
                        console.log('🏆 Recorde carregado:', myEntry.score);
                    }
                } catch (e) {
                    console.error("Erro ao ler ranking global", e);
                }
            }

            // ------------------------------------------------------------------ //
            // PROGRESSO DO SIMULADO (fila de questões, score parcial, streak...)
            // ------------------------------------------------------------------ //
            let session: any = null;

            if (userId) {
                // ✅ Conta logada: o progresso vem do BANCO DE DADOS, vinculado ao
                // userId. Assim, mesmo saindo da conta e entrando de novo (ou em
                // outro dispositivo/navegador), o simulado continua de onde parou.
                console.log('🌐 Buscando progresso salvo no banco de dados para userId:', userId);
                session = await loadProgressFromDatabase(userId);

                if (session) {
                    console.log('📂 Progresso encontrado no banco de dados:', {
                        questionQueue: session.questionQueue?.length || 0,
                        skippedQuestions: session.skippedQuestions?.length || 0,
                        score: session.score
                    });
                } else {
                    console.log('ℹ️ Nenhum progresso salvo no banco de dados para este usuário.');
                }
            } else {
                // Sem conta (modo convidado): não há userId para indexar no banco,
                // então o único lugar possível para continuar a sessão é o
                // localStorage deste mesmo navegador.
                console.log('👤 Usuário sem conta (convidado) — usando cache local do navegador.');
                const savedSessionStr = localStorage.getItem(`@BioGuesser_Session_${playerName}`);
                if (savedSessionStr) {
                    try {
                        session = JSON.parse(savedSessionStr);
                    } catch (e) {
                        console.error('❌ Erro ao restaurar sessão local:', e);
                        session = null;
                    }
                }
            }

            const temQuestaoNaFila = session?.questionQueue && session.questionQueue.length > 0;
            const temQuestaoAtual = !!session?.currentQuestion;

            if (session && (temQuestaoNaFila || temQuestaoAtual)) {
                if (temQuestaoNaFila) {
                    setCurrentQuestion(session.questionQueue[0]);
                    setQuestionQueue(session.questionQueue.slice(1));
                } else {
                    setCurrentQuestion(session.currentQuestion);
                    setQuestionQueue([]);
                }

                setSkippedQuestions(session.skippedQuestions || []);
                setScore(session.score || 0);
                setStreak(session.streak || 0);
                setMedals(session.medals || []);

                console.log('✅ Progresso restaurado com sucesso!');
            } else {
                console.log('🆕 Nenhum progresso salvo, iniciando novo jogo...');
                iniciarNovoJogo();
            }
            
            setIsLoaded(true);
        };
        
        loadData();
    }, [playerName, userId]);

    // 4. SALVAMENTO AUTOMÁTICO DO PROGRESSO
    // Com conta (userId): grava no BANCO DE DADOS (debounced) — é isso que
    // permite retomar o simulado após logout/login ou troca de dispositivo.
    // Sem conta (convidado): mantém o localStorage como único recurso disponível.
    useEffect(() => {
        if (!isLoaded) return;

        if (status === 'victory') {
            if (progressSaveTimeoutRef.current) {
                clearTimeout(progressSaveTimeoutRef.current);
                progressSaveTimeoutRef.current = null;
            }
            if (userId) {
                clearProgressFromDatabase(userId);
            } else {
                localStorage.removeItem(`@BioGuesser_Session_${playerName}`);
            }
            return;
        }

        // Só salva se tiver dados válidos
        if (currentQuestion || questionQueue.length > 0) {
            const session = {
                playerName,
                questionQueue,
                skippedQuestions,
                currentQuestion,
                score,
                streak,
                medals
            };

            if (userId) {
                // Debounce: agrupa gravações rápidas (ex: cliques seguidos) em uma
                // única escrita no banco, ~800ms após a última mudança de estado.
                if (progressSaveTimeoutRef.current) {
                    clearTimeout(progressSaveTimeoutRef.current);
                }
                progressSaveTimeoutRef.current = setTimeout(() => {
                    saveProgressToDatabase(userId, session);
                }, 800);
            } else {
                localStorage.setItem(`@BioGuesser_Session_${playerName}`, JSON.stringify(session));
            }
        }
    }, [questionQueue, skippedQuestions, currentQuestion, score, streak, medals, status, playerName, userId, isLoaded]);

    // Garante que nenhum timeout de gravação fique pendente após desmontar o componente
    useEffect(() => {
        return () => {
            if (progressSaveTimeoutRef.current) {
                clearTimeout(progressSaveTimeoutRef.current);
            }
        };
    }, []);

    // 5. SALVAR PONTUAÇÃO QUANDO O JOGO TERMINA
    useEffect(() => {
        const saveScoreIfNeeded = async () => {
            if (status === 'victory' && !scoreSaved && !isSaving) {
                setIsSaving(true);
                
                try {
                    const success = await saveSimuladoScore(playerName, userId, score);
                    
                    setScoreSaved(true);
                    
                    if (onSaveScore) {
                        onSaveScore(score);
                    }
                    
                    if (score > bestScore) {
                        toast({
                            title: "🏆 Novo Recorde!",
                            description: `Você alcançou ${score} pontos no Simulado!`,
                            variant: "default"
                        });
                    } else {
                        toast({
                            title: "✅ Pontuação Salva!",
                            description: `Você alcançou ${score} pontos. Seu recorde é ${bestScore}.`,
                            variant: "default"
                        });
                    }
                } catch (error) {
                    console.error('❌ Erro ao salvar pontuação:', error);
                    setScoreSaved(true);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        saveScoreIfNeeded();
    }, [status, score, playerName, userId, onSaveScore, scoreSaved, isSaving, bestScore]);

    const iniciarNovoJogo = () => {
        console.log('🔄 Iniciando novo jogo...');
        
        if (TODAS_QUESTOES.length === 0) {
            console.error('❌ Não há questões para iniciar o jogo!');
            return;
        }
        
        const embaralhadas = shuffleArray(TODAS_QUESTOES);
        console.log('📊 Questões embaralhadas:', embaralhadas.length);
        
        // Pega a primeira questão
        const primeiraQuestao = embaralhadas[0];
        console.log('📝 Primeira questão:', primeiraQuestao?.title || 'N/A');
        
        setQuestionQueue(embaralhadas.slice(1));
        setCurrentQuestion(primeiraQuestao);
        setSkippedQuestions([]);
        setScore(0);
        setStreak(0);
        setMedals([]);
        setScoreSaved(false);
    };

    const handleExitAndSave = async () => {
        // Grava imediatamente o progresso atual no banco de dados, sem esperar
        // o debounce, para garantir que a última resposta/pulo não se perca
        // caso o usuário saia da conta logo em seguida.
        if (userId && status !== 'intro' && status !== 'victory' && (currentQuestion || questionQueue.length > 0)) {
            if (progressSaveTimeoutRef.current) {
                clearTimeout(progressSaveTimeoutRef.current);
                progressSaveTimeoutRef.current = null;
            }
            await saveProgressToDatabase(userId, {
                playerName,
                questionQueue,
                skippedQuestions,
                currentQuestion,
                score,
                streak,
                medals
            });
        }

        if (score > 0 && !scoreSaved && status !== 'intro') {
            setIsSaving(true);
            try {
                await saveSimuladoScore(playerName, userId, score);
                setScoreSaved(true);
                if (onSaveScore) {
                    onSaveScore(score);
                }
            } catch (error) {
                console.error('Erro ao salvar ao sair:', error);
            } finally {
                setIsSaving(false);
            }
        }
        
        if (onComplete) {
            onComplete();
        }
    };

    const handleAnswer = async (index: number) => {
        if (!currentQuestion) {
            console.error('❌ Nenhuma questão atual para responder!');
            return;
        }
        
        setSelectedAnswer(index);
        const opcaoEscolhida = currentQuestion.alternatives[index];
        const correct = opcaoEscolhida.isCorrect;
        setIsCorrect(correct);
        
        if (correct) {
            setScore(prev => prev + 25); 
            
            const newStreak = streak + 1;
            setStreak(newStreak);
            
            let mensagemMedalha = "";
            
            if (newStreak === 3 && !medals.includes("🔥 Em Chamas (3 seguidas)")) {
                setMedals(prev => [...prev, "🔥 Em Chamas (3 seguidas)"]);
                mensagemMedalha = " INCRÍVEL! Você ganhou a medalha 'Em Chamas' por 3 acertos seguidos!";
            } else if (newStreak === 5 && !medals.includes("🏆 Geógrafo de Ouro (5 seguidas)")) {
                setMedals(prev => [...prev, "🏆 Geógrafo de Ouro (5 seguidas)"]);
                mensagemMedalha = " FANTÁSTICO! Você é um Geógrafo de Ouro por acertar 5 seguidas!";
            }

            setIaFeedback("Resposta Exata! Você dominou a interpretação dessa questão." + mensagemMedalha);
            setStatus('feedback');
            
        } else {
            setScore(prev => Math.max(0, prev - 10)); 
            setStreak(0); 
            
            setStatus('feedback'); 
            setIsLoadingIA(true); 
            
            const correctOpt = currentQuestion.alternatives.find((opt: any) => opt.isCorrect);

            try {
                const resposta = await fetch('/api/explicacao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tema: "Geografia ENEM " + currentQuestion.year,
                        pergunta: currentQuestion.alternativesIntroduction,
                        respostaErrada: opcaoEscolhida.text,
                        respostaCorreta: correctOpt?.text || ""
                    })
                });

                const dados = await resposta.json();
                
                if (resposta.ok) {
                    setIaFeedback(dados.explicacao); 
                } else {
                    console.error("Erro retornado pela API:", dados);
                    setIaFeedback(dados.error || "Erro de permissão com a IA. Verifique sua chave de API.");
                }

            } catch (erro) {
                console.error("Erro ao chamar IA:", erro);
                setIaFeedback("Ops! Nossa IA professora de Geografia perdeu o sinal. Lembre-se de revisar os conceitos!");
            } finally {
                setIsLoadingIA(false);
            }
        }
    };

    const handleNextAction = () => {
        if (isCorrect) {
            goToNextQuestion();
        } else {
            resetTurn();
        }
    };

    const goToNextQuestion = () => {
        if (questionQueue.length > 0) {
            const nextQuestion = questionQueue[0];
            setCurrentQuestion(nextQuestion);
            setQuestionQueue(prev => prev.slice(1));
            resetTurn();
        } else if (skippedQuestions.length > 0) {
            const shuffledSkipped = shuffleArray(skippedQuestions);
            setQuestionQueue(shuffledSkipped.slice(1));
            setCurrentQuestion(shuffledSkipped[0]);
            setSkippedQuestions([]);
            resetTurn();
        } else {
            setStatus('victory');
        }
    };

    const handleSkipQuestion = () => {
        if (!currentQuestion) return;
        
        setSkippedQuestions(prev => [...prev, currentQuestion]);
        setStreak(0);
        
        if (questionQueue.length > 0) {
            const nextQuestion = questionQueue[0];
            setCurrentQuestion(nextQuestion);
            setQuestionQueue(prev => prev.slice(1));
            resetTurn();
        } else if (skippedQuestions.length > 0) {
            const shuffledSkipped = shuffleArray(skippedQuestions);
            setQuestionQueue(shuffledSkipped.slice(1));
            setCurrentQuestion(shuffledSkipped[0]);
            setSkippedQuestions([]);
            resetTurn();
        } else {
            setStatus('victory');
        }
    };

    const resetTurn = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIaFeedback(null);
        setStatus('playing');
    }

    const EnemHelpPanel = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-purple-900/40 border-purple-500/50 text-purple-200 hover:bg-purple-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm transition-colors">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> 
                    <span className="hidden sm:inline">Regras e Ajuda</span>
                    <span className="sm:hidden">Ajuda</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 text-white border-l-slate-700 w-full sm:max-w-lg p-0">
                <div className="p-6 h-full overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                            <MousePointerClick className="text-purple-400" size={24}/>
                        </div>
                        <h2 className="text-2xl font-black text-white">Como Funciona</h2>
                    </div>
                    <div className="space-y-4 text-left mb-8">
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            Seu objetivo é acertar o maior número de questões reais do ENEM para evoluir o seu <strong>Rank Geográfico</strong> e ganhar medalhas!
                        </p>
                        <ul className="space-y-3 text-[14px] text-slate-300 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                            <li><strong>Acertou:</strong> +25 Pontos e mantém sua sequência.</li>
                            <li><strong>Errou:</strong> -10 Pontos, perde a sequência e a <strong>IA Tutora</strong> te guia para a resposta certa.</li>
                            <li><strong>Pulou:</strong> A questão vai para o final da fila e será respondida depois!</li>
                            <li><strong>Evolução:</strong> Comece como Novato e tente alcançar os cobiçados 5000 pontos para se tornar um <strong>Geógrafo Master</strong>!</li>
                            <li><strong>Progresso:</strong> Se precisar sair, o seu progresso fica salvo automaticamente!</li>
                        </ul>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    // Verifica se está carregando
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                    <p className="text-slate-400 font-medium">Carregando simulado...</p>
                </div>
            </div>
        );
    }

    // Verifica se tem questões
    if (TODAS_QUESTOES.length === 0) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-red-500/50 rounded-3xl p-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-white mb-4">Erro ao carregar questões</h2>
                    <p className="text-slate-400 mb-6">Não foi possível carregar o simulado. Verifique se o arquivo JSON está no local correto.</p>
                    <Button onClick={() => window.location.reload()} className="w-full bg-purple-600 hover:bg-purple-500">
                        Recarregar Página
                    </Button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (status === 'intro') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-4 py-10 overflow-y-auto w-full">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-purple-600/20 p-4 rounded-3xl border border-purple-500/30">
                                <Award className="w-12 h-12 text-purple-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3">Simulado Geográfico</h1>
                        
                        {currentQuestion ? (
                            <p className="text-emerald-300 font-bold text-base md:text-lg mb-6 leading-relaxed bg-emerald-900/30 p-4 rounded-xl">
                                Bem-vindo, <strong>{playerName}</strong>! Vamos ir a sua jornada.
                            </p>
                        ) : (
                            <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
                                Olá, <strong>{playerName}</strong>! Acumule pontos, suba de patente e prove que você domina a Geografia.
                            </p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                            {bestScore > 0 && (
                                <div className="bg-purple-900/30 border border-purple-500/30 text-purple-300 p-4 rounded-xl flex items-center justify-center gap-2 font-bold flex-1">
                                    <Trophy size={20} className="text-yellow-400" />
                                    Recorde: {bestScore} pts
                                </div>
                            )}
                            <div className={`p-4 rounded-xl flex items-center justify-center gap-2 font-black flex-1 border ${currentRank.color}`}>
                                {currentRank.icon}
                                Rank Atual: {currentRank.title}
                            </div>
                        </div>

                        <Button onClick={() => setStatus('playing')} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-7 text-xl rounded-xl transition-transform hover:scale-105 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                            {currentQuestion ? "ir ao Desafio" : "Iniciar Desafio"}
                        </Button>
                    </motion.div>
                </div>
            );
        }

        if (status === 'victory') {
            const totalRespondidas = TODAS_QUESTOES.length - questionQueue.length - skippedQuestions.length;
            
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 max-w-2xl bg-slate-900 border-2 border-purple-500/50 rounded-[2rem] shadow-[0_0_50px_rgba(147,51,234,0.2)] w-full">
                        <CheckCircle2 className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        <h1 className="text-4xl md:text-5xl font-black text-purple-400 mb-4">Simulado Concluído!</h1>
                        
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6 flex flex-col items-center">
                            <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Pontuação Final</span>
                            <span className="text-6xl font-black text-yellow-400 drop-shadow-md">{score} pts</span>
                            
                            <div className={`mt-4 px-4 py-2 rounded-full border flex items-center gap-2 font-black ${currentRank.color}`}>
                                {currentRank.icon}
                                {currentRank.title}
                            </div>

                            {score > bestScore && bestScore > 0 && (
                                <span className="text-emerald-400 font-bold mt-4 animate-pulse">🎉 Novo Recorde Alcançado!</span>
                            )}
                            
                            <div className="text-slate-400 text-sm mt-4">
                                {totalRespondidas} questões respondidas
                            </div>
                        </div>

                        {medals.length > 0 && (
                            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-8 text-left">
                                <h3 className="text-sm text-slate-400 font-bold uppercase mb-3 flex items-center gap-2">
                                    <Medal className="text-purple-400" size={16}/> Suas Conquistas
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {medals.map((medal, idx) => (
                                        <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-purple-300 font-bold text-sm">
                                            {medal}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isSaving ? (
                            <div className="flex items-center justify-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-6 py-4 mb-4">
                                <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                                <p className="text-yellow-400 font-bold">Salvando sua pontuação...</p>
                            </div>
                        ) : scoreSaved ? (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl px-6 py-3 mb-4">
                                <p className="text-green-400 font-bold">✅ Pontuação salva com sucesso!</p>
                            </div>
                        ) : null}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                onClick={handleExitAndSave} 
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-7 text-lg rounded-xl"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Salvando...' : 'Ver Resultado Final'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        if (status === 'feedback' && selectedAnswer !== null && currentQuestion) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                            {isCorrect ? (
                                <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400"><CheckCircle2 size={32}/></div>
                            ) : (
                                <div className="bg-red-500/20 p-3 rounded-full text-red-400"><XCircle size={32}/></div>
                            )}
                            <div>
                                <h2 className={`text-2xl font-black ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isCorrect ? 'Você Acertou!' : 'Atenção ao Erro!'}
                                </h2>
                                <p className="text-slate-400 text-sm font-bold mt-1">
                                    {isCorrect ? '+25 PTS' : '-10 PTS (Penalidade)'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <BrainCircuit className={isCorrect ? "text-emerald-400" : "text-purple-400"}/> 
                                {isCorrect ? 'Feedback:' : 'IA Tutora analisando sua resposta:'}
                            </h3>
                            
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 min-h-[100px] flex items-center">
                                {isLoadingIA ? (
                                    <div className="flex items-center gap-3 text-purple-400 font-bold animate-pulse w-full justify-center">
                                        <RefreshCw className="animate-spin" size={20} />
                                        A IA está pensando na explicação...
                                    </div>
                                ) : (
                                    <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                                        {iaFeedback}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                disabled={isLoadingIA}
                                onClick={handleNextAction} 
                                className={`flex-1 text-white font-black py-7 text-lg rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 ${isCorrect ? 'bg-purple-600 hover:bg-purple-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                            >
                                {isCorrect 
                                    ? (questionQueue.length > 0 || skippedQuestions.length > 0 ? <>Próxima Pergunta <ArrowRight size={20}/></> : 'Finalizar Simulado') 
                                    : <>Tentar Novamente <RefreshCw size={20}/></>
                                } 
                            </Button>
                            
                            {!isCorrect && !isLoadingIA && (
                                <Button 
                                    variant="outline" 
                                    onClick={handleSkipQuestion} 
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 py-7 text-lg rounded-xl flex items-center justify-center gap-2"
                                >
                                    Pular Pergunta <ArrowRight size={20}/>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            );
        }

       if (status === 'playing' && currentQuestion) {
    // Cálculo das variáveis de progresso mantido da versão nova
    const totalQuestoes = TODAS_QUESTOES.length;
    const respondidas = totalQuestoes - questionQueue.length - skippedQuestions.length - 1;
    
    return (
        <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-12 w-full">
            <div className="max-w-4xl w-full flex-1 flex flex-col">
                
                <motion.div 
                    key={currentQuestion.title || 'questao'}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex flex-col"
                >
                    {/* 1. Cabeçalho Responsivo (com dados de pulo e contadores) */}
                    <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 bg-purple-900/30 text-purple-300 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-500/30 shadow-sm">
                            <BookOpen size={16}/> {currentQuestion.title || 'Questão'}
                        </div>
                        <div className="flex items-center gap-3">
                            {skippedQuestions.length > 0 && (
                                <span className="text-amber-400 text-xs font-bold bg-amber-900/30 px-3 py-1 rounded-full border border-amber-500/30">
                                    ⏭️ {skippedQuestions.length} puladas
                                </span>
                            )}
                            <span className="text-slate-400 font-bold text-sm">
                                {Math.max(0, respondidas + 1)} / {totalQuestoes}
                            </span>
                        </div>
                    </div>
                    
                    {/* 2. Área de Contexto / Texto da Pergunta */}
                    <div className="mb-6 bg-slate-800/40 p-4 md:p-6 rounded-2xl border border-slate-700/50 max-h-48 md:max-h-64 overflow-y-auto custom-scrollbar">
                        <div className="text-slate-300 text-sm md:text-base leading-relaxed">
                            {renderContextWithImages(currentQuestion.context || '')}
                        </div>
                    </div>

                    {/* 3. Introdução para as alternativas */}
                    {/* Ajustado de mb-6 para mb-4 para melhorar a proximidade com os botões */}
                    <div className="mb-4">
                        <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
                            {currentQuestion.alternativesIntroduction || 'Selecione uma alternativa:'}
                        </h2>
                    </div>

                    {/* 4. Lista de Alternativas (CORREÇÃO APLICADA AQUI) */}
                    {/* Removido o 'mt-auto' que causava o espaço exagerado no mobile */}
                    <div className="flex flex-col gap-3 mb-6">
                        {currentQuestion.alternatives && currentQuestion.alternatives.map((option: any, index: number) => {
                            const isSelected = selectedAnswer === index;
                            let btnStyle = "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-purple-400 text-slate-200";
                            
                            // Lógica de cores baseada em acerto/erro (mantida intacta)
                            if (selectedAnswer !== null) {
                                if (isSelected) {
                                    btnStyle = isCorrect 
                                        ? "bg-purple-900/80 border-purple-500 text-purple-100" 
                                        : "bg-red-900/80 border-red-500 text-red-100";
                                } else {
                                    btnStyle = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    disabled={selectedAnswer !== null}
                                    onClick={() => handleAnswer(index)}
                                    className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 font-medium shadow-sm ${btnStyle}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <span className="font-black opacity-50 mt-0.5">
                                            {option.letter || String.fromCharCode(65 + index)}.
                                        </span>
                                        <span className="leading-relaxed text-sm md:text-base">
                                            {option.text || 'Opção sem texto'}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

        return null;
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden">
            <header className="bg-[#0A1024]/95 border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center shadow-2xl sticky top-0 z-50 backdrop-blur-md w-full">
                <div className="flex items-center gap-3">
                    <button onClick={handleExitAndSave} className="flex items-center gap-3 transition-transform active:scale-95 group">
                        <div className="bg-purple-600 p-2 rounded-full shadow-lg shadow-purple-900/20 group-hover:-translate-x-1 transition-transform">
                            <ArrowLeft className="text-white w-5 h-5" />
                        </div>
                        <span className="text-white font-black text-xl md:text-2xl tracking-tighter hidden sm:block">Simulado</span>
                    </button>
                </div>
                
                <div className="flex items-center gap-3 md:gap-4">
                    
                    <AnimatePresence>
                        {streak > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 md:py-2 rounded-xl border border-orange-500/30"
                            >
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="font-black text-sm md:text-lg text-orange-400">{streak}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${currentRank.color} whitespace-nowrap`}>
                        {currentRank.icon}
                        <span className="font-black text-[11px] uppercase tracking-wider">{currentRank.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-yellow-500/20 whitespace-nowrap">
                        <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Score:</span>
                        <motion.span 
                            key={score} 
                            initial={{ scale: 1.2, color: '#fff' }}
                            animate={{ scale: 1, color: '#facc15' }} 
                            className="font-black text-sm md:text-lg"
                        >
                            {score} PTS
                        </motion.span>
                    </div>

                    <EnemHelpPanel />
                </div>
            </header>
            {renderContent()}
        </main>
    );
}