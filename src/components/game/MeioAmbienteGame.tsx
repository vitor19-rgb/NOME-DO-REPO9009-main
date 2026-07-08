"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { MissionBriefing } from '@/components/game/mission-briefing';
import { ClueTags, type Keyword } from '@/components/game/clue-tags';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Globe, BrainCircuit, ArrowLeft, ArrowRight, BookOpen, Search, Lightbulb, HelpCircle, RefreshCw, User, CheckCircle2, AlertTriangle, Trophy, Star, Loader2, ShieldCheck } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

// IMPORTAÇÕES DOS JOGOS
import ReacaoEmCadeiaGame from '@/components/game/ReacaoEmCadeiaGame';
import TransacaoEnergeticaGame from '@/components/game/transacao-energetica';

// --- FUNÇÕES UTILITÁRIAS --- //
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// --- DADOS DOS 6 BIOMAS --- //
export interface BiomeData {
  name: string;
  imageIds: { landscape: string; detail: string };
  keywords: Record<string, number>;
  distractors: string[];
  hints: string[];
  summary: string;
}

const BIOMES: BiomeData[] = [
    {
        name: 'Caatinga',
        imageIds: { landscape: 'caatinga-landscape', detail: 'caatinga-detail' },
        keywords: { 'Xerófita': 50, 'Semiárido': 45, 'Mandacaru': 40, 'Caatinga': 35, 'Sertão': 30, 'Mata Branca': 25, 'Aridez': 20, 'Cacto': 15, 'Seca': 10, 'Espinhos': 5 },
        distractors: ['Tundra', 'Permafrost', 'Taiga', 'Monção', 'Equatorial', 'Floresta de Coníferas', 'Geleira', 'Altitude Elevada', 'Solo Alagado', 'Neblina Constante', 'Clima Polar'],
        hints: ['Este bioma é exclusivamente brasileiro.', 'A vegetação aqui é adaptada para sobreviver com pouca água.', 'O clima é quente e seco na maior parte do ano.'],
        summary: "Bioma exclusivamente brasileiro, de clima semiárido. Sua vegetação (xerófita) é altamente adaptada à escassez de água, com forte presença de cactos e arbustos espinhosos que perdem as folhas na seca."
    },
    {
        name: 'Pampa',
        imageIds: { landscape: 'pampa-landscape', detail: 'pampa-detail' },
        keywords: { 'Gramíneas': 50, 'Coxilhas': 45, 'Pampa': 40, 'Clima Temperado': 35, 'Campos Sulinos': 30, 'Pecuária': 25, 'Biodiversidade': 20, 'Solo Fértil': 15, 'Ervas': 10, 'Campanha Gaúcha': 5 },
        distractors: ['Deserto', 'Dunas', 'Oásis', 'Clima Árido', 'Vegetação Esparsa', 'Camelo', 'Savana', 'Latossolo', 'Fogo', 'Troncos Tortuosos', 'Montanhas Rochosas'],
        hints: ['Localizado no sul do Brasil.', 'A paisagem é dominada por campos de vegetação baixa.', 'É uma área importante para a atividade agropecuária.'],
        summary: "Também conhecido como Campos Sulinos, é marcado por um relevo de suaves ondulações (coxilhas) coberto por vegetação rasteira (gramíneas). É uma região de grande tradição pecuária no Brasil."
    },
    {
        name: 'Cerrado',
        imageIds: { landscape: 'cerrado-landscape', detail: 'cerrado-detail' },
        keywords: { 'Savana': 50, 'Hotspot': 45, 'Troncos Tortuosos': 40, 'Cerrado': 35, 'Divisor de Águas': 30, 'Estação Seca': 25, 'Chapadão': 20, 'Latossolo': 15, 'Arbustivo': 10, 'Fogo': 5 },
        distractors: ['Tundra', 'Permafrost', 'Geleira', 'Iceberg', 'Aurora Boreal', 'Vegetação Alpina', 'Floresta Boreal', 'Pinguim', 'Urso Polar', 'Líquens', 'Musgos'],
        hints: ['Considerada a savana mais rica em biodiversidade do mundo.', 'As árvores aqui costumam ter casca grossa e troncos retorcidos.', 'O fogo faz parte do ciclo natural deste bioma.'],
        summary: "A savana brasileira. Caracteriza-se por um clima com duas estações bem definidas (seca e chuvosa) e vegetação de árvores baixas com troncos retorcidos e cascas grossas que resistem ao fogo natural."
    },
    {
        name: 'Amazônia',
        imageIds: { landscape: 'amazonia-landscape', detail: 'amazonia-detail' },
        keywords: { 'Floresta Equatorial': 50, 'Alta Umidade': 45, 'Biodiversidade': 40, 'Bacia Hidrográfica': 35, 'Latifoliada': 30, 'Lianas': 25, 'Dossel': 20, 'Rio Amazonas': 15, 'Chuvas Abundantes': 10, 'Seringueira': 5 },
        distractors: ['Seca', 'Cacto', 'Xerófita', 'Neve', 'Pinguim', 'Tundra', 'Taiga', 'Geada', 'Folhas Aciculadas', 'Deserto', 'Oásis', 'Camelo'],
        hints: ['É a maior floresta tropical do mundo.', 'O clima é quente e úmido durante o ano todo.', 'Abriga a maior bacia hidrográfica do planeta.'],
        summary: "A maior floresta equatorial do planeta, de clima quente e muito úmido o ano todo. Possui a maior biodiversidade do mundo e é atravessada pela bacia hidrográfica do rio Amazonas."
    },
    {
        name: 'Mata Atlântica',
        imageIds: { landscape: 'mata-atlantica-landscape', detail: 'mata-atlantica-detail' },
        keywords: { 'Floresta Tropical': 50, 'Litoral': 45, 'Fragmentação': 40, 'Hotspot': 35, 'Epífitas': 30, 'Serra do Mar': 25, 'Alta Pluviosidade': 20, 'Bromélias': 15, 'Úmido': 10, 'Pau-Brasil': 5 },
        distractors: ['Chapadão', 'Clima Semiárido', 'Permafrost', 'Savana', 'Coníferas', 'Tundra', 'Deserto', 'Vegetação Rasteira', 'Geleira'],
        hints: ['Estende-se por grande parte da costa (litoral) brasileira.', 'É um dos biomas mais devastados do Brasil por causa da urbanização.', 'Apresenta muitas montanhas e serras próximas ao mar.'],
        summary: "Uma floresta tropical exuberante que ocupava quase todo o litoral brasileiro. Hoje é um dos biomas mais devastados (devido à urbanização), mas ainda é um hotspot de biodiversidade com rica fauna e flora."
    },
    {
        name: 'Pantanal',
        imageIds: { landscape: 'pantanal-landscape', detail: 'pantanal-detail' },
        keywords: { 'Planície Inundável': 50, 'Ciclo das Águas': 45, 'Cheias': 40, 'Tuiuiú': 35, 'Bacia do Paraguai': 30, 'Mosaico de Vegetação': 25, 'Clima Tropical': 20, 'Fauna Exuberante': 15, 'Jacaré': 10, 'Garça': 5 },
        distractors: ['Altitude Elevada', 'Clima Polar', 'Permafrost', 'Deserto', 'Seca Extrema', 'Floresta de Coníferas', 'Geleira', 'Caatinga', 'Dunas', 'Falésias'],
        hints: ['É a maior planície alagável do mundo.', 'A vida da flora e fauna aqui é ditada pelo ciclo das chuvas e secas.', 'Fica localizado na região Centro-Oeste do Brasil.'],
        summary: "A maior planície de inundação do mundo. É fortemente influenciada pelo ciclo das águas, alternando entre períodos de seca e grandes cheias, o que atrai uma fauna rica e diversificada, especialmente aves."
    }
];

// --- COMPONENTES INTERNOS --- //
const LevelCompleteScreen = ({ biome, score, onNext, isLast }: { biome: BiomeData, score: number, onNext: () => void, isLast: boolean }) => (
    <div className="w-full bg-slate-900 border border-slate-700 p-8 md:p-12 rounded-3xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-emerald-500/20 p-4 rounded-full"><CheckCircle2 className="w-16 h-16 text-emerald-400" /></div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Análise Concluída!</h2>
        <p className="text-xl text-slate-400 mb-8">Você identificou com sucesso o bioma <span className="text-emerald-400 font-bold">{biome.name}</span>.</p>
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl mb-8 text-left">
            <h3 className="text-2xl font-black text-emerald-400 mb-3 flex items-center gap-2"><BookOpen /> Resumo do Bioma</h3>
            <p className="text-slate-300 leading-relaxed text-lg">{biome.summary}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-950/50 p-6 rounded-2xl border border-white/5">
            <div className="text-center sm:text-left">
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Pontuação Total</p>
                <p className="text-4xl font-black text-yellow-400">{score} pts</p>
            </div>
            <Button onClick={onNext} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-6 px-10 text-lg transition-all shadow-lg shadow-emerald-900/50">
                {isLast ? "Concluir Análises" : "Próxima Fase"} <ArrowRight className="ml-2" />
            </Button>
        </div>
    </div>
);

const GameOverScreen = ({ onRestart }: { onRestart: () => void }) => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl shadow-red-500/10 max-w-lg">
            <h1 className="text-6xl font-black text-red-500 mb-4">Game Over</h1>
            <p className="text-xl text-slate-300 mb-8">
                Você cometeu 12 erros e a análise foi comprometida. A expedição será totalmente reiniciada e seus pontos foram zerados.
            </p>
            <Button onClick={onRestart} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-10 py-7 text-lg transition-all">
                <RefreshCw className="mr-3" /> Reiniciar Expedição
            </Button>
        </motion.div>
    </div>
);

// TELA: BIOMAS CONCLUÍDOS
const BiomesCompleteScreen = ({ score, onNext }: { score: number, onNext: () => void }) => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl relative z-10 w-full">
            <div className="flex justify-center mb-6">
                <ShieldCheck className="w-24 h-24 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-emerald-400 mb-4">
                Biomas Identificados!
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-lg mx-auto">
                Excelente! Você analisou os biomas brasileiros e compreendeu perfeitamente as características ecológicas cobradas nas provas do ENEM.
            </p>
            <div className="bg-slate-800 border border-slate-700/50 p-8 rounded-2xl mb-8 shadow-inner">
                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">
                    PONTUAÇÃO DA ETAPA
                </p>
                <p className="text-6xl md:text-7xl font-black text-yellow-400 drop-shadow-md">
                    +{score} pts
                </p>
            </div>
            <Button 
                onClick={onNext} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-7 text-xl rounded-2xl transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
                Continuar Expedição
            </Button>
        </motion.div>
    </div>
);

// --- COMPONENTE PRINCIPAL DO JOGO --- //
interface MeioAmbienteGameProps {
  playerName: string;
  userId?: string;
  onBackToHub: () => void;
  onSaveScore: (score: number) => void;
}

export default function MeioAmbienteGame({ playerName, userId, onBackToHub, onSaveScore }: MeioAmbienteGameProps) {
  const [sessionBiomes, setSessionBiomes] = useState<BiomeData[]>([]);
  const [currentBiomeIndex, setCurrentBiomeIndex] = useState(0);
  
  // REMOVIDO: O estado 'transition' não existe mais na lista
  const [gameState, setGameState] = useState<'playing' | 'revealed' | 'gameover' | 'biomes_complete' | 'bonus_stage' | 'energia'>('playing');
  
  const [identifiedKeywords, setIdentifiedKeywords] = useState<Keyword[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [clickedWords, setClickedWords] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [incorrectGuessCount, setIncorrectGuessCount] = useState(0);
  const [hintsShown, setHintsShown] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentBiome = sessionBiomes[currentBiomeIndex];

  // Inicializa o jogo
  useEffect(() => {
    const shuffledBiomes = shuffle([...BIOMES]).slice(0, 3);
    setSessionBiomes(shuffledBiomes);
    setCurrentBiomeIndex(0);
    setTotalScore(0);
    setScoreSaved(false);
    setFinalScore(0);
  }, []);

  const setupBiomeRound = useCallback(() => {
    if (!currentBiome) return;
    const correctWords = Object.keys(currentBiome.keywords);
    let possibleDistractors: string[] = [];
    
    BIOMES.forEach(b => {
        if (b.name !== currentBiome.name) {
            possibleDistractors.push(...Object.keys(b.keywords), ...b.distractors);
        } else {
            possibleDistractors.push(...b.distractors);
        }
    });

    possibleDistractors = Array.from(new Set(possibleDistractors)).filter(word => !correctWords.includes(word));
    const selectedDistractors = shuffle(possibleDistractors).slice(0, 20);
    const finalWordBank = shuffle([...correctWords, ...selectedDistractors]);

    setWordBank(finalWordBank);
    setClickedWords({});
    setIdentifiedKeywords([]);
    setGameState('playing');
    setSearchTerm("");
    setIncorrectGuessCount(0);
    setHintsShown([]);
  }, [currentBiome]);

  useEffect(() => {
    if (sessionBiomes.length > 0) setupBiomeRound();
  }, [currentBiomeIndex, sessionBiomes, setupBiomeRound]);

  const handleWordClick = useCallback((word: string) => {
    if (gameState === 'revealed' || clickedWords[word]) return;
    const foundEntry = Object.entries(currentBiome.keywords).find(([key]) => key.toLowerCase() === word.toLowerCase());

    if (foundEntry) {
      const [originalKey, points] = foundEntry;
      setIdentifiedKeywords(prev => [{ text: originalKey, points }, ...prev]);
      setTotalScore(prev => prev + points);
      setClickedWords(prev => ({ ...prev, [word]: 'correct' }));
      toast({ title: "Análise Correta!", description: `Elemento "'${originalKey.toUpperCase()}'" é relevante. (+${points} PTS)` });
    } else {
      setClickedWords(prev => ({ ...prev, [word]: 'incorrect' }));
      const newIncorrectCount = incorrectGuessCount + 1;

      if (newIncorrectCount >= 12) {
        setGameState('gameover');
        return;
      }

      setIncorrectGuessCount(newIncorrectCount);
      toast({ title: "Análise Incorreta", description: `Elemento "'${word.toUpperCase()}'" não é uma característica chave.`, variant: "destructive" });

      if (newIncorrectCount % 3 === 0) {
        setTotalScore(prev => Math.max(0, prev - 15));
        toast({ title: "Penalidade Aplicada!", description: "A cada 3 erros, 15 pontos são descontados.", variant: "destructive", duration: 4000 });
        const nextHintIndex = (newIncorrectCount / 3) - 1;
        const nextHint = currentBiome.hints[nextHintIndex];
        if (nextHint && !hintsShown.includes(nextHint)) {
          setTimeout(() => {
            toast({ title: "Dica do Especialista", description: nextHint, duration: 5000 });
            setHintsShown(prev => [...prev, nextHint]);
          }, 500); 
        }
      }
    }
  }, [gameState, currentBiome, clickedWords, incorrectGuessCount, hintsShown]);

  const handleReveal = () => setGameState('revealed');
  
  const handleUserExit = () => {
    if (window.confirm("Deseja realmente sair da partida? O seu progresso atual será perdido.")) {
        onBackToHub();
    }
  };

  const handleFullRestart = useCallback(() => {
    const shuffledBiomes = shuffle([...BIOMES]).slice(0, 3);
    setSessionBiomes(shuffledBiomes);
    setCurrentBiomeIndex(0);
    setTotalScore(0);
    setScoreSaved(false);
    setFinalScore(0);
  }, []);

  const handleNextBiome = () => {
    if (currentBiomeIndex + 1 < sessionBiomes.length) {
        setCurrentBiomeIndex(prev => prev + 1);
    } else {
        setGameState('biomes_complete');
    }
  };

  const handleCompleteBoss = (bonusScore: number) => {
      const newScore = totalScore + bonusScore;
      setTotalScore(newScore);
      setFinalScore(newScore);
      // ALTERAÇÃO: Ao terminar o bónus, vai direto para a energia sem a tela de transição
      setGameState('energia');
  };

  const handleEnergiaComplete = (energiaScore: number) => {
      const newFinalScore = finalScore + energiaScore;
      setFinalScore(newFinalScore);
      onSaveScore(newFinalScore);
  };

  const getButtonClass = (word: string) => {
    const state = clickedWords[word];
    if (state === 'correct') return 'bg-emerald-500/80 hover:bg-emerald-500/90 border-emerald-400 text-white';
    if (state === 'incorrect') return 'bg-red-500/80 hover:bg-red-500/90 border-red-400 text-white line-through';
    return 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600 text-[#6c7893]';
  }

  const filteredWordBank = wordBank.filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()));

  if (gameState === 'gameover') return <GameOverScreen onRestart={handleFullRestart} />;
  
  if (gameState === 'biomes_complete') {
      return (
          <BiomesCompleteScreen 
              score={totalScore} 
              onNext={() => setGameState('bonus_stage')} 
          />
      );
  }

  if (gameState === 'bonus_stage') {
      return (
          <div className="min-h-screen bg-[#020617] flex flex-col w-full text-white">
              <ReacaoEmCadeiaGame 
                  playerName={playerName}
                  userId={userId}
                  onFinishGame={handleCompleteBoss} 
                  onReturnHome={handleUserExit} 
              />
          </div>
      );
  }

  // TELA DE MATRIZ ENERGÉTICA FICA DIRETAMENTE APÓS O JOGO BONUS
  if (gameState === 'energia') {
      return (
          <TransacaoEnergeticaGame 
              playerName={playerName}
              userId={userId}
              onReturnHome={handleUserExit}
              onSaveScore={handleEnergiaComplete}
          />
      );
  }

  if (!currentBiome) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden flex flex-col">
     
      <header className="w-full flex flex-col md:flex-row justify-between items-center p-3 md:p-6 border-b border-white/10 bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 gap-3 md:gap-4 shadow-xl md:shadow-2xl">
          <div className="flex items-center w-full md:w-auto relative justify-center md:justify-start min-h-[40px]">
              
              <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleUserExit} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full absolute left-0 md:static md:mr-3 shadow-md"
              >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              
              <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex flex-col">
                      <span className="font-black text-base md:text-lg tracking-tight leading-none text-white">Meio Ambiente e Clima</span>
                  </div>
              </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
              
              <h2 className="text-slate-400 font-black text-xs md:text-sm flex items-center gap-2 uppercase tracking-[0.2em]">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Fase {currentBiomeIndex + 1} de {sessionBiomes.length}
              </h2>

              <div className="w-px h-6 bg-white/10 hidden md:block" />
              
              <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border font-bold transition-all shadow-inner ${incorrectGuessCount >= 9 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                  <span className="text-xs uppercase opacity-60 hidden sm:inline">Erros:</span>
                  <span className="text-sm">{incorrectGuessCount}/12</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-emerald-600/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-emerald-500/20 text-emerald-300">
                  <User size={14} className="opacity-70" />
                  <span className="text-sm font-black truncate max-w-[100px]">{playerName}</span>
              </div>

              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="outline" className="bg-emerald-900/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm">
                          <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> O que cai no ENEM?
                      </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-slate-900 text-white border-l-slate-700 w-full sm:max-w-lg p-0">
                       <div className="p-6 h-full overflow-y-auto">
                          
                          <div className="flex items-center gap-3 mb-6">
                              <div className="bg-emerald-500/20 p-2 rounded-lg">
                                  <HelpCircle className="text-emerald-400" size={24}/>
                              </div>
                              <h2 className="text-2xl font-black text-white">Como Jogar</h2>
                          </div>
                          <div className="space-y-6 text-left">
                              <div>
                                  <h3 className="font-bold text-lg text-emerald-300 mb-2">Seu Objetivo</h3>
                                  <p className="text-slate-300 leading-relaxed">Identifique o bioma correto a partir das imagens e palavras-chave.</p>
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-emerald-300 mb-2">Passo a Passo</h3>
                                  <ol className="list-decimal list-inside space-y-3 text-slate-300">
                                      <li><strong>Analise as Imagens:</strong> Observe a foto da paisagem e o perfil do solo.</li>
                                      <li><strong>Selecione Palavras-Chave:</strong> Escolha os termos que descrevem o que você vê no Banco de Palavras.</li>
                                      <li><strong>Ganhe Pontos:</strong> Palavras corretas somam pontos.</li>
                                  </ol>
                              </div>
                          </div>

                          <hr className="border-slate-800 my-8" />

                          <div className="flex items-center gap-3 mb-6">
                              <div className="bg-emerald-500/20 p-2 rounded-lg">
                                  <BookOpen className="text-emerald-400" size={24}/>
                              </div>
                              <h2 className="text-2xl font-black text-white">Revisão ENEM</h2>
                          </div>
                          <div className="space-y-6 text-left pb-8">
                              <div>
                                  <h3 className="font-bold text-lg text-emerald-400 mb-2">A Pegada das Provas</h3>
                                  <p className="text-slate-300 leading-relaxed text-[15px]">
                                      No ENEM, os biomas não são apenas decorados. Eles são cobrados sob a ótica da <strong>interferência humana</strong> (impacto ambiental) e da adaptação da vegetação ao clima (ex: raízes profundas no Cerrado, cactos na Caatinga).
                                  </p>
                              </div>
                              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 mt-4">
                                  <h3 className="font-bold text-md text-white mb-3 flex items-center gap-2">
                                      <AlertTriangle className="w-5 h-5 text-yellow-500" /> Principais Ameaças
                                  </h3>
                                  <ul className="space-y-3 text-[14px] text-slate-300">
                                      <li><strong className="text-white">Cerrado:</strong> Avanço da fronteira agrícola (soja e pecuária).</li>
                                      <li><strong className="text-white">Amazônia:</strong> Desmatamento para extração de madeira e pastagens.</li>
                                      <li><strong className="text-white">Mata Atlântica:</strong> Intensa urbanização e especulação imobiliária costeira.</li>
                                      <li><strong className="text-white">Caatinga:</strong> Risco de desertificação agravado por queimadas e desmatamento.</li>
                                  </ul>
                              </div>
                          </div>

                      </div>
                  </SheetContent>
              </Sheet>
          </div>
      </header>

      <div className="max-w-4xl mx-auto p-3 md:p-6 lg:p-10 w-full flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
            {gameState === 'playing' && (
                <motion.div key={`play-area-${currentBiomeIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="flex flex-col gap-8 w-full">
                    <section className="order-1">
                        <MissionBriefing landscapeId={currentBiome.imageIds.landscape} detailId={currentBiome.imageIds.detail} />
                    </section>

                    <section className="order-2">
                        <div className="glass-panel p-6 flex flex-col gap-6 min-h-[400px] border-white/5 bg-slate-900/40 rounded-2xl">
                            <div className="flex-1 flex flex-col gap-4">
                                <h3 className="text-[11px] font-black uppercase text-emerald-400 tracking-[0.3em] flex items-center gap-2.5"><BrainCircuit size={16} />Banco de Palavras ({wordBank.length})</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <Input type="text" placeholder="Filtrar palavras-chave..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-800/50 border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white w-full" />
                                </div>
                                <div className="flex flex-wrap gap-2.5 pt-2">
                                {filteredWordBank.length > 0 ? (
                                    filteredWordBank.map(word => (
                                        <Button key={word} onClick={() => handleWordClick(word)} className={`rounded-full px-4 py-1.5 text-base font-bold transition-all border ${getButtonClass(word)}`}>{word}</Button>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center w-full">Nenhuma palavra encontrada.</p>
                                )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-[11px] font-black uppercase mb-5 text-emerald-400 tracking-[0.3em] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Amostras Coletadas ({identifiedKeywords.length} de 10)</h3>
                                {identifiedKeywords.length > 0 ? (
                                <ClueTags keywords={identifiedKeywords} onRemove={() => {}} />
                                ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 text-center text-sm">Selecione palavras-chave corretas para analisá-las.</div>
                                )}
                            </div>

                            {hintsShown.length > 0 && (
                                <div className="flex-1">
                                    <h3 className="text-[11px] font-black uppercase mb-3 text-amber-400 tracking-[0.3em] flex items-center gap-2.5"><Lightbulb size={16} />Pistas Recebidas</h3>
                                    <div className="space-y-2">
                                        {hintsShown.map((hint, index) => (
                                            <motion.div key={index} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-300 p-3 rounded-r-lg text-sm">{hint}</motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center bg-slate-800/50 px-5 py-3 rounded-xl">
                                    <span className="text-sm font-semibold text-white/60">Pontuação Total:</span>
                                    <span className="text-2xl font-black text-emerald-400">{totalScore}</span>
                                </div>
                                <Button onClick={handleReveal} disabled={identifiedKeywords.length < 2} className="w-full bg-white hover:bg-gray-100 text-black font-black rounded-2xl py-7 md:py-8 transition-all active:scale-95 text-lg md:text-xl shadow-[0_10px_40px_rgba(255,255,255,0.15)] disabled:opacity-30 border-none">Enviar Dedução</Button>
                            </div>
                        </div>
                    </section>
                </motion.div>
            )}

            {gameState === 'revealed' && (
                <motion.div key={`level-complete-${currentBiomeIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full flex justify-center mt-4">
                    <LevelCompleteScreen biome={currentBiome} score={totalScore} onNext={handleNextBiome} isLast={currentBiomeIndex === sessionBiomes.length - 1} />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}