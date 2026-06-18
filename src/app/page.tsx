"use client"

import React, { useState, useRef } from 'react';
import MainHub from '@/components/game/MainHub';
import MeioAmbienteGame from '@/components/game/MeioAmbienteGame';
import MacrocefaliaUrbanaGame from '@/components/game/macrocefalia-urbana';
import TransacaoEnergeticaGame from '@/components/game/transacao-energetica';
import DetetiveIbgeGame from '@/components/game/DetetiveIbgeGame';
import CorridaPendularGame from '@/components/game/CorridaPendularGame'; 
import EfeitoDominoGlobalGame from '@/components/game/EfeitoDominoGlobalGame';
// --- IMPORTAÇÃO DO NOVO JOGO DE GEOGRAFIA AGRÁRIA --- //
import EscudoDaVerdadeGame from '@/components/game/EscudoDaVerdadeGame'; 
import { Button } from '@/components/ui/button';
import { Trophy, Home, Target } from 'lucide-react';
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

export const saveScore = (name: string, score: number, mode: string) => {
    if (typeof window === 'undefined') return;
    const leaderboard = getLeaderboard();
    leaderboard.push({ name, score, date: new Date().toISOString(), mode });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('bioguesser_leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
};

// --- COMPONENTE ROOT / CONTAINER --- //
export default function App() {
  // ADICIONAMOS 'agraria' AOS ESTADOS POSSÍVEIS DA TELA
  const [currentScreen, setCurrentScreen] = useState<'hub' | 'meio_ambiente' | 'urbanizacao' | 'energia' | 'detetive_ibge' | 'corrida_pendular' | 'geopolitica' | 'agraria' | 'resultado_final'>('hub');
  const [playerName, setPlayerName] = useState<string>('');
  
  // ESTADOS PARA PONTUAÇÃO E RESULTADO
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [maxTrackScore, setMaxTrackScore] = useState(0); 
  const [finalTrackName, setFinalTrackName] = useState("");
  
  const isAdvancingRef = useRef(false);

  const handleSelectTheme = (themeId: string, name: string) => {
    setPlayerName(name);
    setCurrentScreen(themeId as any);
    setAccumulatedScore(0); // Reseta a soma ao iniciar novo tema
    isAdvancingRef.current = false;
  };

  const handleBackToHub = () => {
    if (!isAdvancingRef.current) {
        setCurrentScreen('hub');
    }
  };

  // ========================================================= //
  // TRILHA 1: MEIO AMBIENTE (Biomas + Cadeia -> Energia)
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
                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // TRILHA 2: URBANIZAÇÃO (Macrocefalia -> Detetive IBGE -> Corrida Pendular)
  // ========================================================= //
  if (currentScreen === 'urbanizacao') {
      return (
          <MacrocefaliaUrbanaGame 
            playerName={playerName} 
            onReturnHome={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true; 
                setAccumulatedScore(score); 
                setCurrentScreen('detetive_ibge'); 
                setTimeout(() => isAdvancingRef.current = false, 500); 
            }} 
          />
      );
  }

  if (currentScreen === 'detetive_ibge') {
      return (
          <DetetiveIbgeGame 
            playerName={playerName} 
            onReturnHome={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(prev => prev + score); 
                setCurrentScreen('corrida_pendular'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  if (currentScreen === 'corrida_pendular') {
      return (
          <CorridaPendularGame 
            playerName={playerName} 
            onComplete={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(prev => prev + score); 
                setMaxTrackScore(1850); 
                setFinalTrackName('Trilha Urbanização');
                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // TRILHA 3: GEOPOLÍTICA (Efeito Dominó Global)
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
                
                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // TRILHA 4: GEOGRAFIA AGRÁRIA (Escudo da Verdade)
  // ========================================================= //
  if (currentScreen === 'agraria') {
      return (
          <EscudoDaVerdadeGame 
            playerName={playerName} 
            onComplete={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true;
                setAccumulatedScore(score); 
                
                // São 5 cartas a 50 pontos cada, somando o máximo de 250 pontos na Fase 1
                setMaxTrackScore(1200); 
                setFinalTrackName('Trilha Geografia Agrária'); 
                
                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // TELA GLOBAL: RESULTADO FINAL DA TRILHA
  // ========================================================= //
  if (currentScreen === 'resultado_final') {
      const percentage = Math.min((accumulatedScore / maxTrackScore) * 100, 100);
      let feedbackMessage = "";
      let feedbackColor = "";

      if (percentage >= 90) { feedbackMessage = "Desempenho Extraordinário!"; feedbackColor = "text-emerald-400"; }
      else if (percentage >= 70) { feedbackMessage = "Ótimo Trabalho!"; feedbackColor = "text-blue-400"; }
      else if (percentage >= 50) { feedbackMessage = "Bom, mas pode melhorar!"; feedbackColor = "text-yellow-400"; }
      else { feedbackMessage = "Continue Estudando!"; feedbackColor = "text-red-400"; }

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

                      {/* BARRA DE PROGRESSO VISUAL */}
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

                  <Button 
                    onClick={() => {
                        saveScore(playerName, accumulatedScore, finalTrackName);
                        setCurrentScreen('hub');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 text-xl rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
                  >
                      Salvar no Ranking e Sair <Home className="ml-3" />
                  </Button>
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
        onLogout={() => setPlayerName('')} 
        getLeaderboard={getLeaderboard} 
      />
  );
}