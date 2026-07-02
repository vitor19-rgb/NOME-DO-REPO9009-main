"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, ArrowLeft, HelpCircle, Trophy, BookOpen, 
    AlertTriangle, Newspaper, Play, CheckCircle2, 
    ArrowRight, RefreshCw, LogOut, ImageIcon, Sparkles, 
    MousePointerClick, X, FileText, Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface EfeitoDominoGlobalGameProps {
    playerName: string;
    onComplete?: () => void;
    onSaveScore?: (score: number) => void;
}

interface TagItem {
    id: string;
    text: string;
    correctZone: number; // 1: Evento, 2: Impacto Global/Local, 3: Reflexo Político/Econômico, 0: Distrator
}

// --- DADOS DAS 5 FASES DO JOGO --- //
const LEVELS = [
    {
        id: 1,
        title: "Tensão no Médio Oriente",
        headline: "Escalada de Tensão Militar entre Estados Unidos e Irã Alerta Mercados Mundiais",
        image: "/images/geopilitica/news-placeholder.png",
        newsSupport: `"Marinhas trocam ameaças no Estreito de Ormuz. A passagem é vital para navios petroleiros comerciais mundiais.\n\nEspecialistas de mercado temem o reflexo em cascata direto em países emergentes que dependem amplamente de rodovias e caminhões para transportar os seus bens e abastecer os comércios locais."`,
        reportParts: [
            "Os dados de inteligência confirmam que a atual crise global teve início com o ",
            ". Essa instabilidade militar numa área tão estratégica do Médio Oriente assustou os investidores, provocando imediatamente um ",
            ". Como a economia brasileira é globalizada e internamente muito dependente do transporte rodoviário, esse impacto internacional chegou rapidamente ao cidadão comum, gerando um forte ",
            ", o que elevou drasticamente o custo de vida e o preço final dos alimentos no país."
        ],
        inventory: [
            { id: 't1', text: 'bloqueio do Estreito de Ormuz', correctZone: 1 },
            { id: 't2', text: 'disparo no preço do barril de petróleo', correctZone: 2 },
            { id: 't3', text: 'aumento do preço da gasolina e inflação', correctZone: 3 },
            { id: 't4', text: 'queda na exportação de soja', correctZone: 0 },
            { id: 't5', text: 'investimento no setor de vacinas', correctZone: 0 }
        ],
        hints: [
            "Lacuna 1: Comece pela causa raiz no Médio Oriente. O que aconteceu na rota marítima?",
            "Lacuna 2: Como esse evento afetou o valor da principal fonte de energia mundial?",
            "Lacuna 3: Qual o reflexo direto para os motoristas e consumidores brasileiros?"
        ]
    },
    {
        id: 2,
        title: "Crise Climática e Agronegócio",
        headline: "Ondas de Calor Extremo e Secas Severas Atingem Proporções Históricas",
        image: "/images/geopilitica/seca.jpeg", 
        newsSupport: `"O aumento das emissões de gases de efeito estufa acelerou o aquecimento global, alterando drasticamente o clima.\n\nEspecialistas alertam que a quebra severa no regime de chuvas compromete gravemente o setor agrícola global. O Brasil, como grande exportador, já enfrenta dificuldades extremas para manter suas colheitas."`,
        reportParts: [
            "Estudos ambientais confirmam que a atual instabilidade tem como causa central o ",
            ". Esse fenômeno alterou profundamente os ecossistemas, causando imediatamente um ",
            ". Como a balança comercial do Brasil e sua economia interna dependem fortemente do agronegócio, isso resultou em uma severa ",
            ", impactando a oferta de comida e disparando os preços nas prateleiras dos supermercados."
        ],
        inventory: [
            { id: 'a1', text: 'aquecimento global por emissões', correctZone: 1 },
            { id: 'a2', text: 'descontrole no regime de chuvas e secas', correctZone: 2 },
            { id: 'a3', text: 'quebra de safras e inflação de alimentos', correctZone: 3 },
            { id: 'a4', text: 'aumento da importação de veículos', correctZone: 0 },
            { id: 'a5', text: 'congelamento da taxa de juros global', correctZone: 0 }
        ],
        hints: [
            "Lacuna 1: Qual é o fenômeno macroambiental impulsionado pela poluição atmosférica?",
            "Lacuna 2: O que o aumento da temperatura causou diretamente na natureza (água/clima)?",
            "Lacuna 3: Como a falta de água afeta o principal setor de exportação brasileiro (agronegócio)?"
        ]
    },
    {
        id: 3,
        title: "Protecionismo e Varejo",
        headline: "Nova Política de Tributação Sobre Compras Internacionais Muda o Mercado",
        image: "/images/geopilitica/imposto.jpeg", 
        newsSupport: `"O governo anuncia novas medidas de taxação sobre produtos importados de plataformas internacionais de e-commerce.\n\nEspecialistas apontam que a medida busca proteger a indústria nacional e o varejo local da concorrência, mas alertam para o impacto imediato no poder de compra dos consumidores de baixa e média renda que dependem dessas plataformas para ter acesso a bens mais baratos."`,
        reportParts: [
            "A nova dinâmica econômica foi impulsionada pela ",
            ". Essa política de protecionismo comercial tem como objetivo macroeconômico o ",
            ". No entanto, como o consumidor brasileiro frequentemente recorre a essas plataformas online para acessar bens mais acessíveis, o efeito sentido nas ruas foi a ",
            ", gerando grandes debates sobre o equilíbrio entre indústria local e consumo."
        ],
        inventory: [
            { id: 'p1', text: 'taxação de compras em e-commerces estrangeiros', correctZone: 1 },
            { id: 'p2', text: 'fortalecimento da indústria e do varejo nacional', correctZone: 2 },
            { id: 'p3', text: 'redução do poder de compra do consumidor', correctZone: 3 },
            { id: 'p4', text: 'isenção total de impostos para eletrônicos', correctZone: 0 },
            { id: 'p5', text: 'queda no preço dos produtos importados', correctZone: 0 }
        ],
        hints: [
            "Lacuna 1: Qual foi a ação governamental recente que alterou as regras para compras online do exterior?",
            "Lacuna 2: Qual é o principal objetivo de um país ao adotar medidas de 'protecionismo' e taxar produtos que vêm de fora?",
            "Lacuna 3: Como o consumidor brasileiro comum, que comprava produtos baratos de fora, sentiu essa mudança no bolso?"
        ]
    },
    {
        id: 4,
        title: "Revolução Tecnológica",
        headline: "Avanço da Inteligência Artificial Substitui Funções no Setor de Serviços",
        image: "/images/geopilitica/ia.jpeg", 
        newsSupport: `"Empresas globais adotam sistemas de Inteligência Artificial para automatizar atendimento, análise de dados e rotinas administrativas em tempo recorde.\n\nEspecialistas alertam que, embora a produtividade das corporações aumente, milhões de trabalhadores enfrentam a obsolescência de suas funções, exigindo urgência na formulação de novas políticas públicas e educacionais."`,
        reportParts: [
            "A recente transformação no mercado de trabalho global é impulsionada pela ",
            ". Essa automação em massa de funções cognitivas e operacionais tem gerado um cenário de ",
            ". Como consequência social direta no Brasil e no mundo, observa-se o aumento da desigualdade e a necessidade urgente de ",
            ", para tentar reinserir esses trabalhadores na nova economia digital."
        ],
        inventory: [
            { id: 'ia1', text: 'adoção em massa de Inteligência Artificial', correctZone: 1 },
            { id: 'ia2', text: 'desemprego estrutural nos setores de serviços', correctZone: 2 },
            { id: 'ia3', text: 'requalificação profissional e políticas de renda', correctZone: 3 },
            { id: 'ia4', text: 'proibição do uso de tecnologias nas empresas', correctZone: 0 },
            { id: 'ia5', text: 'aumento imediato de vagas para trabalhos braçais', correctZone: 0 }
        ],
        hints: [
            "Lacuna 1: Qual é a tecnologia atual que está automatizando tarefas complexas nas empresas?",
            "Lacuna 2: Como chamamos a perda permanente de postos de trabalho devido a inovações tecnológicas?",
            "Lacuna 3: Qual é a principal solução (ação do Estado/Sociedade) para os trabalhadores que perderam suas funções para os algoritmos?"
        ]
    },
    {
        id: 5,
        title: "Tragédia Socioambiental",
        headline: "Rompimento de Barragem em Brumadinho Deixa Centenas de Vítimas e Destrói Bacia do Rio Paraopeba",
        image: "/images/geopilitica/brumaidnho.jpeg",
        newsSupport: `"Em 25 de janeiro de 2019, a barragem da mina do Córrego do Feijão, controlada pela Vale, rompeu-se em Brumadinho (MG).\n\nO mar de lama tóxica soterrou trabalhadores, moradores locais e destruiu completamente o ecossistema da bacia do Rio Paraopeba. Especialistas apontam falhas graves na fiscalização e na flexibilização de licenças ambientais para o setor minerário, gerando debates intensos sobre o modelo de exploração de recursos no Brasil."`,
        reportParts: [
            "Investigações confirmam que a tragédia em Minas Gerais foi desencadeada pelo ",
            ". Esse desastre não foi apenas um acidente imprevisível, mas resultado de negligência que causou um imenso ",
            ". A nível nacional, esse evento expôs a fragilidade das políticas de proteção, intensificando a exigência por ",
            ", visando evitar que novas estruturas de rejeitos coloquem a vida e o meio ambiente em risco."
        ],
        inventory: [
            { id: 'b1', text: 'rompimento da barragem de rejeitos de mineração', correctZone: 1 },
            { id: 'b2', text: 'impacto socioambiental na bacia do Rio Paraopeba', correctZone: 2 },
            { id: 'b3', text: 'maior rigor na fiscalização e licenciamento ambiental', correctZone: 3 },
            { id: 'b4', text: 'investimento em usinas hidrelétricas na região', correctZone: 0 },
            { id: 'b5', text: 'aumento das exportações de minério de ferro', correctZone: 0 }
        ],
        hints: [
            "Lacuna 1: Qual foi o evento físico e estrutural que deu início ao desastre na mina do Córrego do Feijão?",
            "Lacuna 2: Qual foi a consequência direta e devastadora para a natureza e para as pessoas atingidas pela lama?",
            "Lacuna 3: O que a sociedade e os especialistas começaram a exigir do Estado após constatarem a negligência da empresa?"
        ]
    }
];

// Função auxiliadora para baralhar arrays aleatoriamente (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- PAINEL DE AJUDA ENEM --- //
const EnemHelpPanel = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" className="bg-red-900/40 border-red-500/50 text-red-200 hover:bg-red-800 hover:text-white rounded-full px-3 md:px-5 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm transition-colors flex items-center gap-2">
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5" /> 
                <span className="hidden sm:inline">O que cai no ENEM?</span>
                <span className="sm:hidden">ENEM</span>
            </Button>
        </SheetTrigger>
        <SheetContent className="bg-slate-900/95 backdrop-blur-xl text-slate-100 border-l-slate-700/50 w-full sm:max-w-lg p-0 overflow-y-auto z-[150]">
             <div className="p-8">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
                        <BookOpen className="text-blue-400 w-6 h-6"/>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Geopolítica no ENEM</h2>
                </div>

                <div className="space-y-6 text-left pb-8">
                    <div>
                        <h3 className="font-bold text-lg text-blue-400 mb-2">Por que estudar isso?</h3>
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            A Geopolítica e a Geografia Econômica são temas fortíssimos na prova de Ciências Humanas. O ENEM quer que você desenvolva a <strong>Visão Sistêmica</strong>: a capacidade de entender como tensões mundiais, clima, medidas do governo e a ação de grandes indústrias afetam o meio ambiente e a sociedade.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 mt-4">
                        <h3 className="font-bold text-md text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Tópicos Frequentes na Prova:
                        </h3>
                        <ul className="space-y-4 text-[14px] text-slate-300">
                            <li>
                                <strong className="text-white">Desastres Socioambientais:</strong> Brumadinho e Mariana são muito cobrados para discutir a negligência corporativa, falhas na fiscalização do Estado e destruição de bacias hidrográficas.
                            </li>
                            <li>
                                <strong className="text-white">Crises Climáticas e Agronegócio:</strong> Como o aquecimento global afeta a produção de alimentos no Brasil, elevando os preços internos.
                            </li>
                            <li>
                                <strong className="text-white">Protecionismo:</strong> O papel do Estado em taxar importações para proteger a indústria nacional e o impacto no cidadão.
                            </li>
                            <li>
                                <strong className="text-white">Tecnologia e Desemprego:</strong> A revolução da Inteligência Artificial causando "desemprego estrutural", exigindo requalificação.
                            </li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-blue-300 italic">
                            <strong>Dica de Mestre:</strong> Ao completar os relatórios deste jogo, você estará exercitando exatamente o raciocínio de "causa e consequência" que as questões do ENEM exigem!
                        </p>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
);

export default function EfeitoDominoGlobalGame({ playerName, onComplete, onSaveScore }: EfeitoDominoGlobalGameProps) {
    const [status, setStatus] = useState<'intro' | 'playing' | 'level_complete' | 'victory'>('intro');
    const [score, setScore] = useState(0);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0); 
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    
    // ORDEM ALEATÓRIA DAS FASES
    const [gameLevels, setGameLevels] = useState<typeof LEVELS>(LEVELS);
    const [alertMessage, setAlertMessage] = useState<{ title: string, hints: string[], pointsDeducted: number } | null>(null);

    const [zone1, setZone1] = useState<TagItem | null>(null);
    const [zone2, setZone2] = useState<TagItem | null>(null);
    const [zone3, setZone3] = useState<TagItem | null>(null);

    const [inventory, setInventory] = useState<TagItem[]>([]);

    const zone1Ref = useRef<HTMLSpanElement>(null);
    const zone2Ref = useRef<HTMLSpanElement>(null);
    const zone3Ref = useRef<HTMLSpanElement>(null);

    // REFERÊNCIA DE SEGURANÇA PARA O CLIQUE vs ARRASTO
    const isDraggingRef = useRef(false);

    // Nível Atual
    const currentLevel = gameLevels[currentLevelIndex];

    // Carregar o Inventário da Fase Atual Embaralhado
    useEffect(() => {
        if (currentLevel) {
            setInventory(shuffleArray(currentLevel.inventory));
            setZone1(null);
            setZone2(null);
            setZone3(null);
            setImageError(false);
        }
    }, [currentLevelIndex, currentLevel]);

    // Função que é chamada ao clicar no botão "Iniciar"
    const handleStartGame = () => {
        // BARALHA AS 5 FASES DE FORMA ALEATÓRIA ANTES DE COMEÇAR!
        const shuffledLevels = shuffleArray(LEVELS);
        setGameLevels(shuffledLevels);
        setCurrentLevelIndex(0);
        setScore(0);
        setStatus('playing');
    };

    // ---------------------------------------------------------
    // LÓGICA DE ARRASTAR E SOLTAR (Segura e Livre)
    // ---------------------------------------------------------
    const handleDragEnd = (event: any, info: any, tag: TagItem) => {
        const pointX = info.point.x;
        const pointY = info.point.y;

        const checkCollision = (ref: React.RefObject<HTMLSpanElement>) => {
            if (!ref.current) return false;
            const rect = ref.current.getBoundingClientRect();
            return (
                pointX >= rect.left - 30 &&
                pointX <= rect.right + 30 &&
                pointY >= rect.top - 30 &&
                pointY <= rect.bottom + 30
            );
        };

        if (checkCollision(zone1Ref) && !zone1) {
            setZone1(tag);
            setInventory(prev => prev.filter(item => item.id !== tag.id));
        } else if (checkCollision(zone2Ref) && !zone2) {
            setZone2(tag);
            setInventory(prev => prev.filter(item => item.id !== tag.id));
        } else if (checkCollision(zone3Ref) && !zone3) {
            setZone3(tag);
            setInventory(prev => prev.filter(item => item.id !== tag.id));
        }
    };

    // Função de Clique Automático (Bloqueada se for um arrasto)
    const handleTagClickFallback = (tag: TagItem) => {
        if (isDraggingRef.current) return; 
        
        if (!zone1) {
            setZone1(tag);
            setInventory(prev => prev.filter(item => item.id !== tag.id));
        } else if (!zone2) {
            setZone2(tag);
            setInventory(prev => prev.filter(item => item.id !== tag.id));
        } else if (!zone3) {
            setZone3(tag);
            setInventory(prev => prev.filter(item => item.id !== tag.id));
        }
    };

    const handleZoneClick = (zoneNumber: number, tag: TagItem | null) => {
        if (!tag) return;
        if (zoneNumber === 1) setZone1(null);
        if (zoneNumber === 2) setZone2(null);
        if (zoneNumber === 3) setZone3(null);
        setInventory(prev => [...prev, tag]);
    };

    // ---------------------------------------------------------
    // VALIDAÇÃO E PROGRESSÃO DAS FASES
    // ---------------------------------------------------------
    const handleValidate = () => {
        let isAllCorrect = true;
        const returningTags: TagItem[] = [];
        const hints: string[] = [];

        if (zone1?.correctZone !== 1) {
            isAllCorrect = false;
            returningTags.push(zone1!);
            if (zone1?.correctZone === 0) {
                hints.push(`Atenção: "${zone1.text}" é uma pegadinha! Não encaixa na ordem lógica.`);
            } else {
                hints.push(currentLevel.hints[0]);
            }
            setZone1(null); 
        }

        if (zone2?.correctZone !== 2) {
            isAllCorrect = false;
            returningTags.push(zone2!);
            if (zone2?.correctZone === 0 && zone1?.id !== zone2.id) {
                hints.push(`Atenção: "${zone2.text}" não faz sentido neste contexto.`);
            } else {
                hints.push(currentLevel.hints[1]);
            }
            setZone2(null);
        }

        if (zone3?.correctZone !== 3) {
            isAllCorrect = false;
            returningTags.push(zone3!);
            if (zone3?.correctZone === 0 && zone1?.id !== zone3.id && zone2?.id !== zone3.id) {
                hints.push(`Atenção: O termo "${zone3.text}" é um distrator para te confundir.`);
            } else {
                hints.push(currentLevel.hints[2]);
            }
            setZone3(null);
        }

        if (isAllCorrect) {
            setScore(prev => prev + 100); 
            
            if (currentLevelIndex < gameLevels.length - 1) {
                setStatus('level_complete');
            } else {
                setStatus('victory');
            }
        } else {
            const pointsToDeduct = score >= 10 ? 10 : score;
            setScore(prev => Math.max(0, prev - 10));
            setInventory(prev => [...prev, ...returningTags]);
            setAlertMessage({
                title: "Análise Incorreta",
                hints: Array.from(new Set(hints)),
                pointsDeducted: pointsToDeduct
            });
        }
    };

    const handleNextLevel = () => {
        setCurrentLevelIndex(prev => prev + 1);
        setStatus('playing');
    };

    // Caso não carregue a tempo
    if (!currentLevel) return null;

    return (
        <main className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden select-none">
            
            {/* CABEÇALHO */}
            <header className="bg-[#0A1024]/95 border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center shadow-2xl sticky top-0 z-50 backdrop-blur-md w-full">
                <div className="flex items-center gap-3">
                    <button onClick={() => onComplete && onComplete()} className="flex items-center gap-3 transition-transform active:scale-95 group">
                        <div className="bg-red-600 p-2 rounded-full shadow-lg shadow-red-900/20 group-hover:-translate-x-1 transition-transform">
                            <ArrowLeft className="text-white w-5 h-5" />
                        </div>
                        <span className="text-white font-black text-xl md:text-2xl tracking-tighter">Efeito Global</span>
                    </button>
                </div>
                
                <h2 className="text-slate-400 font-black text-xs md:text-sm absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Missão {currentLevelIndex + 1}/{gameLevels.length}
                </h2>
                
                <div className="flex items-center gap-2 md:gap-4">
                    <EnemHelpPanel />

                    <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-yellow-500/20 whitespace-nowrap shadow-inner">
                        <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Score:</span>
                        <motion.span key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-black text-sm md:text-lg text-yellow-400">
                            {score} PTS
                        </motion.span>
                    </div>
                </div>
            </header>

            {/* --- INTRODUÇÃO --- */}
            {status === 'intro' && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 py-10 w-full z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-600/20 p-4 rounded-3xl border border-red-500/30">
                                <Globe className="w-12 h-12 text-red-400 animate-spin-slow" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">O Efeito Dominó</h1>
                        <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
                            Olá, <strong>{playerName}</strong>! No ENEM, as questões exigem que você saiba ligar grandes acontecimentos mundiais (guerras, clima, desastres ambientais, tecnologia) com o seu impacto direto na sociedade brasileira.
                        </p>
                        
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-left mb-8 shadow-inner">
                            <h3 className="font-black text-red-400 flex items-center gap-2 mb-3 text-lg">
                                <Newspaper size={20}/> Relatório de Investigação
                            </h3>
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                1. Analise a manchete de <strong>Última Hora (Breaking News)</strong> e leia o texto de apoio para recolher as pistas.
                            </p>
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                2. Leia o <strong className="text-white">Relatório Confidencial</strong> incompleto e preencha as lacunas com os blocos corretos para que o texto faça sentido.
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                ⚠️ <strong>Atenção:</strong> Você pode arrastar os blocos livremente para as lacunas na ordem que preferir, ou apenas clicar neles para preencher na sequência. As fases vão calhar-lhe de forma completamente aleatória!
                            </p>
                        </div>

                        {/* CHAMADA DA NOVA FUNÇÃO QUE BARALHA */}
                        <Button onClick={handleStartGame} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-7 text-xl rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all transform hover:scale-105">
                            Iniciar Expedição
                        </Button>
                    </motion.div>
                </div>
            )}

            {/* --- CORE GAMEPLAY --- */}
            {status === 'playing' && (
                <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full gap-6">
                    
                    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm mb-2">
                        <div className="bg-red-500/20 p-3 rounded-full border border-red-500/30 flex-shrink-0">
                            <Target className="text-red-500 w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="text-center md:text-left max-w-3xl">
                            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                                Missão {currentLevelIndex + 1}: {currentLevel.title}
                            </h2>
                            <p className="text-slate-300 text-base md:text-xl mt-3 leading-relaxed">
                                Leia a notícia no <strong>Plantão Global</strong> e preencha o <strong>Relatório Confidencial</strong> abaixo.
                            </p>
                        </div>
                    </div>

                    {/* TOPO: MANCHETE */}
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl mb-2">
                        <div className="bg-red-600 text-white px-4 py-2 font-black text-xs md:text-sm flex items-center gap-2 tracking-widest uppercase animate-pulse">
                            <Newspaper size={16} /> Última Hora • Plantão Global
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-stretch">
                            <div className="md:w-1/3 bg-slate-950 relative min-h-[160px] flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
                                {imageError ? (
                                    <div className="flex flex-col items-center justify-center text-slate-600">
                                        <ImageIcon className="w-16 h-16 opacity-40 mb-2" />
                                        <span className="text-xs uppercase font-bold tracking-wider">Sem Imagem</span>
                                    </div>
                                ) : (
                                    <img 
                                        src={currentLevel.image} 
                                        alt="Notícia" 
                                        className="w-full h-full object-cover cursor-zoom-in hover:opacity-80 transition-opacity min-h-[180px]"
                                        onError={() => setImageError(true)}
                                        onClick={() => setZoomedImage(currentLevel.image)}
                                    />
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-center items-start gap-3">
                                <span className="text-red-400 font-bold uppercase tracking-wider text-xs md:text-sm border border-red-500/30 bg-red-500/10 px-3 py-1 rounded-full">
                                    Alerta Estratégico
                                </span>
                                <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                                    {currentLevel.headline}
                               </h2>
                                <Button 
                                    onClick={() => setIsNewsModalOpen(true)}
                                    className="mt-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl px-5 py-6 text-sm w-full md:w-auto shadow-md"
                                >
                                    Ler Notícia de Apoio <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* CENTRO: TEXTO COM LACUNAS */}
                    <div className="bg-slate-900/80 p-6 md:p-10 rounded-3xl border border-slate-700 shadow-2xl flex flex-col">
                        <h3 className="font-black text-white text-base md:text-lg mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                            <FileText size={20} className="text-blue-400" /> Relatório Confidencial: Complete a Análise
                        </h3>

                        <div className="text-lg md:text-xl leading-[2.5rem] md:leading-[3rem] text-slate-300 font-medium">
                            {currentLevel.reportParts[0]}
                            
                            {/* LACUNA 1 */}
                            <span 
                                ref={zone1Ref}
                                onClick={() => handleZoneClick(1, zone1)}
                                className={`inline-flex items-center justify-center min-w-[200px] h-[40px] md:h-[48px] px-4 mx-2 align-middle rounded-lg border-2 transition-all cursor-pointer ${
                                    zone1 
                                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-500' 
                                    : 'bg-slate-950 border-slate-600 border-dashed text-slate-500 hover:bg-slate-800'
                                }`}
                            >
                                {zone1 ? <span className="font-black text-sm md:text-base">{zone1.text}</span> : <span className="text-sm italic">1. Arraste para Cá</span>}
                            </span>
                            
                            {currentLevel.reportParts[1]}
                            
                            {/* LACUNA 2 */}
                            <span 
                                ref={zone2Ref}
                                onClick={() => handleZoneClick(2, zone2)}
                                className={`inline-flex items-center justify-center min-w-[200px] h-[40px] md:h-[48px] px-4 mx-2 align-middle rounded-lg border-2 transition-all cursor-pointer ${
                                    zone2 
                                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-purple-500' 
                                    : 'bg-slate-950 border-slate-600 border-dashed text-slate-500 hover:bg-slate-800'
                                }`}
                            >
                                {zone2 ? <span className="font-black text-sm md:text-base">{zone2.text}</span> : <span className="text-sm italic">2. Arraste para Cá</span>}
                            </span>
                            
                            {currentLevel.reportParts[2]}
                            
                            {/* LACUNA 3 */}
                            <span 
                                ref={zone3Ref}
                                onClick={() => handleZoneClick(3, zone3)}
                                className={`inline-flex items-center justify-center min-w-[200px] h-[40px] md:h-[48px] px-4 mx-2 align-middle rounded-lg border-2 transition-all cursor-pointer ${
                                    zone3 
                                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500' 
                                    : 'bg-slate-950 border-slate-600 border-dashed text-slate-500 hover:bg-slate-800'
                                }`}
                            >
                                {zone3 ? <span className="font-black text-sm md:text-base">{zone3.text}</span> : <span className="text-sm italic">3. Arraste para Cá</span>}
                            </span>
                            
                            {currentLevel.reportParts[3]}
                        </div>
                    </div>

                    {/* RODAPÉ: DADOS COLETADOS */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl mt-auto shadow-inner">
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-5 text-center flex items-center justify-center gap-2">
                            <MousePointerClick size={16}/> Termos Disponíveis (Arraste ou Clique)
                        </h3>
                        
                        {zone1 && zone2 && zone3 ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center w-full mt-2">
                                <Button 
                                    onClick={handleValidate} 
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-7 px-10 text-xl rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform hover:scale-105 w-full md:w-auto"
                                >
                                    <CheckCircle2 className="mr-3 w-6 h-6" /> Validar Relatório
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-3 items-center min-h-[60px]">
                                <AnimatePresence>
                                    {inventory.map((tag) => (
                                        <motion.div
                                            key={tag.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            drag
                                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                            dragElastic={1}
                                            dragSnapToOrigin={true}
                                            onDragStart={() => {
                                                isDraggingRef.current = true; // Ativa a barreira de clique acidental
                                            }}
                                            onDragEnd={(e, info) => {
                                                handleDragEnd(e, info, tag);
                                                // Remove a barreira com delay
                                                setTimeout(() => { isDraggingRef.current = false; }, 150);
                                            }}
                                            onClick={() => handleTagClickFallback(tag)}
                                            whileHover={{ scale: 1.05 }}
                                            whileDrag={{ scale: 1.1, zIndex: 100, boxShadow: "0 20px 30px rgba(0,0,0,0.5)" }}
                                            className="bg-slate-800 border-2 border-slate-600 px-5 py-3 rounded-xl cursor-grab active:cursor-grabbing font-bold text-sm md:text-base text-slate-100 shadow-md text-center transition-colors hover:bg-slate-700 hover:border-red-500/50"
                                        >
                                            {tag.text}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* --- MODAL DE ZOOM DA IMAGEM --- */}
            <AnimatePresence>
                {zoomedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                        onClick={() => setZoomedImage(null)}
                    >
                        <button
                            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-[160]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage(null);
                            }}
                        >
                            <X size={24} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={zoomedImage}
                            alt="Notícia Ampliada"
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL DE CONTEXTO TEXTO DE APOIO (DINÂMICO) --- */}
            <AnimatePresence>
                {isNewsModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-xl w-full p-6 md:p-8 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setIsNewsModalOpen(false)}
                                className="absolute top-5 right-5 text-slate-400 hover:text-white rounded-full p-1 bg-white/5 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <AlertTriangle size={24} />
                                <h3 className="text-xl font-black tracking-tight uppercase text-white">Notícia Original</h3>
                            </div>

                            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4">
                                Fonte: Agência Global de Notícias
                            </p>

                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200 text-base md:text-lg leading-relaxed space-y-4 shadow-inner whitespace-pre-line">
                                {currentLevel.newsSupport}
                            </div>

                            <p className="text-xs text-slate-500 mt-4 italic text-center">
                                Use as pistas do texto para perceber quais palavras usar nas lacunas do relatório!
                            </p>

                            <Button 
                                onClick={() => setIsNewsModalOpen(false)}
                                className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-7 text-lg rounded-xl transition-transform active:scale-95"
                            >
                                Compreendido. Voltar ao Relatório
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL DE TRANSIÇÃO (NÍVEL CONCLUÍDO) --- */}
            <AnimatePresence>
                {status === 'level_complete' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-2xl w-full bg-slate-900 border-2 border-blue-500 p-8 md:p-12 rounded-[2.5rem] text-center shadow-[0_0_60px_rgba(59,130,246,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                            
                            <CheckCircle2 className="w-20 h-20 text-blue-400 mx-auto mb-6" />
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Fase Concluída!</h1>
                            
                            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-left mb-8 shadow-inner">
                                <h4 className="font-black text-blue-400 text-lg mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Você decifrou a cadeia de eventos!
                                </h4>
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                    Excelente, <strong>{playerName}</strong>! Você mapeou com perfeição este efeito em cascata. O ENEM valoriza muito essa visão sistêmica. Prepare-se, temos uma nova investigação a caminho.
                                </p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-8 flex flex-col items-center">
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Score Acumulado</span>
                                <span className="text-5xl font-black text-yellow-400 drop-shadow-md">{score} PTS</span>
                            </div>

                            <Button 
                                onClick={handleNextLevel} 
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 text-lg rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-transform hover:scale-105"
                            >
                                Avançar para Próxima Missão <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL DE ERRO PEDAGÓGICO --- */}
            <AnimatePresence>
                {alertMessage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="max-w-lg w-full p-8 rounded-3xl border-2 shadow-2xl text-center bg-slate-900 border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.3)]"
                        >
                            <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-amber-400" />
                            <h2 className="text-2xl md:text-3xl font-black mb-4 text-white tracking-tight">{alertMessage.title}</h2>
                            
                            <p className="text-slate-400 mb-6 font-medium">
                                Os blocos incorretos foram devolvidos ao inventário
                                {alertMessage.pointsDeducted > 0 ? <span className="text-red-400 font-bold"> (-{alertMessage.pointsDeducted} PTS).</span> : '.'}
                            </p>
                            
                            <div className="text-left bg-slate-950 p-5 rounded-2xl mb-8 space-y-3 border border-slate-800 shadow-inner">
                                <p className="text-white font-bold mb-3 flex items-center gap-2">
                                    <HelpCircle className="text-amber-500 w-5 h-5"/> Pistas de Correção:
                                </p>
                                {alertMessage.hints.map((hint, i) => (
                                    <p key={i} className="text-sm text-slate-300 bg-amber-900/20 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
                                        {hint}
                                    </p>
                                ))}
                            </div>

                            <Button 
                                onClick={() => setAlertMessage(null)} 
                                className="w-full font-black py-7 text-lg bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-transform active:scale-95"
                            >
                                Reescrever Relatório
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL DE VITÓRIA FINAL --- */}
            <AnimatePresence>
                {status === 'victory' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-500 p-8 md:p-12 rounded-[2.5rem] text-center shadow-[0_0_60px_rgba(16,185,129,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                            
                            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Raciocínio ENEM Concluído!</h1>
                            
                            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-left mb-8 shadow-inner">
                                <h4 className="font-black text-emerald-400 text-lg mb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Expedição Geopolítica Finalizada!
                                </h4>
                                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                    Extraordinário, <strong>{playerName}</strong>! Você mapeou com sucesso diferentes frentes (política internacional, ambiental, econômica e tecnológica). O ENEM adora avaliar a sua capacidade de conectar eventos globais aos impactos diretos no dia a dia do Brasil!
                                </p>
                            </div>

                       <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-8 flex flex-col items-center">
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Pontuação Final Adquirida</span>
                                <span className="text-5xl font-black text-yellow-400 drop-shadow-md">{score} PTS</span>
                            </div>

                            {/* ALTERAÇÃO: Removido o botão de voltar ao início e deixado apenas o de Salvar ocupando a largura total */}
                            <div className="flex flex-col gap-4 mt-8">
                                <Button 
                                    onClick={() => onSaveScore && onSaveScore(score)} 
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-7 text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform hover:scale-105"
                                >
                                    Salvar a Pontuação (+{score})
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    );
}