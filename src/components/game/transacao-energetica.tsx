"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, Wind, Droplet, Leaf, ArrowLeft, ShieldCheck, Map as MapIcon, CheckCircle2, Lock, HelpCircle, BookOpen, ZoomIn, X, BatteryCharging, AlertCircle, Info, Target, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

// ============================================================ //
// FUNÇÃO PARA SALVAR NO BANCO DE DADOS
// ============================================================ //
const saveEnergiaScore = async (playerName: string, userId: string | undefined, score: number): Promise<boolean> => {
    console.log('💾 Salvando pontuação da Matriz Energética:', { playerName, userId, score });

    const finalUserId = userId || '';

    let saved = false;

    // 1. SALVAR NO LOCAL STORAGE
    try {
        if (typeof window !== 'undefined') {
            const leaderboardKey = 'bioguesser_leaderboard';
            let leaderboard: any[] = [];
            
            try {
                const existingData = localStorage.getItem(leaderboardKey);
                if (existingData) {
                    const parsed = JSON.parse(existingData);
                    if (Array.isArray(parsed)) {
                        leaderboard = parsed;
                    }
                }
            } catch (parseError) {
                console.warn('⚠️ Erro ao parsear localStorage');
                leaderboard = [];
            }

            // Busca por userId primeiro, depois por nome
            const existingIndex = leaderboard.findIndex(
                (entry: any) => 
                    entry && 
                    ((entry.userId && entry.userId === finalUserId) || 
                     (entry.name === playerName && entry.mode === 'Trilha Meio Ambiente'))
            );
            
            if (existingIndex !== -1 && leaderboard[existingIndex]) {
                const currentScore = leaderboard[existingIndex].score || 0;
                if (score > currentScore) {
                    leaderboard[existingIndex].score = score;
                    leaderboard[existingIndex].date = new Date().toISOString();
                    if (finalUserId) leaderboard[existingIndex].userId = finalUserId;
                    saved = true;
                } else {
                    return true;
                }
            } else {
                const newEntry: any = {
                    name: playerName,
                    score: score,
                    mode: 'Trilha Meio Ambiente',
                    date: new Date().toISOString()
                };
                if (finalUserId) newEntry.userId = finalUserId;
                leaderboard.push(newEntry);
                saved = true;
            }
            
            leaderboard.sort((a: any, b: any) => (b?.score || 0) - (a?.score || 0));
            localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
            console.log('✅ Pontuação salva no localStorage!');
        }
    } catch (localError) {
        console.error('❌ Erro ao salvar no localStorage:', localError);
    }

    if (!saved) {
        console.log('ℹ️ Pontuação não é recorde, pulando API');
        return true;
    }

    // 2. TENTAR SALVAR NO BANCO DE DADOS
    try {
        console.log('🌐 Salvando novo recorde no banco de dados...');
        
        const response = await fetch('/api/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: playerName,
                userId: finalUserId,
                score: score,
                mode: 'Trilha Meio Ambiente',
                date: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            console.warn('⚠️ API retornou erro:', await response.text());
            return true;
        }

        console.log('✅ Novo recorde salvo no banco de dados!');
        return true;

    } catch (error) {
        console.warn('⚠️ Erro ao salvar no banco:', error);
        return true;
    }
};

// --- TIPAGENS --- //
interface TransacaoEnergeticaGameProps {
    playerName: string;
    userId?: string; // ADICIONADO
    onReturnHome: () => void;
    onSaveScore: (score: number) => void;
}

type PlantType = 'hydro' | 'wind' | 'biomass';
type BiomeId = 'amazonia' | 'caatinga' | 'cerrado';

interface PlantConfig {
    id: PlantType;
    name: string;
    icon: React.ReactNode;
    color: string;
}

interface BiomeConfig {
    id: BiomeId;
    name: string;
    image: string;
    description: string;
    correctPlant: PlantType;
    successTitle: string;
    successText: string;
}

// --- DADOS (1 PARA 1) --- //
const PLANTS: Record<PlantType, PlantConfig> = {
    hydro: { id: 'hydro', name: 'Hidrelétrica', icon: <Droplet size={28} />, color: 'text-blue-400 border-blue-500' },
    wind: { id: 'wind', name: 'Eólica', icon: <Wind size={28} />, color: 'text-cyan-300 border-cyan-400' },
    biomass: { id: 'biomass', name: 'Biomassa (Etanol)', icon: <Leaf size={28} />, color: 'text-emerald-400 border-emerald-500' }
};

const BIOMES: BiomeConfig[] = [
    { 
        id: 'amazonia', 
        name: 'Amazônia', 
        image: '/images/biomes/amazonia-satellite.png', 
        description: 'Planície florestal densa e úmida.',
        correctPlant: 'hydro',
        successTitle: 'Sucesso! Mas Cuidado... (ENEM)',
        successText: 'Apesar de usarmos muita hidrelétrica aqui, construí-las na planície amazônica exige represas gigantescas, causando alagamento da floresta (emissão de metano) e impacto em comunidades ribeirinhas!'
    },
    { 
        id: 'caatinga', 
        name: 'Caatinga', 
        image: '/images/biomes/caatinga-satellite.png', 
        description: 'Semiárido com alta incidência solar e ventos.',
        correctPlant: 'wind',
        successTitle: 'Excelente! (Alerta ENEM)',
        successText: 'O Nordeste tem os melhores ventos (Alísios) do país. Mas atenção nas provas: grandes parques eólicos podem alterar a rota de aves e causar grave poluição sonora para moradores locais.'
    },
    { 
        id: 'cerrado', 
        name: 'Cerrado', 
        image: '/images/biomes/cerrado-satellite.png', 
        description: 'Savana plana focada no agronegócio.',
        correctPlant: 'biomass',
        successTitle: 'Muito Bem! (Alerta ENEM)',
        successText: 'O etanol da cana é renovável e forte no Centro-Sul. Mas cuidado: a expansão desordenada da cana-de-açúcar causa desmatamento do Cerrado e esgota os nutrientes do solo (lixiviação)!'
    }
];

// MENSAGENS DIDÁTICAS PARA QUANDO O JOGADOR ERRA O BIOMA
const ERROR_MESSAGES: Record<BiomeId, Partial<Record<PlantType, string>>> = {
    amazonia: {
        wind: 'Os ventos na planície amazônica são bloqueados pelo denso dossel da floresta. Para instalar pás eólicas rentáveis, seria necessário um desmatamento inaceitável.',
        biomass: 'Substituir a floresta equatorial por monocultura de cana-de-açúcar destruiria a biodiversidade e secaria os "Rios Voadores" que irrigam todo o Brasil.'
    },
    caatinga: {
        hydro: 'A Caatinga possui rios intermitentes (que secam na estiagem) e altíssima evaporação natural. Uma hidrelétrica aqui não teria água suficiente para girar as turbinas na maior parte do ano.',
        biomass: 'A cana-de-açúcar exige imensa quantidade de água. Plantar biomassa no semiárido agravaria o estresse hídrico, desviando a água da população local.'
    },
    cerrado: {
        hydro: 'O relevo do Cerrado é marcado por planaltos muito planos (chapadas). Construir uma represa hidrelétrica aqui exigiria alagar áreas imensuráveis, destruindo habitats inteiros.',
        wind: 'Embora tenha ventos, priorizar mega parques eólicos no Cerrado gera conflito direto por terras com a agropecuária, intensificando a especulação fundiária.'
    }
};

// --- PAINEL DE AJUDA UNIFICADO (COMO JOGAR + ENEM) --- //
const GameHelpPanel = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" className="bg-emerald-900/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm">
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> O que cai no ENEM?
            </Button>
        </SheetTrigger>
        <SheetContent className="bg-slate-900/95 backdrop-blur-xl text-slate-100 border-l-slate-700/50 w-full sm:max-w-lg p-0 overflow-y-auto">
             <SheetTitle className="sr-only">Painel de Ajuda e Revisão ENEM</SheetTitle>
             
             <div className="p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                        <Info className="text-emerald-400 w-8 h-8"/>
                    </div>
                    <h2 className="text-3xl font-black text-white">O que cai no ENEM?</h2>
                </div>
                
                <div className="space-y-8 text-left">
                    <div>
                        <h3 className="font-black text-xl text-emerald-400 mb-3 tracking-tight">Como Funciona o Jogo</h3>
                        <ul className="list-decimal list-inside space-y-3 text-slate-300 text-[15px]">
                            <li><strong>Escolha a Fonte:</strong> Selecione uma Matriz Energética no rodapé inferior.</li>
                            <li><strong>Analise o Bioma:</strong> Clique na região que possui as melhores características geográficas (clima e relevo) para essa usina funcionar sem grandes danos.</li>
                            <li><strong>Cuidado com Erros:</strong> Instalar uma usina no bioma errado causa impactos graves. Você só pode errar 3 vezes antes do Game Over!</li>
                        </ul>
                    </div>

                    <hr className="border-slate-800" />

                    <div>
                        <h3 className="font-black text-xl text-emerald-400 mb-3 tracking-tight flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> Revisão ENEM
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            O Brasil possui uma das matrizes elétricas <strong>mais renováveis do mundo</strong> (focada em Hidrelétricas), mas "energia limpa" (que não emite carbono) não significa "energia sem impacto ambiental".
                        </p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mt-6">
                        <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Dica para a Prova
                        </h3>
                        <p className="text-sm text-slate-300">
                            Nas questões do ENEM, você deve avaliar o <strong>trade-off (custo-benefício) geográfico</strong>. Cada região possui uma vocação energética, mas todas geram impactos socioambientais locais que a prova vai cobrar de você!
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
);

// --- COMPONENTE PRINCIPAL --- //
export default function TransacaoEnergeticaGame({ playerName, userId, onReturnHome, onSaveScore }: TransacaoEnergeticaGameProps) {
    const [selectedPlant, setSelectedPlant] = useState<PlantType | null>(null);
    const [solvedBiomes, setSolvedBiomes] = useState<BiomeId[]>([]);
    
    // Sistema de Erros
    const [errorCount, setErrorCount] = useState(0);
    const maxErrors = 3;

    const [status, setStatus] = useState<'intro' | 'playing' | 'victory' | 'gameover'>('intro');
    const [alertMessage, setAlertMessage] = useState<{ title: string, text: string, type: 'success' | 'error' } | null>(null);
    const [shakeBiome, setShakeBiome] = useState<BiomeId | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Checa vitória após fechar o alerta
    useEffect(() => {
        if (status === 'playing' && solvedBiomes.length === 3 && !alertMessage) {
            setTimeout(() => setStatus('victory'), 500);
        }
    }, [solvedBiomes, alertMessage, status]);

    // Checa Game Over após fechar o alerta de erro
    useEffect(() => {
        if (status === 'playing' && errorCount >= maxErrors && !alertMessage) {
            setTimeout(() => setStatus('gameover'), 500);
        }
    }, [errorCount, alertMessage, status]);

    const handleInstall = (biomeId: BiomeId) => {
        if (status !== 'playing' || solvedBiomes.includes(biomeId) || errorCount >= maxErrors) return;

        if (!selectedPlant) {
            toast({
                title: "Ação Inválida",
                description: "Selecione uma Matriz Energética no inventário abaixo primeiro.",
                className: "bg-slate-800 border-slate-600 text-white"
            });
            return;
        }

        const biome = BIOMES.find(b => b.id === biomeId);
        
        if (biome && biome.correctPlant === selectedPlant) {
            setSolvedBiomes(prev => [...prev, biomeId]);
            setScore(prev => prev + 50);
            setSelectedPlant(null);
            
            setAlertMessage({
                title: biome.successTitle,
                text: biome.successText,
                type: 'success'
            });
        } else {
            const newErrors = errorCount + 1;
            setErrorCount(newErrors);
            setShakeBiome(biomeId);
            setScore(prev => Math.max(0, prev - 10));
            
            const specificError = ERROR_MESSAGES[biomeId]?.[selectedPlant] || "Essa matriz não é ideal para as características geográficas deste bioma!";

            setAlertMessage({
                title: "Combinação Incorreta!",
                text: specificError,
                type: 'error'
            });

            setSelectedPlant(null);
            setTimeout(() => setShakeBiome(null), 500);
        }
    };

    // --- TELAS SECUNDÁRIAS --- //
    if (status === 'intro') {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
                    <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-emerald-600/20 p-5 rounded-3xl border border-emerald-500/30">
                            <Zap className="w-16 h-16 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-center mb-6">Matriz Energética</h1>
                    <p className="text-slate-300 text-lg text-center mb-10">
                        Ministro <strong>{playerName}</strong>, o desafio é abastecer o Brasil associando cada Matriz Energética ao seu Bioma ideal, compreendendo os impactos cobrados no ENEM.
                    </p>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg text-left mb-10">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-400"><Target size={20}/> Seu Objetivo</h3>
                        <p className="text-slate-300 text-[15px] leading-relaxed">
                            Existem 3 biomas e 3 matrizes de energia. O seu dever é fazer o <strong>encaixe perfeito</strong> entre eles. Instalar uma usina na região com a geografia errada causará impactos severos e, após 3 erros, você será demitido!
                        </p>
                    </div>

                    <Button onClick={() => setStatus('playing')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 text-xl rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-all">
                        Iniciar Transição
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (status === 'gameover') {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-red-500/50 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.2)] max-w-2xl relative z-10">
                    <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-black text-red-500 mb-4">Desastre Ambiental!</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Você cometeu {maxErrors} erros de planeamento. A implantação de usinas incompatíveis com os biomas causou graves danos aos ecossistemas brasileiros.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={onReturnHome} variant="ghost" className="text-slate-400 hover:text-white py-6">Voltar ao Menu</Button>
                        <Button onClick={() => { setErrorCount(0); setSolvedBiomes([]); setScore(0); setStatus('playing'); }} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-6">Tentar Novamente</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'victory') {
        const handleSave = async () => {
            setIsSaving(true);
            try {
                // Salva no banco de dados
                await saveEnergiaScore(playerName, userId, score);
                
                // Chama o callback do componente pai com a pontuação
                onSaveScore(score);
                
                toast({
                    title: "🏆 Matriz Energética Concluída!",
                    description: `Você ganhou ${score} pontos!`,
                    variant: "default"
                });
            } catch (error) {
                console.error('Erro ao salvar pontuação:', error);
                toast({
                    title: "⚠️ Aviso",
                    description: "Pontuação salva localmente. Sincronização pendente.",
                    variant: "default"
                });
                // Mesmo com erro, chama o callback
                onSaveScore(score);
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-green-500/50 rounded-3xl shadow-[0_0_80px_rgba(34,197,94,0.2)] max-w-2xl relative">
                    <ShieldCheck className="w-24 h-24 text-green-400 mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-black text-green-400 mb-4">Matriz Sustentável!</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Excelente! Você encontrou a fonte de energia viável para cada Bioma e compreendeu perfeitamente as ressalvas cobradas nas provas do ENEM.
                    </p>
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl mb-8">
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Pontuação Final</p>
                        <p className="text-6xl font-black text-yellow-400 drop-shadow-md">+{score} pts</p>
                    </div>

                    {isSaving ? (
                        <div className="flex items-center justify-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-6 py-4 mb-4 w-full">
                            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                            <p className="text-yellow-400 font-bold">Salvando sua pontuação...</p>
                        </div>
                    ) : (
                        <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-7 text-xl hover:scale-105 transition-transform">
                            Salvar Pontuação 
                        </Button>
                    )}
                </motion.div>
            </div>
        );
    }

    // --- TELA PRINCIPAL (JOGO) --- //
    const progressPercent = (solvedBiomes.length / 3) * 100;

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
            
            {/* Modal de Zoom da Imagem */}
            <AnimatePresence>
                {expandedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 p-4 flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => setExpandedImage(null)}
                    >
                        <Button variant="ghost" onClick={() => setExpandedImage(null)} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/30 rounded-full w-12 h-12">
                            <X size={32} />
                        </Button>
                        <motion.img 
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            src={expandedImage} 
                            alt="Bioma" 
                            className="max-w-full max-h-[90vh] rounded-[2rem] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-slate-800" 
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Sucesso ou Erro Específico */}
            <AnimatePresence>
                {alertMessage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className={`max-w-xl w-full p-8 rounded-3xl border-2 shadow-2xl text-center ${
                                alertMessage.type === 'error' ? 'bg-red-950 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.4)]' 
                                : 'bg-emerald-950 border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.4)]'
                            }`}
                        >
                            {alertMessage.type === 'error' ? <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-400" />
                            : <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-emerald-400" />}
                            
                            <h2 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{alertMessage.title}</h2>
                            <p className="text-lg text-slate-300 mb-8 font-medium leading-relaxed">{alertMessage.text}</p>
                            <Button 
                                onClick={() => setAlertMessage(null)} 
                                className="w-full font-black py-7 text-lg bg-white text-slate-900 hover:bg-slate-200"
                            >
                                Entendido
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CABEÇALHO */}
            <header className="w-full flex flex-col md:flex-row justify-between items-center p-3 md:p-6 border-b border-white/10 bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 gap-3 md:gap-4 shadow-xl md:shadow-2xl">
                <div className="flex items-center w-full md:w-auto relative justify-center md:justify-start min-h-[40px]">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onReturnHome} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full absolute left-0 md:static md:mr-3 shadow-md shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex flex-col">
                            <span className="font-black text-base md:text-lg tracking-tight leading-none text-white">Matriz Energética</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
                    <GameHelpPanel />
                    
                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border transition-colors ${errorCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                        <AlertTriangle className={`w-4 h-4 ${errorCount > 0 ? 'text-red-400' : 'text-slate-400'}`} />
                        <span className={`font-bold text-[10px] md:text-sm ${errorCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>Erros: {errorCount}/{maxErrors}</span>
                    </div>

                    <div className="hidden md:flex flex-col w-32 md:w-40 space-y-1 ml-1">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <span>Meta Limpa</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 md:h-3 overflow-hidden border border-slate-700">
                            <motion.div 
                                className="bg-gradient-to-r from-emerald-600 to-green-400 h-full" 
                                animate={{ width: `${progressPercent}%` }} 
                                transition={{ type: 'spring', bounce: 0.3 }} 
                            />
                        </div>
                    </div>

                    <div className="w-px h-6 bg-white/10 hidden md:block mx-1" />
                    
                    <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-yellow-500/20 whitespace-nowrap">
                        <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Score:</span>
                        <span className="font-black text-sm md:text-lg text-yellow-400">{score} PTS</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col max-w-6xl mx-auto w-full p-4 md:p-8 gap-6 md:gap-8 relative z-10">
                
                {/* PERGUNTA */}
                <div className="bg-slate-900/80 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-800 text-center relative z-20">
                    <h2 className="text-xl md:text-2xl font-black text-emerald-400 mb-2">Desafio Geográfico</h2>
                    <p className="text-sm md:text-base text-slate-300 font-medium mb-4">
                        Considerando o clima e o relevo, qual matriz energética apresenta o melhor custo-benefício socioambiental para cada bioma?
                    </p>
                    
                    <div className="inline-flex items-center justify-center bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 w-full sm:w-auto">
                        {selectedPlant ? (
                            <span className="text-amber-400 font-bold animate-pulse text-sm md:text-base flex items-center gap-2">
                                <MapIcon size={18}/> Clique no bioma ideal para instalar a Usina {PLANTS[selectedPlant].name}...
                            </span>
                        ) : (
                            <span className="text-slate-400 font-medium text-sm md:text-base flex items-center gap-2">
                                <BatteryCharging size={18}/> Passo 1: Selecione uma Energia no painel inferior.
                            </span>
                        )}
                    </div>
                </div>

                {/* BIOMAS (CENTRO) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                    {BIOMES.map((biome) => {
                        const isSolved = solvedBiomes.includes(biome.id);
                        
                        return (
                            <motion.div 
                                key={biome.id}
                                animate={shakeBiome === biome.id ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                onClick={() => handleInstall(biome.id)}
                                className={`relative rounded-3xl overflow-hidden border-4 transition-all duration-300 flex flex-col justify-between p-6 min-h-[300px] shadow-xl group ${
                                    isSolved ? 'border-emerald-500 scale-[0.98]' 
                                    : selectedPlant ? 'border-amber-400 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]' 
                                    : 'border-slate-800' 
                                }`}
                                style={{
                                    backgroundImage: `url(${biome.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className={`absolute inset-0 transition-colors duration-500 ${isSolved ? 'bg-emerald-950/80 backdrop-blur-[2px]' : 'bg-black/60 group-hover:bg-black/40'}`} />

                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setExpandedImage(biome.image); 
                                    }}
                                    className="absolute top-4 right-4 z-20 bg-slate-900/60 p-2.5 rounded-full hover:bg-emerald-600 transition-colors shadow-lg opacity-80 hover:opacity-100 backdrop-blur-sm"
                                >
                                    <ZoomIn size={20} className="text-white" />
                                </button>

                                <div className="relative z-10 flex justify-between items-start mt-2">
                                    <div>
                                        <h2 className="text-3xl font-black text-white drop-shadow-md tracking-tight mb-1">{biome.name}</h2>
                                        {!isSolved && <p className="text-sm text-slate-200 font-medium drop-shadow-sm leading-relaxed max-w-[85%]">{biome.description}</p>}
                                    </div>
                                </div>

                                {isSolved && (
                                    <div className="absolute top-4 right-16 bg-emerald-500 p-2 rounded-full text-slate-900 shadow-lg z-20">
                                        <CheckCircle2 size={24} />
                                    </div>
                                )}

                                {isSolved && (
                                    <div className="relative z-10 flex flex-col items-center justify-center mt-auto bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/50 shadow-inner">
                                        <span className="text-emerald-400 mb-2 scale-125">{PLANTS[biome.correctPlant].icon}</span>
                                        <span className="text-sm font-black text-emerald-400 uppercase tracking-widest text-center">
                                            {PLANTS[biome.correctPlant].name} Instalada
                                        </span>
                                        <span className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest flex items-center justify-center"><Lock size={12} className="mr-1"/> Resolvido</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* CARTAS DE ENERGIA (RODAPÉ) */}
                <div className="mt-auto bg-slate-900/80 p-5 md:p-6 rounded-3xl border border-slate-800 shadow-md">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-4 text-center">Cartas de Energia (Selecione 1)</h3>
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {(Object.keys(PLANTS) as PlantType[]).map((key) => {
                            const plant = PLANTS[key];
                            const isSelected = selectedPlant === key;
                            const isAlreadyUsed = solvedBiomes.some(b => BIOMES.find(bio => bio.id === b)?.correctPlant === key);

                            return (
                                <motion.div
                                    key={key}
                                    whileHover={!isAlreadyUsed ? { y: -5 } : {}}
                                    whileTap={!isAlreadyUsed ? { scale: 0.95 } : {}}
                                    onClick={() => {
                                        if (!isAlreadyUsed) setSelectedPlant(isSelected ? null : key);
                                    }}
                                    className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl border-2 transition-all shadow-lg ${
                                        isAlreadyUsed ? 'bg-slate-950 border-slate-800 opacity-40 cursor-not-allowed grayscale' 
                                        : isSelected ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer' 
                                        : 'bg-slate-900 border-slate-700 hover:border-slate-500 cursor-pointer'
                                    }`}
                                >
                                    <div className={`${isAlreadyUsed ? 'text-slate-500' : plant.color.split(' ')[0]} mb-2 md:mb-3`}>
                                        {plant.icon}
                                    </div>
                                    <span className={`font-black uppercase tracking-widest text-[10px] md:text-sm text-center ${isSelected ? 'text-emerald-400' : isAlreadyUsed ? 'text-slate-500' : 'text-slate-300'}`}>
                                        {plant.name}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </main>
        </div>
    );
}