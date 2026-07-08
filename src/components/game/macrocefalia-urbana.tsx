"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building, Hammer, ArrowLeft, ArrowRight, Coins, Users, AlertCircle, Calendar, ShieldCheck, BookOpen, FastForward, FileText, TrendingUp, HelpCircle, Zap, Home, TreePine, Droplets, Train, Factory, School, Sparkles, Globe, Briefcase, Landmark, Trophy, Target, Skull, CheckCircle, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// --- TIPAGENS --- //
interface MacrocefaliaUrbanaGameProps {
    playerName: string;
    userId?: string; // Adicionado
    onReturnHome: () => void;
    onSaveScore: (score: number) => void;
}

type CardType = 'build' | 'policy' | 'economy' | 'social' | 'infrastructure';
type Difficulty = 'easy' | 'medium' | 'hard';

interface ActionCard {
    id: string;
    title: string;
    effectText: string;
    explanation: string;
    fullDescription: string;
    cost: number;
    type: CardType;
    icon: React.ReactNode;
    effect: (state: GameState, difficulty: Difficulty) => Partial<GameState>;
    requires?: (state: GameState) => boolean;
    feedback?: string;
}

interface EventCard {
    title: string;
    description: string;
    fullDescription: string;
    type: 'negative' | 'neutral' | 'positive';
    effect: (state: GameState, difficulty: Difficulty) => Partial<GameState>;
    prevention?: string;
}

interface GameState {
    population: number;
    infrastructure: number;
    budget: number;
    month: number;
    score: number;
    activeProjects: string[];
    skipsLeft: number;
    educationLevel: number;
    healthIndex: number;
    housingDeficit: number;
    unemployment: number;
    environmentalQuality: number;
    difficulty: Difficulty;
}

// --- CONFIGURAÇÕES DE DIFICULDADE --- //
const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Fácil',
        icon: <Trophy className="w-5 h-5" />,
        color: 'text-green-400 border-green-500/50 bg-green-950/30',
        maxScore: 700,
        initialBudget: 25,
        initialHousingDeficit: 5,
        initialUnemployment: 3,
        skips: 5,
        populationGrowth: 1,
        hardModeGrowth: 2,
        incomeBase: 8,
        incomeMultiplier: 0.6,
        eventChance: 0.2,
        hardEventChance: 0.4,
        eventSeverity: 0.7,
        cardCostMultiplier: 0.8,
        maxDifference: 25,
        maxHousingDeficit: 22,
        maxUnemployment: 18,
        description: 'Comece com mais recursos e eventos menos severos. Perfeito para aprender!',
        emoji: '🌱'
    },
    medium: {
        label: 'Médio',
        icon: <Target className="w-5 h-5" />,
        color: 'text-yellow-400 border-yellow-500/50 bg-yellow-950/30',
        maxScore: 1000,
        initialBudget: 18,
        initialHousingDeficit: 7,
        initialUnemployment: 5,
        skips: 4,
        populationGrowth: 2,
        hardModeGrowth: 3,
        incomeBase: 6,
        incomeMultiplier: 0.5,
        eventChance: 0.3,
        hardEventChance: 0.55,
        eventSeverity: 1.0,
        cardCostMultiplier: 1.0,
        maxDifference: 22,
        maxHousingDeficit: 20,
        maxUnemployment: 16,
        description: 'Equilíbrio entre desafio e diversão. A experiência completa!',
        emoji: '🎯'
    },
    hard: {
        label: 'Difícil',
        icon: <Skull className="w-5 h-5" />,
        color: 'text-red-400 border-red-500/50 bg-red-950/30',
        maxScore: 1500,
        initialBudget: 12,
        initialHousingDeficit: 10,
        initialUnemployment: 8,
        skips: 3,
        populationGrowth: 3,
        hardModeGrowth: 5,
        incomeBase: 4,
        incomeMultiplier: 0.4,
        eventChance: 0.4,
        hardEventChance: 0.7,
        eventSeverity: 1.3,
        cardCostMultiplier: 1.2,
        maxDifference: 18,
        maxHousingDeficit: 17,
        maxUnemployment: 14,
        description: 'Para gestores experientes! Cada decisão conta. Você vai suar!',
        emoji: '💀'
    }
};

/// --- FUNÇÃO DE SALVAMENTO COM USERID --- //
const saveScoreToRanking = async (playerName: string, userId: string | undefined, score: number, difficulty: Difficulty): Promise<boolean> => {
    console.log('💾 Salvando pontuação:', { playerName, userId, score, difficulty });

    // 1. SALVAR NO LOCAL STORAGE (SEMPRE FUNCIONA)
    let localSaved = false;
    try {
        if (typeof window !== 'undefined') {
            const leaderboardKey = 'bioguesser_leaderboard';
            let leaderboard: any[] = [];
            
            try {
                const existingData = localStorage.getItem(leaderboardKey);
                if (existingData) {
                    leaderboard = JSON.parse(existingData);
                    if (!Array.isArray(leaderboard)) {
                        leaderboard = [];
                    }
                }
            } catch (parseError) {
                console.warn('⚠️ Erro ao parsear localStorage, iniciando novo array');
                leaderboard = [];
            }

            // Busca por userId primeiro, depois por nome (fallback)
            const existingIndex = leaderboard.findIndex(
                (entry: any) => 
                    entry && 
                    ((entry.userId && entry.userId === userId) || 
                     (entry.name === playerName && entry.mode === 'Trilha Urbanização' && entry.difficulty === difficulty))
            );
            
            if (existingIndex !== -1 && leaderboard[existingIndex]) {
                const currentScore = leaderboard[existingIndex].score || 0;
                if (score > currentScore) {
                    leaderboard[existingIndex].score = score;
                    leaderboard[existingIndex].date = new Date().toISOString();
                    if (userId) leaderboard[existingIndex].userId = userId;
                    console.log('📝 Atualizando pontuação existente:', leaderboard[existingIndex]);
                } else {
                    console.log('⏭️ Pontuação não superou o recorde atual:', currentScore);
                }
            } else {
                const newEntry: any = {
                    name: playerName,
                    score: score,
                    mode: 'Trilha Urbanização',
                    difficulty: difficulty,
                    date: new Date().toISOString()
                };
                if (userId) newEntry.userId = userId;
                leaderboard.push(newEntry);
                console.log('📝 Nova entrada criada:', newEntry);
            }
            
            leaderboard.sort((a: any, b: any) => (b?.score || 0) - (a?.score || 0));
            localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
            localSaved = true;
            console.log('✅ Pontuação salva no localStorage! Total de entradas:', leaderboard.length);
        }
    } catch (localError) {
        console.error('❌ Erro ao salvar no localStorage:', localError);
    }

    // 2. TENTAR SINCRONIZAR COM O SERVIDOR (COM USERID)
    try {
        console.log('🌐 Tentando sincronizar com o servidor...');
        
        const response = await fetch('/api/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: playerName,
                userId: userId || '', // Envia o userId
                score: score,
                mode: 'Trilha Urbanização',
                difficulty: difficulty,
                date: new Date().toISOString()
            }),
        });

        console.log('📡 Status da API:', response.status);

        let responseData = {};
        try {
            const text = await response.text();
            console.log('📄 Resposta bruta:', text);
            if (text) {
                responseData = JSON.parse(text);
            }
        } catch (parseError) {
            console.warn('⚠️ Não foi possível parsear a resposta');
        }

        if (!response.ok) {
            console.warn('⚠️ API retornou erro, mas dados já estão salvos localmente');
            return true;
        }

        console.log('✅ Pontuação sincronizada com o servidor!', responseData);
        return true;

    } catch (apiError) {
        console.warn('⚠️ Erro ao sincronizar com API (servidor offline), dados salvos localmente');
        return true;
    }
};

// --- BASE DE DADOS DE CARTAS --- //
const ACTION_CARDS: ActionCard[] = [
    // CONSTRUÇÃO (build)
    {
        id: 'c1', 
        title: 'Plano Diretor de Zoneamento', 
        effectText: '+3 Infra, -1 Pop, +2 Habitação', 
        explanation: 'Organiza o crescimento urbano com regras claras de zoneamento.',
        fullDescription: 'O Plano Diretor estabelece onde cada tipo de construção pode ser feita. Evita a ocupação de áreas de risco, reduz a especulação imobiliária e garante que a cidade cresça de forma ordenada.',
        cost: 15, 
        type: 'policy',
        icon: <Building className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 3,
            population: Math.max(0, s.population - 1),
            housingDeficit: Math.max(0, s.housingDeficit - 2)
        }),
        feedback: "O plano diretor está sendo implementado!"
    },
    {
        id: 'c2', 
        title: 'Programa de Habitação Popular', 
        effectText: '+2 Infra, -3 Déficit Habitacional', 
        explanation: 'Constrói moradias dignas para a população de baixa renda.',
        fullDescription: 'O déficit habitacional é um dos principais indicadores da macrocefalia urbana. Este programa constrói unidades habitacionais com infraestrutura básica.',
        cost: 12, 
        type: 'build',
        icon: <Home className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 2,
            housingDeficit: Math.max(0, s.housingDeficit - 3),
            population: Math.max(0, s.population + 1)
        }),
        feedback: "Famílias estão sendo realocadas!"
    },
    {
        id: 'c3', 
        title: 'Complexo Hospitalar Regional', 
        effectText: '+4 Infra, +3 Saúde', 
        explanation: 'Grande centro médico que atende toda a região.',
        fullDescription: 'A falta de saúde pública de qualidade é um dos principais problemas das cidades inchadas. Um complexo hospitalar bem equipado melhora os indicadores de saúde.',
        cost: 18, 
        type: 'build',
        icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 4,
            healthIndex: Math.min(10, s.healthIndex + 3)
        }),
        feedback: "O novo hospital já está atendendo!"
    },
    {
        id: 'c4', 
        title: 'Saneamento Básico + Drenagem', 
        effectText: '+3 Infra, +2 Saúde', 
        explanation: 'Obras de esgoto, água e drenagem.',
        fullDescription: 'A falta de saneamento básico é uma das principais causas de doenças em áreas periféricas. Além disso, a drenagem inadequada causa enchentes.',
        cost: 10, 
        type: 'build',
        icon: <Droplets className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 3,
            healthIndex: Math.min(10, s.healthIndex + 2),
            environmentalQuality: Math.min(10, s.environmentalQuality + 1)
        }),
        feedback: "O saneamento está chegando aos bairros!"
    },
    {
        id: 'c5', 
        title: 'Parques Lineares e Áreas Verdes', 
        effectText: '+2 Infra, +3 Meio Ambiente', 
        explanation: 'Criação de parques ao longo de rios e córregos.',
        fullDescription: 'Os parques lineares são áreas verdes que acompanham rios e córregos. Além de melhorar o meio ambiente, eles servem como corredores ecológicos.',
        cost: 8, 
        type: 'build',
        icon: <TreePine className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 2,
            environmentalQuality: Math.min(10, s.environmentalQuality + 3),
            healthIndex: Math.min(10, s.healthIndex + 1)
        }),
        feedback: "A cidade está ficando mais verde!"
    },
    {
        id: 'c6', 
        title: 'Ciclovias e Mobilidade Ativa', 
        effectText: '+1 Infra, +2 Saúde, +1 Meio Ambiente', 
        explanation: 'Incentivo ao uso de bicicletas e caminhada.',
        fullDescription: 'A mobilidade ativa é uma alternativa sustentável ao transporte motorizado. Além de reduzir a poluição, melhora a saúde da população e reduz o trânsito.',
        cost: 5, 
        type: 'build',
        icon: <Zap className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 1,
            healthIndex: Math.min(10, s.healthIndex + 2),
            environmentalQuality: Math.min(10, s.environmentalQuality + 1)
        }),
        feedback: "A cidade está mais amigável!"
    },
    {
        id: 'c7', 
        title: 'PAC - Programa de Aceleração', 
        effectText: '+5 Infra, -3 Pop, +2 Saúde', 
        explanation: 'Investimento federal maciço em infraestrutura urbana.',
        fullDescription: 'O PAC é um programa federal que investe pesado em infraestrutura em todo o país. Destina recursos para moradia, saneamento, transporte e saúde.',
        cost: 2, 
        type: 'build',
        icon: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 5, 
            population: Math.max(0, s.population - 3),
            healthIndex: Math.min(10, s.healthIndex + 2)
        }),
        feedback: "Recursos federais chegaram para obras!"
    },
    {
        id: 'c8', 
        title: 'Força-Tarefa de Construção', 
        effectText: '+6 Infraestrutura', 
        explanation: 'Mobilização emergencial para construir hospitais e escolas.',
        fullDescription: 'Em situações de emergência, o governo pode mobilizar equipes para construir equipamentos públicos de forma rápida e eficiente.',
        cost: 1, 
        type: 'build',
        icon: <Hammer className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 6
        }),
        feedback: "Obras emergenciais em tempo recorde!"
    },
    // POLÍTICA (policy)
    {
        id: 'c9', 
        title: 'Fixação no Campo + Agroecologia', 
        effectText: '-3 Pop, +2 Meio Ambiente, +1 Infra', 
        explanation: 'Programa completo de desenvolvimento rural.',
        fullDescription: 'A macrocefalia urbana tem origem no êxodo rural. Este programa oferece crédito e infraestrutura para o agricultor familiar, reduzindo a migração para as cidades.',
        cost: 12, 
        type: 'policy',
        icon: <TreePine className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            population: Math.max(0, s.population - 3),
            environmentalQuality: Math.min(10, s.environmentalQuality + 2),
            infrastructure: s.infrastructure + 1
        }),
        feedback: "O campo está se fortalecendo!"
    },
    {
        id: 'c10', 
        title: 'Lei de Uso do Solo + Fiscalização', 
        effectText: '+2 Infra, -2 Pop, +1 Meio Ambiente', 
        explanation: 'Combate à ocupação irregular e protege áreas verdes.',
        fullDescription: 'A ocupação irregular do solo é uma das principais causas da macrocefalia. Esta lei protege áreas de preservação permanente e cria mecanismos de fiscalização.',
        cost: 14, 
        type: 'policy',
        icon: <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 2,
            population: Math.max(0, s.population - 2),
            environmentalQuality: Math.min(10, s.environmentalQuality + 1)
        }),
        feedback: "A fiscalização está mais rigorosa!"
    },
    {
        id: 'c11', 
        title: 'Regularização Fundiária', 
        effectText: '-2 Déficit Hab., +1 Infra, +5 Pontos', 
        explanation: 'Regulariza a posse da terra em áreas irregulares.',
        fullDescription: 'A regularização fundiária é essencial para dar dignidade às famílias que vivem em áreas irregulares. Com a posse da terra garantida, as famílias podem investir em suas casas.',
        cost: 6, 
        type: 'policy',
        icon: <Home className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            housingDeficit: Math.max(0, s.housingDeficit - 2),
            infrastructure: s.infrastructure + 1,
            score: s.score + 5
        }),
        feedback: "Famílias recebem a escritura!"
    },
    {
        id: 'c12', 
        title: 'Pacto pela Descentralização', 
        effectText: '+4 Infra, -4 Pop, +2 Meio Ambiente', 
        explanation: 'Acordo para descentralizar o desenvolvimento urbano.',
        fullDescription: 'Este pacto envolve a União, estados e municípios em um esforço conjunto para descentralizar o desenvolvimento, reduzindo a pressão sobre as metrópoles.',
        cost: 3, 
        type: 'policy',
        icon: <Landmark className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 4,
            population: Math.max(0, s.population - 4),
            environmentalQuality: Math.min(10, s.environmentalQuality + 2)
        }),
        feedback: "Todos os governos estão unidos!"
    },
    // ECONOMIA (economy)
    {
        id: 'c13', 
        title: 'Reforma Tributária Progressiva', 
        effectText: '+15 Orçamento, +1 Pop, +2 Escolaridade', 
        explanation: 'Aumenta a arrecadação com impostos justos.',
        fullDescription: 'A reforma tributária progressiva torna o sistema mais justo, taxando mais quem tem mais. Com a arrecadação extra, é possível investir em educação.',
        cost: 0, 
        type: 'economy',
        icon: <Coins className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            budget: s.budget + 15, 
            population: s.population + 1,
            educationLevel: Math.min(10, s.educationLevel + 2)
        }),
        feedback: "O orçamento foi reforçado!"
    },
    {
        id: 'c14', 
        title: 'PPP para Transporte', 
        effectText: '+1 Infra, +10 Orçamento', 
        explanation: 'Concessão de transporte público para empresas privadas.',
        fullDescription: 'A mobilidade urbana é um dos maiores desafios das metrópoles. As PPPs podem trazer investimento privado para o transporte público.',
        cost: 4, 
        type: 'economy',
        icon: <Train className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 1, 
            budget: s.budget + 10,
            population: Math.max(0, s.population - 2)
        }),
        feedback: "O transporte está sendo modernizado!"
    },
    {
        id: 'c15', 
        title: 'Descentralização Industrial', 
        effectText: '-3 Pop, +2 Infra, +5 Orçamento', 
        explanation: 'Leva indústrias para o interior.',
        fullDescription: 'A concentração industrial é uma das principais causas da macrocefalia. Este plano oferece incentivos fiscais para que empresas se instalem no interior.',
        cost: 16, 
        type: 'economy',
        icon: <Factory className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            population: Math.max(0, s.population - 3),
            infrastructure: s.infrastructure + 2,
            budget: s.budget + 5
        }),
        feedback: "Indústrias estão se mudando!"
    },
    {
        id: 'c16', 
        title: 'Microcrédito para Periferias', 
        effectText: '+8 Orçamento, -1 Déficit Hab., +1 Infra', 
        explanation: 'Financiamento para pequenos negócios.',
        fullDescription: 'O microcrédito é uma ferramenta poderosa para combater a pobreza em áreas periféricas. Gera emprego e renda, estimulando o empreendedorismo local.',
        cost: 2, 
        type: 'economy',
        icon: <Briefcase className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            budget: s.budget + 8,
            housingDeficit: Math.max(0, s.housingDeficit - 1),
            infrastructure: s.infrastructure + 1,
            unemployment: Math.max(0, s.unemployment - 1)
        }),
        feedback: "Pequenos negócios estão surgindo!"
    },
    {
        id: 'c17', 
        title: 'Cooperação Internacional', 
        effectText: '+4 Infra, -2 Pop, +3 Saúde', 
        explanation: 'Organismos internacionais financiam soluções urbanas.',
        fullDescription: 'Organizações como o Banco Mundial e a ONU-Habitat oferecem recursos para cidades em situação crítica, trazendo tecnologia e conhecimento.',
        cost: 0, 
        type: 'economy',
        icon: <Globe className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            infrastructure: s.infrastructure + 4,
            population: Math.max(0, s.population - 2),
            healthIndex: Math.min(10, s.healthIndex + 3)
        }),
        feedback: "Recursos internacionais chegaram!"
    },
    // SOCIAL
    {
        id: 'c18', 
        title: 'Cultura e Cidadania', 
        effectText: '+20 Pontos, +2 Escolaridade', 
        explanation: 'Programas culturais que educam e engajam.',
        fullDescription: 'Cidades com forte identidade cultural têm mais participação popular. Este programa investe em bibliotecas, centros culturais e projetos de arte-educação.',
        cost: 6, 
        type: 'social',
        icon: <BookOpen className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            score: s.score + 20,
            educationLevel: Math.min(10, s.educationLevel + 2)
        }),
        feedback: "A cultura está florescendo!"
    },
    {
        id: 'c19', 
        title: 'Escolas Técnicas', 
        effectText: '+3 Escolaridade, -2 Desemprego', 
        explanation: 'Formação de mão de obra qualificada.',
        fullDescription: 'A qualificação profissional é fundamental para reduzir o desemprego. Escolas técnicas oferecem cursos alinhados com as necessidades do mercado.',
        cost: 8, 
        type: 'social',
        icon: <School className="w-4 h-4 md:w-5 md:h-5" />,
        effect: (s, diff) => ({ 
            educationLevel: Math.min(10, s.educationLevel + 3),
            unemployment: Math.max(0, s.unemployment - 2),
            score: s.score + 10
        }),
        feedback: "Jovens estão sendo capacitados!"
    }
];

// --- EVENTOS DINÂMICOS --- //
const getDynamicEvents = (state: GameState, difficulty: Difficulty): EventCard[] => {
    const severity = DIFFICULTY_CONFIG[difficulty].eventSeverity;
    const popIncrease = Math.round(4 * severity);
    const infraDecrease = Math.round(2 * severity);
    
    return [
        {
            title: 'Seca no Sertão!',
            description: state.activeProjects.includes('c9') 
                ? 'Política de "Fixação no Campo" evitou o êxodo!'
                : `Êxodo rural em massa! População urbana disparou (+${popIncrease} Pop).`,
            fullDescription: state.activeProjects.includes('c9')
                ? 'Graças ao programa de agroecologia, os agricultores resistiram à seca.'
                : 'A seca devastou o interior. Sem políticas de apoio, milhares migraram para a cidade.',
            type: state.activeProjects.includes('c9') ? 'positive' : 'negative',
            effect: (s, diff) => state.activeProjects.includes('c9') 
                ? {} 
                : { population: s.population + popIncrease, housingDeficit: s.housingDeficit + Math.round(1 * severity) },
            prevention: 'Invista em "Fixação no Campo" para evitar este evento.'
        },
        {
            title: 'Enchentes Devastadoras!',
            description: (state.activeProjects.includes('c4') || state.activeProjects.includes('c10') || state.activeProjects.includes('c5'))
                ? 'Projetos de saneamento/parques evitaram enchentes! (+15 Pontos)'
                : `Enchente Severa! Áreas sem planejamento colapsaram (-${infraDecrease} Infra, +${Math.round(1 * severity)} Déficit).`,
            fullDescription: (state.activeProjects.includes('c4') || state.activeProjects.includes('c10') || state.activeProjects.includes('c5'))
                ? 'Os projetos de drenagem e parques lineares mostraram sua eficácia.'
                : 'As chuvas torrenciais encontraram uma cidade despreparada, agravando a crise.',
            type: (state.activeProjects.includes('c4') || state.activeProjects.includes('c10') || state.activeProjects.includes('c5')) ? 'positive' : 'negative',
            effect: (s, diff) => (state.activeProjects.includes('c4') || state.activeProjects.includes('c10') || state.activeProjects.includes('c5'))
                ? { score: s.score + 15, healthIndex: s.healthIndex + 1 }
                : { 
                    infrastructure: Math.max(0, s.infrastructure - infraDecrease),
                    housingDeficit: s.housingDeficit + Math.round(1 * severity),
                    healthIndex: Math.max(0, s.healthIndex - Math.round(1 * severity))
                },
            prevention: 'Invista em "Saneamento", "Uso do Solo" ou "Parques Lineares".'
        },
        {
            title: 'Crise no Transporte!',
            description: state.activeProjects.includes('c14')
                ? 'PPP de Transporte funcionou! (+10 Orçamento)'
                : `Transporte público com problemas! (-${Math.round(1 * severity)} Infra).`,
            fullDescription: state.activeProjects.includes('c14')
                ? 'A parceria público-privada mostrou seus frutos, gerando receita para a prefeitura.'
                : 'A falta de investimento no transporte público causou problemas de mobilidade.',
            type: state.activeProjects.includes('c14') ? 'positive' : 'negative',
            effect: (s, diff) => state.activeProjects.includes('c14')
                ? { budget: s.budget + 10, infrastructure: s.infrastructure + 1 }
                : { infrastructure: Math.max(0, s.infrastructure - Math.round(1 * severity)), unemployment: s.unemployment + Math.round(1 * severity) },
            prevention: 'Invista em "PPP para Transporte" para evitar este evento.'
        },
        {
            title: 'Surto de Doenças!',
            description: state.activeProjects.includes('c4') || state.activeProjects.includes('c3')
                ? 'Saneamento/Hospital controlou o surto! (+10 Pontos)'
                : `Surto de doenças! (-${Math.round(1 * severity)} Infra, -${Math.round(1 * severity)} Saúde)`,
            fullDescription: state.activeProjects.includes('c4') || state.activeProjects.includes('c3')
                ? 'Os investimentos em saneamento e saúde evitaram uma catástrofe.'
                : 'A falta de saneamento básico causou um surto de doenças.',
            type: (state.activeProjects.includes('c4') || state.activeProjects.includes('c3')) ? 'positive' : 'negative',
            effect: (s, diff) => (state.activeProjects.includes('c4') || state.activeProjects.includes('c3'))
                ? { score: s.score + 10, healthIndex: Math.min(10, s.healthIndex + 1) }
                : { 
                    infrastructure: Math.max(0, s.infrastructure - Math.round(1 * severity)),
                    healthIndex: Math.max(0, s.healthIndex - Math.round(1 * severity)),
                    population: s.population + 1
                },
            prevention: 'Invista em "Saneamento" ou "Complexo Hospitalar".'
        },
        {
            title: 'Investimento Federal Surpresa!',
            description: `Governo federal destinou recursos (+${Math.round(15 * severity)} Orçamento)!`,
            fullDescription: 'Em reconhecimento ao seu esforço, o governo federal liberou recursos adicionais.',
            type: 'positive',
            effect: (s, diff) => ({ budget: s.budget + Math.round(15 * severity) }),
            prevention: 'Mantenha bons indicadores de gestão.'
        }
    ];
};

// --- COMPONENTE PRINCIPAL --- //
export default function MacrocefaliaUrbanaGame({ playerName, userId, onReturnHome, onSaveScore }: MacrocefaliaUrbanaGameProps) {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [gameState, setGameState] = useState<GameState>({
        population: 5,
        infrastructure: 8,
        budget: 20,
        month: 1,
        score: 0,
        activeProjects: [],
        skipsLeft: 4,
        educationLevel: 3,
        healthIndex: 4,
        housingDeficit: 7,
        unemployment: 5,
        environmentalQuality: 4,
        difficulty: 'medium'
    });
    
    const [hand, setHand] = useState<ActionCard[]>([]);
    const [status, setStatus] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
    const [phase, setPhase] = useState<'selection' | 'resolution'>('selection');
    const [turnLogs, setTurnLogs] = useState<string[]>([]);
    const [pendingEvent, setPendingEvent] = useState<EventCard | null>(null);
    const [selectedCardDescription, setSelectedCardDescription] = useState<ActionCard | null>(null);
    
    const [showCollapseInfo, setShowCollapseInfo] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [isSavingScore, setIsSavingScore] = useState(false);
    const [scoreSaved, setScoreSaved] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        if (typeof window !== 'undefined') {
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }
    }, []);

    const config = DIFFICULTY_CONFIG[gameState.difficulty || difficulty];
    const difference = gameState.population - gameState.infrastructure;
    const maxMonths = 12;
    const MAX_DIFFERENCE_GAMEOVER = config.maxDifference;
    const MAX_HOUSING_DEFICIT_GAMEOVER = config.maxHousingDeficit;
    const MAX_UNEMPLOYMENT_GAMEOVER = config.maxUnemployment;

    const checkGameOver = useCallback((state: GameState): boolean => {
        const currentDiff = state.population - state.infrastructure;
        const diffConfig = DIFFICULTY_CONFIG[state.difficulty || 'medium'];
        return currentDiff > diffConfig.maxDifference || 
               state.housingDeficit >= diffConfig.maxHousingDeficit || 
               state.unemployment > diffConfig.maxUnemployment;
    }, []);

    const drawHand = useCallback((currentMonth: number, diff: Difficulty) => {
        const config = DIFFICULTY_CONFIG[diff];
        const allCards = [...ACTION_CARDS];
        
        const adjustedCards = allCards.map(card => ({
            ...card,
            cost: Math.round(card.cost * config.cardCostMultiplier)
        }));
        
        const shuffled = adjustedCards.sort(() => 0.5 - Math.random());
        
        let drawnCards = shuffled.slice(0, 4);
        
        if (currentMonth >= 7) {
            const cheapCards = adjustedCards.filter(c => c.cost <= 5);
            const shuffledCheap = cheapCards.sort(() => 0.5 - Math.random());
            const cheapSelection = shuffledCheap.slice(0, 2);
            const otherCards = adjustedCards.filter(c => c.cost > 5).sort(() => 0.5 - Math.random()).slice(0, 2);
            drawnCards = [...cheapSelection, ...otherCards];
        }
        
        drawnCards = drawnCards.map(c => ({...c, id: `${c.id}-${Date.now()}`}));
        setHand(drawnCards.sort(() => 0.5 - Math.random()));
    }, []);

    const initializeGame = (diff: Difficulty) => {
        const config = DIFFICULTY_CONFIG[diff];
        setScoreSaved(false);
        setIsSavingScore(false);
        setGameState({
            population: 5,
            infrastructure: 8,
            budget: config.initialBudget,
            month: 1,
            score: 0,
            activeProjects: [],
            skipsLeft: config.skips,
            educationLevel: 3,
            healthIndex: 4,
            housingDeficit: config.initialHousingDeficit,
            unemployment: config.initialUnemployment,
            environmentalQuality: 4,
            difficulty: diff
        });
        setDifficulty(diff);
        drawHand(1, diff);
        setStatus('playing');
        setPhase('selection');
        setTurnLogs([]);
    };

    const executeTurn = (card?: ActionCard, isForcedSkip: boolean = false) => {
        setGameState(prev => {
            let tempState = { ...prev };
            let newLogs: string[] = [];
            const currentDiff = tempState.difficulty || difficulty;
            const config = DIFFICULTY_CONFIG[currentDiff];

            if (card) {
                const baseId = card.id.split('-')[0];
                tempState.activeProjects = [...tempState.activeProjects, baseId];
                
                const effectChanges = card.effect(tempState, currentDiff);
                tempState = { ...tempState, ...effectChanges };
                tempState.budget -= card.cost;
                tempState.score += 15;
                
                newLogs.push(`✅ APROVADO: ${card.title}`);
                newLogs.push(`   📊 Efeito: ${card.effectText}`);
                if (card.feedback) {
                    newLogs.push(`   💬 ${card.feedback}`);
                }
            } else {
                if (isForcedSkip) {
                    newLogs.push(`⏭️ Nenhuma obra aprovada por falta de verba.`);
                } else {
                    tempState.skipsLeft -= 1;
                    newLogs.push(`⏭️ Mês pulado estrategicamente (${tempState.skipsLeft} restantes).`);
                }
            }

            const isHardMode = tempState.month >= 7;
            
            let naturalGrowth = isHardMode 
                ? config.hardModeGrowth + Math.floor(tempState.month / 4)
                : config.populationGrowth + Math.floor(tempState.month / 4);
            
            if (tempState.educationLevel >= 7) {
                naturalGrowth = Math.max(1, naturalGrowth - 1);
                newLogs.push(`📚 Educação de qualidade reduzindo crescimento!`);
            }
            
            if (tempState.healthIndex >= 7) {
                naturalGrowth = Math.max(1, naturalGrowth - 1);
                newLogs.push(`🏥 Boa saúde controlando mortalidade!`);
            }
            
            if (tempState.housingDeficit > 12) {
                naturalGrowth += 1;
                newLogs.push(`🏚️ Déficit habitacional acelerando favelização!`);
            }

            let income = config.incomeBase + Math.floor(tempState.infrastructure * config.incomeMultiplier);
            
            if (tempState.educationLevel >= 6) {
                income += 3;
                newLogs.push(`📈 População educada gerando mais arrecadação!`);
            }

            tempState.population += naturalGrowth;
            tempState.budget += income;

            newLogs.push(`📈 População cresceu +${naturalGrowth} (Total: ${tempState.population})`);
            newLogs.push(`💰 Arrecadação: +${income}M (Total: ${tempState.budget}M)`);

            tempState.housingDeficit = Math.min(25, tempState.housingDeficit + Math.floor(naturalGrowth / 3));
            
            if (tempState.infrastructure >= 10) {
                tempState.unemployment = Math.max(0, tempState.unemployment - 1);
            } else if (tempState.infrastructure < 5) {
                tempState.unemployment = Math.min(20, tempState.unemployment + 1);
            }

            const eventChance = isHardMode ? config.hardEventChance : config.eventChance;

            if (tempState.month <= maxMonths && Math.random() < eventChance) {
                const currentEvents = getDynamicEvents(tempState, currentDiff);
                const randomEvent = currentEvents[Math.floor(Math.random() * currentEvents.length)];
                setPendingEvent(randomEvent);
                const eventChanges = randomEvent.effect(tempState, currentDiff);
                tempState = { ...tempState, ...eventChanges };
                newLogs.push(`⚡ EVENTO: ${randomEvent.title}`);
                if (randomEvent.type === 'negative') {
                    newLogs.push(`   ⚠️ Efeito negativo`);
                } else {
                    newLogs.push(`   ✅ Efeito positivo`);
                }
            }

            tempState.month += 1;
            setTurnLogs(newLogs);
            
            if (checkGameOver(tempState)) {
                setStatus('gameover');
            }
            
            return tempState;
        });

        setPhase('resolution');
    };

    const nextMonth = () => {
        if (checkGameOver(gameState)) {
            setStatus('gameover');
            return;
        }

        if (gameState.month > maxMonths) {
            const currentDiff = gameState.difficulty || difficulty;
            const config = DIFFICULTY_CONFIG[currentDiff];
            if (difference > config.maxDifference || 
                gameState.housingDeficit >= config.maxHousingDeficit || 
                gameState.unemployment > config.maxUnemployment) {
                setStatus('gameover');
            } else {
                setStatus('victory');
            }
            return;
        }

        drawHand(gameState.month, gameState.difficulty || difficulty);
        setPhase('selection');
    };

    const handleExit = () => {
        if (status === 'playing' && window.confirm("Deseja renunciar ao seu mandato de Gestor? O progresso será perdido.")) {
            onReturnHome();
        } else if (status !== 'playing') {
            onReturnHome();
        }
    };

    // Salva a pontuação quando o jogo termina (victory) - COM USERID
    useEffect(() => {
        const saveScoreIfNeeded = async () => {
            // Só executa se:
            // 1. Status for 'victory'
            // 2. Ainda não salvou
            // 3. Não está salvando agora
            if (status !== 'victory' || scoreSaved || isSavingScore) {
                return;
            }

            const currentConfig = DIFFICULTY_CONFIG[gameState.difficulty || difficulty];
            const currentDiff = gameState.difficulty || difficulty;
            
            // Calcula a pontuação final
            let rawScore = gameState.score + 
                          (gameState.infrastructure * 5) + 
                          gameState.budget + 
                          (gameState.educationLevel * 10) + 
                          (gameState.healthIndex * 10);
            
            const multipliers = {
                easy: 0.5,
                medium: 0.7,
                hard: 1.0
            };
            
            let finalScore = Math.round(rawScore * multipliers[currentDiff]);
            finalScore = Math.min(finalScore, currentConfig.maxScore);
            
            setIsSavingScore(true);
            
            try {
                console.log('🎯 Salvando pontuação final:', { finalScore, difficulty: currentDiff, userId });
                
                // Salva no ranking com userId
                const success = await saveScoreToRanking(playerName, userId, finalScore, currentDiff);
                
                // Marca como salvo
                setScoreSaved(true);
                
                // Chama o callback do ranking (para o ranking geral)
                onSaveScore(finalScore);
                
                if (success) {
                    toast({
                        title: "🏆 Pontuação Salva!",
                        description: `Você alcançou ${finalScore} pontos na dificuldade ${currentConfig.label}!`,
                        variant: "default"
                    });
                } else {
                    toast({
                        title: "⚠️ Aviso",
                        description: "Pontuação salva localmente. Sincronização pendente.",
                        variant: "default"
                    });
                }
                
            } catch (error) {
                console.error('❌ Erro ao salvar pontuação:', error);
                setScoreSaved(true);
                toast({
                    title: "✅ Pontuação Salva Localmente",
                    description: "A sincronização com o servidor será feita depois.",
                    variant: "default"
                });
            } finally {
                setIsSavingScore(false);
            }
        };

        saveScoreIfNeeded();
    }, [status, gameState, difficulty, playerName, userId, onSaveScore, scoreSaved, isSavingScore]);

    // ============================================================ //
    // Painel de Ajuda ENEM, StatisticsPanel, e telas do jogo
    // ============================================================ //
    // O resto do código permanece igual (EnemHelpPanel, StatisticsPanel, 
    // telas intro, gameover, victory, selection, resolution)
    // Para economizar espaço, estou mantendo o código completo abaixo...

    // ... (continuação do código - todas as telas permanecem iguais)
    // Painel de Ajuda ENEM
    const EnemHelpPanel = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-blue-900/40 border-blue-500/50 text-blue-200 hover:bg-blue-800 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold shadow-md md:shadow-lg text-xs md:text-sm">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> O que cai no ENEM?
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
                            <h3 className="font-black text-xl text-red-400 mb-3 tracking-tight">Causas & Consequências</h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-300 text-[15px]">
                                <li><strong>Êxodo Rural:</strong> Pessoas fogem do campo para a cidade em busca de emprego.</li>
                                <li><strong>Segregação:</strong> Os mais pobres são empurrados para as periferias (favelização).</li>
                                <li><strong>Impacto Ambiental:</strong> Enchentes e ilhas de calor devido à falta de planejamento.</li>
                                <li><strong>Déficit Habitacional:</strong> Falta de moradias dignas para a população.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-green-400 mb-3 tracking-tight">Dificuldades</h3>
                            <div className="space-y-3">
                                <div className="bg-green-950/30 p-4 rounded-xl border border-green-700/30">
                                    <p className="text-green-400 font-bold">🌱 Fácil</p>
                                    <p className="text-slate-300 text-sm">Pontuação máxima: 700 • Mais recursos • Eventos amenos</p>
                                </div>
                                <div className="bg-yellow-950/30 p-4 rounded-xl border border-yellow-700/30">
                                    <p className="text-yellow-400 font-bold">🎯 Médio</p>
                                    <p className="text-slate-300 text-sm">Pontuação máxima: 1000 • Equilíbrio perfeito</p>
                                </div>
                                <div className="bg-red-950/30 p-4 rounded-xl border border-red-700/30">
                                    <p className="text-red-400 font-bold">💀 Difícil</p>
                                    <p className="text-slate-300 text-sm">Pontuação máxima: 1500 • Desafio extremo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    // Painel de Estatísticas
    const StatisticsPanel = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 h-auto font-bold text-xs md:text-sm">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> Indicadores
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900/95 backdrop-blur-xl text-slate-100 border-l-slate-700/50 w-full sm:max-w-md p-6 overflow-y-auto">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <TrendingUp className="text-blue-400" /> Indicadores Urbanos
                </h2>
                <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-400">📚 Escolaridade</span>
                            <span className="font-bold text-white">{gameState.educationLevel}/10</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(gameState.educationLevel / 10) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-400">🏥 Saúde</span>
                            <span className="font-bold text-white">{gameState.healthIndex}/10</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(gameState.healthIndex / 10) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-400">🏚️ Déficit Habitacional</span>
                            <span className={`font-bold ${gameState.housingDeficit > 15 ? 'text-red-400' : 'text-yellow-400'}`}>{gameState.housingDeficit}/25</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div className={`h-2 rounded-full ${gameState.housingDeficit > 15 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${(gameState.housingDeficit / 25) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-400">📉 Desemprego</span>
                            <span className={`font-bold ${gameState.unemployment > 12 ? 'text-red-400' : 'text-yellow-400'}`}>{gameState.unemployment}/20</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div className={`h-2 rounded-full ${gameState.unemployment > 12 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${(gameState.unemployment / 20) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-400">🌳 Meio Ambiente</span>
                            <span className="font-bold text-white">{gameState.environmentalQuality}/10</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(gameState.environmentalQuality / 10) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mt-4">
                        <p className="text-slate-400 text-sm">🏆 Pontuação: <span className="text-yellow-400 font-bold">{gameState.score}</span></p>
                        <p className="text-slate-400 text-sm">⏰ Mês: <span className="text-blue-400 font-bold">{gameState.month}/{maxMonths}</span></p>
                        <p className="text-slate-400 text-sm">💰 Orçamento: <span className="text-green-400 font-bold">{gameState.budget}M</span></p>
                        <p className="text-slate-400 text-sm">🎯 Dificuldade: <span className={`font-bold ${DIFFICULTY_CONFIG[gameState.difficulty || difficulty].color.split(' ')[0]}`}>{DIFFICULTY_CONFIG[gameState.difficulty || difficulty].label}</span></p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    const canAffordAny = hand.some(card => gameState.budget >= card.cost);

    // TELA DE INTRO COM SELEÇÃO DE DIFICULDADE
    if (status === 'intro') {
        const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
        
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-lg md:shadow-[0_0_50px_rgba(37,99,235,0.15)] relative">
                    <div className="flex justify-center mb-6 mt-4">
                        <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30">
                            <Building className="w-16 h-16 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-center mb-2">Macrocefalia Urbana</h1>
                    <p className="text-slate-400 text-center text-sm mb-2">🏙️ Gerencie sua cidade e evite o colapso</p>
                    <p className="text-slate-300 text-lg text-center mb-8">
                        Bem-vindo, <strong>Prefeito {playerName}</strong>! 
                    </p>

                    {/* Seleção de Dificuldade */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-center mb-6 text-white">Selecione a Dificuldade</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {difficulties.map((diff) => {
                                const config = DIFFICULTY_CONFIG[diff];
                                const isSelected = difficulty === diff;
                                const colorMap = {
                                    easy: 'border-green-500/50 hover:border-green-400 bg-green-950/20',
                                    medium: 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-950/20',
                                    hard: 'border-red-500/50 hover:border-red-400 bg-red-950/20'
                                };
                                const selectedColorMap = {
                                    easy: 'border-green-400 bg-green-950/40 shadow-[0_0_30px_rgba(34,197,94,0.2)]',
                                    medium: 'border-yellow-400 bg-yellow-950/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]',
                                    hard: 'border-red-400 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                };
                                
                                return (
                                    <motion.div
                                        key={diff}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setDifficulty(diff)}
                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                            isSelected ? selectedColorMap[diff] : colorMap[diff]
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={config.color.split(' ')[0]}>
                                                {config.icon}
                                            </span>
                                            <h3 className={`text-xl font-black ${config.color.split(' ')[0]}`}>
                                                {config.label}
                                            </h3>
                                            {isSelected && (
                                                <span className="ml-auto text-green-400 text-sm font-bold">✓ SELECIONADO</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-xs text-slate-400 mb-3">
                                            <span>💰 Início: {config.initialBudget}M</span>
                                            <span>⏭️ Pulos: {config.skips}</span>
                                            <span>🏠 Déficit: {config.initialHousingDeficit}</span>
                                            <span>📈 Crescimento: +{config.populationGrowth}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {config.description}
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs">
                                            <span className="text-slate-500">🏆 Máx: {config.maxScore} pts</span>
                                            <span className="text-slate-500">💀 Limite: {config.maxDifference} diff</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <Button 
                        onClick={() => initializeGame(difficulty)} 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 text-xl rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        Assumir a Prefeitura ({DIFFICULTY_CONFIG[difficulty].label})
                    </Button>
                </motion.div>
            </div>
        );
    }

    // GAME OVER
    if (status === 'gameover') {
        const config = DIFFICULTY_CONFIG[gameState.difficulty || difficulty];
        let reason = "A diferença entre População e Infraestrutura ultrapassou o limite crítico.";
        if (gameState.housingDeficit >= config.maxHousingDeficit) {
            reason = `O déficit habitacional atingiu o limite máximo (${config.maxHousingDeficit}). Milhares vivem em condições precárias.`;
        } else if (gameState.unemployment > config.maxUnemployment) {
            reason = `O desemprego explodiu (acima de ${config.maxUnemployment}). A população está desesperada.`;
        }
        
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white absolute inset-0 z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-red-500/50 rounded-3xl shadow-xl md:shadow-[0_0_80px_rgba(239,68,68,0.2)] max-w-2xl relative">
                    <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce" />
                    <h1 className="text-5xl md:text-6xl font-black text-red-500 mb-4 tracking-tighter">Colapso Urbano!</h1>
                    <p className="text-xl text-slate-300 mb-4 leading-relaxed">Infelizmente o seu mandato terminou de forma desastrosa.</p>
                    <p className="text-lg text-red-400 font-bold mb-8">{reason}</p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8">
                        <p className="text-sm text-slate-400">Pontuação alcançada</p>
                        <p className="text-4xl font-bold text-yellow-400">{gameState.score} pts</p>
                        <p className="text-xs text-slate-500 mt-1">Máximo: {config.maxScore} pts</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={onReturnHome} variant="ghost" className="text-slate-400 hover:text-white py-6 text-lg">Voltar ao Menu</Button>
                        <Button onClick={() => { initializeGame(gameState.difficulty || difficulty); }} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-6 text-lg">Tentar Novamente</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // VICTORY
    if (status === 'victory') {
        const config = DIFFICULTY_CONFIG[gameState.difficulty || difficulty];
        
        let rawScore = gameState.score + (gameState.infrastructure * 5) + gameState.budget + (gameState.educationLevel * 10) + (gameState.healthIndex * 10);
        
        const multipliers = {
            easy: 0.5,
            medium: 0.7,
            hard: 1.0
        };
        
        let finalScore = Math.round(rawScore * multipliers[gameState.difficulty || difficulty]);
        finalScore = Math.min(finalScore, config.maxScore);
        
        const isMaxScore = finalScore >= config.maxScore;
        const percentage = Math.min(100, Math.round((finalScore / config.maxScore) * 100));
        
        let rank = '';
        let rankColor = '';
        if (percentage >= 90) {
            rank = '🏆 Excelente!';
            rankColor = 'text-yellow-400';
        } else if (percentage >= 70) {
            rank = '⭐ Bom trabalho!';
            rankColor = 'text-blue-400';
        } else if (percentage >= 50) {
            rank = '👍 Satisfatório';
            rankColor = 'text-green-400';
        } else {
            rank = '📈 Continue melhorando';
            rankColor = 'text-slate-400';
        }
        
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#020617] text-white absolute inset-0 z-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 md:p-12 bg-slate-900 border border-green-500/50 rounded-3xl shadow-xl md:shadow-[0_0_80px_rgba(34,197,94,0.2)] max-w-2xl relative">
                    <ShieldCheck className="w-24 h-24 text-green-400 mx-auto mb-6" />
                    <h1 className="text-5xl md:text-6xl font-black text-green-400 mb-4 tracking-tighter">Mandato de Sucesso!</h1>
                    <p className="text-xl text-slate-300 mb-4">PARABÉNS, {playerName}! Você governou com sabedoria e impediu o colapso da metrópole.</p>
                    
                    {isSavingScore ? (
                        <div className="flex items-center justify-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl px-6 py-3 mb-6">
                            <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                            <p className="text-yellow-400 font-bold">Salvando sua pontuação...</p>
                        </div>
                    ) : scoreSaved && (
                        <motion.div 
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="inline-block bg-green-500/20 border border-green-500/50 rounded-xl px-6 py-2 mb-6"
                        >
                            <p className="text-green-400 font-bold text-lg">✅ Pontuação salva com sucesso!</p>
                        </motion.div>
                    )}
                    
                    <p className={`text-lg font-bold ${rankColor} mb-8`}>{rank}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400">Dificuldade</p>
                            <p className={`text-lg font-bold ${config.color.split(' ')[0]}`}>{config.emoji} {config.label}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400">Pontuação</p>
                            <p className="text-2xl font-bold text-yellow-400">{finalScore} pts</p>
                            <p className="text-xs text-slate-500">Máximo: {config.maxScore} pts</p>
                            {finalScore >= config.maxScore && (
                                <p className="text-xs text-green-400 font-bold mt-1">🏆 PONTUAÇÃO MÁXIMA!</p>
                            )}
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400">População</p>
                            <p className="text-lg font-bold text-white">{gameState.population}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400">Infraestrutura</p>
                            <p className="text-lg font-bold text-white">{gameState.infrastructure}</p>
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-3 mb-8 overflow-hidden border border-slate-700">
                        <motion.div 
                            className={`h-full ${percentage >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : percentage >= 70 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : percentage >= 50 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-slate-400 to-slate-600'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
                        />
                    </div>
                    <p className="text-sm text-slate-400 mb-8">{percentage}% da pontuação máxima</p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={() => { onReturnHome(); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-6 text-lg hover:scale-105 transition-transform shadow-md">
                            Voltar ao Menu
                        </Button>
                        <Button onClick={() => { initializeGame(gameState.difficulty || difficulty); }} variant="outline" className="flex-1 border-green-500/50 text-green-400 hover:bg-green-950/30 font-bold py-6 text-lg">
                            Jogar Novamente
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // PLAYING - Selection e Resolution (mantidos iguais ao original)
    // ... (o código das telas selection e resolution permanece o mesmo)
    // Para não ficar muito longo, mantenha o código original das telas selection e resolution

    

    // PLAYING - Selection
    if (phase === 'selection') {
        const config = DIFFICULTY_CONFIG[gameState.difficulty || difficulty];
        
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
                {/* Modal de Colapso */}
                <AnimatePresence>
                    {showCollapseInfo && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                                className="max-w-2xl w-full p-8 rounded-3xl border-2 shadow-2xl text-center bg-slate-900 border-slate-600"
                            >
                                <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
                                <h2 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">Risco de Colapso</h2>
                                <p className="text-lg text-slate-300 mb-6 font-medium leading-relaxed text-left">
                                    O colapso pode acontecer por três razões:
                                    <ul className="list-disc list-inside mt-4 space-y-2">
                                        <li><strong>Desequilíbrio População/Infraestrutura:</strong> Diferença &gt; {config.maxDifference} pontos</li>
                                        <li><strong>Déficit Habitacional:</strong> Falta de moradias = {config.maxHousingDeficit} pontos</li>
                                        <li><strong>Desemprego:</strong> Taxa de desemprego &gt; {config.maxUnemployment} pontos</li>
                                    </ul>
                                    <br/>
                                    Dificuldade: <strong className={config.color.split(' ')[0]}>{config.label}</strong> • Máximo: {config.maxScore} pts
                                </p>
                                <Button onClick={() => setShowCollapseInfo(false)} className="w-full font-black py-7 text-lg bg-blue-600 text-white hover:bg-blue-500 shadow-md">
                                    Entendi
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal de Descrição da Carta */}
                <AnimatePresence>
                    {selectedCardDescription && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setSelectedCardDescription(null)}
                        >
                            <motion.div 
                                initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="max-w-2xl w-full p-8 rounded-3xl border-2 shadow-2xl bg-slate-900 border-blue-500/50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    {selectedCardDescription.icon}
                                    <h2 className="text-2xl font-black text-white">{selectedCardDescription.title}</h2>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-4">
                                    <p className="text-blue-400 font-bold">📊 Efeito: {selectedCardDescription.effectText}</p>
                                    <p className="text-yellow-400 font-bold">💰 Custo: {selectedCardDescription.cost}M</p>
                                </div>
                                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 mb-4">
                                    <p className="text-slate-300 text-base leading-relaxed">
                                        <strong className="text-white">📖 Explicação ENEM:</strong><br/>
                                        {selectedCardDescription.fullDescription}
                                    </p>
                                </div>
                                <Button onClick={() => setSelectedCardDescription(null)} className="w-full font-black py-4 text-lg bg-blue-600 text-white hover:bg-blue-500">
                                    Fechar
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HEADER */}
                <header className="w-full flex flex-col md:flex-row justify-between items-center p-3 md:p-6 border-b border-white/10 bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50 gap-3 md:gap-4 shadow-xl md:shadow-2xl">
                    <div className="flex items-center w-full md:w-auto relative justify-center md:justify-start min-h-[40px]">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleExit} 
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full absolute left-0 md:static md:mr-3 shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex flex-col">
                                <span className="font-black text-base md:text-lg tracking-tight leading-none text-white">Gestão Urbana</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
                        <EnemHelpPanel />
                        <StatisticsPanel />
                        <div className="w-px h-6 bg-white/10 hidden md:block" />
                        <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border ${config.color}`}>
                            {config.icon}
                            <span className="font-bold text-sm">{config.label}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border ${gameState.month >= 7 ? 'bg-red-900/20 border-red-500/30 text-red-300 animate-pulse' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                            <Calendar className={`w-4 h-4 ${gameState.month >= 7 ? 'text-red-400' : 'text-blue-400'}`} />
                            <span className="font-bold text-sm">Mês {Math.min(gameState.month, maxMonths)}/{maxMonths}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-yellow-500/20">
                            <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                            <motion.span key={`budget-${gameState.budget}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-black text-sm md:text-lg text-yellow-400">{gameState.budget}M</motion.span>
                        </div>
                    </div>
                </header>

                {/* MAIN - Cards com estilo de carta */}
                <main className="flex-grow flex flex-col items-center justify-center p-3 md:p-4 relative z-10">
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                                    <BookOpen className="text-blue-400 w-6 h-6 md:w-8 md:h-8" /> Projetos do Mandato
                                </h2>
                                <p className="text-slate-400 mt-1 md:mt-2 text-base md:text-lg">
                                    {gameState.month >= 7 ? 
                                        <span className="text-red-400 font-bold">🚨 CRISE URBANA: Escolha sabiamente!</span> : 
                                        'Analise as opções e aprove 1 projeto para este mês.'}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs bg-slate-800 px-2 md:px-3 py-1 rounded-full border border-slate-700">
                                        🏠 Déficit: {gameState.housingDeficit}/{config.maxHousingDeficit}
                                    </span>
                                    <span className="text-xs bg-slate-800 px-2 md:px-3 py-1 rounded-full border border-slate-700">
                                        📚 Escolaridade: {gameState.educationLevel}/10
                                    </span>
                                    <span className="text-xs bg-slate-800 px-2 md:px-3 py-1 rounded-full border border-slate-700">
                                        🏥 Saúde: {gameState.healthIndex}/10
                                    </span>
                                    <span className="text-xs bg-slate-800 px-2 md:px-3 py-1 rounded-full border border-slate-700">
                                        📉 Desemprego: {gameState.unemployment}/{config.maxUnemployment}
                                    </span>
                                </div>
                            </div>
                            
                            <motion.div whileHover={(!canAffordAny || gameState.skipsLeft > 0) && !isMobile ? { scale: 1.05 } : {}} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    onClick={() => executeTurn(undefined, !canAffordAny)} 
                                    disabled={canAffordAny && gameState.skipsLeft <= 0}
                                    className={`font-bold py-4 md:py-8 px-4 md:px-8 rounded-2xl shadow-md md:shadow-xl text-sm md:text-lg border ${
                                        canAffordAny && gameState.skipsLeft <= 0 
                                            ? 'bg-slate-800 border-slate-700 text-slate-500'
                                            : !canAffordAny 
                                                ? 'bg-red-900/50 hover:bg-red-800/60 border-red-500 text-white' 
                                                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                                    }`}
                                >
                                    <FastForward className={`mr-2 md:mr-3 w-4 h-4 md:w-6 md:h-6 ${!canAffordAny ? 'text-white' : 'text-yellow-400'}`} /> 
                                    {!canAffordAny 
                                        ? 'Pular (Sem Verba)' 
                                        : `Poupar (${gameState.skipsLeft} restam)`
                                    }
                                </Button>
                            </motion.div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-4 md:gap-6">
                            <AnimatePresence mode="popLayout">
                                {hand.map((card, idx) => {
                                    const canAfford = gameState.budget >= card.cost;
                                    
                                    const getCardColors = () => {
                                        switch(card.type) {
                                            case 'build':
                                                return {
                                                    border: 'border-blue-500/70',
                                                    bg: 'bg-gradient-to-br from-blue-950/80 to-blue-900/50',
                                                    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
                                                    badge: 'bg-blue-950 text-blue-400 border-blue-700',
                                                    title: 'text-blue-300'
                                                };
                                            case 'policy':
                                                return {
                                                    border: 'border-purple-500/70',
                                                    bg: 'bg-gradient-to-br from-purple-950/80 to-purple-900/50',
                                                    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
                                                    badge: 'bg-purple-950 text-purple-400 border-purple-700',
                                                    title: 'text-purple-300'
                                                };
                                            case 'social':
                                                return {
                                                    border: 'border-pink-500/70',
                                                    bg: 'bg-gradient-to-br from-pink-950/80 to-pink-900/50',
                                                    glow: 'shadow-[0_0_30px_rgba(236,72,153,0.15)]',
                                                    badge: 'bg-pink-950 text-pink-400 border-pink-700',
                                                    title: 'text-pink-300'
                                                };
                                            case 'economy':
                                                return {
                                                    border: 'border-green-500/70',
                                                    bg: 'bg-gradient-to-br from-green-950/80 to-green-900/50',
                                                    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
                                                    badge: 'bg-green-950 text-green-400 border-green-700',
                                                    title: 'text-green-300'
                                                };
                                            default:
                                                return {
                                                    border: 'border-slate-500/70',
                                                    bg: 'bg-gradient-to-br from-slate-900 to-slate-800/80',
                                                    glow: '',
                                                    badge: 'bg-slate-800 text-slate-400 border-slate-700',
                                                    title: 'text-slate-300'
                                                };
                                        }
                                    };
                                    
                                    const colors = getCardColors();
                                    
                                    const getTypeIcon = () => {
                                        switch(card.type) {
                                            case 'build': return '🏗️';
                                            case 'policy': return '📋';
                                            case 'social': return '🤝';
                                            case 'economy': return '💹';
                                            default: return '📌';
                                        }
                                    };
                                    
                                    return (
                                        <motion.div
                                            key={card.id}
                                            initial={isMobile ? { opacity: 0, y: 20, rotateX: 10 } : { opacity: 0, rotateY: 90, scale: 0.8, y: 100 }}
                                            animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0, rotateX: 0 }}
                                            exit={isMobile ? { opacity: 0, scale: 0.9 } : { opacity: 0, scale: 0.8, y: -50 }}
                                            transition={isMobile ? { duration: 0.3 } : { delay: idx * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                                            whileHover={canAfford && !isMobile ? { 
                                                y: -10, 
                                                scale: 1.03,
                                                transition: { type: "spring", stiffness: 300, damping: 20 }
                                            } : {}}
                                            className={`relative flex flex-col w-[98%] max-w-[360px] md:w-full md:max-w-none mx-auto rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 ${colors.border} ${colors.bg} ${colors.glow} shadow-xl backdrop-blur-sm min-h-[420px] md:min-h-[380px] ${
                                                canAfford ? 'cursor-pointer' : 'opacity-60 grayscale-[0.5]'
                                            }`}
                                            style={{
                                                backgroundImage: `radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)`
                                            }}
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-tr-2xl md:rounded-tr-3xl pointer-events-none" />
                                            
                                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[11px] md:text-xs font-black uppercase tracking-widest px-2.5 md:px-3 py-1 md:py-1 rounded-xl border ${colors.badge} flex items-center gap-1.5 md:gap-1.5`}>
                                                        {card.icon}
                                                        <span>{getTypeIcon()} {card.type === 'build' ? 'CONSTRUÇÃO' : card.type === 'policy' ? 'POLÍTICA' : card.type === 'social' ? 'SOCIAL' : 'ECONOMIA'}</span>
                                                    </span>
                                                </div>
                                                
                                                <div className={`flex items-center gap-1 font-black text-lg md:text-2xl bg-black/40 backdrop-blur-sm px-2.5 md:px-4 py-1 md:py-1.5 rounded-xl border border-white/10 ${canAfford ? 'text-yellow-400' : 'text-red-500'}`}>
                                                    <Coins size={isMobile ? 16 : 18} className="opacity-70" /> 
                                                    <span className="text-sm md:text-xl">{card.cost}M</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-2 mb-1.5">
                                                <div className="mt-0.5 text-white/30">
                                                    {card.icon}
                                                </div>
                                                <h3 className={`text-lg md:text-xl font-black ${colors.title} leading-tight line-clamp-2 flex-1`}>
                                                    {card.title}
                                                </h3>
                                            </div>
                                            
                                            <div className={`w-12 h-0.5 rounded-full ${colors.border} mb-2.5 md:mb-3 opacity-50`} />
                                            
                                            <div className="mb-2.5 md:mb-3">
                                                <span className={`font-bold text-[11px] md:text-xs px-2.5 md:px-2.5 py-1 md:py-1 rounded-lg border bg-black/30 backdrop-blur-sm border-white/10 text-blue-300`}>
                                                    {card.effectText}
                                                </span>
                                            </div>

                                            <p className={`text-slate-400 text-sm font-medium mb-1 md:mb-4 flex-grow leading-relaxed ${
                                                isMobile && !expandedCards.has(card.id) ? 'line-clamp-2' : 'line-clamp-4'
                                            }`}>
                                                {card.explanation}
                                            </p>

                                            {isMobile && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedCards(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(card.id)) {
                                                                next.delete(card.id);
                                                            } else {
                                                                next.add(card.id);
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                    className="text-[11px] font-bold text-slate-400 hover:text-white mb-3 self-start transition-colors"
                                                >
                                                </button>
                                            )}
                                            <div className={isMobile ? "flex flex-col gap-2 mt-auto" : "flex gap-2 mt-auto"}>
                                                <Button 
                                                    onClick={() => setSelectedCardDescription(card)}
                                                    variant="outline"
                                                    className={isMobile ? "w-full flex items-center justify-center bg-black/30 backdrop-blur-sm border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl text-xs md:text-sm font-bold py-2.5 md:py-3 px-2 transition-all" : "flex-1 flex items-center justify-center bg-black/30 backdrop-blur-sm border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl text-xs md:text-sm font-bold py-2.5 md:py-3 px-2 transition-all"}
                                                >
                                                    <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" /> 
                                                    Detalhes
                                                </Button>
                                                <Button 
                                                    onClick={() => executeTurn(card)} 
                                                    disabled={!canAfford}
                                                    className={`${isMobile ? 'w-full' : 'flex-1'} font-bold rounded-xl py-2.5 md:py-3 text-xs md:text-sm transition-all active:scale-95 ${
                                                        canAfford 
                                                        ? 'bg-white hover:bg-slate-200 text-slate-900 shadow-lg shadow-white/10' 
                                                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {canAfford ? ' Aprovar' : ' Sem Verba'}
                                                </Button>
                                            </div>

                                            <div className="absolute bottom-2 right-3 text-[8px] md:text-[10px] text-white/10 font-mono">
                                                #{idx + 1}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // PLAYING - Resolution
    if (phase === 'resolution') {
        const config = DIFFICULTY_CONFIG[gameState.difficulty || difficulty];
        
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
                <AnimatePresence>
                    {pendingEvent && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                                className={`max-w-2xl w-full p-8 rounded-[2.5rem] border-2 shadow-xl md:shadow-2xl text-center ${pendingEvent.type === 'negative' ? 'bg-red-950 border-red-500' : pendingEvent.type === 'positive' ? 'bg-green-950 border-green-500' : 'bg-blue-950 border-blue-500'}`}
                            >
                                <AlertCircle className={`w-20 h-20 mx-auto mb-6 ${pendingEvent.type === 'negative' ? 'text-red-400' : pendingEvent.type === 'positive' ? 'text-green-400' : 'text-blue-400'}`} />
                                <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tight">{pendingEvent.title}</h2>
                                <p className="text-lg text-slate-300 mb-4">{pendingEvent.description}</p>
                                {pendingEvent.fullDescription && (
                                    <p className="text-base text-slate-400 mb-4 italic border-t border-slate-700 pt-4">{pendingEvent.fullDescription}</p>
                                )}
                                {pendingEvent.prevention && (
                                    <p className="text-sm text-yellow-400 mb-6">💡 Como prevenir: {pendingEvent.prevention}</p>
                                )}
                                <Button onClick={() => setPendingEvent(null)} className="w-full font-black py-7 text-lg bg-white text-slate-900 hover:bg-slate-200">
                                    Entendido
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className="w-full flex flex-col md:flex-row justify-between items-center p-3 md:p-6 border-b border-white/10 bg-[#0A1024]/90 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <span className="font-black text-lg text-white">Relatório do Mês</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.color}`}>
                            {config.icon}
                            <span className="font-bold text-sm">{config.label}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${gameState.month >= 7 ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                            <Calendar className="w-4 h-4" />
                            <span className="font-bold">Mês {Math.min(gameState.month, maxMonths)}/{maxMonths}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-xl md:shadow-2xl overflow-hidden">
                        
                        <div className="bg-slate-950 p-8 border-b border-slate-800">
                            <h2 className="text-3xl font-black text-white mb-2">📊 Relatório do Mês</h2>
                            <p className="text-slate-400">Veja as consequências das suas decisões.</p>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className={`p-6 rounded-2xl border-2 flex items-center justify-between ${difference > config.maxDifference ? 'bg-red-950/50 border-red-500' : difference >= (config.maxDifference - 5) ? 'bg-orange-950/30 border-orange-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold flex items-center gap-2">
                                            <AlertTriangle size={16}/> Nível de Erros
                                        </h3>
                                        <button 
                                            onClick={() => setShowCollapseInfo(true)} 
                                            className="bg-slate-700 text-slate-300 hover:bg-blue-500 hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-sm md:shadow-md"
                                        >
                                            ?
                                        </button>
                                    </div>
                                    <p className={`text-3xl font-black ${difference > config.maxDifference ? 'text-red-500' : difference >= (config.maxDifference - 5) ? 'text-orange-500' : 'text-white'}`}>
                                        {Math.max(0, difference)} / {config.maxDifference}
                                    </p>
                                </div>
                                {difference > config.maxDifference ? (
                                    <span className="bg-red-600 text-white font-black px-4 py-2 rounded-xl animate-bounce text-xs md:text-sm text-center">COLAPSO!<br/>Recupere!</span>
                                ) : difference >= (config.maxDifference - 5) && (
                                    <span className="bg-orange-500 text-white font-black px-4 py-2 rounded-xl animate-pulse">CRÍTICO</span>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-bold text-red-400">
                                        <span className="flex items-center gap-2"><TrendingUp size={20}/> População</span>
                                        <span>{gameState.population}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700 shadow-inner">
                                        <motion.div 
                                            className="bg-gradient-to-r from-red-600 to-red-400 h-full relative"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((gameState.population / 30) * 100, 100)}%` }}
                                            transition={{ type: 'spring', bounce: 0.3, delay: 0.1 }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-bold text-blue-400">
                                        <span className="flex items-center gap-2"><Hammer size={20}/> Infraestrutura</span>
                                        <span>{gameState.infrastructure}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700 shadow-inner">
                                        <motion.div 
                                            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full relative"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((gameState.infrastructure / 25) * 100, 100)}%` }}
                                            transition={{ type: 'spring', bounce: 0.3, delay: 0.2 }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-sm">🏠 Déficit Hab.</span>
                                            <span className={`font-bold ${gameState.housingDeficit > config.maxHousingDeficit - 5 ? 'text-red-400' : 'text-yellow-400'}`}>{gameState.housingDeficit}/{config.maxHousingDeficit}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-sm">📉 Desemprego</span>
                                            <span className={`font-bold ${gameState.unemployment > config.maxUnemployment - 3 ? 'text-red-400' : 'text-yellow-400'}`}>{gameState.unemployment}/{config.maxUnemployment}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-sm">📚 Escolaridade</span>
                                            <span className="font-bold text-blue-400">{gameState.educationLevel}/10</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-sm">🏥 Saúde</span>
                                            <span className="font-bold text-green-400">{gameState.healthIndex}/10</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 rounded-2xl p-5 space-y-3 border border-slate-800 max-h-[300px] overflow-y-auto">
                                {turnLogs.map((log, i) => (
                                    <motion.div 
                                        key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.08) }}
                                        className={`text-sm md:text-base p-3 rounded-xl border font-medium ${log.includes('⚡ EVENTO') || log.includes('EXPLOSÃO') ? 'bg-red-950/50 border-red-900/50 text-red-200' : log.includes('✅ APROVADO') ? 'bg-green-950/30 border-green-900/30 text-green-200' : log.includes('📈') || log.includes('💰') ? 'bg-blue-950/30 border-blue-900/30 text-blue-200' : 'bg-slate-800/50 border-slate-700/50 text-slate-300'}`}
                                    >
                                        {log}
                                    </motion.div>
                                ))}
                            </div>
                            
                            <Button onClick={nextMonth} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-8 text-xl rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95">
                                {gameState.month > maxMonths ? (
                                    <>Terminar o Mandato <ShieldCheck className="ml-2 w-6 h-6" /></>
                                ) : (
                                    <>Avançar para o Mês {gameState.month} <ArrowRight className="ml-2 w-6 h-6" /></>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return null;
}