"use client"

import React, { useState, useRef } from 'react';
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
    score: number;
    date: string;
    mode?: string;
}

export const getLeaderboard = (): ScoreEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('bioguesser_leaderboard');
    return data ? JSON.parse(data) : [];
};

// ATUALIZAÇÃO: Lógica para manter a maior pontuação e guardar todo o histórico
export const saveScore = (name: string, score: number, mode: string) => {
    if (typeof window === 'undefined') return;
    const leaderboard = getLeaderboard();

    // Procura se este jogador já jogou este modo de jogo antes
    const existingEntryIndex = leaderboard.findIndex(
        (entry) => entry.name === name && entry.mode === mode
    );

    if (existingEntryIndex !== -1) {
        // Se já jogou, verifica se a nova pontuação é MAIOR do que a antiga
        if (score > leaderboard[existingEntryIndex].score) {
            leaderboard[existingEntryIndex].score = score;
            leaderboard[existingEntryIndex].date = new Date().toISOString();
        }
        // Se não for maior, não faz nada (mantém a pontuação alta antiga)
    } else {
        // Se nunca jogou, adiciona um novo registo
        leaderboard.push({ name, score, date: new Date().toISOString(), mode });
    }

    // Ordena do maior para o menor
    leaderboard.sort((a, b) => b.score - a.score);
    
    // ATUALIZAÇÃO: Retiramos o .slice(0, 10) para não apagar o progresso dos jogadores,
    // garantindo que o MainHub consegue calcular a "Trilha Total".
    localStorage.setItem('bioguesser_leaderboard', JSON.stringify(leaderboard));
};

// --- DEFINIÇÃO DAS TRILHAS DISPONÍVEIS --- //
// ATUALIZAÇÃO: Separamos as 4 trilhas principais. O Simulado fica independente.
const MAIN_TRACKS = ['meio_ambiente', 'urbanizacao', 'geopolitica', 'agraria'];

// Dicionário para traduzir o ID no nome do botão
const TRACK_NAMES: Record<string, string> = {
    'meio_ambiente': 'Meio Ambiente',
    'urbanizacao': 'Urbanização',
    'geopolitica': 'Geopolítica',
    'agraria': 'Geografia Agrária'
};

// --- COMPONENTE ROOT / CONTAINER --- //
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'hub' | 'meio_ambiente' | 'urbanizacao' | 'energia' | 'detetive_ibge' | 'corrida_pendular' | 'geopolitica' | 'agraria' | 'simulados' | 'resultado_final'>('hub');
  const [playerName, setPlayerName] = useState<string>('');
  
  // ESTADOS PARA PONTUAÇÃO E RESULTADO
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [maxTrackScore, setMaxTrackScore] = useState(0); 
  const [finalTrackName, setFinalTrackName] = useState("");
  
  // ESTADO: Guarda as trilhas principais que o jogador já completou
  const [completedTracks, setCompletedTracks] = useState<string[]>([]);
  
  const isAdvancingRef = useRef(false);

  const handleSelectTheme = (themeId: string, name: string) => {
    setPlayerName(name);
    setCurrentScreen(themeId as any);
    setAccumulatedScore(0);
    isAdvancingRef.current = false;
  };

  const handleBackToHub = () => {
    if (!isAdvancingRef.current) {
        setCurrentScreen('hub');
    }
  };

  // ========================================================= //
  // TRILHA 1: MEIO AMBIENTE
  // ========================================================= //
  if (currentScreen === 'meio_ambiente') {
      return (
          <MeioAmbienteGame 
            playerName={playerName} 
            onBackToHub={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true; 
                setAccumulatedScore(score); 
                setCurrentScreen('energia'); 
                setTimeout(() => isAdvancingRef.current = false, 500); 
            }} 
          />
      );
  }

  if (currentScreen === 'energia') {
      return (
          <TransacaoEnergeticaGame 
            playerName={playerName} 
            onReturnHome={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(prev => prev + score); 
                setMaxTrackScore(1575); 
                setFinalTrackName('Trilha Meio Ambiente');
                
                setCompletedTracks(prev => Array.from(new Set([...prev, 'meio_ambiente'])));

                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
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
            onReturnHome={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true; 
                setAccumulatedScore(score); 
                setMaxTrackScore(550); 
                setFinalTrackName('Trilha Urbanização');

                setCompletedTracks(prev => Array.from(new Set([...prev, 'urbanizacao'])));

                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500); 
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
            onComplete={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(score); 
                setMaxTrackScore(500); 
                setFinalTrackName('Trilha Geopolítica'); 
                
                setCompletedTracks(prev => Array.from(new Set([...prev, 'geopolitica'])));

                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
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
            onComplete={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(score); 
                setMaxTrackScore(3000); 
                setFinalTrackName('Trilha Geografia Agrária'); 
                
                setCompletedTracks(prev => Array.from(new Set([...prev, 'agraria'])));

                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // MÓDULO 5 (INDEPENDENTE): SIMULADOS ENEM
  // ========================================================= //
  if (currentScreen === 'simulados') {
      return (
          <CorridaPendularGame 
            playerName={playerName} 
            onComplete={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(score); 
                
                // Pontuação máxima da Corrida Pendular
                setMaxTrackScore(5000); 
                setFinalTrackName('Trilha do Simulado Enem'); 
                
                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // TELA GLOBAL: RESULTADO FINAL
  // ========================================================= //
  if (currentScreen === 'resultado_final') {
      const percentage = Math.min((accumulatedScore / maxTrackScore) * 100, 100);
      let feedbackMessage = "";
      let feedbackColor = "";

      if (percentage >= 90) { feedbackMessage = "Desempenho Extraordinário!"; feedbackColor = "text-emerald-400"; }
      else if (percentage >= 70) { feedbackMessage = "Ótimo Trabalho!"; feedbackColor = "text-blue-400"; }
      else if (percentage >= 50) { feedbackMessage = "Bom, mas pode melhorar!"; feedbackColor = "text-yellow-400"; }
      else { feedbackMessage = "Continue Estudando!"; feedbackColor = "text-red-400"; }

      // ATUALIZAÇÃO: Só sugere continuar se o jogador estiver a fazer uma das 4 trilhas principais.
      // O Simulado é independente e não entra neste ciclo.
      const nextTrackId = finalTrackName !== 'Trilha do Simulado Enem' 
          ? MAIN_TRACKS.find(track => !completedTracks.includes(track)) 
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
                      {/* BOTÃO DINÂMICO PARA AS 4 TRILHAS BASE */}
                      {nextTrackId ? (
                          <Button 
                            onClick={() => {
                                saveScore(playerName, accumulatedScore, finalTrackName);
                                setAccumulatedScore(0);
                                setCurrentScreen(nextTrackId as any);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 md:py-8 text-base md:text-xl rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 h-auto text-center whitespace-normal"
                          >
                              <span>Continuar para: {TRACK_NAMES[nextTrackId]}</span> 
                              <Play className="hidden md:block w-5 h-5 shrink-0" />
                          </Button>
                      ) : (
                          // Se for o Simulado ou já tiver completado as 4 trilhas, mostra a mensagem de sucesso
                          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold py-4 px-6 rounded-2xl text-center text-sm md:text-base">
                              {finalTrackName === 'Trilha do Simulado Enem' 
                                ? "🎉 Simulado Concluído com Sucesso!" 
                                : "🎉 Impressionante! Você completou todas as 4 Trilhas!"}
                          </div>
                      )}

                      {/* BOTÃO VOLTAR AO INÍCIO */}
                      <Button 
                        onClick={() => {
                            saveScore(playerName, accumulatedScore, finalTrackName);
                            setCurrentScreen('hub');
                        }}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 md:py-6 text-sm md:text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 h-auto text-center whitespace-normal"
                      >
                          <span>Salvar no Ranking e Voltar ao Início</span> 
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
        onLogout={() => {
            setPlayerName('');
            setCompletedTracks([]); 
        }} 
        getLeaderboard={getLeaderboard} 
      />
  );
}