"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Trees, Flame, Factory, Sun, 
  Tractor, ArrowDownToLine, HeartCrack, Wind, 
  Leaf, CloudRain, Mountain, ShieldAlert,
  ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, ShieldBan, HelpCircle, ZoomIn, X, BookOpen, AlertCircle, Info, AlertTriangle
} from 'lucide-react';

// --- UTILITÁRIOS --- //
function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// --- DADOS DAS FASES --- //
type EventCard = { id: string; text: string; icon: React.ReactNode };

interface PhaseData {
    id: string;
    name: string;
    theme: string;
    question: string;
    satelliteImg: string;
    soilImg: string;
    expectedOrder: EventCard[];
    visuals: {
        satelliteOpacity: number[];
        overlayClass: string[];
        overlayAnimate: object[];
    };
}

const PHASES: PhaseData[] = [
    {
        id: 'amazonia',
        name: 'Amazônia',
        theme: 'Aquecimento Global',
        question: "Qual é a sequência lógica que leva ao aumento da temperatura e seca na floresta?",
        satelliteImg: '/images/biomes/amazonia-satellite.png',
        soilImg: '/images/biomes/amazonia-soil.png',
        expectedOrder: [
            { id: 'amz_1', text: 'Desmatamento', icon: <Trees size={24} /> },
            { id: 'amz_2', text: 'Queimadas', icon: <Flame size={24} /> },
            { id: 'amz_3', text: 'Emissão de CO2', icon: <Factory size={24} /> },
            { id: 'amz_4', text: 'Seca Extrema', icon: <Sun size={24} /> },
        ],
        visuals: {
            satelliteOpacity: [1, 0.7, 0.4, 0.1, 0],
            overlayClass: [
                'bg-transparent', 
                'bg-slate-900/20 grayscale', 
                'bg-orange-600/40 mix-blend-color-burn', 
                'bg-gray-800/60 mix-blend-multiply', 
                'bg-amber-900/50 mix-blend-color sepia-[.75]' 
            ],
            overlayAnimate: [
                {}, {}, 
                { opacity: [0.3, 0.6, 0.3], transition: { repeat: Infinity, duration: 1.5 } }, 
                { opacity: [0.5, 0.8, 0.5], transition: { repeat: Infinity, duration: 3 } }, 
                {}
            ]
        }
    },
    {
        id: 'caatinga',
        name: 'Caatinga',
        theme: 'Desertificação',
        question: "Ordene os eventos que transformam o solo da Caatinga em um deserto estéril:",
        satelliteImg: '/images/biomes/caatinga-satellite.png',
        soilImg: '/images/biomes/caatinga-soil.png',
        expectedOrder: [
            { id: 'caa_1', text: 'Pecuária Intensiva', icon: <Tractor size={24} /> },
            { id: 'caa_2', text: 'Compactação do Solo', icon: <ArrowDownToLine size={24} /> },
            { id: 'caa_3', text: 'Perda de Nutrientes', icon: <HeartCrack size={24} /> },
            { id: 'caa_4', text: 'Tempestade de Areia', icon: <Wind size={24} /> },
        ],
        visuals: {
            satelliteOpacity: [1, 0.8, 0.5, 0.2, 0],
            overlayClass: [
                'bg-transparent',
                'bg-yellow-900/10', 
                'bg-yellow-900/30 saturate-50', 
                'bg-orange-800/40 saturate-0 brightness-75', 
                'bg-yellow-700/60 mix-blend-hard-light backdrop-blur-[2px]' 
            ],
            overlayAnimate: [ {}, {}, {}, {}, { x: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.5 } } ] 
        }
    },
    {
        id: 'cerrado',
        name: 'Laterização',
        question: "Como a retirada da vegetação nativa do Cerrado altera a química do solo?",
        satelliteImg: '/images/biomes/cerrado-satellite.png',
        soilImg: '/images/biomes/cerrado-soil.png',
        expectedOrder: [
            { id: 'cer_1', text: 'Retirada da Vegetação', icon: <Leaf size={24} /> },
            { id: 'cer_2', text: 'Chuva Forte', icon: <CloudRain size={24} /> },
            { id: 'cer_3', text: 'Concentração de Ferro', icon: <Mountain size={24} /> },
            { id: 'cer_4', text: 'Laterização', icon: <ShieldAlert size={24} /> },
        ],
        visuals: {
            satelliteOpacity: [1, 0.7, 0.4, 0.1, 0],
            overlayClass: [
                'bg-transparent',
                'bg-green-900/30 grayscale', 
                'bg-blue-900/40 mix-blend-overlay', 
                'bg-orange-900/50 mix-blend-multiply contrast-125', 
                'bg-red-950/60 mix-blend-multiply contrast-150 saturate-50' 
            ],
            overlayAnimate: [ {}, {}, { opacity: [0.3, 0.5, 0.3], transition: { repeat: Infinity, duration: 0.5 } }, {}, {} ]
        }
    }
];

// --- PAINEL DE AJUDA UNIFICADO (COMO JOGAR + ENEM) --- //
const GameHelpPanel = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" className="bg-red-900/40 border-red-500/50 text-red-200 hover:bg-red-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm">
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> O que cai no ENEM?
            </Button>
        </SheetTrigger>
        <SheetContent className="bg-slate-900/95 backdrop-blur-xl text-slate-100 border-l-slate-700/50 w-full sm:max-w-lg p-0 overflow-y-auto">
             <div className="p-8 h-full overflow-y-auto">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/30">
                        <Info className="text-red-400 w-8 h-8"/>
                    </div>
                    <h2 className="text-3xl font-black text-white">O que cai no ENEM?</h2>
                </div>
                
                <div className="space-y-8 text-left pb-8">
                    {/* COMO JOGAR */}
                    <div>
                        <h3 className="font-black text-xl text-red-400 mb-3 tracking-tight">Como Funciona o Jogo</h3>
                        <ul className="list-decimal list-inside space-y-3 text-slate-300 text-[15px]">
                            <li><strong>Leia a Pergunta:</strong> Identifique o processo de degradação ambiental exigido.</li>
                            <li><strong>Analise o Sistema:</strong> O ecossistema é conectado. Qual evento causa o próximo?</li>
                            <li><strong>Ordene as Cartas:</strong> Clique nas cartas na base da tela na exata <strong>ordem cronológica</strong> em que os desastres acontecem.</li>
                            <li><strong>Cuidado:</strong> Um erro na ordem causará falha na simulação!</li>
                        </ul>
                    </div>

                    <hr className="border-slate-800" />

                    {/* REVISÃO ENEM */}
                    <div>
                        <h3 className="font-black text-xl text-red-400 mb-3 tracking-tight flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> Para que serve no ENEM?
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            O ENEM quase nunca cobra definições isoladas de biomas. A banca exige que você compreenda <strong>processos sistêmicos</strong> (Relação de Causa e Efeito).
                        </p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mt-6">
                        <h3 className="font-black text-lg text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Foco da Prova
                        </h3>
                        <ul className="space-y-4 text-[14px] text-slate-300">
                            <li><strong className="text-white">Laterização:</strong> Processo em que a chuva lava os nutrientes do solo após o desmatamento no Cerrado, deixando uma "crosta de ferro".</li>
                            <li><strong className="text-white">Desertificação:</strong> Como o pisoteio do gado (pecuária) compacta o solo frágil da Caatinga, impedindo a água de entrar.</li>
                            <li><strong className="text-white">Mudanças Climáticas:</strong> A quebra do ciclo de umidade ("Rios Voadores") na Amazônia gera seca para o resto do país.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
);

interface ReacaoEmCadeiaGameProps {
    onFinishGame: (bonusScore: number) => void;
    onReturnHome: () => void; 
}

export default function ReacaoEmCadeiaGame({ onFinishGame, onReturnHome }: ReacaoEmCadeiaGameProps) {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [placedCards, setPlacedCards] = useState<EventCard[]>([]);
    const [availableCards, setAvailableCards] = useState<EventCard[]>([]);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'game_over' | 'phase_complete' | 'all_complete'>('intro');
    const [score, setScore] = useState(0);
    const [isImageExpanded, setIsImageExpanded] = useState(false); 

    const currentPhase = PHASES[phaseIndex];

    const setupPhase = () => {
        setPlacedCards([]);
        setAvailableCards(shuffle([...currentPhase.expectedOrder]));
        setGameState('playing');
        setIsImageExpanded(false);
    };

    const handleStart = () => setupPhase();

    const handleCardClick = (card: EventCard) => {
        if (gameState !== 'playing') return;

        const nextExpectedCard = currentPhase.expectedOrder[placedCards.length];

        if (card.id === nextExpectedCard.id) {
            const newPlaced = [...placedCards, card];
            setPlacedCards(newPlaced);
            setAvailableCards(availableCards.filter(c => c.id !== card.id));
            setScore(prev => prev + 50);

            if (newPlaced.length === 4) {
                setTimeout(() => setGameState('phase_complete'), 1000);
            }
        } else {
            setGameState('game_over');
        }
    };

    const handleNextPhase = () => {
        if (phaseIndex + 1 < PHASES.length) {
            setPhaseIndex(prev => prev + 1);
            setGameState('intro'); 
        } else {
            setGameState('all_complete');
        }
    };

    const handleRetryPhase = () => {
        setScore(prev => Math.max(0, prev - 50));
        setupPhase();
    };

    const handleFinish = () => {
        onFinishGame(score);
    };

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl mx-auto mt-10 relative">
                
                {/* BOTÃO DE VOLTAR NO CANTO SUPERIOR ESQUERDO NA INTRO */}
                <div className="absolute top-6 left-6">
                    <Button variant="ghost" size="icon" onClick={onReturnHome} className="bg-red-600 hover:bg-red-500 text-white rounded-full shrink-0 shadow-md">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </div>

                {/* BOTÃO DE AJUDA NO CANTO SUPERIOR DIREITO NA INTRO */}
                <div className="absolute top-6 right-6">
                    <GameHelpPanel />
                </div>

                <ShieldBan className="w-20 h-20 text-red-500 mb-6 mt-4" />
                <h2 className="text-4xl font-black text-white mb-2">Desafio Final: Efeito Dominó</h2>
                <h3 className="text-2xl text-red-400 mb-6">{currentPhase.name} - {currentPhase.theme}</h3>
                <p className="text-slate-300 text-lg max-w-2xl mb-10 leading-relaxed">
                    A natureza é um sistema conectado. Uma ação destrutiva desencadeia a próxima. 
                    Sua missão é colocar os eventos de degradação na <strong>ordem cronológica exata</strong>. 
                </p>
                <Button onClick={handleStart} className="bg-red-600 hover:bg-red-500 text-white font-bold py-6 px-10 text-xl rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                    Iniciar Simulação
                </Button>
            </div>
        );
    }

    if (gameState === 'all_complete') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-slate-900 border border-green-500/50 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.2)] max-w-4xl mx-auto mt-10">
                <CheckCircle2 className="w-24 h-24 text-green-400 mb-6" />
                <h2 className="text-5xl font-black text-white mb-4">Análise Concluída!</h2>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl">Você mapeou perfeitamente as cadeias de degradação ambiental.</p>
                <div className="bg-slate-800 p-6 rounded-2xl mb-10 border border-slate-700">
                    <p className="text-sm uppercase tracking-widest text-slate-500 mb-1">Bônus de Investigação</p>
                    <p className="text-5xl font-black text-yellow-400">+{score} pts</p>
                </div>
                <Button onClick={handleFinish} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-10 text-xl rounded-2xl transition-all shadow-lg">
                    Concluir Missão <ArrowRight className="ml-2" />
                </Button>
            </div>
        );
    }

    const visualStep = placedCards.length;
    const currentOpacity = currentPhase.visuals.satelliteOpacity[visualStep];
    const currentOverlay = currentPhase.visuals.overlayClass[visualStep];
    const currentAnimation = currentPhase.visuals.overlayAnimate[visualStep] || {};

    const renderSimulationLayers = () => (
        <>
            <img src={currentPhase.soilImg} alt="Solo" className="absolute inset-0 w-full h-full object-cover" />
            <img src={currentPhase.satelliteImg} alt="Satélite" className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ease-in-out" style={{ opacity: currentOpacity }} />
            <motion.div animate={currentAnimation} className={`absolute inset-0 z-20 pointer-events-none transition-all duration-1000 ease-in-out ${currentOverlay}`} />
        </>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
            
            {/* INÍCIO DO CABEÇALHO PADRONIZADO */}
            <header className="w-full flex flex-col md:flex-row justify-between items-center p-3 md:p-6 border-b border-white/10 bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 gap-3 md:gap-4 shadow-xl md:shadow-2xl">
                <div className="flex items-center w-full md:w-auto relative justify-center md:justify-start min-h-[40px]">
                    
                    {/* Botão de voltar padronizado com fundo vermelho */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onReturnHome} 
                        className="bg-red-600 hover:bg-red-500 text-white rounded-full absolute left-0 md:static md:mr-3 shadow-md shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    
                    {/* Títulos alinhados e centralizados no mobile */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex flex-col text-center md:text-left">
                            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold">Bioma: {currentPhase.name}</span>
                            <span className="font-black text-base md:text-lg tracking-tight leading-none text-white">{currentPhase.theme}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
                     <GameHelpPanel /> 
                </div>
            </header>
            {/* FIM DO CABEÇALHO PADRONIZADO */}

            <main className="w-full max-w-5xl mx-auto mt-6 px-4 flex flex-col gap-6 relative pb-10 flex-grow">
                {/* PAINEL DE PERGUNTA */}
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <AlertCircle className="text-red-400 shrink-0 w-6 h-6 md:w-8 md:h-8" />
                    <p className="text-red-100 font-medium text-sm md:text-lg leading-snug">{currentPhase.question}</p>
                </div>

                {/* SIMULADOR VISUAL */}
                <div 
                    onClick={() => setIsImageExpanded(true)}
                    className="relative w-full h-[35vh] md:h-[45vh] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black cursor-pointer group"
                >
                    {renderSimulationLayers()}

                    <div className="absolute inset-0 z-40 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={32} />
                    </div>

                    <AnimatePresence>
                        {gameState === 'game_over' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-red-950/90 flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <ShieldBan className="text-red-500 w-16 h-16 mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Ordem Incorreta!</h2>
                                <p className="text-red-200 mb-6">A degradação não segue esse caminho lógico. Tente novamente.</p>
                                <Button onClick={handleRetryPhase} className="bg-red-600 hover:bg-red-500">Tentar Novamente</Button>
                            </motion.div>
                        )}
                        {gameState === 'phase_complete' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-green-950/80 flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <CheckCircle2 className="text-green-400 w-16 h-16 mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-4">Processo Identificado!</h2>
                                <Button onClick={handleNextPhase} className="bg-green-600 hover:bg-green-500">Próxima Análise</Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ÁREA DE JOGO */}
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5">
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-24 md:h-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center p-2 text-center">
                                {placedCards[i] ? (
                                    <>
                                        <div className="text-red-400 mb-1">{placedCards[i].icon}</div>
                                        <span className="text-[10px] md:text-xs font-bold text-white uppercase">{placedCards[i].text}</span>
                                    </>
                                ) : (
                                    <span className="text-slate-600 font-black text-xl">{i + 1}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {availableCards.map((card) => (
                            <motion.button
                                key={card.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCardClick(card)}
                                className="bg-slate-800 border border-slate-600 p-4 rounded-xl flex flex-col items-center gap-2 w-32 md:w-40 hover:border-red-400 transition-colors"
                            >
                                <div className="text-red-400">{card.icon}</div>
                                <span className="text-xs md:text-sm font-bold text-white">{card.text}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* MODAL ZOOM */}
                <AnimatePresence>
                    {isImageExpanded && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 p-4 flex flex-col items-center justify-center">
                            <Button variant="ghost" onClick={() => setIsImageExpanded(false)} className="absolute top-4 right-4 text-white">
                                <X size={32} />
                            </Button>
                            <div className="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden">
                                {renderSimulationLayers()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}