"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building, Hammer, ArrowLeft, ArrowRight, Coins, Users, AlertCircle, Calendar, ShieldCheck, BookOpen, FastForward, FileText, TrendingUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// --- TIPAGENS --- //
interface MacrocefaliaUrbanaGameProps {
    playerName: string;
    onReturnHome: () => void;
    onSaveScore: (score: number) => void;
}

type CardType = 'build' | 'policy' | 'economy';

interface ActionCard {
    id: string;
    title: string;
    effectText: string;
    explanation: string;
    cost: number;
    type: CardType;
    effect: (state: GameState) => Partial<GameState>;
}

interface EventCard {
    title: string;
    description: string;
    type: 'negative' | 'neutral' | 'positive';
    effect: (state: GameState) => Partial<GameState>;
}

interface GameState {
    population: number;
    infrastructure: number;
    budget: number;
    month: number;
    score: number;
}

// --- BASE DE DADOS DE CARTAS (COM EXPLICAÇÕES DIDÁTICAS) --- //
const ACTION_CARDS: ActionCard[] = [
    {
        id: 'c1', 
        title: 'Bairro Planejado', 
        effectText: '+3 Infraestrutura', 
        explanation: 'A construção de bairros bem estruturados com asfalto e esgoto descentraliza a cidade e reduz a favelização nas periferias.',
        cost: 15, 
        type: 'build',
        effect: (s) => ({ infrastructure: s.infrastructure + 3 })
    },
    {
        id: 'c2', 
        title: 'Mutirão Comunitário', 
        effectText: '+1 Infraestrutura', 
        explanation: 'Moradores unem-se para pequenas melhorias locais, como limpeza de valas e pavimentação. É barato, mas o impacto estrutural geral é limitado.',
        cost: 5, 
        type: 'build',
        effect: (s) => ({ infrastructure: s.infrastructure + 1 })
    },
    {
        id: 'c3', 
        title: 'Fixação no Campo', 
        effectText: 'Reduz o Êxodo (-2 População)', 
        explanation: 'Políticas de subsídio e crédito para a agricultura familiar reduzem o êxodo rural, diminuindo a chegada de novas pessoas à cidade.',
        cost: 12, 
        type: 'policy',
        effect: (s) => ({ population: Math.max(0, s.population - 2) })
    },
    {
        id: 'c4', 
        title: 'Taxa Urbana Extra', 
        effectText: '+12 Orçamento, mas +1 População', 
        explanation: 'Aumentar impostos atrai grandes investidores para o centro (trazendo mais pessoas a reboque), mas gera uma injeção rápida de dinheiro público.',
        cost: 0, 
        type: 'economy',
        effect: (s) => ({ budget: s.budget + 12, population: s.population + 1 })
    },
    {
        id: 'c5', 
        title: 'Hospital Central', 
        effectText: '+4 Infraestrutura', 
        explanation: 'Construir um grande complexo de saúde centralizado melhora drasticamente o atendimento à população doente, exigindo um alto investimento.',
        cost: 20, 
        type: 'build',
        effect: (s) => ({ infrastructure: s.infrastructure + 4 })
    },
    {
        id: 'c6', 
        title: 'Plano Diretor', 
        effectText: '+2 Infraestrutura, -1 População', 
        explanation: 'Regras rígidas de zoneamento organizam o crescimento urbano, evitam a ocupação de encostas e freiam a especulação imobiliária caótica.',
        cost: 18, 
        type: 'policy',
        effect: (s) => ({ infrastructure: s.infrastructure + 2, population: Math.max(0, s.population - 1) }) 
    },
    {
        id: 'c7', 
        title: 'Parceria Privada', 
        effectText: '+1 Infraestrutura, +8 Orçamento', 
        explanation: 'Concessão de serviços públicos para empresas privadas. Gera caixa rápido para a prefeitura, mas o controle estrutural direto é menor.',
        cost: 5, 
        type: 'economy',
        effect: (s) => ({ infrastructure: s.infrastructure + 1, budget: s.budget + 8 })
    },
    {
        id: 'c8', 
        title: 'Saneamento Básico', 
        effectText: '+2 Infraestrutura', 
        explanation: 'Obras de esgoto e água encanada nas periferias previnem a proliferação de doenças (como dengue) e melhoram as condições de moradia.',
        cost: 10, 
        type: 'build',
        effect: (s) => ({ infrastructure: s.infrastructure + 2 })
    },
    {
        id: 'c9', 
        title: 'Festival da Cidade', 
        effectText: '+15 Pontos de Gestão', 
        explanation: 'Eventos culturais trazem alegria e aumentam a sua popularidade como gestor, mas não resolvem o problema do inchaço urbano.',
        cost: 5, 
        type: 'policy',
        effect: (s) => ({ score: s.score + 15 })
    }
];

const RANDOM_EVENTS: EventCard[] = [
    {
        title: 'Seca no Sertão!', description: 'Êxodo rural em massa! A população disparou (+5 População).', type: 'negative',
        effect: (s) => ({ population: s.population + 5 })
    },
    {
        title: 'Polo Industrial Aberto!', description: 'Novos empregos geram impostos, mas atraem pessoas (+3 Pop, +15 Orçamento).', type: 'neutral',
        effect: (s) => ({ population: s.population + 3, budget: s.budget + 15 })
    },
    {
        title: 'Enchente Severa!', description: 'Áreas sem planeamento colapsaram sob as chuvas fortes (-2 Infraestrutura).', type: 'negative',
        effect: (s) => ({ infrastructure: Math.max(0, s.infrastructure - 2) })
    },
    {
        title: 'Apoio Federal!', description: 'O Ministério repassou fundos emergenciais para obras (+20 Orçamento).', type: 'positive',
        effect: (s) => ({ budget: s.budget + 20 })
    }
];

// --- COMPONENTE PRINCIPAL --- //
export default function MacrocefaliaUrbanaGame({ playerName, onReturnHome, onSaveScore }: MacrocefaliaUrbanaGameProps) {
    const [gameState, setGameState] = useState<GameState>({
        population: 5,
        infrastructure: 8,
        budget: 15,
        month: 1,
        score: 0
    });
    
    const [hand, setHand] = useState<ActionCard[]>([]);
    const [status, setStatus] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
    const [phase, setPhase] = useState<'selection' | 'resolution'>('selection'); 
    const [turnLogs, setTurnLogs] = useState<string[]>([]);
    const [pendingEvent, setPendingEvent] = useState<EventCard | null>(null);
    
    const [showCollapseInfo, setShowCollapseInfo] = useState(false);

    const difference = gameState.population - gameState.infrastructure;
    const maxMonths = 12;

    const drawHand = useCallback(() => {
        const shuffled = [...ACTION_CARDS].sort(() => 0.5 - Math.random()).slice(0, 3).map(card => ({...card, id: `${card.id}-${Date.now()}`}));
        setHand(shuffled);
    }, []);

    const executeTurn = (card?: ActionCard) => {
        setGameState(prev => {
            let tempState = { ...prev };
            let newLogs: string[] = [];

            if (card) {
                const effectChanges = card.effect(tempState);
                tempState = { ...tempState, ...effectChanges };
                tempState.budget -= card.cost;
                tempState.score += 10;
                newLogs.push(`Aprovou o projeto: ${card.title} (-${card.cost}M)`);
            } else {
                newLogs.push(`Nenhuma obra aprovada. Verba poupada.`);
            }

            const naturalGrowth = Math.floor(tempState.month / 3) + 1; 
            const income = 5 + Math.floor(tempState.infrastructure / 2); 

            tempState.population += naturalGrowth;
            tempState.budget += income;
            tempState.month += 1;

            newLogs.push(`Aumento populacional natural: +${naturalGrowth}`);
            newLogs.push(`Impostos arrecadados no mês: +${income}M`);

            if (tempState.month <= maxMonths && Math.random() < 0.3) {
                const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
                setPendingEvent(randomEvent); 
                const eventChanges = randomEvent.effect(tempState);
                tempState = { ...tempState, ...eventChanges };
                newLogs.push(`⚠️ EVENTO: ${randomEvent.title}`);
            }

            setTurnLogs(newLogs);
            return tempState;
        });

        setPhase('resolution');
    };

    const nextMonth = () => {
        if (difference >= 30) {
            setStatus('gameover');
            return;
        }
        if (gameState.month > maxMonths) {
            setStatus('victory');
            return;
        }

        drawHand();
        setPhase('selection');
    };

    const handleExit = () => {
        if (status === 'playing' && window.confirm("Deseja renunciar ao seu mandato de Gestor? O progresso será perdido.")) {
            onReturnHome();
        } else if (status !== 'playing') {
            onReturnHome();
        }
    };

    // --- COMPONENTE DO PAINEL DO ENEM --- //
    const EnemHelpPanel = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-blue-900/40 border-blue-500/50 text-blue-200 hover:bg-blue-800 hover:text-white rounded-full px-4 font-bold shadow-lg">
                    <HelpCircle className="w-5 h-5 mr-2" /> O que cai no ENEM?
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900/95 backdrop-blur-xl text-slate-100 border-l-slate-700/50 w-full sm:max-w-lg p-0 overflow-y-auto">
                 <div className="p-8">
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                        <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                            <BookOpen className="text-blue-400 w-8 h-8"/>
                        </div>
                        <h2 className="text-3xl font-black text-white">Revisão ENEM</h2>
                    </div>
                    
                    <div className="space-y-8 text-left">
                        <div>
                            <h3 className="font-black text-xl text-blue-400 mb-3 tracking-tight">O que é a Macrocefalia Urbana?</h3>
                            <p className="text-slate-300 leading-relaxed text-[15px]">
                                É o <strong>inchaço desordenado</strong> de uma metrópole. Ocorre quando uma cidade cresce muito rápido, concentrando população e serviços, enquanto a infraestrutura não acompanha esse ritmo.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-red-400 mb-3 tracking-tight">Causas (Como começa)</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-300 text-[15px]">
                                <li><strong>Êxodo Rural:</strong> Pessoas fogem do campo (mecanização agrícola, secas, concentração de terras) para buscar emprego na cidade.</li>
                                <li><strong>Industrialização Tardia:</strong> Fábricas concentradas em poucas cidades atraíram multidões rapidamente a partir dos anos 50 no Brasil.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-yellow-400 mb-3 tracking-tight">Consequências (O Colapso)</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-300 text-[15px]">
                                <li><strong>Favelização e Segregação Socioespacial:</strong> Os mais pobres são empurrados para as periferias sem saneamento básico.</li>
                                <li><strong>Saturação de Serviços:</strong> Falta de hospitais, escolas e transporte público lotado (como você viu na barra de Infraestrutura do jogo).</li>
                                <li><strong>Problemas Ambientais:</strong> Ilhas de calor, enchentes por impermeabilização do solo e poluição.</li>
                            </ul>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mt-6">
                            <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Dica para a Prova
                            </h3>
                            <p className="text-sm text-slate-300">
                                Nas questões do ENEM, a Macrocefalia Urbana está sempre ligada à <strong>falta de planejamento do Estado</strong> e ao aumento da <strong>desigualdade social</strong>. Se a prova perguntar a solução, busque alternativas que falem sobre "Descentralização de investimentos" ou "Políticas de fixação no campo".
                            </p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    // --- TELAS SECUNDÁRIAS (TUTORIAL, GAME OVER, VITÓRIA) --- //
    if (status === 'intro') {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative">
                    
                    <div className="absolute top-6 right-6">
                        <EnemHelpPanel />
                    </div>

                    <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30">
                            <Building className="w-16 h-16 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-center mb-6">Macrocefalia Urbana</h1>
                    <p className="text-slate-300 text-lg text-center mb-10">
                        A cidade está a crescer rápido demais devido ao êxodo rural. O seu objetivo, <strong>Prefeito {playerName}</strong>, é gerir o orçamento durante <strong>12 meses</strong> sem deixar a cidade entrar em colapso.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg text-center">
                            <Users className="w-10 h-10 text-red-400 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">1. O Problema</h3>
                            <p className="text-sm text-slate-400">A População cresce todo mês. Se o descompasso com a Infraestrutura chegar a 30, é Game Over!</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg text-center">
                            <BookOpen className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">2. Suas Cartas</h3>
                            <p className="text-sm text-slate-400">Todo mês você compra 3 cartas gigantes. Escolha 1 projeto para construir infraestrutura ou políticas.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg text-center">
                            <Coins className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">3. Orçamento</h3>
                            <p className="text-sm text-slate-400">Sem dinheiro? Pode <strong>Poupar e Avançar</strong> para recolher impostos da infraestrutura existente.</p>
                        </div>
                    </div>

                    <Button onClick={() => { drawHand(); setStatus('playing'); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 text-xl rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all">
                        Assumir a Prefeitura
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (status === 'gameover') {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white absolute inset-0 z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-red-500/50 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.2)] max-w-2xl relative">
                    <div className="absolute top-6 right-6">
                        <EnemHelpPanel />
                    </div>
                    <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce" />
                    <h1 className="text-5xl md:text-6xl font-black text-red-500 mb-4 tracking-tighter">Colapso Urbano!</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        A Macrocefalia Urbana tomou conta da cidade. A diferença entre População e Infraestrutura ultrapassou os 30 pontos, gerando colapso dos serviços públicos.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={onReturnHome} variant="ghost" className="text-slate-400 hover:text-white py-6 text-lg">Voltar ao Menu</Button>
                        <Button onClick={() => { setGameState({population: 5, infrastructure: 8, budget: 15, month: 1, score: 0}); setPhase('selection'); setStatus('playing'); drawHand(); }} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-6 text-lg">Tentar Novo Mandato</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'victory') {
        const finalScore = gameState.score + (gameState.infrastructure * 5) + gameState.budget;
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white absolute inset-0 z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-green-500/50 rounded-3xl shadow-[0_0_80px_rgba(34,197,94,0.2)] max-w-2xl relative">
                    <div className="absolute top-6 right-6">
                        <EnemHelpPanel />
                    </div>
                    <ShieldCheck className="w-24 h-24 text-green-400 mx-auto mb-6" />
                    <h1 className="text-5xl md:text-6xl font-black text-green-400 mb-4 tracking-tighter">Mandato de Sucesso!</h1>
                    <p className="text-xl text-slate-300 mb-8">
                        PARABÉNS, {playerName}! Governou por 12 meses e evitou o inchaço urbano através de um excelente planeamento estratégico.
                    </p>
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl mb-8 shadow-inner">
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Pontuação Final de Gestão</p>
                        <p className="text-6xl font-black text-yellow-400 drop-shadow-md">{finalScore} pts</p>
                    </div>
                    <Button onClick={() => { onSaveScore(finalScore); onReturnHome(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 text-xl hover:scale-105 transition-transform">Salvar Pontuação e continuar </Button>
                </motion.div>
            </div>
        );
    }

    // --- TELA PRINCIPAL (JOGO) --- //
    const maxBarValueVisual = Math.max(gameState.population, gameState.infrastructure, 30);

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
            
            {/* OVERLAY EXPLICANDO O RISCO DE COLAPSO */}
            <AnimatePresence>
                {showCollapseInfo && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-md w-full p-8 rounded-3xl border-2 shadow-2xl text-center bg-slate-900 border-slate-600"
                        >
                            <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
                            <h2 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">O que é o Risco de Colapso?</h2>
                            <p className="text-lg text-slate-300 mb-8 font-medium leading-relaxed">
                                Ele representa a <strong>diferença (Erros de Gestão)</strong> entre o número de habitantes e a infraestrutura disponível. <br/><br/>
                                Se a população crescer muito e a infraestrutura não acompanhar (chegando a 30 pontos de diferença), a cidade sofre um colapso total (favelização, trânsito parado, hospitais lotados) e é <strong>Game Over</strong>!
                            </p>
                            <Button 
                                onClick={() => setShowCollapseInfo(false)} 
                                className="w-full font-black py-7 text-lg bg-blue-600 text-white hover:bg-blue-500"
                            >
                                Entendi
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OVERLAY DE EVENTOS POP-UP */}
            <AnimatePresence>
                {pendingEvent && phase === 'resolution' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                            className={`max-w-md w-full p-8 rounded-[2.5rem] border-2 shadow-2xl text-center ${pendingEvent.type === 'negative' ? 'bg-red-950 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.4)]' : pendingEvent.type === 'positive' ? 'bg-green-950 border-green-500 shadow-[0_0_80px_rgba(34,197,94,0.4)]' : 'bg-blue-950 border-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.4)]'}`}
                        >
                            <AlertCircle className={`w-20 h-20 mx-auto mb-6 ${pendingEvent.type === 'negative' ? 'text-red-400' : pendingEvent.type === 'positive' ? 'text-green-400' : 'text-blue-400'}`} />
                            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tight">{pendingEvent.title}</h2>
                            <p className="text-lg text-slate-300 mb-8">{pendingEvent.description}</p>
                            <Button 
                                onClick={() => setPendingEvent(null)} 
                                className="w-full font-black py-7 text-lg bg-white text-slate-900 hover:bg-slate-200 shadow-xl"
                            >
                                Entendido
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CABEÇALHO GLOBAL */}
            <header className="w-full flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <Button variant="ghost" size="icon" onClick={handleExit} className="text-slate-400 hover:text-white bg-slate-800 rounded-full"><ArrowLeft /></Button>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl"><Building className="text-white w-5 h-5" /></div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight leading-none">Gestão Urbana</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    <EnemHelpPanel /> {/* <-- BOTÃO DE AJUDA DO ENEM AQUI */}
                    <div className="w-px h-6 bg-slate-700 hidden sm:block" />
                    
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        {/* Como "month" já avançou no state, mas a UI reflete o mês que acabou de fechar: */}
                        <span className="font-bold text-slate-300 hidden sm:inline">Mês {Math.min(gameState.month - 1, maxMonths)}/{maxMonths}</span>
                        <span className="font-bold text-slate-300 sm:hidden">{Math.min(gameState.month - 1, maxMonths)}/{maxMonths}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        <motion.span key={`budget-${gameState.budget}`} initial={{ scale: 1.5, color: '#fff' }} animate={{ scale: 1, color: '#facc15' }} className="font-black text-xl sm:text-2xl text-yellow-400">{gameState.budget}M</motion.span>
                    </div>
                </div>
            </header>

            {/* FASE 1: SELEÇÃO DE CARTAS (Cartas Gigantes no Centro) */}
            {phase === 'selection' && (
                <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                                    <BookOpen className="text-blue-400 w-8 h-8" /> Projetos do Mandato
                                </h2>
                                <p className="text-slate-400 mt-2 text-lg">Analise as opções e aprove 1 projeto para este mês.</p>
                            </div>
                            
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    onClick={() => executeTurn()} 
                                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-8 px-8 rounded-2xl shadow-xl text-lg"
                                >
                                    <FastForward className="mr-3 w-6 h-6 text-yellow-400" /> Poupar Verba e Avançar
                                </Button>
                            </motion.div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <AnimatePresence mode="popLayout">
                                {hand.map((card, idx) => {
                                    const canAfford = gameState.budget >= card.cost;
                                    return (
                                        <motion.div
                                            key={card.id}
                                            initial={{ opacity: 0, rotateY: 90, scale: 0.8, y: 100 }}
                                            animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                            transition={{ delay: idx * 0.15, type: "spring", stiffness: 200, damping: 20 }}
                                            whileHover={canAfford ? { y: -20, scale: 1.03 } : {}}
                                            className={`flex flex-col rounded-[2.5rem] p-8 border-4 transition-colors shadow-2xl bg-slate-900 min-h-[400px] ${
                                                canAfford 
                                                ? card.type === 'build' ? 'border-blue-500 hover:border-blue-400 shadow-[0_20px_50px_rgba(59,130,246,0.2)]'
                                                : card.type === 'policy' ? 'border-purple-500 hover:border-purple-400 shadow-[0_20px_50px_rgba(168,85,247,0.2)]'
                                                : 'border-green-500 hover:border-green-400 shadow-[0_20px_50px_rgba(34,197,94,0.2)]'
                                                : 'border-slate-800 opacity-60 grayscale'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-inner ${
                                                    card.type === 'build' ? 'bg-blue-950 text-blue-400'
                                                    : card.type === 'policy' ? 'bg-purple-950 text-purple-400'
                                                    : 'bg-green-950 text-green-400'
                                                }`}>
                                                    {card.type === 'build' ? 'Construção' : card.type === 'policy' ? 'Política' : 'Economia'}
                                                </span>
                                                
                                                <div className={`flex items-center gap-2 font-black text-3xl bg-slate-950 px-4 py-2 rounded-2xl border-2 border-slate-800 ${canAfford ? 'text-yellow-400' : 'text-red-500'}`}>
                                                    <Coins size={24} /> {card.cost}M
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-3xl font-black text-white mb-2 leading-tight">{card.title}</h3>
                                            
                                            {/* O efeito mecânico em destaque */}
                                            <div className="mb-4 inline-block">
                                                <span className="text-blue-300 font-bold text-sm bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-900/50">
                                                    {card.effectText}
                                                </span>
                                            </div>

                                            {/* A explicação didática e geográfica */}
                                            <p className="text-slate-400 text-base font-medium mb-8 flex-grow leading-relaxed">
                                                {card.explanation}
                                            </p>
                                            
                                            <Button 
                                                onClick={() => executeTurn(card)} 
                                                disabled={!canAfford}
                                                className={`w-full font-black rounded-2xl py-8 text-xl transition-transform active:scale-90 mt-auto ${
                                                    canAfford 
                                                    ? 'bg-white hover:bg-slate-200 text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.4)]' 
                                                    : 'bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {canAfford ? 'Aprovar Projeto' : 'Verba Insuficiente'}
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            )}

            {/* FASE 2: RESOLUÇÃO (O que aconteceu no mês) */}
            {phase === 'resolution' && (
                <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        
                        <div className="bg-slate-950 p-8 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">Relatório do Mês</h2>
                                <p className="text-slate-400">Veja as consequências das suas decisões.</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Alarme de Macrocefalia (COM BOTÃO DE DÚVIDA E TEXTO 'ERROS') */}
                            <div className={`p-6 rounded-2xl border-2 flex items-center justify-between ${difference >= 20 ? 'bg-red-950/30 border-red-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2">
                                            <AlertTriangle size={16}/> Risco de Colapso
                                        </h3>
                                        <button 
                                            onClick={() => setShowCollapseInfo(true)} 
                                            className="bg-slate-700 text-slate-300 hover:bg-blue-500 hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-md"
                                        >
                                            ?
                                        </button>
                                    </div>
                                    <p className={`text-3xl font-black ${difference >= 20 ? 'text-red-500' : 'text-white'}`}>
                                        Erros: {Math.max(0, difference)} / 30
                                    </p>
                                </div>
                                {difference >= 20 && (
                                    <span className="bg-red-500 text-white font-black px-4 py-2 rounded-xl animate-pulse">CRÍTICO</span>
                                )}
                            </div>

                            {/* Barras Animadas */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-bold text-red-400">
                                        <span className="flex items-center gap-2"><TrendingUp size={20}/> População (Êxodo)</span>
                                        <span>{gameState.population}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700 shadow-inner">
                                        <motion.div 
                                            className="bg-gradient-to-r from-red-600 to-red-400 h-full relative"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((gameState.population / maxBarValueVisual) * 100, 100)}%` }}
                                            transition={{ type: 'spring', bounce: 0.3, delay: 0.2 }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-bold text-blue-400">
                                        <span className="flex items-center gap-2"><Hammer size={20}/> Infraestrutura Urbana</span>
                                        <span>{gameState.infrastructure}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700 shadow-inner">
                                        <motion.div 
                                            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full relative"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((gameState.infrastructure / maxBarValueVisual) * 100, 100)}%` }}
                                            transition={{ type: 'spring', bounce: 0.3, delay: 0.4 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Diário Compacto */}
                            <div className="bg-slate-950 rounded-2xl p-5 space-y-3 border border-slate-800">
                                {turnLogs.map((log, i) => (
                                    <motion.div 
                                        key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
                                        className={`text-base p-3 rounded-xl border font-medium ${log.includes('URGENTE') || log.includes('EVENTO') ? 'bg-red-950/50 border-red-900/50 text-red-200' : log.includes('Ação') || log.includes('Aprovou') ? 'bg-blue-950/30 border-blue-900/30 text-blue-200' : 'bg-slate-800/50 border-slate-700/50 text-slate-300'}`}
                                    >
                                        {log}
                                    </motion.div>
                                ))}
                            </div>
                            
                            <Button onClick={nextMonth} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-8 text-xl rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all hover:scale-105 active:scale-95">
                                {gameState.month > maxMonths ? (
                                    <>Terminar o Mandato </>
                                ) : (
                                    <>Avançar para o Mês {gameState.month} <ArrowRight className="ml-2 w-6 h-6" /></>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </main>
            )}

        </div>
    );
}