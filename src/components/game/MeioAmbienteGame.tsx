"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { MissionBriefing } from '@/components/game/mission-briefing';
import { ClueTags, type Keyword } from '@/components/game/clue-tags';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BackToHomeButton } from "@/components/game/back-to-home-button";
import { Globe, BrainCircuit, ArrowRight, BookOpen, Search, Lightbulb, HelpCircle, RefreshCw, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

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
            <div className="bg-green-500/20 p-4 rounded-full"><CheckCircle2 className="w-16 h-16 text-green-400" /></div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Análise Concluída!</h2>
        <p className="text-xl text-slate-400 mb-8">Você identificou com sucesso o bioma <span className="text-green-400 font-bold">{biome.name}</span>.</p>
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl mb-8 text-left">
            <h3 className="text-2xl font-black text-blue-400 mb-3 flex items-center gap-2"><BookOpen /> Resumo do Bioma</h3>
            <p className="text-slate-300 leading-relaxed text-lg">{biome.summary}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-950/50 p-6 rounded-2xl border border-white/5">
            <div className="text-center sm:text-left">
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Pontuação Total</p>
                <p className="text-4xl font-black text-yellow-400">{score} pts</p>
            </div>
            <Button onClick={onNext} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-6 px-10 text-lg transition-all shadow-lg shadow-blue-900/50">
                {isLast ? "Finalizar Missão" : "Próxima Fase"} <ArrowRight className="ml-2" />
            </Button>
        </div>
    </div>
);

const GameOverScreen = ({ onRestart }: { onRestart: () => void }) => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-slate-900/50 border border-red-500/50 rounded-2xl shadow-2xl shadow-red-500/20">
            <h1 className="text-6xl font-black text-red-500 mb-4">Game Over</h1>
            <p className="text-xl text-white/80 mb-8 max-w-md">Você cometeu 12 erros e a análise foi comprometida. A fase será reiniciada.</p>
            <Button onClick={onRestart} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full px-10 py-5 text-lg">
                <RefreshCw className="mr-2" /> Tentar Novamente
            </Button>
        </motion.div>
    </div>
);

// --- COMPONENTE PRINCIPAL DO JOGO --- //
interface MeioAmbienteGameProps {
  playerName: string;
  onBackToHub: () => void;
  onSaveScore: (score: number) => void;
}

export default function MeioAmbienteGame({ playerName, onBackToHub, onSaveScore }: MeioAmbienteGameProps) {
  const [sessionBiomes, setSessionBiomes] = useState<BiomeData[]>([]);
  const [currentBiomeIndex, setCurrentBiomeIndex] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'revealed' | 'gameover'>('playing');
  const [identifiedKeywords, setIdentifiedKeywords] = useState<Keyword[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [clickedWords, setClickedWords] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [incorrectGuessCount, setIncorrectGuessCount] = useState(0);
  const [hintsShown, setHintsShown] = useState<string[]>([]);

  // Inicializa o jogo
  useEffect(() => {
    const shuffledBiomes = shuffle([...BIOMES]).slice(0, 3);
    setSessionBiomes(shuffledBiomes);
    setCurrentBiomeIndex(0);
    setTotalScore(0);
  }, []);

  const currentBiome = sessionBiomes[currentBiomeIndex];

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

  const handleFinishPhase = () => {
      onSaveScore(totalScore);
      toast({ title: "Missão Completa! 🎉", description: `Sua pontuação final (${totalScore} pts) foi registrada no Ranking.`, duration: 4000 });
      onBackToHub(); 
  }

  const handleNextBiome = () => {
    if (currentBiomeIndex + 1 < sessionBiomes.length) setCurrentBiomeIndex(prev => prev + 1);
    else handleFinishPhase();
  };

  const getButtonClass = (word: string) => {
    const state = clickedWords[word];
    if (state === 'correct') return 'bg-green-500/80 hover:bg-green-500/90 border-green-400 text-white';
    if (state === 'incorrect') return 'bg-red-500/80 hover:bg-red-500/90 border-red-400 text-white line-through';
    return 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600 text-[#6c7893]';
  }

  const filteredWordBank = wordBank.filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()));

  if (gameState === 'gameover') return <GameOverScreen onRestart={setupBiomeRound} />;
  if (!currentBiome) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden flex flex-col">
       <BackToHomeButton onConfirm={handleUserExit} />

      <header className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={handleUserExit} className="flex items-center gap-3 transition-transform active:scale-95">
            <div className="bg-green-500 p-2 rounded-full"><Globe className="text-white w-5 h-5" /></div>
            <span className="text-blue-900 font-black text-xl md:text-2xl tracking-tighter">BioGuesser</span>
          </button>
        </div>
        
        <h2 className="text-black font-extrabold text-sm md:text-xl absolute left-1/2 -translate-x-1/2 hidden lg:block uppercase tracking-widest opacity-80">
          Meio Ambiente • Fase {currentBiomeIndex + 1} de {sessionBiomes.length}
        </h2>
        
        <div className="flex items-center gap-3 md:gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold transition-colors ${incorrectGuessCount >= 9 ? 'bg-red-100 border-red-300 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
                <span className="hidden sm:inline">Erros:</span>
                <span>{incorrectGuessCount}/12</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600">
                <User size={16} />
                <span className="text-sm font-bold truncate max-w-[100px]">{playerName}</span>
            </div>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full">
                        <HelpCircle size={22} />
                    </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 text-white border-l-slate-700 w-full sm:max-w-lg p-0">
                     <div className="p-6 h-full overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <HelpCircle className="text-blue-400" size={24}/>
                            </div>
                            <h2 className="text-2xl font-black text-white">Como Jogar</h2>
                        </div>
                        <div className="space-y-6 text-left">
                            <div>
                                <h3 className="font-bold text-lg text-blue-300 mb-2">Seu Objetivo</h3>
                                <p className="text-slate-300 leading-relaxed">Identifique o bioma correto a partir das imagens e palavras-chave.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-300 mb-2">Passo a Passo</h3>
                                <ol className="list-decimal list-inside space-y-3 text-slate-300">
                                    <li><strong>Analise as Imagens:</strong> Observe a foto da paisagem e o perfil do solo.</li>
                                    <li><strong>Selecione Palavras-Chave:</strong> Escolha os termos que descrevem o que você vê.</li>
                                    <li><strong>Ganhe Pontos:</strong> Palavras corretas somam pontos.</li>
                                </ol>
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
                                <h3 className="text-[11px] font-black uppercase text-blue-400 tracking-[0.3em] flex items-center gap-2.5"><BrainCircuit size={16} />Banco de Palavras ({wordBank.length})</h3>
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
                                <h3 className="text-[11px] font-black uppercase mb-5 text-blue-400 tracking-[0.3em] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />Amostras Coletadas ({identifiedKeywords.length} de 10)</h3>
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
                                    <span className="text-2xl font-black text-green-400">{totalScore}</span>
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