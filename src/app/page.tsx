"use client"

import React, { useState, useRef, useEffect } from 'react';
import MainHub from '@/components/game/MainHub';
import MeioAmbienteGame from '@/components/game/MeioAmbienteGame';
import MacrocefaliaUrbanaGame from '@/components/game/macrocefalia-urbana';
import TransacaoEnergeticaGame from '@/components/game/transacao-energetica';
import DetetiveIbgeGame from '@/components/game/DetetiveIbgeGame';
import CorridaPendularGame from '@/components/game/CorridaPendularGame'; 
import EfeitoDominoGlobalGame from '@/components/game/EfeitoDominoGlobalGame';
import EscudoDaVerdadeGame from '@/components/game/EscudoDaVerdadeGame'; 
import { Button } from '@/components/ui/button';
import { Trophy, Home, Target, Play } from 'lucide-react'; 
import { motion } from 'framer-motion';

// --- LÓGICA GLOBAL DE RANKING --- //
export interface ScoreEntry {
    name: string;
    userId?: string;
    score: number;
    date: string;
    mode?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

// --- RANKING GERAL (todos os jogos) --- //
export const getLeaderboard = (): ScoreEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('bioguesser_leaderboard');
    return data ? JSON.parse(data) : [];
};

export const saveScore = async (name: string, score: number, mode: string, difficulty?: 'easy' | 'medium' | 'hard', userId?: string) => {
    if (typeof window === 'undefined') return;
    
    const leaderboard = getLeaderboard();

    const existingEntryIndex = leaderboard.findIndex(
        (entry) => {
            if (userId && entry.userId === userId) {
                return entry.mode === mode && entry.difficulty === difficulty;
            }
            return entry.name === name && entry.mode === mode && entry.difficulty === difficulty;
        }
    );

    if (existingEntryIndex !== -1) {
        if (score > leaderboard[existingEntryIndex].score) {
            leaderboard[existingEntryIndex].score = score;
            leaderboard[existingEntryIndex].date = new Date().toISOString();
            if (userId) leaderboard[existingEntryIndex].userId = userId;
        }
    } else {
        const newEntry: ScoreEntry = { 
            name, 
            score, 
            date: new Date().toISOString(), 
            mode, 
            difficulty 
        };
        if (userId) newEntry.userId = userId;
        leaderboard.push(newEntry);
    }

    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('bioguesser_leaderboard', JSON.stringify(leaderboard));

    try {
        await fetch('/api/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                userId: userId || '',
                score,
                mode,
                difficulty,
                date: new Date().toISOString()
            }),
        });
        console.log("Pontuação salva no Local Storage e sincronizada com o Banco de Dados!");
    } catch (error) {
        console.error("Erro ao sincronizar com o banco de dados. Salvo apenas localmente.", error);
    }
};

// --- RANKING ESPECÍFICO DA URBANIZAÇÃO --- //
export interface UrbanizationRanking {
    easy: ScoreEntry[];
    medium: ScoreEntry[];
    hard: ScoreEntry[];
}

const getUrbanizationRanking = (): UrbanizationRanking => {
    if (typeof window === 'undefined') return { easy: [], medium: [], hard: [] };
    
    const allScores = getLeaderboard();
    const urbanScores = allScores.filter(entry => entry.mode === 'Trilha Urbanização');
    
    const uniqueUsers = new Map<string, ScoreEntry>();
    
    urbanScores.forEach(entry => {
        const key = entry.userId || entry.name;
        const existing = uniqueUsers.get(key);
        if (!existing || entry.score > existing.score) {
            uniqueUsers.set(key, entry);
        }
    });
    
    const uniqueEntries = Array.from(uniqueUsers.values());
    
    const easy = uniqueEntries.filter(e => e.difficulty === 'easy').sort((a, b) => b.score - a.score).slice(0, 10);
    const medium = uniqueEntries.filter(e => e.difficulty === 'medium').sort((a, b) => b.score - a.score).slice(0, 10);
    const hard = uniqueEntries.filter(e => e.difficulty === 'hard').sort((a, b) => b.score - a.score).slice(0, 10);
    
    return { easy, medium, hard };
};

export const getBestUrbanizationScore = (playerName: string, userId?: string): number => {
    if (typeof window === 'undefined') return 0;
    const allScores = getLeaderboard();
    
    let urbanScores;
    if (userId) {
        urbanScores = allScores.filter(
            entry => entry.mode === 'Trilha Urbanização' && entry.userId === userId
        );
    } else {
        urbanScores = allScores.filter(
            entry => entry.mode === 'Trilha Urbanização' && entry.name === playerName
        );
    }
    
    if (urbanScores.length === 0) return 0;
    return Math.max(...urbanScores.map(e => e.score));
};

// --- DEFINIÇÃO DAS TRILHAS --- //
const MAIN_TRACKS = ['meio_ambiente', 'urbanizacao', 'geopolitica', 'agraria'];

const TRACK_NAMES: Record<string, string> = {
    'meio_ambiente': 'Meio Ambiente',
    'urbanizacao': 'Urbanização',
    'geopolitica': 'Geopolítica',
    'agraria': 'Geografia Agrária'
};

// --- COMPONENTE ROOT --- //
export default function App() {
    const [currentScreen, setCurrentScreen] = useState<'hub' | 'meio_ambiente' | 'urbanizacao' | 'energia' | 'detetive_ibge' | 'corrida_pendular' | 'geopolitica' | 'agraria' | 'simulados' | 'resultado_final'>('hub');
    const [playerName, setPlayerName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    
    const [accumulatedScore, setAccumulatedScore] = useState(0);
    const [maxTrackScore, setMaxTrackScore] = useState(0); 
    const [finalTrackName, setFinalTrackName] = useState("");
    const [completedTracks, setCompletedTracks] = useState<string[]>([]);
    
    const [urbanizationDifficulty, setUrbanizationDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [scoreSaved, setScoreSaved] = useState(false);
    
    const isAdvancingRef = useRef(false);

    const handleSelectTheme = (themeId: string, name: string, userId?: string) => {
        setPlayerName(name);
        if (userId) setUserId(userId);
        setCurrentScreen(themeId as any);
        setAccumulatedScore(0);
        setScoreSaved(false);
        isAdvancingRef.current = false;
    };

    const handleBackToHub = () => {
        if (!isAdvancingRef.current) {
            setCurrentScreen('hub');
        }
    };

    // --- FUNÇÃO PARA SALVAR SCORE --- //
    const handleSaveScore = (score: number, difficulty?: 'easy' | 'medium' | 'hard') => {
        isAdvancingRef.current = true;
        setAccumulatedScore(score);
        
        if (currentScreen === 'urbanizacao' && difficulty) {
            setUrbanizationDifficulty(difficulty);
        }
        
        const maxScores: Record<string, number> = {
            'meio_ambiente': 1575,
            'urbanizacao': 1500,
            'geopolitica': 500,
            'agraria': 3000,
            'simulados': 5000 
        };
        
        const trackNames: Record<string, string> = {
            'meio_ambiente': 'Trilha Meio Ambiente',
            'urbanizacao': 'Trilha Urbanização',
            'geopolitica': 'Trilha Geopolítica',
            'agraria': 'Trilha Geografia Agrária',
            'simulados': 'Trilha do Simulado Enem' 
        };
        
        setMaxTrackScore(maxScores[currentScreen] || 0);
        setFinalTrackName(trackNames[currentScreen] || '');
        
        if (currentScreen !== 'simulados') {
            setCompletedTracks(prev => Array.from(new Set([...prev, currentScreen])));
        }
        
        saveScore(playerName, score, trackNames[currentScreen] || '', difficulty, userId);
        setScoreSaved(true);
        
        setCurrentScreen('resultado_final');
        setTimeout(() => isAdvancingRef.current = false, 500);
    };

    // ========================================================= //
    // TRILHA 1: MEIO AMBIENTE
    // ========================================================= //
   if (currentScreen === 'meio_ambiente') {
    return (
        <MeioAmbienteGame 
            playerName={playerName}
            userId={userId}
            onBackToHub={handleBackToHub} 
            onSaveScore={(score) => {
                handleSaveScore(score);
            }} 
        />
    );
}

    // ========================================================= //
    // TRILHA 2: URBANIZAÇÃO 
    // ========================================================= //
    if (currentScreen === 'urbanizacao') {
        return (
            <MacrocefaliaUrbanaGame 
                playerName={playerName}
                userId={userId}
                onReturnHome={handleBackToHub} 
                onSaveScore={(score: number) => {
                    handleSaveScore(score, urbanizationDifficulty);
                }} 
            />
        );
    }

    // ========================================================= //
    // TRILHA 3: GEOPOLÍTICA
    // ========================================================= //
    if (currentScreen === 'geopolitica') {
        return (
            <EfeitoDominoGlobalGame 
                playerName={playerName}
                userId={userId}
                onComplete={handleBackToHub} 
                onSaveScore={(score: number) => {
                    handleSaveScore(score);
                }} 
            />
        );
    }

    // ========================================================= //
    // TRILHA 4: GEOGRAFIA AGRÁRIA 
    // ========================================================= //
    if (currentScreen === 'agraria') {
        return (
            <EscudoDaVerdadeGame 
                playerName={playerName}
                userId={userId}
                onComplete={handleBackToHub} 
                onSaveScore={(score: number) => {
                    handleSaveScore(score);
                }} 
            />
        );
    }

    // ========================================================= //
    // MÓDULO 5: SIMULADOS ENEM
    // ========================================================= //
    if (currentScreen === 'simulados') {
        return (
            <CorridaPendularGame 
                playerName={playerName}
                userId={userId}
                onComplete={handleBackToHub} 
                onSaveScore={(score: number) => {
                    handleSaveScore(score);
                }} 
            />
        );
    }

    // ========================================================= //
    // TELA GLOBAL: RESULTADO FINAL
    // ========================================================= //
    if (currentScreen === 'resultado_final') {
        const percentage = maxTrackScore > 0 ? Math.min((accumulatedScore / maxTrackScore) * 100, 100) : 0;
        let feedbackMessage = "";
        let feedbackColor = "";

        if (percentage >= 90) { feedbackMessage = "Desempenho Extraordinário!"; feedbackColor = "text-emerald-400"; }
        else if (percentage >= 70) { feedbackMessage = "Ótimo Trabalho!"; feedbackColor = "text-blue-400"; }
        else if (percentage >= 50) { feedbackMessage = "Bom, mas pode melhorar!"; feedbackColor = "text-yellow-400"; }
        else { feedbackMessage = "Continue Estudando!"; feedbackColor = "text-red-400"; }

        // 🧠 LÓGICA CORRIGIDA: Lendo do Banco de Dados/LocalStorage para saber o que já jogaste
        const leaderboard = getLeaderboard();
        const userScores = leaderboard.filter(e => userId ? e.userId === userId : e.name === playerName);
        const userCompletedModes = userScores.map(e => e.mode);
        
        // Combina o que já completaste na sessão atual com o que está no localStorage
        const allCompletedTracks = new Set([
            ...completedTracks,
            ...(userCompletedModes.includes('Trilha Meio Ambiente') ? ['meio_ambiente'] : []),
            ...(userCompletedModes.includes('Trilha Urbanização') ? ['urbanizacao'] : []),
            ...(userCompletedModes.includes('Trilha Geopolítica') ? ['geopolitica'] : []),
            ...(userCompletedModes.includes('Trilha Geografia Agrária') ? ['agraria'] : [])
        ]);

        // Procura a próxima trilha que NÃO está no histórico completo do jogador
        const nextTrackId = finalTrackName !== 'Trilha do Simulado Enem' 
            ? MAIN_TRACKS.find(track => !allCompletedTracks.has(track)) 
            : null;

        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />
                
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-500/50 rounded-[2.5rem] p-8 md:p-12 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] relative z-10">
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">Expedição Concluída!</h1>
                    <p className="text-slate-400 text-lg mb-8">Agente <strong>{playerName}</strong>, aqui está o resultado do seu desempenho na <strong>{finalTrackName}</strong>:</p>
                    
                    <div className="bg-slate-950/80 rounded-3xl p-8 border border-slate-800 mb-10 shadow-inner">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Target className={`w-5 h-5 ${feedbackColor}`} />
                            <p className={`text-sm uppercase tracking-widest font-bold ${feedbackColor}`}>{feedbackMessage}</p>
                        </div>
                        
                        <div className="flex items-baseline justify-center gap-3 mb-6">
                            <p className="text-6xl md:text-7xl font-black text-white">{accumulatedScore}</p>
                            <p className="text-2xl md:text-3xl font-bold text-slate-500">/ {maxTrackScore} pts</p>
                        </div>

                        <div className="w-full bg-slate-800 rounded-full h-4 md:h-5 overflow-hidden border border-slate-700 relative">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${percentage}%` }} 
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-emerald-600 to-green-400 h-full relative" 
                            />
                        </div>
                        <p className="text-right text-slate-400 text-sm mt-3 font-bold tracking-wider">{percentage.toFixed(1)}% de aproveitamento</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {nextTrackId ? (
                            <Button 
                                onClick={() => {
                                    setAccumulatedScore(0);
                                    setScoreSaved(false);
                                    setCurrentScreen(nextTrackId as any);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 md:py-8 text-base md:text-xl rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 h-auto text-center whitespace-normal"
                            >
                                <span>Continuar para: {TRACK_NAMES[nextTrackId]}</span> 
                                <Play className="hidden md:block w-5 h-5 shrink-0" />
                            </Button>
                        ) : (
                            <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold py-4 px-6 rounded-2xl text-center text-sm md:text-base">
                                {finalTrackName === 'Trilha do Simulado Enem' 
                                    ? "🎉 Simulado Concluído com Sucesso!" 
                                    : "🎉 Impressionante! Você completou todas as 4 Trilhas!"}
                            </div>
                        )}

                        <Button 
                            onClick={() => {
                                setCurrentScreen('hub');
                            }}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 md:py-6 text-sm md:text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 h-auto text-center whitespace-normal"
                        >
                            <span>Voltar ao Início</span> 
                            <Home className="hidden md:block w-5 h-5 shrink-0" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ========================================================= //
    // TELA PADRÃO: MAIN HUB
    // ========================================================= //
    return (
        <MainHub 
            onSelectTheme={handleSelectTheme} 
            initialPlayerName={playerName}
            initialUserId={userId}
            onLogout={() => {
                setPlayerName('');
                setUserId('');
                setCompletedTracks([]); 
            }} 
        />
    );
}