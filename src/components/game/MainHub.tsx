"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Globe, BrainCircuit, ArrowRight, BookOpen, Building, ShieldCheck, Cloud, Trophy, User, X, Map, Gamepad2, Compass, GraduationCap, Sparkles, Loader2, Medal, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { ScoreEntry } from '@/app/page';

// IMPORTAÇÕES DO FIREBASE (Para o Login do Google)
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

// --- VARIÁVEIS DE ANIMAÇÃO (FRAMER MOTION) --- //
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const fadeUpItem = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- FUNÇÕES AUXILIARES PARA CORES DINÂMICAS --- //

// 1. Cor do texto da Tag no Ranking
const getBadgeColor = (mode?: string) => {
    if (!mode) return "text-slate-400";
    if (mode.includes("Meio Ambiente")) return "text-green-400";
    if (mode.includes("Urbanização")) return "text-blue-400";
    if (mode.includes("Agrária")) return "text-orange-400"; 
    if (mode.includes("Geopolítica")) return "text-red-400";
    if (mode.includes("Simulado")) return "text-purple-400";
    if (mode === "Mestre da Geografia") return "text-yellow-400";
    return "text-blue-400";
};

// 2. Cor de fundo do Botão (Sub-aba) quando selecionado
const getTabActiveColor = (track: string) => {
    if (track.includes("Meio Ambiente")) return "bg-green-600 text-white border-green-500";
    if (track.includes("Urbanização")) return "bg-blue-600 text-white border-blue-500";
    if (track.includes("Agrária")) return "bg-orange-600 text-white border-orange-500";
    if (track.includes("Geopolítica")) return "bg-red-600 text-white border-red-500";
    return "bg-slate-700 text-white border-slate-600";
};

// --- TELA DE CARREGAMENTO GLOBAL --- //
const LoadingScreen = () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden">
        <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full"
        />
        
        <div className="relative z-10 flex flex-col items-center">
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="mb-8 p-4 rounded-full border-2 border-dashed border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center"
            >
                <img 
                    src="/favicon.ico" 
                    alt="A carregar..." 
                    className="w-20 h-20 aspect-square shrink-0 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                />
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center mb-6"
            >
                <img 
                    src="/icon.png" 
                    alt="Logotipo BioGuesser" 
                    className="h-16 md:h-20 w-auto object-contain drop-shadow-lg" 
                />
            </motion.div>

            <motion.h2 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-xl md:text-2xl font-black tracking-widest uppercase mb-4 text-blue-400"
            >
                A Iniciar Sistema...
            </motion.h2>
            <p className="text-slate-400 font-medium text-sm md:text-base animate-pulse">
                Preparando os seus desafios
            </p>
        </div>
    </div>
);

const HowToStep = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div variants={fadeUpItem} className="text-center bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors shadow-lg hover:shadow-blue-900/20 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-center items-center mb-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 shadow-xl group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </motion.div>
);

const GameModeCard = ({ icon, title, description, onClick, enabled = true }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, enabled?: boolean }) => (
    <motion.div
        variants={fadeUpItem}
        whileHover={enabled ? { scale: 1.03, y: -5 } : {}}
        whileTap={enabled ? { scale: 0.98 } : {}}
        onClick={enabled ? onClick : undefined}
        className={`relative bg-slate-900 border ${enabled ? 'border-slate-700 hover:border-blue-500/50' : 'border-slate-800'} rounded-3xl p-8 text-center transition-all duration-300 flex flex-col h-full shadow-2xl ${!enabled ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer group'}`}
    >
        {enabled && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
        )}
        <div className={`flex justify-center mb-6 transition-transform duration-500 ${enabled ? 'text-blue-400 group-hover:scale-110 group-hover:text-blue-300' : 'text-slate-600'}`}>
            {icon}
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 mb-8 flex-grow leading-relaxed font-medium">{description}</p>
        <Button disabled={!enabled} className={`w-full mt-auto font-black rounded-xl py-6 text-lg shadow-md transition-all ${enabled ? 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            {enabled ? 'Iniciar Trilha' : 'Em Desenvolvimento'}
        </Button>
    </motion.div>
);

interface MainHubProps {
    onSelectTheme: (themeId: string, playerName: string, userId?: string) => void;
    initialPlayerName: string;
    initialUserId?: string;
    onLogout: () => void;
}

// ============================================================ //
// FUNÇÃO PARA CARREGAR O RANKING DO LOCAL STORAGE
// ============================================================ //
const loadRankingFromLocalStorage = (): ScoreEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem('bioguesser_leaderboard');
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
        return [];
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        return [];
    }
};

export default function MainHub({ onSelectTheme, initialPlayerName, initialUserId, onLogout }: MainHubProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'home' | 'fake_login' | 'name_input' | 'ranking'>('home');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState(initialPlayerName || '');
    const [userId, setUserId] = useState(initialUserId || '');
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

    const [isFetchingRanking, setIsFetchingRanking] = useState(false);

    const [rankingTab, setRankingTab] = useState<'total' | 'modulos' | 'simulados'>('total');
    const [moduleTab, setModuleTab] = useState<string>('Trilha Meio Ambiente');

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!initialUserId);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasLoadedBefore = sessionStorage.getItem('bioguesser_has_loaded');
            if (hasLoadedBefore) {
                const timer = setTimeout(() => setIsLoading(false), 2000); 
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    sessionStorage.setItem('bioguesser_has_loaded', 'true');
                }, 5000); 
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // ========================================================= //
    // LÓGICA DO RANKING ONLINE (BANCO DE DADOS)
    // ========================================================= //
    useEffect(() => {
        if (view === 'ranking') {
            const fetchOnlineRanking = async () => {
                setIsFetchingRanking(true);
                try {
                    const response = await fetch('/api/ranking');
                    
                    if (response.ok) {
                        const dadosDoBanco = await response.json();
                        setLeaderboard(dadosDoBanco);
                    } else {
                        const localData = loadRankingFromLocalStorage();
                        setLeaderboard(localData);
                        toast({ 
                            title: "⚠️ Modo Offline", 
                            description: "Usando dados salvos localmente.", 
                            variant: "default" 
                        });
                    }
                } catch (error) {
                    console.error("Erro ao buscar o ranking global:", error);
                    const localData = loadRankingFromLocalStorage();
                    setLeaderboard(localData);
                    toast({ 
                        title: "⚠️ Modo Offline", 
                        description: "Não foi possível conectar ao servidor.", 
                        variant: "default" 
                    });
                } finally {
                    setIsFetchingRanking(false);
                }
            };
            
            fetchOnlineRanking();
        }
    }, [view]);

    const handleModeSelection = (themeId: string, enabled: boolean) => {
        if (!enabled) {
            toast({ title: "Módulo Trancado", description: `Os professores ainda estão a preparar esta matéria.` });
            return;
        }

        if (isUserLoggedIn && userId) {
            onSelectTheme(themeId, playerName, userId);
        } else {
            setSelectedTheme(themeId);
            setView('fake_login'); 
        }
    }

    // --- LOGIN REAL COM O GOOGLE (COM SUPORTE A UID) --- //
    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (user.displayName && user.uid) {
                const nomeCompleto = user.displayName;
                const uid = user.uid;
                
                setPlayerName(nomeCompleto);
                setUserId(uid);
                setIsUserLoggedIn(true);
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('bioguesser_user_id', uid);
                    localStorage.setItem('bioguesser_user_name', nomeCompleto);
                }
                
                if (selectedTheme) {
                    toast({ 
                        title: "Login bem-sucedido!", 
                        description: `Bem-vindo(a), ${nomeCompleto}! Iniciando o jogo...`,
                        variant: "default" 
                    });
                    
                    onSelectTheme(selectedTheme, nomeCompleto, uid);
                    return;
                }
                
                setView('home');
                toast({ 
                    title: "Login bem-sucedido!", 
                    description: `Bem-vindo(a), ${nomeCompleto}!`,
                    variant: "default" 
                });
            } else {
                setView('name_input');
            }
        } catch (error) {
            console.error("Erro ao fazer login com o Google:", error);
            toast({ 
                title: "Erro no Login", 
                description: "Não foi possível conectar com o Google. Tente novamente.", 
                variant: "destructive" 
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleStartGame = () => {
        if (playerName.trim().length < 3) {
            toast({ title: "Atenção", description: "O seu nome de estudante deve ter pelo menos 3 letras.", variant: "destructive" });
            return;
        }
        if (selectedTheme) {
            setIsUserLoggedIn(true);
            const finalUserId = userId || `temp_${Date.now()}`;
            onSelectTheme(selectedTheme, playerName.trim(), finalUserId);
        }
    };
    
    // ============================================================ //
    // FUNÇÕES CORRIGIDAS DO RANKING - USANDO userId SEMPRE
    // ============================================================ //
    
    // 1. Agrupa as melhores pontuações por userId (NUNCA por nome)
    const getBestScoresPerUser = () => {
        const bestScores: Record<string, Record<string, ScoreEntry>> = {};
        
        leaderboard.forEach(entry => {
            if (!entry.mode) return;
            
            // SEMPRE usa userId como chave principal
            // Se não tiver userId, usa o nome (mas isso é fallback)
            const key = entry.userId || entry.name;
            
            if (!bestScores[key]) {
                bestScores[key] = {};
                // Guarda o nome associado a este userId
                bestScores[key]._name = entry.name;
            }
            
            const currentBest = bestScores[key][entry.mode];
            if (!currentBest || entry.score > currentBest.score) {
                bestScores[key][entry.mode] = entry;
            }
        });
        
        return bestScores;
    };

    // 2. Ranking da Trilha Total (soma de todas as 4 trilhas)
    const getTrilhaTotalRanking = () => {
        const bestScores = getBestScoresPerUser();
        const mainTracks = ['Trilha Meio Ambiente', 'Trilha Urbanização', 'Trilha Geopolítica', 'Trilha Geografia Agrária'];
        const totals: ScoreEntry[] = [];

        Object.entries(bestScores).forEach(([userId, modes]) => {
            let totalScore = 0;
            let hasAll = true;
            let latestDate = "";
            let userName = modes._name || userId; // Usa o nome guardado ou o userId

            mainTracks.forEach(track => {
                if (modes[track]) {
                    totalScore += modes[track].score;
                    if (modes[track].date > latestDate) latestDate = modes[track].date;
                } else {
                    hasAll = false; 
                }
            });

            if (hasAll) {
                totals.push({ 
                    name: userName,
                    userId: userId,
                    score: totalScore, 
                    date: latestDate, 
                    mode: 'Mestre da Geografia' 
                });
            }
        });

        return totals.sort((a, b) => b.score - a.score).slice(0, 10);
    };

    // 3. Ranking por módulo específico
    const getModuleRanking = (moduleName: string) => {
        const bestScores = getBestScoresPerUser();
        const results: ScoreEntry[] = [];

        Object.entries(bestScores).forEach(([userId, modes]) => {
            if (modes[moduleName]) {
                const entry = modes[moduleName];
                results.push({
                    ...entry,
                    userId: userId,
                    name: modes._name || userId
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    };

    // 4. Ranking do Simulado
    const getSimuladoRanking = () => {
        return getModuleRanking('Trilha do Simulado Enem');
    };

    let displayLeaderboard: ScoreEntry[] = [];

    if (rankingTab === 'total') {
        displayLeaderboard = getTrilhaTotalRanking();
    } else if (rankingTab === 'simulados') {
        displayLeaderboard = getSimuladoRanking();
    } else if (rankingTab === 'modulos') {
        displayLeaderboard = getModuleRanking(moduleTab);
    }

    if (isLoading) return <LoadingScreen />;

    // --- TELA DE LOGIN --- //
    if (view === 'fake_login') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
                
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", damping: 20 }} className="bg-slate-900/90 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-slate-700/50 max-w-md w-full text-center shadow-[0_0_80px_rgba(37,99,235,0.15)] relative z-10">
                    
                    <div className="flex justify-center mb-8">
                        <div className="flex gap-[2px] text-4xl font-black tracking-tighter">
                            <span className="text-blue-500">G</span>
                            <span className="text-red-500">o</span>
                            <span className="text-yellow-500">o</span>
                            <span className="text-blue-500">g</span>
                            <span className="text-green-500">l</span>
                            <span className="text-red-500">e</span>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-2 tracking-tight">Fazer login</h2>
                    <p className="text-slate-400 mb-10 font-medium">Use a sua Conta do Google para acessar o BioGuesser</p>
                    
                    <div className="space-y-4">
                        <Button 
                            onClick={handleGoogleLogin} 
                            disabled={isLoggingIn}
                            className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-7 text-lg rounded-xl shadow-md transition-all flex items-center justify-center gap-3"
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    <span>Conectando aos servidores...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continuar com o Google
                                </>
                            )}
                        </Button>
                        
                        {!isLoggingIn && (
                            <Button onClick={() => setView('home')} variant="ghost" className="w-full text-slate-400 hover:text-white py-6 rounded-xl font-bold transition-all">
                                Cancelar e Voltar
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }

    // --- TELA DE INPUT DO NOME (FALLBACK) --- //
    if (view === 'name_input') {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="bg-slate-900/90 backdrop-blur-xl p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-slate-700/50 max-w-sm md:max-w-md w-full text-center shadow-[0_0_80px_rgba(16,185,129,0.15)] relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="flex justify-center mb-5 md:mb-6"
                    >
                        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 p-4 md:p-5 rounded-full border border-emerald-500/30 shadow-inner">
                            <ShieldCheck className="text-emerald-400 w-8 h-8 md:w-10 md:h-10" />
                        </div>
                    </motion.div>
                    
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                        Como quer ser chamado?
                    </h2>

                    <p className="text-slate-400 mb-6 text-sm sm:text-base leading-relaxed font-medium px-1">
                        Digite seu nome para aparecer no Ranking dos Estudantes
                    </p>
                    
                    <Input 
                        type="text" 
                        placeholder="Ex: João Silva" 
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                        className="bg-slate-950/50 border-slate-700 text-white font-black text-base sm:text-lg md:text-xl py-5 sm:py-6 md:py-8 mb-6 text-center rounded-xl md:rounded-2xl shadow-inner focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                        maxLength={15}
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <Button
                            onClick={() => setView('home')}
                            variant="outline"
                            className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 py-3 md:py-7 text-sm md:text-lg rounded-xl font-bold transition-all min-h-[48px] md:min-h-[64px]"
                        >
                            Voltar
                        </Button>

                        <Button
                            onClick={handleStartGame}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 md:py-7 text-sm md:text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-all min-h-[48px] md:min-h-[64px]"
                        >
                            Salvar Perfil
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // --- TELA DE RANKING --- //
    if (view === 'ranking') {
        return (
            <div className="min-h-screen bg-[#020617] p-4 md:p-10 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-yellow-500/5 blur-[150px] rounded-full pointer-events-none" />
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25 }} className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col">
                    
                    {/* CABEÇALHO DO RANKING */}
                    <div className="bg-slate-950/80 p-6 md:p-8 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-500/20 p-3 rounded-2xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                <Trophy className="text-yellow-400 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Top 10 Estudantes</h2>
                        </div>
                        <Button onClick={() => setView('home')} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X size={28} /></Button>
                    </div>

                    {/* ABAS DE NAVEGAÇÃO PRINCIPAL */}
                    <div className="p-4 md:p-6 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row gap-2 justify-center">
                        <Button 
                            variant={rankingTab === 'total' ? 'default' : 'outline'} 
                            onClick={() => setRankingTab('total')}
                            className={`rounded-xl flex-1 py-6 font-bold text-sm md:text-base ${rankingTab === 'total' ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            <Medal className="w-5 h-5 mr-2" /> Trilha Total
                        </Button>
                        <Button 
                            variant={rankingTab === 'modulos' ? 'default' : 'outline'} 
                            onClick={() => setRankingTab('modulos')}
                            className={`rounded-xl flex-1 py-6 font-bold text-sm md:text-base ${rankingTab === 'modulos' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            <Layers className="w-5 h-5 mr-2" /> Módulos
                        </Button>
                        <Button 
                            variant={rankingTab === 'simulados' ? 'default' : 'outline'} 
                            onClick={() => setRankingTab('simulados')}
                            className={`rounded-xl flex-1 py-6 font-bold text-sm md:text-base ${rankingTab === 'simulados' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            <BrainCircuit className="w-5 h-5 mr-2" /> Simulados
                        </Button>
                    </div>

                    {/* SUB-ABAS (SÓ APARECEM SE 'MODULOS' ESTIVER SELECIONADO) */}
                    <AnimatePresence>
                        {rankingTab === 'modulos' && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-slate-950/50 p-4 border-b border-slate-800"
                            >
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['Trilha Meio Ambiente', 'Trilha Urbanização', 'Trilha Geopolítica', 'Trilha Geografia Agrária'].map(track => {
                                        const isActive = moduleTab === track;
                                        const activeClass = isActive ? getTabActiveColor(track) : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent';
                                        
                                        return (
                                            <Button 
                                                key={track} 
                                                variant="ghost" 
                                                onClick={() => setModuleTab(track)}
                                                className={`rounded-full text-xs md:text-sm font-bold px-4 py-2 transition-all ${activeClass}`}
                                            >
                                                {track.replace('Trilha ', '')}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* LISTA DE PONTUAÇÕES */}
                    <div className="p-4 md:p-8 overflow-y-auto flex-1 max-h-[50vh]">
                        {isFetchingRanking ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                                <p className="text-slate-400 font-medium">A procurar os melhores na base de dados global...</p>
                            </motion.div>
                        ) : displayLeaderboard.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium text-lg">
                                    {rankingTab === 'total' 
                                        ? "Nenhum jogador completou todas as 4 trilhas base ainda. Seja o primeiro!" 
                                        : "Nenhum registo encontrado para esta categoria. O pódio está à sua espera!"}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                                {displayLeaderboard.map((entry, index) => (
                                    <motion.div variants={fadeUpItem} key={entry.userId || entry.name + index} className="flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-300 p-4 md:p-5 rounded-2xl border border-slate-700/50 group">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <span className={`text-2xl md:text-3xl font-black w-10 text-center transition-transform group-hover:scale-110 ${index === 0 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : index === 1 ? 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]' : index === 2 ? 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.4)]' : 'text-slate-600'}`}>
                                                #{index + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-lg md:text-xl">{entry.name}</span>
                                                <span className={`${getBadgeColor(entry.mode)} font-bold text-xs uppercase tracking-widest`}>
                                                    {entry.mode || 'Missão Concluída'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-emerald-400 font-black text-xl md:text-2xl tracking-tight">{entry.score} pts</span>
                                            <span className="text-xs text-slate-500 font-medium">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }

    // --- TELA PRINCIPAL (HOME) --- //
    return (
        <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden flex flex-col selection:bg-blue-500/30">
            
            {/* BACKGROUND ANIMADO */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div 
                    animate={{ x: [0, 50, 0], y: [0, 30, 0], opacity: [0.1, 0.15, 0.1] }} 
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{ x: [0, -30, 0], y: [0, -50, 0], opacity: [0.05, 0.1, 0.05] }} 
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-900/20 blur-[120px] rounded-full"
                />
            </div>

            {/* HEADER */}
            <header className="bg-[#0A1024]/80 backdrop-blur-xl border-b border-white/5 px-2 md:px-8 py-0.5 md:py-2 flex justify-between items-center sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
                    <img 
                        src="/icon.png" 
                        alt="Logotipo BioGuesser" 
                        className="h-5 md:h-16 w-auto object-contain drop-shadow-md" 
                    />
                </motion.div>
                
                <AnimatePresence>
                    {initialPlayerName && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-0.5 md:gap-4">
                            <span className="text-slate-400 text-[8px] md:text-sm hidden sm:inline bg-slate-800/50 px-1.5 md:px-4 py-0.5 md:py-1.5 rounded-full border border-slate-700/50">
                                <strong className="text-white font-black ml-0.5 md:ml-1">{initialPlayerName}</strong>
                            </span>
                            <Button variant="ghost" onClick={onLogout} className="text-slate-400 font-bold hover:text-red-400 hover:bg-red-500/10 rounded-full text-[8px] md:text-sm transition-colors px-1 md:px-4 py-0.5 md:py-2 h-auto">
                                Sair
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* HERO SECTION */}
            <section className="relative w-full text-center py-8 md:py-32 px-3 md:px-4 flex-shrink-0 min-h-[40vh] md:min-h-[90vh] flex flex-col items-center justify-center">
              
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
                    <img 
                        src="/fundo.png" 
                        alt="Bioma Caatinga - Exclusivo do Brasil" 
                        className="w-full md:w-[95%] h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A1024]/40 via-transparent to-[#0A1024]/60"></div>
                </div>
                
                <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, type: "spring" }}
                        className="mb-4 md:mb-6 w-full max-w-4xl px-2 md:px-4 flex justify-center"
                    >
                        <img 
                            src="/escrito.png" 
                            alt="BioGuesser Logo" 
                            className="w-[85%] md:w-full max-w-[300px] md:max-w-[600px] object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] md:drop-shadow-[0_0_60px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-transform duration-700"
                        />
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-5 w-full sm:w-auto mb-6 md:mb-8 px-2"
                    >
                        <Button 
                            onClick={() => document.getElementById('modos')?.scrollIntoView({ behavior: 'smooth' })} 
                            className="w-[95%] sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black rounded-xl md:rounded-2xl px-6 md:px-12 py-4 md:py-7 text-sm md:text-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] md:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 border border-emerald-400/30"
                        >
                            Jogar Agora
                        </Button>
                        
                        <Button 
                            onClick={() => setView('ranking')} 
                            className="w-[95%] sm:w-auto bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 font-black rounded-xl md:rounded-2xl px-6 md:px-10 py-4 md:py-7 text-sm md:text-xl hover:scale-105 transition-all duration-300 group shadow-xl"
                        >
                            <Trophy className="mr-2 md:mr-3 text-yellow-400 group-hover:scale-110 transition-transform w-4 h-4 md:w-5 md:h-5" /> 
                            Ranking
                        </Button>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-[8px] md:text-sm text-white/40 md:text-white/60 max-w-2xl mx-auto font-light tracking-wider mt-8 md:mt-16 px-2"
                    >
                        Imagem da Caatinga, o único bioma exclusivo do Brasil
                    </motion.p>
                </div>
            </section>

            {/* SECÇÃO COMO FUNCIONA */}
            <section className="py-24 relative z-10">
                <div className="absolute inset-0 bg-slate-900/40 border-y border-slate-800/50" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-black text-center text-white mb-16 tracking-tight">
                        Como o BioGuesser Funciona?
                    </motion.h2>
                    <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-3 gap-8">
                        <HowToStep 
                            icon={<Map size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />} 
                            title="1. Escolha a Trilha" 
                            description="Navegue pelos módulos com os temas mais cobrados nas provas: Urbanização, Meio Ambiente, Agrária, etc." 
                        />
                        <HowToStep 
                            icon={<Gamepad2 size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />} 
                            title="2. Encare os Minijogos" 
                            description="Fuja da teoria chata! Você vai classificar mapas, tomar decisões vitais e analisar paisagens do Brasil." 
                        />
                        <HowToStep 
                            icon={<Trophy size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />} 
                            title="3. Suba no Ranking" 
                            description="Cada acerto dá-lhe pontos. Cuidado com os erros! Mostre para os seus amigos quem percebe mais de geografia." 
                        />
                    </motion.div>
                </div>
            </section>

            {/* SECÇÃO MÓDULOS (JOGOS) */}
            <section id="modos" className="pt-32 pb-8 px-4 relative flex-grow z-10">
                 <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Módulos de Missão</h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium">Selecione a matéria que quer estudar e treinar hoje.</p>
                    </motion.div>
                    
                    <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                        <GameModeCard 
                            icon={<Globe size={56} className="drop-shadow-md"/>} 
                            title="Meio Ambiente e Clima" 
                            description="Aprenda a identificar os Biomas Brasileiros e gerencie a Matriz Energética do país para evitar um colapso." 
                            onClick={() => handleModeSelection('meio_ambiente', true)} 
                            enabled={true} 
                        />
                        <GameModeCard 
                            icon={<Building size={56} className="drop-shadow-md"/>} 
                            title="Urbanização do Brasil" 
                            description="Enfrente a Macrocefalia Urbana, seja um Detetive Cartográfico do IBGE e sobreviva à Migração Pendular." 
                            onClick={() => handleModeSelection('urbanizacao', true)} 
                            enabled={true} 
                        />
                       <GameModeCard 
                            icon={<Cloud size={56} className="drop-shadow-md"/>} 
                            title="Geopolítica Global" 
                            description="Descubra as reações em cadeia ligando os maiores conflitos mundiais com a economia diária do Brasil." 
                            onClick={() => handleModeSelection('geopolitica', true)} 
                            enabled={true} 
                        />
                        
                        <GameModeCard 
                            icon={<BookOpen size={56} className="drop-shadow-md"/>} 
                            title="Geografia Agrária" 
                            description="Entenda a Estrutura Fundiária, a revolução verde e o balanço entre o Agronegócio e a Agricultura Familiar." 
                            onClick={() => handleModeSelection('agraria', true)} 
                            enabled={true} 
                        />
                    </motion.div>

                    {/* --- NOVO MÓDULO: SIMULADOS --- */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-6 flex justify-center">
                        <div className="w-full max-w-3xl">
                            <GameModeCard 
                                icon={<BrainCircuit size={56} className="drop-shadow-md text-blue-400"/>} 
                                title="Simulados ENEM" 
                                description="O desafio final. Teste os seus conhecimentos com um simulado que mistura questões de todos os módulos ao estilo do Enem." 
                                onClick={() => handleModeSelection('simulados', true)} 
                                enabled={true} 
                            />
                        </div>
                    </motion.div>
                 </div>
            </section>

            {/* --- RODAPÉ PROFISSIONAL DO TCC --- */}
            <footer className="w-full bg-[#050A15] border-t border-slate-800/60 py-6 relative z-20 flex-shrink-0 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col md:flex-row items-center gap-4 text-slate-300">
                        <div className="bg-blue-900/30 p-2 rounded-full border border-blue-500/20">
                            <GraduationCap className="text-blue-400 w-6 h-6" />
                        </div>
                        <span className="font-black text-base md:text-lg tracking-widest uppercase text-center bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                            TCC Gamificado para o ENEM (Geografia)
                        </span>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xs md:text-sm text-slate-500 text-center font-medium max-w-3xl bg-slate-900/50 py-2 px-6 rounded-full border border-slate-800">
                        Desenvolvido por: <span className="text-blue-400 font-bold tracking-wide">Vitor Rafael, Vitoria, Murillo, Luiz e Pedro Henrique Fabiano</span>
                    </motion.div>
                </div>
            </footer>
        </main>
    );
}