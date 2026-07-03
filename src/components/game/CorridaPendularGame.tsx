"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    CheckCircle2, XCircle, BookOpen, ArrowRight, Info,
    User, HelpCircle, ArrowLeft, AlertTriangle, RefreshCw, 
    MousePointerClick, BrainCircuit, Flame, Award, Medal, Trophy, Star
} from 'lucide-react';

// 1. IMPORTAÇÃO DO SEU JSON
import simuladoData from '@/lib/geografia_simulado.json';

interface CorridaPendularGameProps {
    playerName: string;
    onComplete?: () => void;
    onSaveScore?: (score: number) => void;
}

// 2. PREPARANDO TODAS AS QUESTÕES
const TODAS_QUESTOES = Object.values(simuladoData).flat();

const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- NOVO: SISTEMA DE RANKS (PATENTES) ---
const getPlayerRank = (currentScore: number) => {
    if (currentScore >= 5000) return { title: "Geógrafo Master", color: "text-red-400 bg-red-900/30 border-red-500/50", icon: <Star size={16} className="text-red-400"/> };
    if (currentScore >= 2500) return { title: "Lenda da Geografia", color: "text-fuchsia-400 bg-fuchsia-900/30 border-fuchsia-500/50", icon: <Star size={16} className="text-fuchsia-400"/> };
    if (currentScore >= 1000) return { title: "Especialista Regional", color: "text-purple-400 bg-purple-900/30 border-purple-500/50", icon: <Medal size={16} className="text-purple-400"/> };
    if (currentScore >= 500) return { title: "Geógrafo Intermediário", color: "text-blue-400 bg-blue-900/30 border-blue-500/50", icon: <Award size={16} className="text-blue-400"/> };
    if (currentScore >= 250) return { title: "Iniciante Avançado", color: "text-cyan-400 bg-cyan-900/30 border-cyan-500/50", icon: <Award size={16} className="text-cyan-400"/> };
    if (currentScore >= 100) return { title: "Iniciante", color: "text-emerald-400 bg-emerald-900/30 border-emerald-500/50", icon: <Award size={16} className="text-emerald-400"/> };
    return { title: "Explorador Novato", color: "text-slate-400 bg-slate-800/50 border-slate-600", icon: <BookOpen size={16} className="text-slate-400"/> };
};

export default function CorridaPendularGame({ playerName, onComplete, onSaveScore }: CorridaPendularGameProps) {
    const [isLoaded, setIsLoaded] = useState(false); 
    const [status, setStatus] = useState<'intro' | 'playing' | 'feedback' | 'victory'>('intro');
    
    const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
    
    const [currentQIndex, setCurrentQIndex] = useState(0); 
    const [score, setScore] = useState(0); 
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    
    const [iaFeedback, setIaFeedback] = useState<string | null>(null);
    const [isLoadingIA, setIsLoadingIA] = useState(false);

    const [streak, setStreak] = useState(0); 
    const [medals, setMedals] = useState<string[]>([]); 
    const [bestScore, setBestScore] = useState(0); 

    // Calcula o rank atual em tempo real
    const currentRank = getPlayerRank(score);

    // 3. CARREGAMENTO INICIAL: RECORDE GLOBAL E SESSÃO SALVA
    useEffect(() => {
        const leaderboardData = localStorage.getItem('bioguesser_leaderboard');
        if (leaderboardData) {
            try {
                const leaderboard = JSON.parse(leaderboardData);
                const myEntry = leaderboard.find((entry: any) => 
                    entry.name === playerName && entry.mode === 'Trilha do Simulado Enem'
                );
                if (myEntry) {
                    setBestScore(myEntry.score);
                }
            } catch (e) {
                console.error("Erro ao ler ranking global", e);
            }
        }

        const savedSessionStr = localStorage.getItem(`@BioGuesser_Session_${playerName}`);
        if (savedSessionStr) {
            try {
                const session = JSON.parse(savedSessionStr);
                setQuizQuestions(session.questions);
                setCurrentQIndex(session.currentIndex);
                setScore(session.score);
                setStreak(session.streak);
                setMedals(session.medals || []);
            } catch (e) {
                iniciarNovoJogo();
            }
        } else {
            iniciarNovoJogo();
        }
        
        setIsLoaded(true);
    }, [playerName]);

    // 4. SALVAMENTO AUTOMÁTICO DA SESSÃO
    useEffect(() => {
        if (!isLoaded || quizQuestions.length === 0) return;

        if (status === 'victory') {
            localStorage.removeItem(`@BioGuesser_Session_${playerName}`);
            return;
        }

        const session = {
            questions: quizQuestions,
            currentIndex: currentQIndex,
            score,
            streak,
            medals
        };
        localStorage.setItem(`@BioGuesser_Session_${playerName}`, JSON.stringify(session));
    }, [quizQuestions, currentQIndex, score, streak, medals, status, playerName, isLoaded]);

    const iniciarNovoJogo = () => {
        const embaralhadas = shuffleArray(TODAS_QUESTOES);
        setQuizQuestions(embaralhadas);
        setCurrentQIndex(0);
        setScore(0);
        setStreak(0);
        setMedals([]);
    };

    const handleExitAndSave = () => {
        if (onSaveScore) {
            onSaveScore(score); 
        }
    };

    const handleAnswer = async (index: number) => {
        setSelectedAnswer(index);
        const currentQuestion = quizQuestions[currentQIndex];
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
            if (currentQIndex + 1 < quizQuestions.length) {
                setCurrentQIndex(prev => prev + 1);
                resetTurn();
            } else {
                setStatus('victory');
            }
        } else {
            resetTurn();
        }
    };

    const handleSkipQuestion = () => {
        setStreak(0);
        if (currentQIndex + 1 < quizQuestions.length) {
            setCurrentQIndex(prev => prev + 1);
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
                            <li><strong>Evolução:</strong> Comece como Novato e tente alcançar os cobiçados 5000 pontos para se tornar um <strong>Geógrafo Master</strong>!</li>
                            <li><strong>Progresso:</strong> Se precisar sair, o seu progresso fica salvo automaticamente!</li>
                        </ul>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    if (!isLoaded || quizQuestions.length === 0) return null;

    const currentQuestion = quizQuestions[currentQIndex];

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
                        
                        {currentQIndex > 0 ? (
                            <p className="text-emerald-300 font-bold text-base md:text-lg mb-6 leading-relaxed bg-emerald-900/30 p-4 rounded-xl">
                                Bem-vindo de volta, <strong>{playerName}</strong>! Vamos continuar a sua jornada rumo ao rank Master a partir da questão {currentQIndex + 1}.
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
                            {currentQIndex > 0 ? "Retomar Desafio" : "Iniciar Desafio"}
                        </Button>
                    </motion.div>
                </div>
            );
        }

        if (status === 'victory') {
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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleExitAndSave} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-7 text-lg rounded-xl">
                                Ver Resultado Final
                            </Button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        if (status === 'feedback' && selectedAnswer !== null) {
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
                                    ? (currentQIndex + 1 < quizQuestions.length ? <>Próxima Pergunta <ArrowRight size={20}/></> : 'Finalizar Simulado') 
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

        if (status === 'playing') {
            return (
                <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-12 w-full">
                    <div className="max-w-4xl w-full flex-1 flex flex-col">
                        
                        <motion.div 
                            key={currentQuestion.title}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="mb-6 flex justify-between items-center">
                                <div className="inline-flex items-center gap-2 bg-purple-900/30 text-purple-300 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-500/30 shadow-sm">
                                    <BookOpen size={16}/> {currentQuestion.title}
                                </div>
                                <span className="text-slate-400 font-bold text-sm">
                                    {currentQIndex + 1} / {quizQuestions.length}
                                </span>
                            </div>
                            
                            <div className="mb-6 bg-slate-800/40 p-4 md:p-6 rounded-2xl border border-slate-700/50 max-h-48 md:max-h-64 overflow-y-auto custom-scrollbar">
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                    {currentQuestion.context}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">
                                    {currentQuestion.alternativesIntroduction}
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3 mt-auto mb-6">
                                {currentQuestion.alternatives.map((option: any, index: number) => {
                                    const isSelected = selectedAnswer === index;
                                    let btnStyle = "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-purple-400 text-slate-200";
                                    
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
                                                <span className="font-black opacity-50 mt-0.5">{option.letter}.</span>
                                                <span className="leading-relaxed text-sm md:text-base">{option.text}</span>
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

                    {/* SELO DE RANK NO CABEÇALHO */}
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