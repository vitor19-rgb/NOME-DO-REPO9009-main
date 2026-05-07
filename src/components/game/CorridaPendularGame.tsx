"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    Bus, Home, Building, CheckCircle2, XCircle, 
    BookOpen, MapPin, ArrowRight, Info,
    User, HelpCircle, ArrowLeft, AlertTriangle, RefreshCw, LogOut, MousePointerClick
} from 'lucide-react';

interface CorridaPendularGameProps {
    playerName: string;
    onComplete?: () => void;
    onSaveScore?: (score: number) => void;
}

// --- BANCO DE QUESTÕES (SIMPLIFICADO E FÁCIL DE ENTENDER) ---
const QUIZ_QUESTIONS = [
    {
        id: 1,
        context: "Saindo de Casa (05:30 AM)",
        question: "O que significa o termo 'Migração Pendular' nas grandes cidades?",
        options: [
            { 
                text: "Mudar de vez do campo para a cidade grande para procurar trabalho.", 
                feedback: "Incorreto. Mudar de vez é o chamado 'Êxodo Rural'. A migração pendular não é uma mudança definitiva." 
            },
            { 
                text: "A viagem de ir e voltar todos os dias entre a cidade onde a pessoa mora e a cidade onde trabalha.", 
                feedback: "Exatamente! É o movimento diário, igual ao pêndulo de um relógio, que milhões de pessoas fazem para trabalhar ou estudar." 
            },
            { 
                text: "A viagem que os trabalhadores rurais fazem apenas na época de colheita.", 
                feedback: "Incorreto. Essa viagem das colheitas acontece de tempos em tempos e não é uma rotina diária das cidades." 
            },
            { 
                text: "A volta dos idosos e aposentados para as suas cidades natais no interior.", 
                feedback: "Incorreto. O retorno definitivo ao local de origem tem outro nome: Migração de Retorno." 
            }
        ],
        correctIndex: 1
    },
    {
        id: 2,
        context: "Preso no Trânsito (07:00 AM)",
        question: "Por que muitos trabalhadores são obrigados a morar tão longe do centro, passando horas no trânsito?",
        options: [
            { 
                text: "Porque o custo de vida e os imóveis no centro são muito caros (Especulação Imobiliária).", 
                feedback: "Correto! Como morar no centro custa muito dinheiro, a população mais pobre é empurrada para as periferias (bairros mais distantes)." 
            },
            { 
                text: "Porque não existem mais terrenos vazios nas partes centrais das cidades.", 
                feedback: "Incorreto. Existem muitos terrenos vazios no centro, mas os donos os deixam parados esperando o preço subir para vender mais caro." 
            },
            { 
                text: "Porque o trabalhador prefere a tranquilidade da periferia, mesmo com o trânsito.", 
                feedback: "Incorreto. Morar longe não é uma escolha por gosto, mas sim uma necessidade imposta pela falta de dinheiro para pagar aluguéis caros." 
            },
            { 
                text: "Porque a lei proíbe a construção de casas e apartamentos no centro das cidades.", 
                feedback: "Incorreto. A lei não proíbe. Na verdade, o centro é o lugar com mais prédios construídos." 
            }
        ],
        correctIndex: 0
    },
    {
        id: 3,
        context: "Chegando ao Centro (08:30 AM)",
        question: "Por que a maioria dos empregos, faculdades e bons hospitais ficam no centro da cidade?",
        options: [
            { 
                text: "Por causa da Reforma Agrária.", 
                feedback: "Incorreto. A Reforma Agrária fala sobre a divisão de terras no campo, e não sobre os serviços nas cidades." 
            },
            { 
                text: "Porque as indústrias estão fugindo das cidades grandes.", 
                feedback: "Incorreto. A fuga de fábricas (desconcentração) acontece, mas não explica por que o centro atrai tantas pessoas todos os dias." 
            },
            { 
                text: "Porque o centro concentra quase todos os investimentos e infraestrutura (Macrocefalia Urbana).", 
                feedback: "Resposta Exata! Esse inchaço do centro (Macrocefalia) deixa a periferia sem serviços, obrigando todos a viajarem para lá." 
            },
            { 
                text: "Porque as prefeituras dos bairros mais pobres não deixam abrir lojas.", 
                feedback: "Incorreto. As prefeituras não proíbem lojas, mas os grandes negócios preferem ficar no centro onde há mais estrutura." 
            }
        ],
        correctIndex: 2
    },
    {
        id: 4,
        context: "Fim do Expediente (18:00 PM)",
        question: "Como chamamos as cidades vizinhas que servem basicamente para os trabalhadores dormirem?",
        options: [
            { 
                text: "Metrópoles Globais.", 
                feedback: "Incorreto. Metrópoles globais são as cidades mais poderosas e ricas, não as cidades apenas de moradia." 
            },
            { 
                text: "Cidades-Dormitório.", 
                feedback: "Correto! As Cidades-Dormitório ficam na região metropolitana. As pessoas saem de manhã para trabalhar no centro e só voltam para dormir." 
            },
            { 
                text: "Tecnopolos.", 
                feedback: "Incorreto. Tecnopolos são lugares focados em alta tecnologia e universidades de ponta." 
            },
            { 
                text: "Distritos Turísticos.", 
                feedback: "Incorreto. Distritos turísticos são voltados para viagens de lazer, e não para abrigar a massa de trabalhadores." 
            }
        ],
        correctIndex: 1
    },
    {
        id: 5,
        context: "Voltando Exausto (20:00 PM)",
        question: "Qual é o principal problema que essa rotina de viagem diária (Migração Pendular) causa na vida do trabalhador?",
        options: [
            { 
                text: "O aumento do tempo livre para se divertir.", 
                feedback: "Incorreto. Passando 3 ou 4 horas num ônibus, o trabalhador acaba perdendo quase todo o seu tempo livre." 
            },
            { 
                text: "A diminuição do lixo e da poluição na cidade.", 
                feedback: "Incorreto. O uso em massa de ônibus e carros todos os dias aumenta muito a poluição do ar." 
            },
            { 
                text: "A melhora na qualidade de vida por visitar cidades diferentes.", 
                feedback: "Incorreto. Enfrentar transporte público lotado todos os dias piora, e muito, a saúde e a qualidade de vida." 
            },
            { 
                text: "Cansaço extremo e falta de tempo para descansar, estudar ou ficar com a família.", 
                feedback: "Correto! Perder horas preciosas do dia no trânsito gera estresse e tira a chance de o trabalhador estudar e melhorar de vida." 
            }
        ],
        correctIndex: 3
    }
];

export default function CorridaPendularGame({ playerName, onComplete, onSaveScore }: CorridaPendularGameProps) {
    const [status, setStatus] = useState<'intro' | 'playing' | 'feedback' | 'victory'>('intro');
    const [currentQIndex, setCurrentQIndex] = useState(0); 
    const [score, setScore] = useState(0); 
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const currentQuestion = QUIZ_QUESTIONS[currentQIndex];
    const progressPercent = (currentQIndex / QUIZ_QUESTIONS.length) * 100;

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        const correct = index === currentQuestion.correctIndex;
        setIsCorrect(correct);
        
        if (correct) {
            setScore(prev => prev + 25); 
        } else {
            setScore(prev => Math.max(0, prev - 10)); 
        }

        setTimeout(() => {
            setStatus('feedback');
        }, 1200);
    };

    const handleNextAction = () => {
        if (isCorrect) {
            if (currentQIndex + 1 < QUIZ_QUESTIONS.length) {
                setCurrentQIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setStatus('playing');
            } else {
                setStatus('victory');
            }
        } else {
            setSelectedAnswer(null);
            setIsCorrect(null);
            setStatus('playing');
        }
    };

    const handleSkipQuestion = () => {
        if (currentQIndex + 1 < QUIZ_QUESTIONS.length) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setStatus('playing');
        } else {
            setStatus('victory');
        }
    };

    // --- PAINEL DE AJUDA / REVISÃO ENEM NO HEADER ---
    const EnemHelpPanel = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-blue-900/40 border-blue-500/50 text-blue-200 hover:bg-blue-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm transition-colors">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> 
                    <span className="hidden sm:inline">Ajuda e ENEM</span>
                    <span className="sm:hidden">ENEM</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 text-white border-l-slate-700 w-full sm:max-w-lg p-0">
                <div className="p-6 h-full overflow-y-auto">
                    
                    {/* SESSÃO: COMO JOGAR */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <MousePointerClick className="text-blue-400" size={24}/>
                        </div>
                        <h2 className="text-2xl font-black text-white">Como Jogar</h2>
                    </div>
                    <div className="space-y-4 text-left mb-8">
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                            Acompanhe a rotina diária de um trabalhador. O seu objetivo é fazer o <strong>Ônibus chegar ao trabalho</strong> respondendo ao Quiz.
                        </p>
                        <ul className="space-y-3 text-[14px] text-slate-300 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                            <li><strong>Passo 1:</strong> Leia a situação atual da viagem (ex: Preso no Trânsito).</li>
                            <li><strong>Passo 2:</strong> Escolha a alternativa correta.</li>
                            <li><strong>Passo 3:</strong> Se acertar, ganha <strong>25 Pontos</strong>. Se errar, perde <strong>10 Pontos</strong> (mas pode tentar de novo ou pular).</li>
                        </ul>
                    </div>

                    <hr className="border-slate-800 my-6" />

                    {/* SESSÃO: REVISÃO ENEM */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                            <BookOpen className="text-green-400" size={24}/>
                        </div>
                        <h2 className="text-2xl font-black text-white">O que cai no ENEM?</h2>
                    </div>
                    <div className="space-y-6 text-left pb-8">
                        <div>
                            <h3 className="font-bold text-lg text-green-400 mb-2">A Pegada das Provas</h3>
                            <p className="text-slate-300 leading-relaxed text-[15px]">
                                No ENEM, a <strong>Migração Pendular</strong> raramente aparece só como uma definição. A prova quer que você saiba que isso é um <strong>problema social</strong> causado pelo crescimento desordenado das cidades.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 mt-4">
                            <h3 className="font-bold text-md text-white mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Conceitos Chave
                            </h3>
                            <ul className="space-y-3 text-[14px] text-slate-300">
                                <li><strong className="text-white">Segregação:</strong> Terrenos caros no centro empurram os mais pobres para áreas afastadas.</li>
                                <li><strong className="text-white">Cidade-Dormitório:</strong> Municípios vizinhos que abrigam trabalhadores, mas têm poucos empregos próprios.</li>
                                <li><strong className="text-white">Impacto na Saúde:</strong> Perda de qualidade de vida, exaustão e falta de tempo.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    const renderContent = () => {
        if (status === 'intro') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-4 py-10 overflow-y-auto w-full">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-blue-600/20 p-4 rounded-3xl border border-blue-500/30">
                                <Bus className="w-12 h-12 text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3">A Jornada Diária</h1>
                        <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
                            Olá, <strong>{playerName}</strong>! Antes de embarcarmos no ônibus para testar os seus conhecimentos, vamos entender como a cidade funciona.
                        </p>
                        
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-left mb-8 shadow-inner">
                            <h3 className="font-black text-emerald-400 flex items-center gap-2 mb-3 text-lg">
                                <BookOpen size={20}/> O que é Migração Pendular?
                            </h3>
                            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                                Imagine um pêndulo de um relógio antigo que vai e volta o dia todo. A <strong>Migração Pendular</strong> é exatamente isso: o movimento de vai e volta diário de milhões de trabalhadores que saem das suas casas para trabalhar no centro.
                            </p>
                            
                            <h3 className="font-black text-blue-400 flex items-center gap-2 mb-3 text-lg">
                                <MapPin size={20}/> Por que isso acontece?
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Morar no centro, perto do trabalho, é muito caro. A população é obrigada a viver em bairros distantes ou cidades vizinhas (as cidades-dormitório) e a perder horas no trânsito todos os dias.
                            </p>
                        </div>

                        <Button onClick={() => setStatus('playing')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 text-xl rounded-xl transition-transform hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                            Entendi! Iniciar a Viagem
                        </Button>
                    </motion.div>
                </div>
            );
        }

        if (status === 'victory') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] w-full">
                        <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                        <h1 className="text-4xl md:text-5xl font-black text-emerald-400 mb-4">Jornada Concluída!</h1>
                        
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-left mb-8">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Você compreendeu perfeitamente a <strong>Migração Pendular</strong>. O custo de vida encarece o centro e empurra as pessoas para longe. Assim, o trabalhador gasta uma grande parte da sua vida preso no transporte público.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8 flex flex-col items-center">
                            <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Sua Pontuação</span>
                            <span className="text-6xl font-black text-yellow-400 drop-shadow-md">{score} pts</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={() => onSaveScore && onSaveScore(score)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-7 text-lg rounded-xl">
                                Salvar Pontuação
                            </Button>
                            <Button variant="outline" onClick={() => onComplete && onComplete()} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 py-7 text-lg rounded-xl">
                                Voltar ao Menu
                            </Button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        if (status === 'feedback' && selectedAnswer !== null) {
            const clickedOption = currentQuestion.options[selectedAnswer];

            return (
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                            {isCorrect ? (
                                <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400"><CheckCircle2 size={32}/></div>
                            ) : (
                                <div className="bg-red-500/20 p-3 rounded-full text-red-400"><XCircle size={32}/></div>
                            )}
                            <div>
                                <h2 className={`text-2xl font-black ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isCorrect ? 'Você Acertou!' : 'Atenção!'}
                                </h2>
                                <p className="text-slate-400 text-sm font-bold mt-1">
                                    {isCorrect ? '+25 PTS' : '-10 PTS (Penalidade)'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <Info className="text-blue-400"/> {isCorrect ? 'Por que você acertou:' : 'Dica para você pensar:'}
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-base md:text-lg bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                {isCorrect 
                                    ? clickedOption.feedback 
                                    : "Parece que a opção que escolheu não está certa. Lembre-se do texto de introdução e tente uma nova alternativa!"
                                }
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                onClick={handleNextAction} 
                                className={`flex-1 text-white font-black py-7 text-lg rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 ${isCorrect ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                            >
                                {isCorrect 
                                    ? (currentQIndex + 1 < QUIZ_QUESTIONS.length ? <>Próxima Pergunta <ArrowRight size={20}/></> : 'Finalizar Jogo') 
                                    : <>Tentar Novamente <RefreshCw size={20}/></>
                                } 
                            </Button>
                            
                            {!isCorrect && (
                                <Button 
                                    variant="outline" 
                                    onClick={handleSkipQuestion} 
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 py-7 text-lg rounded-xl flex items-center justify-center gap-2"
                                >
                                    Pular Pergunta <ArrowRight size={20}/>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            );
        }

        if (status === 'playing') {
            return (
                <div className="flex-1 flex flex-col items-center p-4 pt-8 md:pt-12 w-full">
                    <div className="max-w-3xl w-full flex-1 flex flex-col">
                        
                        {/* BARRA DE PROGRESSO DO ÔNIBUS */}
                        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-3xl shadow-xl mb-8">
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex flex-col items-center text-slate-400">
                                    <Home size={20} className="mb-1" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Periferia</span>
                                </div>
                                <div className="flex flex-col items-center text-blue-400">
                                    <Building size={24} className="mb-1" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Centro</span>
                                </div>
                            </div>
                            
                            <div className="w-full h-3 bg-slate-800 rounded-full relative">
                                <motion.div 
                                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                    initial={{ width: `${(currentQIndex / QUIZ_QUESTIONS.length) * 100}%` }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                                <motion.div 
                                    className="absolute top-1/2 -translate-y-1/2 -ml-4 bg-slate-900 p-1.5 rounded-full border-2 border-blue-400 shadow-lg"
                                    initial={{ left: `${(currentQIndex / QUIZ_QUESTIONS.length) * 100}%` }}
                                    animate={{ left: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Bus size={16} className="text-white" />
                                </motion.div>
                            </div>
                        </div>

                        {/* ÁREA DA PERGUNTA */}
                        <motion.div 
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/30 mb-4 shadow-sm">
                                    <MapPin size={16}/> {currentQuestion.context}
                                </div>
                                <h2 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                                    {currentQuestion.question}
                                </h2>
                            </div>

                            {/* OPÇÕES DE RESPOSTA */}
                            <div className="flex flex-col gap-3 md:gap-4 mt-auto mb-6">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswer === index;
                                    
                                    let btnStyle = "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-blue-400 text-slate-200";
                                    
                                    if (selectedAnswer !== null) {
                                        if (isSelected) {
                                            btnStyle = isCorrect 
                                                ? "bg-emerald-900/80 border-emerald-500 text-emerald-100" 
                                                : "bg-red-900/80 border-red-500 text-red-100";
                                        } else {
                                            btnStyle = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                                        }
                                    }

                                    return (
                                        <button
                                            key={index}
                                            disabled={selectedAnswer !== null}
                                            onClick={() => handleAnswer(index)}
                                            className={`text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 font-medium md:text-lg shadow-sm ${btnStyle}`}
                                        >
                                            <div className="flex gap-3 md:gap-4 items-start">
                                                <span className="font-black opacity-50 mt-0.5">{String.fromCharCode(65 + index)}.</span>
                                                <span className="leading-relaxed">{option.text}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden">
            <header className="bg-[#0A1024]/95 border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center shadow-2xl sticky top-0 z-50 backdrop-blur-md w-full">
                <div className="flex items-center gap-3">
                    <button onClick={() => onComplete && onComplete()} className="flex items-center gap-3 transition-transform active:scale-95 group">
                        <div className="bg-blue-600 p-2 rounded-full shadow-lg shadow-blue-900/20 group-hover:-translate-x-1 transition-transform">
                            <ArrowLeft className="text-white w-5 h-5" />
                        </div>
                        <span className="text-white font-black text-xl md:text-2xl tracking-tighter hidden sm:block">BioGuesser</span>
                    </button>
                </div>
                
                <h2 className="text-slate-400 font-black text-xs md:text-sm absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Migração Pendular
                </h2>
                
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-yellow-500/20 whitespace-nowrap">
                        <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Score:</span>
                        <motion.span 
                            key={score} 
                            initial={{ scale: 1.2, color: '#fff' }}
                            animate={{ scale: 1, color: '#facc15' }} 
                            className="font-black text-sm md:text-lg"
                        >
                            {score} PTS
                        </motion.span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20 text-blue-300">
                        <User size={14} className="opacity-70" />
                        <span className="text-sm font-black truncate max-w-[100px]">{playerName}</span>
                    </div>

                    <EnemHelpPanel />
                </div>
            </header>

            {renderContent()}

        </main>
    );
}