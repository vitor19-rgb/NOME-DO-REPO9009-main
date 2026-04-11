"use client"

import React, { useState } from 'react';
import MainHub from '@/components/game/MainHub';
import MeioAmbienteGame from '@/components/game/MeioAmbienteGame';
import MacrocefaliaUrbanaGame from '@/components/game/macrocefalia-urbana';

// --- LOGICA GLOBAL DE RANKING --- //
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
  const [currentScreen, setCurrentScreen] = useState<'hub' | 'meio_ambiente' | 'urbanizacao' | 'agraria' | 'fenomenos'>('hub');
  const [playerName, setPlayerName] = useState<string>('');

  // Recebe o comando do Hub para trocar a tela
  const handleSelectTheme = (themeId: string, name: string) => {
    setPlayerName(name);
    setCurrentScreen(themeId as any);
  };

  // Recebe o comando de dentro dos jogos para voltar ao menu
  const handleBackToHub = () => {
    setCurrentScreen('hub');
  };

  // Renderização Condicional Limpa (Roteador de Telas)
  if (currentScreen === 'meio_ambiente') {
      return (
          <MeioAmbienteGame 
            playerName={playerName} 
            onBackToHub={handleBackToHub} 
            onSaveScore={(score) => saveScore(playerName, score, 'Meio Ambiente')} 
          />
      );
  }

  if (currentScreen === 'urbanizacao') {
      return (
          <MacrocefaliaUrbanaGame 
            playerName={playerName} 
            onReturnHome={handleBackToHub} 
            onSaveScore={(score) => saveScore(playerName, score, 'Urbanização')} 
          />
      );
  }

  // Por padrão (hub ou rotas não prontas), renderiza o MainHub
  return (
      <MainHub 
        onSelectTheme={handleSelectTheme} 
        initialPlayerName={playerName} 
        onLogout={() => setPlayerName('')} 
        getLeaderboard={getLeaderboard} 
      />
  );
}