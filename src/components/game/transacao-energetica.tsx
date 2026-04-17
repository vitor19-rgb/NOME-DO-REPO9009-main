"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, Wind, Sun, Droplet, Leaf, ArrowLeft, ShieldCheck, Map as MapIcon, Info, CheckCircle2, Lock, HelpCircle, BookOpen, ZoomIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface TransacaoEnergeticaGameProps {
    playerName: string;
    onReturnHome: () => void;
    onSaveScore: (score: number) => void;
}

type PlantType = 'hydro' | 'wind' | 'solar' | 'biomass';
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
}

const PLANTS: Record<PlantType, PlantConfig> = {
    hydro: { id: 'hydro', name: 'Hidrelétrica', icon: <Droplet size={28} />, color: 'text-blue-400 border-blue-500' },
    wind: { id: 'wind', name: 'Eólica', icon: <Wind size={28} />, color: 'text-cyan-300 border-cyan-400' },
    solar: { id: 'solar', name: 'Solar', icon: <Sun size={28} />, color: 'text-yellow-400 border-yellow-500' },
    biomass: { id: 'biomass', name: 'Biomassa (Etanol)', icon: <Leaf size={28} />, color: 'text-emerald-400 border-emerald-500' }
};

const BIOMES: BiomeConfig[] = [
    { id: 'amazonia', name: 'Amazônia', image: '/images/biomes/amazonia-satellite.png', description: 'Planície florestal densa e úmida.' },
    { id: 'caatinga', name: 'Caatinga', image: '/images/biomes/caatinga-satellite.png', description: 'Semiárido com alta incidência solar e ventos.' },
    { id: 'cerrado', name: 'Cerrado', image: '/images/biomes/cerrado-satellite.png', description: 'Savana plana focada no agronegócio.' }
];

const IMPACT_LIMIT = 50; 

// --- COMPONENTE DO PAINEL DO ENEM --- //
const EnemHelpPanel = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" className="bg-emerald-900/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-800 hover:text-white rounded-full px-5 py-2 font-bold shadow-lg transition-colors">
                <HelpCircle className="w-5 h-5 mr-2" /> O que cai no ENEM?
            </Button>
        </SheetTrigger>
        <SheetContent className="bg-slate-900/95 backdrop-blur-xl text-slate-100 border-l-slate-700/50 w-full sm:max-w-lg p-0 overflow-y-auto">
             <div className="p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                        <BookOpen className="text-emerald-400 w-8 h-8"/>
                    </div>
                    <h2 className="text-3xl font-black text-white">Revisão ENEM</h2>
                </div>
                
                <div className="space-y-8 text-left">
                    <div>
                        <h3 className="font-black text-xl text-emerald-400 mb-3 tracking-tight">A Matriz Brasileira</h3>
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            O Brasil possui uma das matrizes elétricas <strong>mais renováveis do mundo</strong> (focada em Hidrelétricas), mas "energia limpa" (que não emite CO2 na geração) não significa "energia sem impacto ambiental".
                        </p>
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-blue-400 mb-3 tracking-tight">O Paradoxo Hidrelétrico</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-[15px]">
                            <li><strong>No Planalto (Sul/Sudeste):</strong> Excelentes quedas d'água, mas potencial esgotado.</li>
                            <li><strong>Na Planície (Amazônia):</strong> Construir usinas aqui (ex: Belo Monte) exige <strong>alagamento de áreas gigantescas</strong>, o que expulsa comunidades tradicionais, inunda a biodiversidade e gera <strong>Gás Metano</strong> (CH4) devido à decomposição orgânica debaixo d'água.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-yellow-400 mb-3 tracking-tight">O Potencial do Nordeste</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-[15px]">
                            <li>A região da <strong>Caatinga</strong> e o litoral nordestino são as principais apostas para o futuro devido aos constantes <strong>Ventos Alísios</strong> (Eólica) e à forte incidência solar.</li>
                        </ul>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mt-6">
                        <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Dica para a Prova
                        </h3>
                        <p className="text-sm text-slate-300">
                            Nas questões de Geografia e Ciências da Natureza, a banca do ENEM quer que você avalie o <strong>trade-off (custo-benefício) geográfico</strong>. Nunca assinale que a energia Hidrelétrica ou Eólica não tem impacto. Elas alteram microclimas, o curso dos rios e exigem vastas áreas de terra.
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
);

// --- COMPONENTE PRINCIPAL --- //
export default function TransacaoEnergeticaGame({ playerName, onReturnHome, onSaveScore }: TransacaoEnergeticaGameProps) {
    const [impact, setImpact] = useState(0);
    const [selectedPlant, setSelectedPlant] = useState<PlantType | null>(null);
    const [lockedBiomes, setLockedBiomes] = useState<{ id: BiomeId, plant: PlantType }[]>([]);
    const [status, setStatus] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
    const [alertMessage, setAlertMessage] = useState<{ title: string, text: string, type: 'success' | 'warning' | 'critical' } | null>(null);
    
    // ESTADO: Controla a imagem que está expandida em ecrã inteiro
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    useEffect(() => {
        if (status !== 'playing' || alertMessage) return;

        if (impact >= IMPACT_LIMIT) {
            setStatus('gameover');
        } else if (lockedBiomes.length === 3) {
            setStatus('victory');
        }
    }, [lockedBiomes, impact, status, alertMessage]);

    const handleInstall = (biomeId: BiomeId) => {
        if (!selectedPlant || status !== 'playing' || lockedBiomes.some(b => b.id === biomeId)) return;

        let isSuccess = false;
        let addedImpact = 0;
        let alertConfig = { title: '', text: '', type: 'success' as const };

        // --- CAATINGA ---
        if (biomeId === 'caatinga' && (selectedPlant === 'wind' || selectedPlant === 'solar')) {
            isSuccess = true;
            addedImpact = 0;
            alertConfig = {
                title: 'Estratégia Perfeita!',
                text: 'A Caatinga e o litoral nordestino possuem a maior incidência solar do Brasil e os melhores ventos alísios. Geração limpa garantida com baixíssimo impacto espacial!',
                type: 'success'
            };
        } 
        else if (biomeId === 'caatinga' && selectedPlant === 'hydro') {
            isSuccess = false;
            addedImpact = 15;
            alertConfig = {
                title: 'Rios Intermitentes e Evaporação',
                text: 'No clima semiárido, os rios secam em parte do ano (intermitentes). Uma represa aqui alagaria vales férteis (brejos) e a água evaporaria rapidamente pelo calor extremo.',
                type: 'warning'
            };
        }
        else if (biomeId === 'caatinga' && selectedPlant === 'biomass') {
            isSuccess = false;
            addedImpact = 20;
            alertConfig = {
                title: 'Estresse Hídrico Grave',
                text: 'A cana-de-açúcar exige muita irrigação. Desviar a pouca água disponível no sertão para produzir combustível em vez de alimentos gera graves conflitos sociais e ambientais.',
                type: 'critical'
            };
        }

        // --- CERRADO ---
        else if (biomeId === 'cerrado' && selectedPlant === 'biomass') {
            isSuccess = true;
            addedImpact = 10;
            alertConfig = {
                title: 'Correto, mas com Ressalvas!',
                text: 'Dica ENEM: O Cerrado lidera a produção de cana. Porém, o avanço intenso dessa monocultura causa desmatamento, perda de biodiversidade e esgotamento/laterização do solo.',
                type: 'warning'
            };
        } 
        else if (biomeId === 'cerrado' && selectedPlant === 'hydro') {
            isSuccess = false;
            addedImpact = 20;
            alertConfig = {
                title: 'Alagamento de Chapadas',
                text: 'Apesar de ser o "berço das águas", o relevo de planalto plano (chapadas) faz com que as represas alaguem áreas imensas, destruindo matas de galeria e expulsando populações tradicionais.',
                type: 'warning'
            };
        }
        else if (biomeId === 'cerrado' && (selectedPlant === 'wind' || selectedPlant === 'solar')) {
            isSuccess = false;
            addedImpact = 10;
            alertConfig = {
                title: 'Conflito pelo Uso da Terra',
                text: 'Embora viável, a instalação de mega parques eólicos e solares no Cerrado compete por terras planas usadas para agricultura, intensificando a especulação fundiária e a fragmentação do habitat.',
                type: 'warning'
            };
        }

        // --- AMAZÔNIA ---
        else if (biomeId === 'amazonia' && selectedPlant === 'solar') {
            isSuccess = true;
            addedImpact = 0;
            alertConfig = {
                title: 'Visão Sustentável!',
                text: 'Para proteger a floresta, a melhor solução não são megaobras, mas sim sistemas descentralizados (microrredes solares) para abastecer comunidades ribeirinhas e isoladas sem desmatar.',
                type: 'success'
            };
        } 
        else if (biomeId === 'amazonia' && selectedPlant === 'hydro') {
            isSuccess = false;
            addedImpact = 30;
            alertConfig = {
                title: 'PEGADINHA DO ENEM (ALERTA)!',
                text: 'A Amazônia é uma PLANÍCIE. Hidrelétricas aqui (ex: Belo Monte) exigem alagar áreas gigantescas! A floresta submersa apodrece e emite Gás Metano (CH4), piorando o aquecimento global.',
                type: 'critical'
            };
        } 
        else if (biomeId === 'amazonia' && selectedPlant === 'wind') {
            isSuccess = false;
            addedImpact = 15;
            alertConfig = {
                title: 'Ventos Bloqueados',
                text: 'O denso dossel das grandes árvores funciona como uma barreira que reduz a velocidade dos ventos. Seria necessário desmatar imensas clareiras para as pás eólicas girarem.',
                type: 'warning'
            };
        }
        else if (biomeId === 'amazonia' && selectedPlant === 'biomass') {
            isSuccess = false;
            addedImpact = 25;
            alertConfig = {
                title: 'Ameaça aos Rios Voadores',
                text: 'Derrubar a floresta úmida para plantar monoculturas de combustível anula a transpiração das árvores. Isso seca os "Rios Voadores", prejudicando o regime de chuvas de todo o Brasil central!',
                type: 'critical'
            };
        }

        if (isSuccess) {
            setLockedBiomes(prev => [...prev, { id: biomeId, plant: selectedPlant }]);
        }
        setImpact(prev => prev + addedImpact);
        setSelectedPlant(null); 
        setAlertMessage(alertConfig); 
    };

    // --- TELAS SECUNDÁRIAS --- //
    if (status === 'intro') {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
                    
                    <div className="absolute top-6 right-6">
                        <EnemHelpPanel />
                    </div>

                    <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-emerald-600/20 p-5 rounded-3xl border border-emerald-500/30">
                            <Zap className="w-16 h-16 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-center mb-6">Matriz Energética</h1>
                    <p className="text-slate-300 text-lg text-center mb-10">
                        Ministro <strong>{playerName}</strong>, o desafio é abastecer o Brasil minimizando danos. Encontre a <strong>fonte ideal de energia para as características de cada Bioma</strong>.
                    </p>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg text-left mb-10">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-400"><Info size={20}/> Instruções do Desafio</h3>
                        <ul className="space-y-3 text-slate-300 text-sm">
                            <li><strong>1. Escolha a Fonte:</strong> Selecione uma usina no baralho.</li>
                            <li><strong>2. Escolha o Bioma:</strong> Clique na região onde ela causará menos impacto e terá mais rendimento. Pode clicar na <strong>Lupa</strong> para ampliar a imagem do satélite e analisar o terreno.</li>
                            <li><strong>3. Cuidado com o Impacto:</strong> Escolhas erradas ou <strong className="text-yellow-400">Pegadinhas do ENEM</strong> aumentarão drasticamente o Impacto. Se chegar a {IMPACT_LIMIT}%, é Game Over!</li>
                        </ul>
                    </div>

                    <Button onClick={() => setStatus('playing')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 text-xl rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-all">
                        Iniciar Projeto Energético
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (status === 'gameover') {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-red-500/50 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.2)] max-w-2xl relative">
                    {/* Botão do ENEM removido desta tela a pedido */}
                    <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-black text-red-500 mb-4">Desastre Ambiental!</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        A implantação energética foi feita sem planejamento geográfico. O Limite de Impacto de {IMPACT_LIMIT}% foi estourado.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={onReturnHome} variant="ghost" className="text-slate-400 hover:text-white py-6">Voltar ao Menu</Button>
                        <Button onClick={() => { setImpact(0); setLockedBiomes([]); setStatus('playing'); }} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-6">Tentar Novamente</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'victory') {
        const finalScore = 150 - impact; 
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-green-500/50 rounded-3xl shadow-[0_0_80px_rgba(34,197,94,0.2)] max-w-2xl relative">
                    {/* Botão do ENEM removido desta tela a pedido */}
                    <ShieldCheck className="w-24 h-24 text-green-400 mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-black text-green-400 mb-4">Matriz Sustentável!</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Excelente! Você encontrou a fonte de energia viável para cada Bioma, conhecendo profundamente os impactos socioambientais.
                    </p>
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl mb-8">
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Índice de Sustentabilidade</p>
                        <p className="text-6xl font-black text-emerald-400 drop-shadow-md">+{finalScore} pts</p>
                    </div>
                    <Button onClick={() => { onSaveScore(finalScore); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-7 text-xl hover:scale-105 transition-transform">Concluir Missão</Button>
                </motion.div>
            </div>
        );
    }

    // --- TELA PRINCIPAL (JOGO) --- //
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
            
            {/* MODAL PARA A IMAGEM EM ECRÃ INTEIRO */}
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
                            alt="Bioma em Detalhe" 
                            className="max-w-full max-h-[90vh] rounded-[2rem] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-slate-800" 
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ALERTA DE JOGADA (Pegadinhas do ENEM) */}
            <AnimatePresence>
                {alertMessage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className={`max-w-xl w-full p-8 rounded-3xl border-2 shadow-2xl text-center ${
                                alertMessage.type === 'critical' ? 'bg-red-950 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.4)]' 
                                : alertMessage.type === 'warning' ? 'bg-amber-950 border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.4)]'
                                : 'bg-emerald-950 border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.4)]'
                            }`}
                        >
                            {alertMessage.type === 'critical' ? <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-red-400" />
                            : alertMessage.type === 'warning' ? <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-amber-400" />
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

            {/* BOTÃO DO ENEM ACIMA DO HEADER NO JOGO */}
            <div className="w-full flex justify-end px-4 md:px-6 pt-4 relative z-20">
                <EnemHelpPanel />
            </div>

            <header className="w-full p-4 md:p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10 mt-2">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" size="icon" onClick={onReturnHome} className="text-slate-400 hover:text-white bg-slate-800 rounded-full"><ArrowLeft /></Button>
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 p-2 rounded-xl"><Zap className="text-white w-5 h-5" /></div>
                            <span className="font-black text-lg tracking-tight hidden sm:block">Matriz Energética</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-6 sm:px-8">
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-sm font-bold text-emerald-400">
                                <span>Biomas Abastecidos</span>
                                <span>{lockedBiomes.length} / 3</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                                <motion.div className="bg-gradient-to-r from-emerald-600 to-green-400 h-full" animate={{ width: `${(lockedBiomes.length / 3) * 100}%` }} transition={{ type: 'spring' }} />
                            </div>
                        </div>
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-sm font-bold text-red-400">
                                <span>Impacto Ambiental Acumulado</span>
                                <span>{impact}% / {IMPACT_LIMIT}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                                <motion.div className="bg-gradient-to-r from-red-600 to-orange-400 h-full" animate={{ width: `${(impact / IMPACT_LIMIT) * 100}%` }} transition={{ type: 'spring' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col max-w-6xl mx-auto w-full p-4 md:p-8 gap-8 relative z-10">
                
                <div className="text-center bg-slate-900 border border-slate-800 py-4 rounded-2xl shadow-lg">
                    {selectedPlant ? (
                        <p className="text-emerald-400 font-bold animate-pulse text-lg flex items-center justify-center gap-2">
                            <MapIcon /> Clique no Bioma ideal para instalar a Usina {PLANTS[selectedPlant].name}...
                        </p>
                    ) : (
                        <p className="text-slate-400 font-medium text-lg flex items-center justify-center gap-2">
                            1. Selecione uma Usina no painel inferior.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                    {BIOMES.map((biome) => {
                        const lockedState = lockedBiomes.find(b => b.id === biome.id);
                        const isLocked = !!lockedState;
                        
                        return (
                            <div 
                                key={biome.id}
                                onClick={() => handleInstall(biome.id)}
                                className={`relative rounded-3xl overflow-hidden border-4 transition-all duration-300 flex flex-col justify-between p-6 min-h-[320px] shadow-xl group ${
                                    isLocked ? 'border-emerald-500 scale-[0.98]' 
                                    : selectedPlant ? 'border-amber-400 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]' 
                                    : 'border-slate-800' 
                                }`}
                                style={{
                                    backgroundImage: `url(${biome.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className={`absolute inset-0 transition-colors duration-500 ${isLocked ? 'bg-emerald-950/80 backdrop-blur-[2px]' : selectedPlant ? 'bg-black/40' : 'bg-black/60'}`} />

                                {/* BOTÃO DE LUPA PARA EXPANDIR A IMAGEM */}
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
                                        {!isLocked && <p className="text-sm text-slate-200 font-medium drop-shadow-sm leading-relaxed max-w-[85%]">{biome.description}</p>}
                                    </div>
                                </div>

                                {isLocked && (
                                    <div className="absolute top-4 right-16 bg-emerald-500 p-2 rounded-full text-slate-900 shadow-lg z-20">
                                        <CheckCircle2 size={24} />
                                    </div>
                                )}

                                {isLocked && lockedState && (
                                    <div className="relative z-10 flex flex-col items-center justify-center mt-auto bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/50">
                                        <span className="text-emerald-400 mb-2">{PLANTS[lockedState.plant].icon}</span>
                                        <span className="text-sm font-black text-emerald-400 uppercase tracking-widest text-center">
                                            {PLANTS[lockedState.plant].name} Instalada
                                        </span>
                                        <span className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest"><Lock size={10} className="inline mr-1"/> Bioma Seguro</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4 text-center">Fontes de Energia Disponíveis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(Object.keys(PLANTS) as PlantType[]).map((key) => {
                            const plant = PLANTS[key];
                            const isSelected = selectedPlant === key;
                            const isAlreadyUsed = lockedBiomes.some(b => b.plant === key);

                            return (
                                <motion.div
                                    key={key}
                                    whileHover={!isAlreadyUsed ? { y: -5 } : {}}
                                    whileTap={!isAlreadyUsed ? { scale: 0.95 } : {}}
                                    onClick={() => {
                                        if (!isAlreadyUsed) setSelectedPlant(isSelected ? null : key);
                                    }}
                                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-lg ${
                                        isAlreadyUsed ? 'bg-slate-950 border-slate-800 opacity-30 cursor-not-allowed' 
                                        : isSelected ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer' 
                                        : 'bg-slate-900 border-slate-700 hover:border-slate-500 cursor-pointer'
                                    }`}
                                >
                                    <div className={`${isAlreadyUsed ? 'text-slate-600' : plant.color.split(' ')[0]} mb-3`}>
                                        {plant.icon}
                                    </div>
                                    <span className={`font-black uppercase tracking-widest text-sm text-center ${isSelected ? 'text-emerald-400' : isAlreadyUsed ? 'text-slate-600' : 'text-slate-300'}`}>
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