"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Globe, BrainCircuit, ArrowRight, BookOpen, Building, ShieldCheck, Cloud, Trophy, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { ScoreEntry } from '@/app/page';

// --- TELA DE CARREGAMENTO GLOBAL --- //
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
        className={`bg-slate-800/60 border border-white/10 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col h-full ${!enabled && 'opacity-50 cursor-not-allowed'}`}>
        <div className="flex justify-center mb-5 text-blue-400">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/50 mb-6 flex-grow">{description}</p>
        <Button disabled={!enabled} className="w-full mt-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3">
            {enabled ? 'Jogar Agora' : 'Em Breve'}
        </Button>
    </motion.div>
);

interface MainHubProps {
    onSelectTheme: (themeId: string, playerName: string) => void;
    initialPlayerName: string;
    onLogout: () => void;
    getLeaderboard: () => ScoreEntry[];
}

export default function MainHub({ onSelectTheme, initialPlayerName, onLogout, getLeaderboard }: MainHubProps) {
    // Estado para controlar a tela de carregamento
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'home' | 'name_input' | 'ranking'>('home');
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState(initialPlayerName || '');
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

    // 1. Efeito para controlar a exibição do Loading usando Session Storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasLoadedBefore = sessionStorage.getItem('bioguesser_has_loaded');
            
            if (hasLoadedBefore) {
                // Se já carregou antes, pula a animação instantaneamente
                setIsLoading(false);
            } else {
                // Se for a primeira vez, aguarda 2s e salva na memória
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    sessionStorage.setItem('bioguesser_has_loaded', 'true');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // 2. Efeito para atualizar o Ranking
    useEffect(() => {
        if (view === 'ranking') setLeaderboard(getLeaderboard());
    }, [view, getLeaderboard]);

    const handleModeSelection = (themeId: string, enabled: boolean) => {
        if (!enabled) {
            toast({ title: "Modo em Desenvolvimento", description: `Este modo de jogo ainda não está disponível.` });
            return;
        }

        if (initialPlayerName) {
            onSelectTheme(themeId, initialPlayerName);
        } else {
            setSelectedTheme(themeId);
            setView('name_input'); 
        }
    }

    const handleStartGame = () => {
        if (playerName.trim().length < 3) {
            toast({ title: "Atenção", description: "Por favor, insira um nome com pelo menos 3 letras.", variant: "destructive" });
            return;
        }
        if (selectedTheme) {
            onSelectTheme(selectedTheme, playerName.trim());
        }
    };

    // Renderiza a tela de Loading se for a primeira vez
    if (isLoading) return <LoadingScreen />;

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
                                                <span className="text-slate-500 text-xs uppercase tracking-widest">{entry.mode || 'Missão'}</span>
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
                        <GameModeCard icon={<Globe size={40}/>} title="Meio Ambiente e Impactos" description="Biomas, Impactos Ambientais/Urbanos, Desenvolvimento Sustentável." onClick={() => handleModeSelection('meio_ambiente', true)} enabled={true} />
                        <GameModeCard icon={<Building size={40}/>} title="Urbanização" description="Metropolização, Migrações Pendulares, Hierarquia Urbana." onClick={() => handleModeSelection('urbanizacao', true)} enabled={true} />
                        <GameModeCard icon={<BookOpen size={40}/>} title="Geografia Agrária" description="Estrutura Fundiária, Agronegócio, Agricultura Familiar, Revolução Verde." onClick={() => handleModeSelection('agraria', false)} enabled={false} />
                        <GameModeCard icon={<Cloud size={40}/>} title="Fenômenos Naturais" description="Explore os tipos climáticos e fenômenos naturais." onClick={() => handleModeSelection('fenomenos', false)} enabled={false} />
                    </div>
                 </div>
            </section>
        </main>
    );
}