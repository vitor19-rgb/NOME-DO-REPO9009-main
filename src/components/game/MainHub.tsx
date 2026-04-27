"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Globe, BrainCircuit, ArrowRight, BookOpen, Building, ShieldCheck, Cloud, Trophy, User, X, LogOut, LogIn } from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthPending, setIsAuthPending] = useState(false);
    
    const [view, setView] = useState<'home' | 'login' | 'name_input' | 'ranking'>('home');
    const [playerName, setPlayerName] = useState(initialPlayerName || '');
    const [isLogged, setIsLogged] = useState(false);
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
    
    // Guarda o modo de jogo que o usuário clicou antes de fazer o login
    const [pendingTheme, setPendingTheme] = useState<string | null>(null);

    // 1. Efeito para controlar a exibição do Loading e verificar Autenticação Local
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasLoadedBefore = sessionStorage.getItem('bioguesser_has_loaded');
            const loggedIn = localStorage.getItem('bioguesser_logged_in') === 'true';
            const savedName = localStorage.getItem('bioguesser_player_name');

            setIsLogged(loggedIn);
            if (savedName) setPlayerName(savedName);

            // O site agora SEMPRE abre na tela inicial (Home) para o utilizador explorar
            setView('home');

            // Lógica do Loading Splash Screen
            if (hasLoadedBefore) {
                setIsLoading(false);
            } else {
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    sessionStorage.setItem('bioguesser_has_loaded', 'true');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // 2. Atualizar o Ranking
    useEffect(() => {
        if (view === 'ranking') setLeaderboard(getLeaderboard());
    }, [view, getLeaderboard]);

    // QUANDO O UTILIZADOR CLICA NUM JOGO
    const handleModeSelection = (themeId: string, enabled: boolean) => {
        if (!enabled) {
            toast({ title: "Modo em Desenvolvimento", description: `Este modo de jogo ainda não está disponível.` });
            return;
        }

        // Se NÃO estiver logado, redireciona para o login e guarda o jogo escolhido
        if (!isLogged) {
            setPendingTheme(themeId);
            setView('login');
            toast({ title: "Acesso Restrito", description: "Faça login com a sua conta para iniciar uma expedição." });
            return;
        }

        // Se estiver logado mas sem nome, pede o nome
        if (!playerName || playerName.trim().length < 3) {
            setPendingTheme(themeId);
            setView('name_input');
            return;
        }

        // Se estiver tudo certo, entra direto no jogo
        onSelectTheme(themeId, playerName);
    }

    // SIMULAÇÃO DO LOGIN COM GOOGLE
    const handleSimulateGoogleLogin = () => {
        setIsAuthPending(true);
        // Simula o delay de comunicação com um servidor OAuth (Google)
        setTimeout(() => {
            setIsAuthPending(false);
            localStorage.setItem('bioguesser_logged_in', 'true');
            setIsLogged(true);
            
            // Se já tem nome, vai direto para o jogo que tinha clicado (se houver)
            if (playerName && playerName.trim().length >= 3) {
                if (pendingTheme) {
                    onSelectTheme(pendingTheme, playerName);
                    setPendingTheme(null);
                } else {
                    setView('home');
                }
            } else {
                setView('name_input'); // Se não tem nome, vai para a tela de nome
            }
        }, 1500); 
    };

    // SALVAR O NOME DO JOGADOR
    const handleSaveName = () => {
        if (playerName.trim().length < 3) {
            toast({ title: "Atenção", description: "Por favor, insira um nome com pelo menos 3 letras.", variant: "destructive" });
            return;
        }
        localStorage.setItem('bioguesser_player_name', playerName.trim());
        
        // Se tinha um jogo pendente aguardando o login, entra direto nele
        if (pendingTheme) {
            onSelectTheme(pendingTheme, playerName.trim());
            setPendingTheme(null);
        } else {
            setView('home');
            toast({ title: "Perfil Criado!", description: `Bem-vindo à equipe de expedição, ${playerName.trim()}!`, duration: 3000 });
        }
    };

    // LOGOUT DA CONTA
    const handleLogout = () => {
        localStorage.removeItem('bioguesser_logged_in');
        localStorage.removeItem('bioguesser_player_name');
        setIsLogged(false);
        setPlayerName('');
        setView('home');
        onLogout();
        toast({ title: "Sessão Encerrada", description: "Você saiu da sua conta com sucesso." });
    };

    if (isLoading) return <LoadingScreen />;

    // --- TELA 1: LOGIN SIMULADO DO GOOGLE --- //
    if (view === 'login') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-700 max-w-md w-full text-center shadow-2xl relative">
                    
                    <Button variant="ghost" onClick={() => setView('home')} className="absolute top-4 left-4 text-slate-400 hover:text-white rounded-full p-2">
                        <X className="w-6 h-6" />
                    </Button>

                    <div className="flex justify-center mb-8 mt-4">
                        <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30">
                            <Globe className="text-blue-400 w-12 h-12" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Acesso ao BioGuesser</h2>
                    <p className="text-slate-400 mb-10 text-[15px] leading-relaxed">
                        Faça login para começar sua jornada educativa, salvar o seu progresso e competir no ranking nacional.
                    </p>

                    <Button 
                        onClick={handleSimulateGoogleLogin} 
                        disabled={isAuthPending}
                        className="w-full bg-white hover:bg-slate-200 text-slate-800 font-bold py-7 text-lg rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-80"
                    >
                        {isAuthPending ? (
                            <span className="animate-pulse">Conectando ao Google...</span>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continuar com o Google
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        )
    }

    // --- TELA 2: INSERIR O NOME --- //
    if (view === 'name_input') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-700 max-w-md w-full text-center shadow-2xl relative">
                    
                    <Button variant="ghost" onClick={() => setView('home')} className="absolute top-4 left-4 text-slate-400 hover:text-white rounded-full p-2">
                        <X className="w-6 h-6" />
                    </Button>

                    <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30"><User className="text-green-400 w-10 h-10" /></div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Quase lá!</h2>
                    <p className="text-slate-400 mb-8 text-[15px]">Como você deseja ser chamado nas expedições e no ranking oficial?</p>
                    
                    <Input 
                        type="text" 
                        placeholder="Ex: João Silva" 
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className="bg-slate-800 border-slate-600 text-white text-lg py-6 mb-6 text-center rounded-xl focus-visible:ring-green-500"
                        maxLength={15}
                    />
                    
                    <Button onClick={handleSaveName} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-7 text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        Salvar e Continuar
                    </Button>
                </motion.div>
            </div>
        )
    }

    // --- TELA 3: RANKING GLOBAL --- //
    if (view === 'ranking') {
        return (
            <div className="min-h-screen bg-[#020617] p-4 md:p-10 flex flex-col items-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="bg-slate-800 p-6 md:p-8 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-500/20 p-3 rounded-xl border border-yellow-500/30">
                                <Trophy className="text-yellow-400 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white">Top 10 Exploradores</h2>
                        </div>
                        <Button onClick={() => setView('home')} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"><X /></Button>
                    </div>
                    
                    <div className="p-4 md:p-8 bg-slate-900">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 font-medium">Nenhum registro encontrado. Seja o primeiro a jogar!</div>
                        ) : (
                            <div className="space-y-4">
                                {leaderboard.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-800/50 p-4 md:p-5 rounded-2xl border border-slate-700/50 transition-all hover:bg-slate-800">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <span className={`text-2xl md:text-3xl font-black w-8 text-center ${index === 0 ? 'text-yellow-400 drop-shadow-md' : index === 1 ? 'text-slate-300 drop-shadow-md' : index === 2 ? 'text-amber-600 drop-shadow-md' : 'text-slate-500'}`}>#{index + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-lg md:text-xl">{entry.name}</span>
                                                <span className="text-blue-400 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">{entry.mode || 'Missão'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-green-400 font-black text-xl md:text-2xl">{entry.score} pts</span>
                                            <span className="text-[10px] md:text-xs text-slate-500 font-medium mt-1">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
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

    // --- TELA PRINCIPAL (MAIN HUB) --- //
    return (
        <main className="min-h-screen bg-[#020617] text-white">
            <header className="bg-[#0A1024]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
                <div className="flex items-center gap-3">
                     <div className="bg-green-500 p-2 rounded-xl shadow-lg shadow-green-500/20"><Globe className="text-white w-5 h-5" /></div>
                    <span className="text-white font-black text-xl md:text-2xl tracking-tighter">BioGuesser</span>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                    {isLogged && playerName ? (
                        <>
                            <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                                <User className="w-4 h-4 text-blue-400"/>
                                <span className="text-slate-200 text-sm font-medium">Logado como <strong className="text-white font-bold">{playerName}</strong></span>
                            </div>
                            
                            <Button variant="outline" onClick={handleLogout} className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 rounded-xl hidden sm:flex">
                                <LogOut className="w-4 h-4 mr-2"/> Sair da Conta
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 sm:hidden rounded-full">
                                <LogOut className="w-5 h-5"/>
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setView('login')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-6">
                            <LogIn className="w-4 h-4 mr-2" /> Fazer Login
                        </Button>
                    )}
                </div>
            </header>

            <section className="text-center py-20 md:py-32 px-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
                
                 <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-6 relative z-10">
                    Explore o mundo e<br className="hidden md:block" /> teste seus conhecimentos
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3}} className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 relative z-10">
                    Analise imagens, identifique elementos geográficos e tome decisões estratégicas para acumular pontos e dominar o ranking nacional.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5}} className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                    <Button onClick={() => document.getElementById('modos')?.scrollIntoView({ behavior: 'smooth' })} className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl px-8 py-7 text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
                        Começar Expedição <ArrowRight className="ml-2" />
                    </Button>
                    <Button onClick={() => setView('ranking')} className="bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 font-bold rounded-2xl px-8 py-7 text-lg transition-all hover:scale-105 active:scale-95">
                        <Trophy className="mr-3 text-yellow-400" /> Ver Ranking
                    </Button>
                </motion.div>
            </section>

            <section className="py-24 bg-slate-900/50 border-t border-slate-800 px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-16 tracking-tight">Como Funciona?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <HowToStep icon={<BookOpen className="text-blue-400" size={32} />} title="1. Análise Geográfica" description="Observe a paisagem, o perfil do solo e identifique os padrões cobrados no ENEM." />
                        <HowToStep icon={<BrainCircuit className="text-blue-400" size={32} />} title="2. Pensamento Sistêmico" description="Ligue as causas às consequências. Um erro de gestão pode causar o colapso." />
                        <HowToStep icon={<ShieldCheck className="text-blue-400" size={32} />} title="3. Domine o Ranking" description="Complete as trilhas com precisão cirúrgica para ganhar pontos e subir de posição." />
                    </div>
                </div>
            </section>

            <section id="modos" className="py-24 px-4 relative z-10">
                 <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-16 tracking-tight">Escolha sua Trilha de Conhecimento</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <GameModeCard icon={<Globe size={48}/>} title="Meio Ambiente" description="Biomas, Impactos Ambientais, Aquecimento Global e Transição Energética." onClick={() => handleModeSelection('meio_ambiente', true)} enabled={true} />
                        <GameModeCard icon={<Building size={48}/>} title="Urbanização" description="Macrocefalia Urbana, Hierarquia, Favelização e Rede IBGE." onClick={() => handleModeSelection('urbanizacao', true)} enabled={true} />
                        <GameModeCard icon={<BookOpen size={48}/>} title="Geografia Agrária" description="Estrutura Fundiária, Agronegócio, Agricultura Familiar e Revolução Verde." onClick={() => handleModeSelection('agraria', false)} enabled={false} />
                        <GameModeCard icon={<Cloud size={48}/>} title="Geofísica" description="Explore os tipos climáticos, relevo, hidrografia e fenômenos naturais." onClick={() => handleModeSelection('fenomenos', false)} enabled={false} />
                    </div>
                 </div>
            </section>
        </main>
    );
}
