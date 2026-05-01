"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    Bus, Home, Building, CheckCircle2, XCircle, 
    BookOpen, MapPin, ArrowRight, Info,
    User, HelpCircle, ArrowLeft, AlertTriangle, RefreshCw
} from 'lucide-react';

interface CorridaPendularGameProps {
    playerName: string;
    onComplete?: () => void;
    onSaveScore?: (score: number) => void;
}

// --- BANCO DE QUESTÕES (FOCO ENEM) ---
const QUIZ_QUESTIONS = [
    {
        id: 1,
        context: "Saindo de Casa (05:30 AM)",
        question: "Baseado no conceito geográfico, como podemos definir a 'Migração Pendular' nas grandes metrópoles?",
        options: [
            { 
                text: "A mudança definitiva de uma família do campo para a cidade em busca de emprego.", 
                feedback: "Incorreto. A mudança definitiva de domicílio (especialmente do campo para a cidade) é chamada de Êxodo Rural. A migração pendular não é definitiva, é um movimento de 'ir e vir' diário." 
            },
            { 
                text: "O deslocamento diário (vai e volta) de trabalhadores entre a cidade onde moram e a cidade onde trabalham.", 
                feedback: "Exatamente! A Migração Pendular é o movimento diário semelhante a um pêndulo (vai e volta) que milhões de pessoas fazem todos os dias para trabalhar ou estudar na metrópole." 
            },
            { 
                text: "A viagem sazonal de trabalhadores agrícolas durante a época de colheita.", 
                feedback: "Incorreto. Essa viagem ligada às colheitas (como a dos 'bóias-frias') é chamada de Transumância ou Migração Sazonal, e não acontece diariamente nas cidades." 
            },
            { 
                text: "O retorno de aposentados para suas cidades natais no interior.", 
                feedback: "Incorreto. O retorno definitivo à cidade natal é conhecido como Migração de Retorno, um fenômeno demográfico diferente da rotina diária pendular." 
            }
        ],
        correctIndex: 1
    },
    {
        id: 2,
        context: "Preso no Trânsito (07:00 AM)",
        question: "Muitos trabalhadores demoram horas no trânsito. Qual fator urbano empurra a população para morar tão longe do centro?",
        options: [
            { 
                text: "A Especulação Imobiliária, que encarece o custo de vida nas áreas centrais.", 
                feedback: "Correto! A Especulação Imobiliária torna o solo urbano nas áreas centrais muito caro. Isso causa a 'Segregação Socioespacial', empurrando a população de menor renda para as periferias." 
            },
            { 
                text: "A falta total de terrenos vazios no Brasil.", 
                feedback: "Incorreto. Existem muitos terrenos vazios (lotes ociosos) nas áreas centrais, mas eles são mantidos sem uso justamente por Especulação Imobiliária, esperando valorizar para dar lucro." 
            },
            { 
                text: "A preferência cultural do brasileiro por morar em áreas mais afastadas e com engarrafamentos.", 
                feedback: "Incorreto. A ida para a periferia distante não é uma 'preferência' por calmaria, mas sim uma dura imposição econômica impulsionada pelo alto custo de vida no centro metropolitano." 
            },
            { 
                text: "A proibição legal de construir prédios residenciais nos centros urbanos.", 
                feedback: "Incorreto. Não há proibição legal; pelo contrário, o centro é a área mais verticalizada (com mais prédios). O grande obstáculo é o preço cobrado para morar lá." 
            }
        ],
        correctIndex: 0
    },
    {
        id: 3,
        context: "Chegando ao Centro (08:30 AM)",
        question: "Por que a maioria dos empregos e bons hospitais se concentra no Centro, obrigando esse deslocamento em massa?",
        options: [
            { 
                text: "Devido à Reforma Agrária que distribuiu terras igualitariamente.", 
                feedback: "Incorreto. A Reforma Agrária trata da distribuição de terras no espaço rural. Além disso, a estrutura fundiária brasileira é historicamente muito concentrada, e não igualitária." 
            },
            { 
                text: "Por causa da Desconcentração Industrial iniciada nos anos 90.", 
                feedback: "Incorreto. A 'Desconcentração Industrial' é a fuga de fábricas das metrópoles para o interior. Isso na verdade ajuda a espalhar empregos, contrariando a concentração no centro." 
            },
            { 
                text: "Devido à Macrocefalia Urbana, que concentra investimentos, infraestrutura e trabalho num único núcleo.", 
                feedback: "Resposta Exata! A Macrocefalia Urbana é o inchaço de um único ponto da metrópole. Isso gera um desequilíbrio: a periferia vira 'cidade-dormitório', e o centro monopoliza a economia." 
            },
            { 
                text: "Porque as prefeituras periféricas proíbem a abertura de empresas e comércios.", 
                feedback: "Incorreto. As prefeituras não proíbem; inclusive oferecem incentivos (como isenção de impostos) para atrair indústrias, mas o poder e a infraestrutura continuam centralizados na metrópole." 
            }
        ],
        correctIndex: 2
    },
    {
        id: 4,
        context: "Voltando Exausto (19:00 PM)",
        question: "Qual é a principal consequência social da Migração Pendular exaustiva para a classe trabalhadora?",
        options: [
            { 
                text: "Aumento da produtividade e do tempo livre para lazer.", 
                feedback: "Incorreto. Ao perder horas no trânsito, ocorre exatamente o oposto: o tempo livre desaparece, o cansaço aumenta e a produtividade no trabalho acaba despencando." 
            },
            { 
                text: "Diminuição da poluição atmosférica nas grandes cidades.", 
                feedback: "Incorreto. O movimento diário simultâneo de milhões de carros, motos e ônibus (queimando combustíveis fósseis) é o principal causador do aumento da poluição nas metrópoles." 
            },
            { 
                text: "Melhoria na qualidade de vida devido ao contato diário com diferentes cidades.", 
                feedback: "Incorreto. Longe de ser um 'passeio', o transporte público superlotado e os engarrafamentos representam um fator brutal de precarização da qualidade de vida e adoecimento." 
            },
            { 
                text: "Esgotamento físico e redução severa do tempo disponível para descanso, família e estudos.", 
                feedback: "Correto! Perder de 3 a 4 horas por dia no transporte afeta diretamente a saúde (estresse, cansaço) e rouba o tempo que o trabalhador utilizaria para estudar ou ficar com a família." 
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
            // Tentar novamente (errou e quer refazer)
            setSelectedAnswer(null);
            setIsCorrect(null);
            setStatus('playing');
        }
    };

    // --- NOVA AÇÃO: PULAR QUESTÃO APÓS ERRAR ---
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

    const EnemHelpPanel = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-blue-900/40 border-blue-500/50 text-blue-200 hover:bg-blue-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm transition-colors">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> 
                    <span className="hidden sm:inline">O que cai no ENEM?</span>
                    <span className="sm:hidden">ENEM</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 text-white border-l-slate-700 w-full sm:max-w-lg p-0">
                <div className="p-6 h-full overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                            <BookOpen className="text-green-400" size={24}/>
                        </div>
                        <h2 className="text-2xl font-black text-white">Revisão ENEM</h2>
                    </div>
                    <div className="space-y-6 text-left pb-8">
                        <div>
                            <h3 className="font-bold text-lg text-green-400 mb-2">A Pegada das Provas</h3>
                            <p className="text-slate-300 leading-relaxed text-[15px]">
                                No ENEM, a <strong>Migração Pendular</strong> raramente aparece como uma simples definição. Ela é cobrada como uma <strong>consequência</strong> da má gestão urbana e da desigualdade.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 mt-4">
                            <h3 className="font-bold text-md text-white mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Conceitos Chave
                            </h3>
                            <ul className="space-y-3 text-[14px] text-slate-300">
                                <li><strong className="text-white">Segregação Socioespacial:</strong> Terrenos centrais caros empurram os mais pobres para áreas periféricas.</li>
                                <li><strong className="text-white">Macrocefalia Urbana:</strong> Concentração excessiva de serviços, empresas e infraestrutura num único polo (o centro).</li>
                                <li><strong className="text-white">Impacto:</strong> Perda de qualidade de vida, exaustão, trânsito caótico e poluição (ilhas de calor).</li>
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
                                Imagine um pêndulo de um relógio antigo que vai e volta o dia todo. A <strong>Migração Pendular</strong> é exatamente isso: o movimento diário de milhões de trabalhadores que saem de suas casas na periferia de manhã para trabalhar no centro, e retornam à noite.
                            </p>
                            
                            <h3 className="font-black text-blue-400 flex items-center gap-2 mb-3 text-lg">
                                <MapPin size={20}/> Por que isso acontece?
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                A culpa é da <strong>Segregação Socioespacial</strong>. Morar no centro, perto do trabalho, é muito caro. A população de menor renda é "empurrada" para bairros distantes e cidades vizinhas (cidades-dormitório), sendo obrigada a gastar horas no transporte público todos os dias.
                            </p>
                        </div>

                        <Button onClick={() => setStatus('playing')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 text-xl rounded-xl transition-transform hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                            Entendi! Embarcar no Ônibus
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
                                Você compreendeu perfeitamente o ciclo da <strong>Migração Pendular</strong>. O custo de vida encarece o centro, empurrando as pessoas para longe (Segregação). Como os empregos ficam no centro (Macrocefalia), o trabalhador gasta sua vida no transporte público.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8 flex flex-col items-center">
                            <span className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Pontuação da Avaliação</span>
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
                                    {isCorrect ? 'Análise Correta!' : 'Atenção!'}
                                </h2>
                                <p className="text-slate-400 text-sm font-bold mt-1">
                                    {isCorrect ? '+25 PTS' : '-10 PTS (Penalidade)'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <Info className="text-blue-400"/> {isCorrect ? 'Explicação da sua Resposta:' : 'Ops... Pense um pouco mais!'}
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-base md:text-lg bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                {isCorrect 
                                    ? currentQuestion.options[selectedAnswer].feedback 
                                    : "Parece que a opção que escolheu não é a mais adequada ao contexto do ENEM. Lembre-se do que aprendemos na introdução e tente outra alternativa para descobrir o conceito correto!"
                                }
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                onClick={handleNextAction} 
                                className={`flex-1 text-white font-black py-7 text-lg rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 ${isCorrect ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                            >
                                {isCorrect 
                                    ? (currentQIndex + 1 < QUIZ_QUESTIONS.length ? <>Próxima Questão <ArrowRight size={20}/></> : 'Finalizar Expedição') 
                                    : <>Tentar Novamente <RefreshCw size={20}/></>
                                } 
                            </Button>
                            
                            {/* --- NOVO BOTÃO: PULAR QUESTÃO (apenas se errou) --- */}
                            {!isCorrect && (
                                <Button 
                                    variant="outline" 
                                    onClick={handleSkipQuestion} 
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 py-7 text-lg rounded-xl flex items-center justify-center gap-2"
                                >
                                    Próxima Questão <ArrowRight size={20}/>
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
                                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
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
                                            <div className="flex gap-4 items-start">
                                                <span className="font-black opacity-50 mt-0.5">{String.fromCharCode(65 + index)}.</span>
                                                <span>{option.text}</span>
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
            {/* CABEÇALHO PADRÃO DO JOGO */}
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