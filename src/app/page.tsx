"use client"

import React, { useState, useRef } from 'react';
import MainHub from '@/components/game/MainHub';
import MeioAmbienteGame from '@/components/game/MeioAmbienteGame';
import MacrocefaliaUrbanaGame from '@/components/game/macrocefalia-urbana';
import TransacaoEnergeticaGame from '@/components/game/transacao-energetica';
import DetetiveIbgeGame from '@/components/game/DetetiveIbgeGame'; // <-- IMPORTAÇÃO DO NOVO JOGO
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight, Home, Globe } from 'lucide-react';
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
  const [currentScreen, setCurrentScreen] = useState<'hub' | 'meio_ambiente' | 'urbanizacao' | 'energia' | 'detetive_ibge' | 'resultado_final'>('hub');
  const [playerName, setPlayerName] = useState<string>('');
  
  // ESTADO PARA SOMA CUMULATIVA E NOME DA TRILHA
  const [accumulatedScore, setAccumulatedScore] = useState(0);
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
                setAccumulatedScore(score); // Salva Biomas + Cadeia
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
                setAccumulatedScore(prev => prev + score); // Soma o jogo de Energia
                setFinalTrackName('Trilha Meio Ambiente'); // Define o nome para a tela final
                setCurrentScreen('resultado_final'); 
                setTimeout(() => isAdvancingRef.current = false, 500);
            }} 
          />
      );
  }

  // ========================================================= //
  // TRILHA 2: URBANIZAÇÃO (Macrocefalia -> Detetive IBGE)
  // ========================================================= //
  if (currentScreen === 'urbanizacao') {
      return (
          <MacrocefaliaUrbanaGame 
            playerName={playerName} 
            onReturnHome={handleBackToHub} 
            onSaveScore={(score) => {
                isAdvancingRef.current = true; 
                setAccumulatedScore(score); // Salva Macrocefalia
                setCurrentScreen('detetive_ibge'); // Avança para Detetive IBGE
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
                setAccumulatedScore(prev => prev + score); // Soma o jogo do IBGE
                setFinalTrackName('Trilha Urbanização'); // Define o nome para a tela final
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
      return (
          <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-500/50 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                  <h1 className="text-4xl font-black mb-2">Expedição Concluída!</h1>
                  <p className="text-slate-400 text-lg mb-8">Agente {playerName}, aqui está o resultado do seu desempenho na <strong>{finalTrackName}</strong>:</p>
                  
                  <div className="bg-slate-950/50 rounded-3xl p-8 border border-slate-800 mb-10">
                      <p className="text-sm uppercase tracking-widest text-emerald-400 font-bold mb-2">Soma Total de Pontos</p>
                      <p className="text-7xl font-black text-white">{accumulatedScore} pts</p>
                  </div>

                  <Button 
                    onClick={() => {
                        saveScore(playerName, accumulatedScore, finalTrackName);
                        setCurrentScreen('hub');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 text-xl rounded-2xl shadow-lg transition-all"
                  >
                      Salvar no Ranking e Sair <Home className="ml-2" />
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