"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { MissionBriefing } from '@/components/game/mission-briefing';
import { ClueTags, type Keyword } from '@/components/game/clue-tags';
import { Button } from '@/components/ui/button';
import { Globe, Menu, BrainCircuit, ArrowRight, BookOpen, Building, ShieldCheck, Cloud, Search, Lightbulb, HelpCircle, RefreshCw, Trophy, User, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BackToHomeButton } from "@/components/game/back-to-home-button";
import { Input } from "@/components/ui/input";

// IMPORTANDO O NOVO JOGO DE URBANIZAÇÃO
import MacrocefaliaUrbanaGame from '@/components/game/macrocefalia-urbana';

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

// Lógica de Ranking no Local Storage (Atualizado para suportar 'Modos')
export interface ScoreEntry {
    name: string;
    score: number;
    date: string;
    mode?: string; // Diferencia Biomas de Urbanização
}

const getLeaderboard = (): ScoreEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('bioguesser_leaderboard');
    return data ? JSON.parse(data) : [];
};

const saveScore = (name: string, score: number, mode: string = 'Biomas') => {
    if (typeof window === 'undefined') return;
    const leaderboard = getLeaderboard();
    leaderboard.push({ name, score, date: new Date().toISOString(), mode });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('bioguesser_leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
};

// --- DADOS DOS 6 BIOMAS --- //
interface BiomeData {
  name: string;
  imageIds: { landscape: string; detail: string };
  keywords: Record<string, number>;
  distractors: string[];
  hints: string[];
  summary: string;
}

const BIOMES: BiomeData[] = [
    // CORREÇÃO: Atualizamos os imageIds para bater com o placeholder-images.json
    {
        name: 'Caatinga',
        imageIds: { landscape: 'caatinga-landscape', detail: 'caatinga-detail' }, 
        keywords: {
          'Xerófita': 50, 'Semiárido': 45, 'Mandacaru': 40, 'Caatinga': 35, 'Sertão': 30,
          'Mata Branca': 25, 'Aridez': 20, 'Cacto': 15, 'Seca': 10, 'Espinhos': 5 
        },
        distractors: [
          'Tundra', 'Permafrost', 'Taiga', 'Monção', 'Equatorial', 'Floresta de Coníferas',
          'Geleira', 'Altitude Elevada', 'Solo Alagado', 'Neblina Constante', 'Clima Polar'
        ],
        hints: [
            'Este bioma é exclusivamente brasileiro.',
            'A vegetação aqui é adaptada para sobreviver com pouca água.',
            'O clima é quente e seco na maior parte do ano.'
        ],
        summary: "Bioma exclusivamente brasileiro, de clima semiárido. Sua vegetação (xerófita) é altamente adaptada à escassez de água, com forte presença de cactos e arbustos espinhosos que perdem as folhas na seca."
    },
    {
        name: 'Pampa',
        imageIds: { landscape: 'pampa-landscape', detail: 'pampa-detail' },
        keywords: {
          'Gramíneas': 50, 'Coxilhas': 45, 'Pampa': 40, 'Clima Temperado': 35, 'Campos Sulinos': 30,
          'Pecuária': 25, 'Biodiversidade': 20, 'Solo Fértil': 15, 'Ervas': 10, 'Campanha Gaúcha': 5 
        },
        distractors: [
          'Deserto', 'Dunas', 'Oásis', 'Clima Árido', 'Vegetação Esparsa', 'Camelo', 'Savana',
          'Latossolo', 'Fogo', 'Troncos Tortuosos', 'Montanhas Rochosas'
        ],
        hints: [
            'Localizado no sul do Brasil.',
            'A paisagem é dominada por campos de vegetação baixa.',
            'É uma área importante para a atividade agropecuária.'
        ],
        summary: "Também conhecido como Campos Sulinos, é marcado por um relevo de suaves ondulações (coxilhas) coberto por vegetação rasteira (gramíneas). É uma região de grande tradição pecuária no Brasil."
    },
    {
        name: 'Cerrado',
        imageIds: { landscape: 'cerrado-landscape', detail: 'cerrado-detail' },
        keywords: {
          'Savana': 50, 'Hotspot': 45, 'Troncos Tortuosos': 40, 'Cerrado': 35, 'Divisor de Águas': 30,
          'Estação Seca': 25, 'Chapadão': 20, 'Latossolo': 15, 'Arbustivo': 10, 'Fogo': 5 
        },
        distractors: [
          'Tundra', 'Permafrost', 'Geleira', 'Iceberg', 'Aurora Boreal', 'Vegetação Alpina',
          'Floresta Boreal', 'Pinguim', 'Urso Polar', 'Líquens', 'Musgos'
        ],
        hints: [
            'Considerada a savana mais rica em biodiversidade do mundo.',
            'As árvores aqui costumam ter casca grossa e troncos retorcidos.',
            'O fogo faz parte do ciclo natural deste bioma.'
        ],
        summary: "A savana brasileira. Caracteriza-se por um clima com duas estações bem definidas (seca e chuvosa) e vegetação de árvores baixas com troncos retorcidos e cascas grossas que resistem ao fogo natural."
    },
    // ... O resto da array (Amazônia, Mata Atlântica e Pantanal) já está correto! Pode manter igual.
    // OS 3 NOVOS USAM O NOME NOVO (-landscape e -detail)
    {
        name: 'Amazônia',
        imageIds: { landscape: 'amazonia-landscape', detail: 'amazonia-detail' },
        keywords: {
            'Floresta Equatorial': 50, 'Alta Umidade': 45, 'Biodiversidade': 40, 'Bacia Hidrográfica': 35,
            'Latifoliada': 30, 'Lianas': 25, 'Dossel': 20, 'Rio Amazonas': 15, 'Chuvas Abundantes': 10, 'Seringueira': 5 
        },
        distractors: [
            'Seca', 'Cacto', 'Xerófita', 'Neve', 'Pinguim', 'Tundra', 'Taiga', 'Geada', 
            'Folhas Aciculadas', 'Deserto', 'Oásis', 'Camelo'
        ],
        hints: [
            'É a maior floresta tropical do mundo.',
            'O clima é quente e úmido durante o ano todo.',
            'Abriga a maior bacia hidrográfica do planeta.'
        ],
        summary: "A maior floresta equatorial do planeta, de clima quente e muito úmido o ano todo. Possui a maior biodiversidade do mundo e é atravessada pela bacia hidrográfica do rio Amazonas."
    },
    {
        name: 'Mata Atlântica',
        imageIds: { landscape: 'mata-atlantica-landscape', detail: 'mata-atlantica-detail' },
        keywords: {
            'Floresta Tropical': 50, 'Litoral': 45, 'Fragmentação': 40, 'Hotspot': 35, 'Epífitas': 30,
            'Serra do Mar': 25, 'Alta Pluviosidade': 20, 'Bromélias': 15, 'Úmido': 10, 'Pau-Brasil': 5 
        },
        distractors: [
            'Chapadão', 'Clima Semiárido', 'Permafrost', 'Savana', 'Coníferas', 'Tundra', 
            'Deserto', 'Vegetação Rasteira', 'Geleira'
        ],
        hints: [
            'Estende-se por grande parte da costa (litoral) brasileira.',
            'É um dos biomas mais devastados do Brasil por causa da urbanização.',
            'Apresenta muitas montanhas e serras próximas ao mar.'
        ],
        summary: "Uma floresta tropical exuberante que ocupava quase todo o litoral brasileiro. Hoje é um dos biomas mais devastados (devido à urbanização), mas ainda é um hotspot de biodiversidade com rica fauna e flora."
    },
    {
        name: 'Pantanal',
        imageIds: { landscape: 'pantanal-landscape', detail: 'pantanal-detail' },
        keywords: {
            'Planície Inundável': 50, 'Ciclo das Águas': 45, 'Cheias': 40, 'Tuiuiú': 35, 
            'Bacia do Paraguai': 30, 'Mosaico de Vegetação': 25, 'Clima Tropical': 20, 'Fauna Exuberante': 15, 'Jacaré': 10, 'Garça': 5 
        },
        distractors: [
            'Altitude Elevada', 'Clima Polar', 'Permafrost', 'Deserto', 'Seca Extrema', 
            'Floresta de Coníferas', 'Geleira', 'Caatinga', 'Dunas', 'Falésias'
        ],
        hints: [
            'É a maior planície alagável do mundo.',
            'A vida da flora e fauna aqui é ditada pelo ciclo das chuvas e secas.',
            'Fica localizado na região Centro-Oeste do Brasil.'
        ],
        summary: "A maior planície de inundação do mundo. É fortemente influenciada pelo ciclo das águas, alternando entre períodos de seca e grandes cheias, o que atrai uma fauna rica e diversificada, especialmente aves."
    }
];

// --- COMPONENTES DE UI --- //
const LoadingScreen = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
      <Globe className="w-24 h-24 text-green-400 mb-6" />
    </motion.div>
    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="text-5xl font-black tracking-tighter text-white mb-3">
      BioGuesser
    </motion.h1>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.8 }} className="text-blue-400/80 tracking-widest uppercase">
      Calibrando sensores...
    </motion.p>
  </div>
);

const HowToStep = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="text-center">
        <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-900/50 p-4 rounded-full border border-blue-500/50">{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60">{description}</p>
    </div>
);

const GameModeCard = ({ icon, title, description, onClick, enabled = true }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, enabled?: boolean }) => (
    <motion.div
        whileHover={{ scale: enabled ? 1.05 : 1, y: enabled ? -5 : 0 }}
        onClick={onClick}
        className={`bg-slate-800/60 border border-white/10 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${!enabled && 'opacity-50 cursor-not-allowed'}`}>
        <div className="flex justify-center mb-5 text-blue-400">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/50 mb-6">{description}</p>
        <Button disabled={!enabled} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3">
            {enabled ? 'Jogar Agora' : 'Em Breve'}
        </Button>
    </motion.div>
);

const LevelCompleteScreen = ({ biome, score, onNext, isLast }: { biome: BiomeData, score: number, onNext: () => void, isLast: boolean }) => (
    <div className="w-full bg-slate-900 border border-slate-700 p-8 md:p-12 rounded-3xl shadow-2xl text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-green-500/20 p-4 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
            </div>
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

// HomeScreen com os ajustes para manter o usuário logado e nova tipagem do Modo
const HomeScreen = ({ onSelectMode, initialPlayerName, onLogout }: { onSelectMode: (mode: 'biomes' | 'urbanization', playerName: string) => void, initialPlayerName: string, onLogout: () => void }) => {
    const [view, setView] = useState<'home' | 'name_input' | 'ranking'>('home');
    const [selectedMode, setSelectedMode] = useState<'biomes' | 'urbanization' | null>(null);
    const [playerName, setPlayerName] = useState(initialPlayerName || '');
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

    useEffect(() => {
        if (view === 'ranking') {
            setLeaderboard(getLeaderboard());
        }
    }, [view]);

    const handleModeSelection = (mode: string) => {
        if (mode === 'biomes' || mode === 'urbanization') {
            if (initialPlayerName) {
                onSelectMode(mode as 'biomes' | 'urbanization', initialPlayerName);
            } else {
                setSelectedMode(mode as 'biomes' | 'urbanization');
                setView('name_input'); 
            }
        } else {
            toast({ title: "Modo em Desenvolvimento", description: `O modo ${mode} ainda não está disponível.` });
        }
    }

    const handleStartGame = () => {
        if (playerName.trim().length < 3) {
            toast({ title: "Atenção", description: "Por favor, insira um nome com pelo menos 3 letras.", variant: "destructive" });
            return;
        }
        if (selectedMode) {
            onSelectMode(selectedMode, playerName.trim());
        }
    };

    if (view === 'name_input') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-700 max-w-md w-full text-center shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-500/20 p-4 rounded-full"><User className="text-blue-400 w-10 h-10" /></div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Identifique-se</h2>
                    <p className="text-slate-400 mb-8">Digite seu nome ou apelido para registrarmos sua pontuação no ranking.</p>
                    
                    <Input 
                        type="text" 
                        placeholder="Ex: João Silva" 
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                        className="bg-slate-800 border-slate-600 text-white text-lg py-6 mb-6 text-center rounded-xl"
                        maxLength={15}
                    />
                    
                    <div className="flex gap-4">
                        <Button onClick={() => setView('home')} variant="ghost" className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800 py-6">Voltar</Button>
                        <Button onClick={handleStartGame} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-6 text-lg">Iniciar Missão</Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (view === 'ranking') {
        return (
            <div className="min-h-screen bg-[#020617] p-4 md:p-10 flex flex-col items-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Trophy className="text-yellow-400 w-8 h-8" />
                            <h2 className="text-2xl font-black text-white">Top 10 Exploradores</h2>
                        </div>
                        <Button onClick={() => setView('home')} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"><X /></Button>
                    </div>
                    
                    <div className="p-2 md:p-6">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">Nenhum registro encontrado. Seja o primeiro a jogar!</div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xl font-black w-8 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'}`}>#{index + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-lg">{entry.name}</span>
                                                <span className="text-slate-500 text-xs uppercase tracking-widest">{entry.mode || 'Biomas'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-green-400 font-black text-xl">{entry.score} pts</span>
                                            <span className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#020617] text-white">
            <header className="bg-[#0A1024] border-b border-white/10 px-8 py-5 flex justify-between items-center sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-3">
                     <div className="bg-green-500 p-2 rounded-full"><Globe className="text-white w-5 h-5" /></div>
                    <span className="text-white font-black text-2xl tracking-tighter">BioGuesser</span>
                </div>
                {/* Se o jogador já estiver logado, aparece no topo da Home com opção de trocar usuário */}
                {initialPlayerName && (
                    <div className="flex items-center gap-4">
                        <span className="text-slate-300 text-sm hidden sm:inline">Bem-vindo, <strong className="text-white">{initialPlayerName}</strong></span>
                        <Button variant="ghost" onClick={onLogout} className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full">
                            Trocar Usuário
                        </Button>
                    </div>
                )}
            </header>

            <section className="text-center py-20 md:py-32 px-4">
                 <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
                    Explore o mundo e teste seus conhecimentos
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3}} className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10">
                    Analise imagens, identifique elementos geográficos e ganhe pontos para subir no ranking.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5}} className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={() => document.getElementById('modos')?.scrollIntoView({ behavior: 'smooth' })} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full px-8 py-6 text-lg shadow-lg shadow-blue-900/50">
                        Começar Jogo <ArrowRight className="ml-2" />
                    </Button>
                    <Button onClick={() => setView('ranking')} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold rounded-full px-8 py-6 text-lg">
                        <Trophy className="mr-2 text-yellow-400" /> Ver Ranking
                    </Button>
                </motion.div>
            </section>

            <section className="py-20 bg-slate-900/50 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Como Funciona?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <HowToStep icon={<BookOpen size={32} />} title="1. Observe a Imagem" description="Analise a paisagem e o perfil do solo apresentados." />
                        <HowToStep icon={<BrainCircuit size={32} />} title="2. Escolha os Elementos" description="Use o banco de palavras para selecionar os termos corretos." />
                        <HowToStep icon={<ShieldCheck size={32} />} title="3. Ganhe Pontos" description="Acerte mais para acumular pontos e subir no ranking." />
                    </div>
                </div>
            </section>

            <section id="modos" className="py-20 px-4">
                 <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Modos de Jogo</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* 1. Alterado de "Biomas" para "Meio Ambiente" */}
                        <GameModeCard icon={<Globe size={40}/>} title="Meio Ambiente" description="Identifique biomas e aspectos ambientais do Brasil." onClick={() => handleModeSelection('biomes')} />
                        
                        <GameModeCard icon={<Building size={40}/>} title="Urbanização" description="Analise o crescimento das cidades e evite a Macrocefalia Urbana." onClick={() => handleModeSelection('urbanization')} enabled={true} />
                        
                        <GameModeCard icon={<ShieldCheck size={40}/>} title="Geopolítica" description="Entenda as disputas territoriais." onClick={() => handleModeSelection('Geopolítica')} enabled={false} />
                        
                        {/* 2. Alterado de "Clima" para "Fenômenos Naturais" */}
                        <GameModeCard icon={<Cloud size={40}/>} title="Fenômenos Naturais" description="Explore os tipos climáticos e fenômenos naturais." onClick={() => handleModeSelection('Clima')} enabled={false} />
                    </div>
                 </div>
            </section>
        </main>
    );
}

const GameOverScreen = ({ onRestart }: { onRestart: () => void }) => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-slate-900/50 border border-red-500/50 rounded-2xl shadow-2xl shadow-red-500/20"
        >
            <h1 className="text-6xl font-black text-red-500 mb-4">Game Over</h1>
            <p className="text-xl text-white/80 mb-8 max-w-md">Você cometeu 12 erros e a análise foi comprometida. A fase será reiniciada.</p>
            <Button onClick={onRestart} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full px-10 py-5 text-lg">
                <RefreshCw className="mr-2" />
                Tentar Novamente
            </Button>
        </motion.div>
    </div>
);

// --- MAIN APP EXPORT --- //
export default function BioGuesser() {
  const [isLoading, setIsLoading] = useState(true);
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  // Estados do Jogo de Biomas
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

  const currentBiome = sessionBiomes[currentBiomeIndex];

  const handleReturnHome = useCallback(() => {
    setGameMode(null);
    setSessionBiomes([]);
    setCurrentBiomeIndex(0);
    setGameState('playing');
    setIdentifiedKeywords([]);
    setTotalScore(0);
    setWordBank([]);
    setClickedWords({});
    setSearchTerm("");
    setIncorrectGuessCount(0);
    setHintsShown([]);
  }, []);

 const handleSelectMode = (mode: 'biomes' | 'urbanization', name: string) => {
    setPlayerName(name); 
    setGameMode(mode);

    // Setup inicial apenas se o modo for Biomas
    if (mode === 'biomes') {
        // Passo 1: [...BIOMES] cria uma cópia da lista de 6 biomas.
        // Passo 2: shuffle() embaralha essa lista de forma 100% aleatória.
        // Passo 3: .slice(0, 3) seleciona os 3 primeiros biomas sorteados.
        const shuffledBiomes = shuffle([...BIOMES]).slice(0, 3);
        
        setSessionBiomes(shuffledBiomes);
        setCurrentBiomeIndex(0);
        setTotalScore(0);
    }
  };

  const setupBiomeRound = useCallback(() => {
    if (!currentBiome) return;
    
    const correctWords = Object.keys(currentBiome.keywords);
    
    let possibleDistractors: string[] = [];
    BIOMES.forEach(b => {
        if (b.name !== currentBiome.name) {
            possibleDistractors.push(...Object.keys(b.keywords));
            possibleDistractors.push(...b.distractors);
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
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gameMode === 'biomes' && sessionBiomes.length > 0) {
        setupBiomeRound();
    }
  }, [currentBiomeIndex, gameMode, sessionBiomes, setupBiomeRound]);

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
         toast({
            title: "Penalidade Aplicada!",
            description: "A cada 3 erros, 15 pontos são descontados.",
            variant: "destructive",
            duration: 4000
        });

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
        handleReturnHome();
    }
  };

  const handleFinishPhase = () => {
      saveScore(playerName, totalScore, 'Biomas');
      toast({ 
          title: "Missão Completa! 🎉", 
          description: `Sua pontuação final (${totalScore} pts) foi registrada no Ranking.`,
          duration: 4000 
      });
      handleReturnHome(); 
  }

  const handleNextBiome = () => {
    if (currentBiomeIndex + 1 < sessionBiomes.length) {
        setCurrentBiomeIndex(prev => prev + 1);
    } else {
        handleFinishPhase();
    }
  };

  const getButtonClass = (word: string) => {
    const state = clickedWords[word];
    if (state === 'correct') return 'bg-green-500/80 hover:bg-green-500/90 border-green-400 text-white';
    if (state === 'incorrect') return 'bg-red-500/80 hover:bg-red-500/90 border-red-400 text-white line-through';
    return 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600 text-[#6c7893]';
  }

  const filteredWordBank = wordBank.filter(word => 
    word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. TELA DE LOADING
  if (isLoading) return <LoadingScreen />;
  
  // 2. TELA INICIAL
  if (!gameMode) return <HomeScreen onSelectMode={handleSelectMode} initialPlayerName={playerName} onLogout={() => setPlayerName('')} />;
  
  // 3. ROTEAMENTO PARA O NOVO MODO DE URBANIZAÇÃO
  if (gameMode === 'urbanization') {
      return <MacrocefaliaUrbanaGame playerName={playerName} onReturnHome={handleReturnHome} onSaveScore={(score) => saveScore(playerName, score, 'Urbanização')} />;
  }

  // 4. FLUXO DO MODO BIOMAS
  if (gameState === 'gameover') return <GameOverScreen onRestart={setupBiomeRound} />;
  if (!currentBiome) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500/30 flex flex-col">
       
       <BackToHomeButton onConfirm={handleUserExit} />

      <header className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={handleUserExit} className="flex items-center gap-3 transition-transform active:scale-95">
            <div className="bg-green-500 p-2 rounded-full"><Globe className="text-white w-5 h-5" /></div>
            <span className="text-blue-900 font-black text-xl md:text-2xl tracking-tighter">BioGuesser</span>
          </button>
        </div>
        
        <h2 className="text-black font-extrabold text-sm md:text-xl absolute left-1/2 -translate-x-1/2 hidden lg:block uppercase tracking-widest opacity-80">
          Modo: Biomas • Fase {currentBiomeIndex + 1} de {sessionBiomes.length}
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
                            <h2 className="text-2xl font-black text-white">Como Jogar: Modo Biomas</h2>
                        </div>
                        
                        <div className="space-y-6 text-left">
                            <div>
                                <h3 className="font-bold text-lg text-blue-300 mb-2">O que é um Bioma?</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Um bioma é uma grande comunidade de plantas e animais que vivem em uma área específica, definida pelo clima, solo e vegetação.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-300 mb-2">Seu Objetivo</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Sua missão é identificar o bioma correto a partir das pistas visuais (imagens) e das palavras-chave que você selecionar.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-300 mb-2">Passo a Passo</h3>
                                <ol className="list-decimal list-inside space-y-3 text-slate-300">
                                    <li><strong>Analise as Imagens:</strong> Observe com atenção a foto da paisagem e o perfil do solo.</li>
                                    <li><strong>Selecione Palavras-Chave:</strong> Use o "Banco de Palavras" para escolher os termos que descrevem o que você vê. Você pode usar a busca para achar palavras mais rápido.</li>
                                    <li><strong>Ganhe Pontos:</strong> Palavras corretas somam pontos. Lembre-se, há exatas 10 palavras corretas perdidas no meio de 30 totais!</li>
                                    <li><strong>Receba Dicas:</strong> A cada 3 palavras erradas, o sistema liberará uma dica para te ajudar.</li>
                                    <li><strong>Envie sua Dedução:</strong> Quando estiver confiante, clique para enviar sua análise e descobrir o resultado.</li>
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
                                    <Input 
                                        type="text"
                                        placeholder="Filtrar palavras-chave..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-800/50 border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white w-full"
                                    />
                                </div>
                                {searchTerm && (
                                    <p className="text-sm text-slate-400">Encontrados {filteredWordBank.length} resultados para "<span className="font-bold text-white">{searchTerm}</span>".</p>
                                )}
                                <div className="flex flex-wrap gap-2.5 pt-2">
                                {filteredWordBank.length > 0 ? (
                                    filteredWordBank.map(word => (
                                        <Button key={word} onClick={() => handleWordClick(word)} className={`rounded-full px-4 py-1.5 text-base font-bold transition-all border ${getButtonClass(word)}`}>{word}</Button>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center w-full">Nenhuma palavra-chave encontrada.</p>
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
                    <LevelCompleteScreen 
                        biome={currentBiome} 
                        score={totalScore} 
                        onNext={handleNextBiome} 
                        isLast={currentBiomeIndex === sessionBiomes.length - 1} 
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}