"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen, HelpCircle, MapPin, Search, MousePointerClick, Radio, SignalHigh, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// --- TIPAGENS --- //
interface DetetiveIbgeGameProps {
    playerName: string;
    onReturnHome: () => void;
    onSaveScore: (score: number) => void;
}

type LabelId = 
    | 'metropole_global' | 'metropole_nacional' | 'metropole_regional' 
    | 'tecnopolo' | 'capital_regional' | 'centro_sub' 
    | 'centro_zona' | 'centro_local' | 'vila' 
    | 'distrator_1' | 'distrator_2' | 'distrator_3';

interface NodeDef {
    id: string;
    x: number; // Porcentagem (0-100)
    y: number; // Porcentagem (0-100)
    labelPredefinida?: string;
    isDropzone?: boolean;
    correctLabelId?: LabelId;
    radius?: number;
}

interface EdgeDef {
    from: string;
    to: string;
    thickness: number;
    dashed?: boolean;
}

interface LabelDef {
    id: LabelId;
    text: string;
}

interface PhaseData {
    title: string;
    briefing: string;
    description: string;
    nodes: NodeDef[];
    edges: EdgeDef[];
    availableLabels: LabelDef[];
    trivia: { title: string; text: string };
}

// --- DADOS DAS FASES --- //
const PHASES: PhaseData[] = [
    {
        title: "Missão 1: A Base da Rede Urbana",
        briefing: "Bem-vindo ao IBGE! O Brasil possui milhares de pequenos municípios. A base da rede urbana é formada por Vilas e pequenos Centros Locais que oferecem serviços essenciais (padarias, farmácias locais). Porém, quando os moradores precisam de serviços um pouco mais complexos (como um hospital secundário), viajam para uma cidade ligeiramente maior, chamada Centro de Zona.",
        description: "Organize o caminho correto que uma pessoa faz ao sair de um lugar com poucos serviços até chegar a um local com mais serviços.",
        nodes: [
            { id: 'n1', x: 50, y: 30, isDropzone: true, correctLabelId: 'centro_zona', radius: 24 },
            { id: 'n2', x: 50, y: 60, isDropzone: true, correctLabelId: 'centro_local', radius: 16 },
            { id: 'n3', x: 50, y: 85, isDropzone: true, correctLabelId: 'vila', radius: 10 },
        ],
        edges: [
            { from: 'n3', to: 'n2', thickness: 2 },
            { from: 'n2', to: 'n1', thickness: 4 },
        ],
        availableLabels: [
            { id: 'centro_zona', text: 'Centro de Zona' },
            { id: 'centro_local', text: 'Centro Local' },
            { id: 'vila', text: 'Vila Rural' },
            { id: 'distrator_1', text: 'Capital' } 
        ],
        trivia: {
            title: "Centros de Zona e Locais",
            text: "Os Centros de Zona exercem influência apenas sobre as cidades e vilas vizinhas. Eles são o primeiro nível de centralização para o cidadão do interior."
        }
    },
    {
        title: "Missão 2: O Comando Regional",
        briefing: "Avançando na hierarquia! Agora vamos analisar as cidades médias e os grandes pólos regionais. Uma Capital Regional possui imenso poder de atração (shoppings e universidades), exercendo influência sobre dezenas de pequenos 'Centros Sub-regionais'. Mas a hierarquia dita que até as Capitais Regionais devem se reportar a uma gigante Metrópole Regional para decisões financeiras pesadas.",
        description: "Organize a hierarquia correta das cidades, do nível menor até o maior poder de influência regional.",
        nodes: [
            { id: 'n1', x: 20, y: 50, isDropzone: true, correctLabelId: 'metropole_regional', radius: 32 },
            { id: 'n2', x: 50, y: 50, isDropzone: true, correctLabelId: 'capital_regional', radius: 24 },
            { id: 'n3', x: 80, y: 50, isDropzone: true, correctLabelId: 'centro_sub', radius: 16 },
            { id: 'n4', x: 80, y: 80, labelPredefinida: 'Centro Local', radius: 10 }, 
        ],
        edges: [
            { from: 'n4', to: 'n3', thickness: 2 },
            { from: 'n3', to: 'n2', thickness: 4 },
            { from: 'n2', to: 'n1', thickness: 6 },
        ],
        availableLabels: [
            { id: 'metropole_regional', text: 'Metrópole Reg.' },
            { id: 'capital_regional', text: 'Capital Regional' },
            { id: 'centro_sub', text: 'Centro Sub-reg.' },
            { id: 'distrator_2', text: 'Megalópole' } 
        ],
        trivia: {
            title: "Capitais Regionais",
            text: "São cidades como Campinas (SP) ou Caruaru (PE). Possuem enorme atração comercial e industrial, servindo de ponte antes das imensas Metrópoles."
        }
    },
    {
        title: "Missão 3: A Elite Global e a Rede Flexível",
        briefing: "O topo da cadeia! Aqui estão as cidades que comandam a economia do país e do mundo. O mais importante para o ENEM: com a internet (Meio Técnico-Científico-Informacional), a hierarquia deixou de ser rígida! Hoje, uma cidade média comanda fluxos que podem ir diretamente à grande Metrópole Global, saltando intermediários.",
        description: "Organize a hierarquia das cidades mais influentes, considerando do nível nacional até o nível global.",
        nodes: [
            { id: 'n1', x: 50, y: 20, isDropzone: true, correctLabelId: 'metropole_global', radius: 40 },
            { id: 'n2', x: 25, y: 55, isDropzone: true, correctLabelId: 'metropole_nacional', radius: 30 },
            { id: 'n3', x: 75, y: 55, isDropzone: true, correctLabelId: 'tecnopolo', radius: 20 },
            { id: 'n4', x: 50, y: 85, labelPredefinida: 'Capital Regional', radius: 16 },
        ],
        edges: [
            { from: 'n2', to: 'n1', thickness: 8 },
            { from: 'n3', to: 'n1', thickness: 4 },
            { from: 'n4', to: 'n2', thickness: 5 },
            { from: 'n4', to: 'n1', thickness: 3, dashed: true }, 
        ],
        availableLabels: [
            { id: 'metropole_global', text: 'Metrópole Global' },
            { id: 'metropole_nacional', text: 'Metrópole Nacional' },
            { id: 'tecnopolo', text: 'Tecnopolo' },
            { id: 'distrator_3', text: 'Distrito Histórico' } 
        ],
        trivia: {
            title: "Avanço ENEM: A Quebra da Hierarquia Rígida",
            text: "As Metrópoles Globais conectam o Brasil ao exterior. A sacada do ENEM é a linha pontilhada: a rede de telecomunicações permitiu que outras cidades acessem serviços globais sem passar pelos níveis do meio."
        }
    }
];

// --- FEEDBACK ESPECÍFICO PARA CADA ERRO DIDÁTICO --- //
const getErrorFeedback = (wrongLabel: LabelId): string => {
    switch (wrongLabel) {
        case 'vila':
            return "Uma Vila Rural é a base absoluta da hierarquia. Ela não possui infraestrutura para atrair fluxos de outras cidades, apenas envia pessoas.";
        case 'centro_local':
            return "Um Centro Local oferece comércio básico (padarias, farmácias locais). Repare que a cidade selecionada exerce uma influência muito maior.";
        case 'centro_zona':
            return "O Centro de Zona atrai centros locais, mas não é uma Metrópole. O tamanho do círculo e a espessura da linha indicam o poder de influência.";
        case 'centro_sub':
            return "O Centro Sub-regional é menor que uma Capital Regional. Ele costuma estar subordinado diretamente a essas grandes cidades do interior.";
        case 'capital_regional':
            return "Uma Capital Regional atua como ponte clássica: atrai cidades menores e subordina-se à Metrópole. Analise a linha deste ponto no mapa.";
        case 'metropole_regional':
        case 'metropole_nacional':
        case 'metropole_global':
            return "Metrópoles são os grandes ímãs da rede urbana nacional! Elas comandam a economia. Este ponto no mapa não possui toda essa força.";
        case 'tecnopolo':
            return "Um Tecnopolo é focado exclusivamente em alta tecnologia e pólos universitários. A posição deste nó indica uma função urbana geral.";
        case 'distrator_1':
            return "Cuidado! Nem toda cidade no topo de uma pequena região é uma Capital. 'Capital' depende da divisão política dos estados.";
        case 'distrator_2':
            return "Megalópole é a união (conurbação) de duas Metrópoles vizinhas, crescendo até se encostarem. Aqui vemos apenas pólos distintos.";
        case 'distrator_3':
            return "Distritos ou Centros Históricos atraem turismo, mas essa não é uma categoria do IBGE para a rede de comando empresarial do Brasil.";
        default:
            return "Essa classificação hierárquica não bate com as conexões e o tamanho deste nó geográfico.";
    }
};

// --- PAINEL DE AJUDA ENEM --- //
const EnemHelpPanel = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" className="bg-blue-900/40 border-blue-500/50 text-blue-200 hover:bg-blue-800 hover:text-white rounded-full px-3 md:px-5 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm transition-colors">
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" /> 
                <span className="hidden sm:inline">O que cai no ENEM?</span>
                <span className="sm:hidden">ENEM</span>
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
                        <h3 className="font-black text-xl text-blue-400 mb-3 tracking-tight">Hierarquia Urbana Clássica</h3>
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            É a organização das cidades em níveis. No modelo antigo, uma <strong>Vila</strong> se comunicava com o <strong>Centro Local</strong>, que ia para a <strong>Capital Regional</strong>, até chegar à <strong>Metrópole</strong>. Era um esquema rígido.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-emerald-400 mb-3 tracking-tight">A Rede Urbana Moderna</h3>
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            Com os avanços no <strong>Meio Técnico-Científico-Informacional</strong> (internet/transportes), a rede tornou-se flexível. Hoje, uma indústria no interior pode fechar negócios online diretamente com a Metrópole Global.
                        </p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mt-6">
                        <h3 className="font-black text-lg text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Dica para a Prova
                        </h3>
                        <p className="text-sm text-slate-300">
                            Nas provas do ENEM, ao ver imagens de fluxos materiais e imateriais (linhas de mapa), a resposta quase sempre envolve o facto de a tecnologia ter quebrado a subordinação rígida das cidades.
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
);

// --- COMPONENTE PRINCIPAL --- //
export default function DetetiveIbgeGame({ playerName, onReturnHome, onSaveScore }: DetetiveIbgeGameProps) {
    const [status, setStatus] = useState<'intro' | 'mission_briefing' | 'playing' | 'phase_complete' | 'victory'>('intro');
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [score, setScore] = useState(0);
    
    const [activeLabel, setActiveLabel] = useState<LabelDef | null>(null);
    const [placedLabels, setPlacedLabels] = useState<Record<string, LabelId>>({});
    
    const [alertMessage, setAlertMessage] = useState<{ title: string, text: string, type: 'warning' | 'success' } | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const phase = PHASES[currentPhaseIndex];

    // Detetar tamanho do ecrã para ajustar os gráficos
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        if (typeof window !== 'undefined') {
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, []);

    const handleZoneClick = (dropzoneId: string) => {
        if (!activeLabel) {
            toast({
                title: "Ação Inválida",
                description: "Selecione uma Etiqueta no Inventário abaixo antes de clicar no mapa.",
                className: "bg-slate-800 border-slate-600 text-white"
            });
            return;
        }

        const dropzoneNode = phase.nodes.find(n => n.id === dropzoneId);
        
        if (dropzoneNode?.correctLabelId === activeLabel.id) {
            setPlacedLabels(prev => ({ ...prev, [dropzoneId]: activeLabel.id }));
            setScore(prev => prev + 50);
            toast({
                title: "Classificação Correta!",
                description: `A área foi identificada como ${activeLabel.text}.`,
                className: "bg-emerald-900 border-emerald-500 text-white"
            });
            setActiveLabel(null); 
        } else {
            setScore(prev => Math.max(0, prev - 10));
            setAlertMessage({
                title: 'Classificação Incorreta',
                text: getErrorFeedback(activeLabel.id),
                type: 'warning'
            });
            setActiveLabel(null); 
        }
    };

    useEffect(() => {
        if (status !== 'playing') return;
        const dropzones = phase.nodes.filter(n => n.isDropzone);
        const allFilledCorrectly = dropzones.every(dz => placedLabels[dz.id] === dz.correctLabelId);

        if (allFilledCorrectly && dropzones.length > 0) {
            setTimeout(() => setStatus('phase_complete'), 1000);
        }
    }, [placedLabels, phase, status]);

    const handleNextPhase = () => {
        if (currentPhaseIndex + 1 < PHASES.length) {
            setCurrentPhaseIndex(prev => prev + 1);
            setPlacedLabels({});
            setActiveLabel(null);
            setStatus('mission_briefing'); 
        } else {
            setStatus('victory');
        }
    };

    // --- TELAS SECUNDÁRIAS --- //
    
    if (status === 'intro') {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">

                    <div className="absolute top-6 right-6">
                        <EnemHelpPanel />
                    </div>

                    <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30">
                            <MapPin className="w-16 h-16 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-center text-white mb-6">Detetive do IBGE</h1>
                    <p className="text-slate-300 text-lg text-center mb-10">
                        Agente <strong>{playerName}</strong>, os dados cartográficos foram corrompidos! A sua missão é analisar a Rede Urbana e <strong>classificar a hierarquia</strong> das cidades no mapa.
                    </p>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-sm text-left mb-10">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-white"><Search size={20} className="text-blue-400"/> Como Jogar:</h3>
                        <ul className="space-y-3 text-slate-300 text-sm">
                            <li>📍 <strong>Círculos Maiores:</strong> Representam cidades com maior infraestrutura e poder de atração.</li>
                            <li>🛣️ <strong>Linhas:</strong> Representam a atração e fluxo de pessoas e informações de uma cidade para a outra.</li>
                            <li>👆 <strong>Ação:</strong> Clique numa Etiqueta no seu inventário, depois <strong>clique no espaço "?"</strong> no mapa para identificá-la.</li>
                        </ul>
                    </div>

                    <Button onClick={() => setStatus('mission_briefing')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 text-xl rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105 transition-all">
                        Iniciar Expedição
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (status === 'mission_briefing') {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full bg-slate-900 border-2 border-blue-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30">
                            <ClipboardList className="w-16 h-16 text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{phase.title}</h2>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-inner text-left mb-8">
                        <p className="text-slate-300 text-lg leading-relaxed">
                            {phase.briefing}
                        </p>
                    </div>
                    <Button onClick={() => setStatus('playing')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 text-xl rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 transition-all">
                        Entrar no Mapa
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (status === 'victory') {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-2xl relative z-10">
                    <ShieldCheck className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-black text-emerald-400 mb-4">Rede Mapeada!</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Excelente trabalho analítico! Você compreendeu perfeitamente a dinâmica de subordinação da Hierarquia Urbana clássica e a flexibilidade da rede moderna (ENEM).
                    </p>
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl mb-8 shadow-inner">
                        <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Pontuação Cartográfica</p>
                        <p className="text-6xl font-black text-yellow-400 drop-shadow-md">+{score} pts</p>
                    </div>
                    <Button onClick={() => onSaveScore(score)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-7 text-xl rounded-2xl shadow-lg hover:scale-105 transition-transform">
                        Concluir Missão
                    </Button>
                </motion.div>
            </div>
        );
    }

    // --- TELA PRINCIPAL (JOGO MAPA) --- //
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
            
            <div className="absolute top-0 w-full h-full opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* MODAL DE ERRO DIDÁTICO */}
            <AnimatePresence>
                {alertMessage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-lg w-full p-8 rounded-3xl border-2 shadow-2xl text-center bg-amber-950 border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.4)]"
                        >
                            <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-amber-400" />
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

            {/* MODAL DE FASE CONCLUÍDA */}
            <AnimatePresence>
                {status === 'phase_complete' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-xl w-full bg-slate-900 p-8 rounded-3xl border-2 border-blue-500/50 shadow-2xl text-center"
                        >
                            <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-emerald-400" />
                            <h2 className="text-3xl font-black mb-6 text-white">Análise Correta!</h2>
                            
                            <div className="bg-blue-950/30 p-6 rounded-2xl border border-blue-900/50 mb-8 text-left">
                                <h3 className="font-black text-blue-400 flex items-center gap-2 mb-3"><BookOpen size={20}/> {phase.trivia.title}</h3>
                                <p className="text-slate-300 font-medium leading-relaxed">{phase.trivia.text}</p>
                            </div>

                            <Button onClick={handleNextPhase} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 text-xl rounded-xl shadow-lg">
                                {currentPhaseIndex === PHASES.length - 1 ? "Ver Resultado Final" : "Avançar na Investigação"}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CABEÇALHO GLOBAL */}
            <header className="w-full p-3 md:p-6 bg-[#0A1024]/95 backdrop-blur-md border-b border-white/10 relative z-20 flex flex-col md:flex-row justify-between items-center shadow-xl md:shadow-2xl gap-3 md:gap-4 sticky top-0">
                <div className="flex items-center justify-between md:justify-start w-full md:w-auto relative">
                    <Button variant="ghost" size="icon" onClick={onReturnHome} className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full absolute left-0 md:static md:mr-4 shrink-0">
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    <div className="flex items-center gap-2 md:gap-3 mx-auto md:mx-0">
                        <div className="bg-blue-600 p-1.5 md:p-2 rounded-xl shadow-md md:shadow-lg shadow-blue-900/20">
                            <MapIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-black text-base md:text-lg tracking-tight leading-none text-white">Cartografia IBGE</span>
                            <span className="text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-widest mt-1 whitespace-nowrap">Missão {currentPhaseIndex + 1} de {PHASES.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center md:justify-end w-full md:w-auto gap-2 md:gap-4">
                    <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-yellow-500/20 whitespace-nowrap">
                        <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Score:</span>
                        <span className="font-black text-sm md:text-lg text-yellow-400">{score} PTS</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col max-w-5xl mx-auto w-full p-4 gap-6 relative z-10">
                
                <div className="bg-slate-900/80 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-800 text-center relative z-20">
                    <h2 className="text-xl md:text-2xl font-black text-blue-400 mb-2">Desafio de Mapeamento</h2>
                    <p className="text-sm md:text-lg text-slate-300 font-medium">{phase.description}</p>
                </div>

                {/* ÁREA DO MAPA - COMPACTA NO MOBILE PARA NÃO SOBREPOR */}
                <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[16/9] bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {phase.edges.map((edge, idx) => {
                            const nodeFrom = phase.nodes.find(n => n.id === edge.from);
                            const nodeTo = phase.nodes.find(n => n.id === edge.to);
                            if (!nodeFrom || !nodeTo) return null;
                            const thickness = isMobile ? edge.thickness * 0.7 : edge.thickness;
                            return (
                                <line 
                                    key={idx}
                                    x1={`${nodeFrom.x}%`} y1={`${nodeFrom.y}%`}
                                    x2={`${nodeTo.x}%`} y2={`${nodeTo.y}%`}
                                    stroke="#3b82f6" 
                                    strokeOpacity={edge.dashed ? 0.8 : 0.4}
                                    strokeWidth={thickness}
                                    strokeDasharray={edge.dashed ? "10, 10" : "none"}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </svg>

                    {phase.nodes.map(node => {
                        const isFilled = node.isDropzone && placedLabels[node.id];
                        const labelText = isFilled ? phase.availableLabels.find(l => l.id === placedLabels[node.id])?.text : node.labelPredefinida;

                        const isActiveDropzone = node.isDropzone && !isFilled && activeLabel;
                        const isFilledAcerto = isFilled;
                        const isPredefinida = !!node.labelPredefinida;
                        
                        // Círculos menores no telemóvel para dar mais espaço
                        const currentRadius = (node.radius || 16) * (isMobile ? 0.65 : 1);

                        return (
                            <div 
                                key={node.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <AnimatePresence>
                                        {isActiveDropzone && (
                                            <>
                                                <motion.div 
                                                    className="absolute rounded-full bg-blue-500 opacity-30"
                                                    style={{ width: `${currentRadius * 4}px`, height: `${currentRadius * 4}px` }}
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                                />
                                                <motion.div 
                                                    className="absolute rounded-full bg-blue-500 opacity-20"
                                                    style={{ width: `${currentRadius * 6}px`, height: `${currentRadius * 6}px` }}
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                                />
                                            </>
                                        )}
                                        {isFilledAcerto && (
                                            <motion.div 
                                                className="absolute rounded-full bg-emerald-400 opacity-30"
                                                style={{ width: `${currentRadius * 4}px`, height: `${currentRadius * 4}px` }}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                            />
                                        )}
                                        {isPredefinida && (
                                            <motion.div 
                                                className="absolute rounded-full bg-blue-400 opacity-20"
                                                style={{ width: `${currentRadius * 3.5}px`, height: `${currentRadius * 3.5}px` }}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: [1, 1.3], opacity: [0.2, 0] }}
                                                transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <motion.div 
                                        className={`rounded-full border-2 md:border-4 shadow-lg md:shadow-xl flex items-center justify-center transition-colors duration-300 relative z-10 ${
                                            isFilledAcerto ? 'bg-emerald-500 border-emerald-400' 
                                            : isPredefinida ? 'bg-slate-800 border-blue-500/80' 
                                            : isActiveDropzone ? 'bg-blue-950 border-blue-400'
                                            : 'bg-slate-800 border-slate-600' 
                                        }`}
                                        style={{ 
                                            width: `${currentRadius * 2}px`, 
                                            height: `${currentRadius * 2}px`,
                                            boxShadow: isFilledAcerto ? '0 0 15px rgba(16,185,129,0.5), inset 0 0 5px rgba(0,0,0,0.5)'
                                                     : isActiveDropzone ? '0 0 15px rgba(59,130,246,0.5), inset 0 0 5px rgba(0,0,0,0.5)'
                                                     : isPredefinida ? '0 0 10px rgba(59,130,246,0.2), inset 0 0 5px rgba(0,0,0,0.5)'
                                                     : '0 0 5px rgba(0,0,0,0.3), inset 0 0 5px rgba(0,0,0,0.5)'
                                        }}
                                        animate={
                                            isFilledAcerto ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } }
                                            : isActiveDropzone ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1, ease: "easeInOut" } }
                                            : isPredefinida ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 2.5 } } 
                                            : {} 
                                        }
                                    >
                                        {isFilledAcerto && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                                                <CheckCircle2 className="text-slate-950" style={{ width: `${currentRadius * 1.3}px`, height: `${currentRadius * 1.3}px` }} />
                                            </motion.div>
                                        )}
                                        {isActiveDropzone && (
                                            <MousePointerClick className="text-blue-200 animate-pulse" style={{ width: `${currentRadius}px`, height: `${currentRadius}px` }} />
                                        )}
                                        {isPredefinida && node.radius && node.radius > 15 && (
                                             <SignalHigh className="text-blue-400 opacity-60 animate-pulse" style={{ width: `${currentRadius}px`, height: `${currentRadius}px` }} />
                                        )}
                                        {isPredefinida && node.radius && node.radius <= 15 && (
                                             <Radio className="text-blue-400 opacity-40" style={{ width: `${currentRadius * 0.8}px`, height: `${currentRadius * 0.8}px` }} />
                                        )}
                                    </motion.div>
                                </div>

                                <div className="mt-2 md:mt-4 relative z-20">
                                    {node.isDropzone && !isFilled ? (
                                        <motion.button 
                                            onClick={() => handleZoneClick(node.id)}
                                            className={`border-2 font-black px-2 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-xl shadow-md min-w-[75px] md:min-w-[140px] text-[10px] md:text-base text-center transition-all transform hover:scale-105 ${
                                                activeLabel 
                                                ? 'bg-blue-900 border-blue-400 text-blue-100 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                                                : 'bg-slate-800/80 border-slate-600 border-dashed text-slate-500 cursor-pointer hover:bg-slate-700 hover:border-slate-400'
                                            }`}
                                            animate={activeLabel ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                                        >
                                            {activeLabel ? (isMobile ? 'Colar' : 'Clique para Colar') : '?'}
                                        </motion.button>
                                    ) : (
                                        <motion.div 
                                            className={`font-bold px-2 md:px-4 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-base whitespace-nowrap shadow-sm border ${
                                            isFilled ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-blue-200 border-blue-900/50'
                                        }`}
                                            initial={isFilled ? { opacity: 0, y: 10 } : {}}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            {labelText}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* INVENTÁRIO */}
                <div className="bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg border border-slate-800 relative z-30">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-4 text-center flex items-center justify-center gap-2">
                        <MousePointerClick size={16}/> Inventário de Etiquetas
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 min-h-[60px]">
                        {phase.availableLabels.map((label) => {
                            const isPlaced = Object.values(placedLabels).includes(label.id);
                            if (isPlaced) return null;

                            const isSelected = activeLabel?.id === label.id;

                            return (
                                <motion.button
                                    key={label.id}
                                    onClick={() => setActiveLabel(isSelected ? null : label)}
                                    whileHover={!isMobile ? { scale: 1.05 } : {}}
                                    whileTap={{ scale: 0.95 }}
                                    className={`font-black px-3 md:px-6 py-2 md:py-3.5 rounded-lg md:rounded-xl cursor-pointer shadow-md border-2 transition-all text-[11px] md:text-base ${
                                        isSelected 
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
                                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-400'
                                    }`}
                                >
                                    {label.text}
                                </motion.button>
                            );
                        })}
                    </div>
                    <p className="text-center text-blue-400 font-medium text-xs md:text-sm mt-4 md:mt-5">
                        Passo 1: Clique na etiqueta | Passo 2: Clique no <strong>?</strong> no mapa.
                    </p>
                </div>

            </main>
        </div>
    );
}