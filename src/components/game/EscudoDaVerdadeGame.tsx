"use client"

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Tractor,
  Leaf,
  ZoomIn,
  X,
  TrendingUp,
  MoveRight,
  Info,
  BookOpen,
} from "lucide-react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TIPAGENS DA APLICAÇÃO ---
interface EscudoDaVerdadeProps {
  playerName: string;
  onComplete?: () => void;
  onSaveScore?: (score: number) => void;
}

type CardType = "truth" | "myth";

interface CardItem {
  id: string;
  text: string;
  type: CardType;
  explanation: string;
}

// TIPAGEM DAS FASES
type PhaseType = {
  id: number;
  title: string;
  imageSrc: string;
  cards: CardItem[];
};

// --- DADOS DA FASE 1 (15 Cartas: Agricultura Familiar) ---
const INITIAL_CARDS: CardItem[] = [
  {
    id: "c1",
    text: "Produz cerca de 70% da comida que chega à nossa mesa.",
    type: "truth",
    explanation: "Correto! A agricultura familiar é a base do abastecimento alimentar interno do Brasil.",
  },
  {
    id: "c2",
    text: "Absorve a maior parte da mão de obra no campo.",
    type: "truth",
    explanation: "Exato! Por ser menos mecanizada que o agronegócio, ela gera muito mais empregos diretos.",
  },
  {
    id: "c3",
    text: "Garante a diversidade de alimentos no mercado interno.",
    type: "truth",
    explanation: "Correto! Enquanto o agronegócio foca em monocultura (soja, milho), a familiar planta feijão, mandioca, hortaliças, etc.",
  },
  {
    id: "c4",
    text: "É a principal fonte de renda para a maioria dos municípios pequenos.",
    type: "truth",
    explanation: "Correto! A economia de muitas cidades do interior gira em torno do pequeno produtor.",
  },
  {
    id: "c5",
    text: "Preserva mais a biodiversidade local que o agronegócio.",
    type: "truth",
    explanation: "Exato! O uso de policulturas e técnicas tradicionais agride menos o meio ambiente.",
  },
  {
    id: "c6",
    text: "Sofre com a falta de assistência técnica e crédito rural.",
    type: "truth",
    explanation: "Correto! Historicamente, o Estado brasileiro privilegia os grandes latifundiários nas políticas de crédito.",
  },
  {
    id: "c7",
    text: "Utiliza predominantemente mão de obra do próprio núcleo familiar.",
    type: "truth",
    explanation: "Correto! A gestão e o trabalho são divididos entre os membros da família.",
  },
  {
    id: "c8",
    text: "Tem forte ligação com a posse histórica e cultural da terra.",
    type: "truth",
    explanation: "Exato! Muitos pequenos produtores têm uma relação de ancestralidade com o lote que cultivam.",
  },
  {
    id: "c9",
    text: "É essencial para a segurança alimentar do país.",
    type: "truth",
    explanation: "Perfeito! Sem a agricultura familiar, o Brasil enfrentaria escassez de alimentos básicos.",
  },
  {
    id: "c10",
    text: "Recebe a maior fatia dos financiamentos do governo.",
    type: "myth",
    explanation: "Mito! O agronegócio exportador é quem recebe a esmagadora maioria do crédito (ex: Plano Safra).",
  },
  {
    id: "c11",
    text: "Seu foco principal é a exportação de commodities para a Ásia.",
    type: "myth",
    explanation: "Mito! O foco da agricultura familiar é o mercado interno. Quem exporta commodities é o grande agronegócio.",
  },
  {
    id: "c12",
    text: "Ocupa as maiores e mais extensas propriedades de terra do Brasil.",
    type: "myth",
    explanation: "Mito! Eles ocupam a menor parcela das terras (minifúndios). A maior parte das terras férteis está nos latifúndios.",
  },
  {
    id: "c13",
    text: "É altamente mecanizada e utiliza drones em larga escala.",
    type: "myth",
    explanation: "Mito! A agricultura familiar costuma ter baixo nível tecnológico devido à falta de capital.",
  },
  {
    id: "c14",
    text: "Planta principalmente soja para a fabricação de ração.",
    type: "myth",
    explanation: "Mito! O foco da agricultura familiar é a comida (arroz, feijão, alface). A soja é o foco do latifúndio.",
  },
  {
    id: "c15",
    text: "É responsável pelo grande desmatamento da Amazônia.",
    type: "myth",
    explanation: "Mito! O grande desmatamento é causado pelo avanço da fronteira agrícola (gado e soja) dos grandes produtores.",
  },
];

// --- DADOS DA FASE 2 (15 Cartas: Agronegócio) ---
const AGRONEGOCIO_CARDS: CardItem[] = [
  {
    id: "f2-v1",
    text: "Baseia-se na monocultura de 'commodities' como soja e milho.",
    type: "truth",
    explanation: "Correto! O agronegócio foca em plantar um único produto em vasta escala para o mercado internacional."
  },
  {
    id: "f2-v2",
    text: "Foco absoluto no mercado externo (exportação) e ração animal.",
    type: "truth",
    explanation: "Correto! A maior parte da produção não vai para o prato do brasileiro, mas sim para navios cargueiros."
  },
  {
    id: "f2-v3",
    text: "Alta mecanização, gerando pouquíssimos empregos por hectare.",
    type: "truth",
    explanation: "Correto! O uso de tratores, drones e colheitadeiras substituiu massivamente o trabalho braçal no campo."
  },
  {
    id: "f2-v4",
    text: "Recebe a maior parte dos financiamentos e subsídios do Plano Safra.",
    type: "truth",
    explanation: "Correto! Apesar de empregar menos, o grande capital atrai a esmagadora maioria do crédito agrícola do governo."
  },
  {
    id: "f2-v5",
    text: "Apresenta alta concentração de terras (Latifúndios).",
    type: "truth",
    explanation: "Correto! O modelo é sustentado por imensas propriedades nas mãos de poucos donos ou empresas."
  },
  {
    id: "f2-v6",
    text: "Avança intensamente sobre as fronteiras agrícolas do Cerrado e Amazônia.",
    type: "truth",
    explanation: "Correto! A expansão da soja e da pecuária é o principal vetor de ocupação e desmatamento nestes biomas."
  },
  {
    id: "f2-v7",
    text: "Integra o campo com a indústria e bolsas de valores (Complexo Agroindustrial).",
    type: "truth",
    explanation: "Correto! Hoje, o campo não está isolado. Ele depende de laboratórios, indústrias químicas e do mercado financeiro."
  },
  {
    id: "f2-v8",
    text: "Utiliza intensivamente agrotóxicos e fertilizantes químicos.",
    type: "truth",
    explanation: "Correto! O Brasil é um dos maiores consumidores de defensivos agrícolas do mundo devido às monoculturas."
  },
  {
    id: "f2-v9",
    text: "Possui forte influência política, atuando através da 'Bancada Ruralista'.",
    type: "truth",
    explanation: "Correto! O setor possui forte representação no Congresso Nacional para aprovar leis que favoreçam a expansão agrícola."
  },
  {
    id: "f2-m1",
    text: "É o setor responsável por garantir a comida barata na mesa dos brasileiros.",
    type: "myth",
    explanation: "Mito! O agronegócio foca na exportação de commodities. Quem alimenta o Brasil no dia a dia é a agricultura familiar."
  },
  {
    id: "f2-m2",
    text: "Protege ativamente a biodiversidade e evita o desmatamento.",
    type: "myth",
    explanation: "Cuidado! A expansão da fronteira agrícola é a principal causa histórica do desmatamento de biomas brasileiros."
  },
  {
    id: "f2-m3",
    text: "É formado majoritariamente por pequenas cooperativas de camponeses.",
    type: "myth",
    explanation: "Incorreto! O agronegócio é amplamente dominado por grandes latifundiários e multinacionais (tradings)."
  },
  {
    id: "f2-m4",
    text: "Absorve a maior parte da mão de obra desempregada das cidades.",
    type: "myth",
    explanation: "Erro! Por ser extremamente mecanizado e tecnológico, o agronegócio gera muito poucos empregos diretos no campo."
  },
  {
    id: "f2-m5",
    text: "Resolveu o problema da desigualdade na distribuição de terras no Brasil.",
    type: "myth",
    explanation: "Mito! Pelo contrário, o avanço do agronegócio moderno intensificou a concentração fundiária e os conflitos no campo."
  },
  {
    id: "f2-m6",
    text: "Prioriza o cultivo diversificado (policultura) para evitar o esgotamento do solo.",
    type: "myth",
    explanation: "Incorreto! A base do agronegócio brasileiro é a monocultura (plantar um único item em áreas gigantescas)."
  }
];

// --- DADOS DA FASE 3 (15 Cartas: Estrutura Fundiária) ---
const ESTRUTURA_FUNDIARIA_CARDS: CardItem[] = [
  {
    id: "f3-v1",
    text: "A Lei de Terras (1850) determinou a compra como única forma de acesso à terra pública.",
    type: "truth",
    explanation: "Correto! Isso impediu que pessoas pobres, indígenas e ex-escravos tivessem acesso legal à terra, consolidando o latifúndio."
  },
  {
    id: "f3-v2",
    text: "O Brasil possui um dos maiores Índices de Gini agrário do mundo.",
    type: "truth",
    explanation: "Correto! O Índice de Gini mede a desigualdade, e no campo brasileiro ele é altíssimo, com muita terra nas mãos de muito poucos."
  },
  {
    id: "f3-v3",
    text: "A raiz da concentração fundiária remonta ao sistema de Capitanias Hereditárias e Sesmarias.",
    type: "truth",
    explanation: "Correto! Desde o período colonial, a Coroa Portuguesa distribuía extensas faixas de terra apenas a uma pequena elite."
  },
  {
    id: "f3-v4",
    text: "A 'Revolução Verde' (modernização do campo) agravou a concentração de terras no Brasil.",
    type: "truth",
    explanation: "Correto! Apenas os grandes proprietários tinham capital para comprar os novos tratores e adubos, engolindo os pequenos."
  },
  {
    id: "f3-v5",
    text: "Os minifúndios são a grande maioria das propriedades, mas ocupam uma minoria da área total.",
    type: "truth",
    explanation: "Correto! Quase 90% das propriedades rurais são pequenas, mas juntas não somam nem 25% da área agrícola total do país."
  },
  {
    id: "f3-v6",
    text: "Latifúndios mantidos ociosos servem frequentemente para especulação imobiliária.",
    type: "truth",
    explanation: "Correto! Muitos grandes proprietários mantêm terras improdutivas apenas à espera que elas valorizem para as revenderem."
  },
  {
    id: "f3-v7",
    text: "A profunda desigualdade na distribuição de terras é a causa principal dos conflitos no campo.",
    type: "truth",
    explanation: "Correto! A luta por terras improdutivas que não cumprem a sua função social é a raiz dos movimentos agrários."
  },
  {
    id: "f3-v8",
    text: "A expansão incontrolada dos grandes latifúndios monocultores impulsionou o êxodo rural.",
    type: "truth",
    explanation: "Correto! Sem conseguir competir ou perdendo as suas terras, milhões de camponeses foram forçados a migrar para as cidades."
  },
  {
    id: "f3-v9",
    text: "A Constituição determina que propriedades que não cumprem a 'função social' podem ser desapropriadas.",
    type: "truth",
    explanation: "Correto! A lei prevê que a terra tem de ser produtiva e respeitar o meio ambiente para não ser alvo de Reforma Agrária."
  },
  {
    id: "f3-m1",
    text: "A abolição da escravatura (1888) incluiu a doação de terras para a integração dos ex-escravos.",
    type: "myth",
    explanation: "Mito absoluto! Os ex-escravos foram libertos sem qualquer indemnização, acesso à terra ou políticas de integração, sendo marginalizados."
  },
  {
    id: "f3-m2",
    text: "A Lei de Terras de 1850 foi o primeiro grande projeto de Reforma Agrária do Império.",
    type: "myth",
    explanation: "Erro! Foi exatamente o contrário. A lei dificultou o acesso à terra para proteger os interesses dos grandes barões do café."
  },
  {
    id: "f3-m3",
    text: "A estrutura fundiária brasileira atual é considerada equilibrada e igualitária pela ONU.",
    type: "myth",
    explanation: "Incorreto! A nossa estrutura fundiária é reconhecida internacionalmente como uma das mais desiguais e concentradas do planeta."
  },
  {
    id: "f3-m4",
    text: "Os pequenos produtores (minifúndios) ocupam a maior parte das terras agricultáveis do país.",
    type: "myth",
    explanation: "Erro clássico do ENEM! Eles são a maioria em *número de propriedades*, mas a terra que ocupam é minúscula em comparação com os latifúndios."
  },
  {
    id: "f3-m5",
    text: "A chegada da tecnologia ao campo barateou a terra e facilitou a compra pelos mais pobres.",
    type: "myth",
    explanation: "Mito! A mecanização encareceu a produção e o valor da terra, forçando os pequenos agricultores a venderem as suas propriedades aos maiores."
  },
  {
    id: "f3-m6",
    text: "A grilagem de terras (roubo de terras públicas com documentos falsos) é uma prática extinta no Brasil.",
    type: "myth",
    explanation: "Incorreto! A grilagem continua a ser uma prática criminosa muito comum, especialmente nas novas fronteiras agrícolas como o MATOPIBA e a Amazónia."
  }
];

// --- DADOS DA FASE 4 (15 Cartas: O Avanço do MATOPIBA) ---
const MATOPIBA_CARDS: CardItem[] = [
  {
    id: "f4-v1",
    text: "A sigla MATOPIBA refere-se a áreas dos estados do Maranhão, Tocantins, Piauí e Bahia.",
    type: "truth",
    explanation: "Correto! É a principal e mais recente fronteira de expansão agrícola do Brasil, localizada no encontro do Nordeste com o Norte."
  },
  {
    id: "f4-v2",
    text: "A expansão ocorre predominantemente sobre a vegetação nativa do bioma Cerrado.",
    type: "truth",
    explanation: "Correto! O Cerrado é o bioma mais atingido e desmatado pelo avanço recente das plantações de soja nesta região."
  },
  {
    id: "f4-v3",
    text: "Gera graves conflitos por terra com comunidades tradicionais, como indígenas e quilombolas.",
    type: "truth",
    explanation: "Correto! A expansão dos latifúndios e a grilagem frequentemente invadem e desapropriam territórios historicamente ocupados."
  },
  {
    id: "f4-v4",
    text: "É impulsionada pelo cultivo altamente mecanizado da soja para exportação.",
    type: "truth",
    explanation: "Correto! O motor desta fronteira agrícola é o agronegócio de exportação, usando alta tecnologia e genética avançada."
  },
  {
    id: "f4-v5",
    text: "Causa profundas alterações no ciclo das águas e esgotamento de recursos hídricos locais.",
    type: "truth",
    explanation: "Correto! O desmatamento das raízes profundas do Cerrado e a irrigação intensiva afetam rios, aquíferos e as chuvas."
  },
  {
    id: "f4-v6",
    text: "Promove uma intensa concentração de terras nas mãos de grandes empresas.",
    type: "truth",
    explanation: "Correto! O modelo do MATOPIBA não é feito por pequenos agricultores, mas por empresas capitalizadas que compram vastas áreas."
  },
  {
    id: "f4-v7",
    text: "Aumenta o PIB da região, mas a riqueza gerada é altamente concentrada e excludente.",
    type: "truth",
    explanation: "Correto! Os números económicos globais crescem, mas isso não se traduz em desenvolvimento social ou diminuição da pobreza local."
  },
  {
    id: "f4-v8",
    text: "Exige pesados investimentos em infraestrutura logística (ferrovias e portos) para escoamento.",
    type: "truth",
    explanation: "Correto! Obras como a Ferrovia Norte-Sul e o Porto do Itaqui (MA) são fundamentais para levar as commodities para o exterior."
  },
  {
    id: "f4-v9",
    text: "A grilagem de terras (falsificação de documentos de posse) é um crime frequente nesta nova fronteira.",
    type: "truth",
    explanation: "Correto! A rápida valorização da terra atrai grileiros que roubam terras públicas e expulsam pequenos camponeses."
  },
  {
    id: "f4-m1",
    text: "Essa expansão agrícola ocorre de forma pacífica e resolve os problemas sociais da região.",
    type: "myth",
    explanation: "Mito! O MATOPIBA é hoje uma das áreas com maior índice de violência, mortes e conflitos agrários do Brasil."
  },
  {
    id: "f4-m2",
    text: "O avanço no MATOPIBA é focado na produção orgânica de alimentos para o mercado interno.",
    type: "myth",
    explanation: "Incorreto! O foco absoluto é a monocultura de commodities (principalmente soja, milho e algodão) voltada para o mercado internacional."
  },
  {
    id: "f4-m3",
    text: "É um processo que distribui terras de forma igualitária para camponeses sem-terra.",
    type: "myth",
    explanation: "Erro grave! Ocorre exatamente o oposto: o aumento do preço da terra expulsa os pequenos produtores e concentra ainda mais as propriedades."
  },
  {
    id: "f4-m4",
    text: "A expansão ocorre sem causar desmatamento, aproveitando apenas pastagens já degradadas.",
    type: "myth",
    explanation: "Cuidado! O MATOPIBA concentra as maiores taxas de desmatamento de vegetação nativa e intacta do Cerrado dos últimos anos."
  },
  {
    id: "f4-m5",
    text: "Gera milhões de empregos diretos para a população local, acabando com o desemprego rural.",
    type: "myth",
    explanation: "Mito! Por ser altamente mecanizada, a produção de soja exige pouquíssima mão de obra, gerando poucos empregos para os habitantes locais."
  },
  {
    id: "f4-m6",
    text: "O MATOPIBA localiza-se na região Sul do Brasil, onde o clima frio favorece o plantio da soja.",
    type: "myth",
    explanation: "Erro geográfico clássico do ENEM! O MATOPIBA localiza-se no encontro do Nordeste com o Norte (Maranhão, Tocantins, Piauí, Bahia)."
  }
];

// --- DADOS DA FASE 5 (15 Cartas: Reforma Agrária / Função Social da Terra) ---
const REFORMA_AGRARIA_CARDS: CardItem[] = [
  {
    id: "f5-v1",
    text: "A Constituição determina que toda a propriedade rural deve cumprir a sua Função Social.",
    type: "truth",
    explanation: "Correto! A lei exige que a terra seja produtiva, respeite o meio ambiente e as leis trabalhistas."
  },
  {
    id: "f5-v2",
    text: "Grandes latifúndios improdutivos podem ser desapropriados pelo Estado para Reforma Agrária.",
    type: "truth",
    explanation: "Correto! Se a terra estiver abandonada ou servir apenas para especulação, o governo pode intervir."
  },
  {
    id: "f5-v3",
    text: "Propriedades altamente produtivas não podem ser desapropriadas para fins de Reforma Agrária.",
    type: "truth",
    explanation: "Correto! A Constituição protege a propriedade privada que está a gerar riqueza e a cumprir a sua função social."
  },
  {
    id: "f5-v4",
    text: "A desapropriação de terras improdutivas garante uma indemnização ao proprietário original.",
    type: "truth",
    explanation: "Correto! O Estado não 'rouba' a terra; o dono é indemnizado através de Títulos da Dívida Agrária."
  },
  {
    id: "f5-v5",
    text: "A Reforma Agrária visa diminuir a extrema concentração de terras e a pobreza no campo.",
    type: "truth",
    explanation: "Correto! O objetivo principal é democratizar o acesso à terra para quem nela quer trabalhar."
  },
  {
    id: "f5-v6",
    text: "Os assentamentos rurais são focados, na sua maioria, na agricultura familiar e na policultura.",
    type: "truth",
    explanation: "Correto! As famílias assentadas produzem grande parte dos alimentos que abastecem os mercados locais."
  },
  {
    id: "f5-v7",
    text: "Terras com trabalho escravo ou cultivo de drogas ilegais são confiscadas sem indemnização.",
    type: "truth",
    explanation: "Correto! Nesses casos de crimes graves, a terra é expropriada (confiscada) e o dono perde o direito ao dinheiro."
  },
  {
    id: "f5-v8",
    text: "Movimentos sociais (como o MST) pressionam o Estado para que a lei da Função Social seja cumprida.",
    type: "truth",
    explanation: "Correto! As ocupações de terras ociosas são uma forma de pressão política para forçar o governo a realizar os assentamentos."
  },
  {
    id: "f5-v9",
    text: "Uma verdadeira Reforma Agrária exige também acesso a crédito, tecnologia e infraestrutura.",
    type: "truth",
    explanation: "Correto! Não basta apenas entregar o lote de terra; o agricultor precisa de estradas e financiamento para conseguir produzir."
  },
  {
    id: "f5-m1",
    text: "Qualquer terra privada no Brasil, mesmo as que produzem muito, pode ser tomada pelo governo.",
    type: "myth",
    explanation: "Mito! Terras produtivas que cumprem a lei são protegidas pela Constituição e não podem ser desapropriadas para Reforma Agrária."
  },
  {
    id: "f5-m2",
    text: "A Função Social da terra é cumprida apenas com o pagamento dos impostos rurais (ITR) em dia.",
    type: "myth",
    explanation: "Erro! Pagar impostos não chega. A terra tem de ser economicamente útil, proteger a natureza e respeitar os trabalhadores."
  },
  {
    id: "f5-m3",
    text: "A Reforma Agrária tem como objetivo acabar com o agronegócio e as exportações do Brasil.",
    type: "myth",
    explanation: "Incorreto! O alvo não é a terra produtiva do agronegócio, mas sim o latifúndio improdutivo mantido apenas para especulação imobiliária."
  },
  {
    id: "f5-m4",
    text: "O proprietário de um latifúndio desapropriado perde a terra sem receber qualquer valor financeiro.",
    type: "myth",
    explanation: "Mito! A lei garante a indemnização do valor da terra (em títulos públicos) e das benfeitorias úteis (em dinheiro)."
  },
  {
    id: "f5-m5",
    text: "Manter terras ociosas e vazias à espera de valorização imobiliária é uma atividade produtiva para a lei.",
    type: "myth",
    explanation: "Erro grave! A especulação imobiliária com terras rurais é exatamente o que viola a Função Social da propriedade."
  },
  {
    id: "f5-m6",
    text: "As famílias que recebem terras da Reforma Agrária podem vendê-las no dia seguinte a grandes empresas.",
    type: "myth",
    explanation: "Mito! Os beneficiários não recebem a escritura definitiva imediatamente. Não podem vender ou arrendar o lote durante anos."
  }
];

// --- ESTRUTURA DE FASES (Array que contém todas as fases) ---
const PHASES: PhaseType[] = [
  {
    id: 1,
    title: "Agricultura Familiar",
    imageSrc: "/images/geografia/agricultura-familiar.png",
    cards: INITIAL_CARDS
  },
  {
    id: 2,
    title: "A Máquina de Exportação (Agronegócio)",
    imageSrc: "/images/geografia/agronegocio.png",
    cards: AGRONEGOCIO_CARDS
  },
  {
    id: 3,
    title: "A Herança Desigual (Estrutura Fundiária)",
    imageSrc: "/images/geografia/estrutura-fundiaria.png",
    cards: ESTRUTURA_FUNDIARIA_CARDS
  },
  {
    id: 4,
    title: "O Avanço do MATOPIBA",
    imageSrc: "/images/geografia/matopiba.png",
    cards: MATOPIBA_CARDS
  },
  {
    id: 5,
    title: "O Alvo da Lei (Função Social e Reforma Agrária)",
    imageSrc: "/images/geografia/reforma-agraria.png",
    cards: REFORMA_AGRARIA_CARDS
  }
];

export default function EscudoDaVerdadeGame({
  playerName,
  onComplete,
  onSaveScore,
}: EscudoDaVerdadeProps) {
  
  // Embaralhar as fases ao iniciar o jogo para que apareçam de forma aleatória a cada nova jogada
  const [gamePhases] = useState<PhaseType[]>(() => [...PHASES].sort(() => Math.random() - 0.5));

  // --- ESTADOS DO JOGO ---
  const [status, setStatus] = useState<"intro" | "playing" | "phase_transition" | "victory">("intro");
  
  // ESTADO DA FASE (Lê a partir das fases aleatórias)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const currentPhase = gamePhases[currentPhaseIndex];

  const [score, setScore] = useState(0);
  const [availableCards, setAvailableCards] = useState<CardItem[]>([]);
  const [shieldedCards, setShieldedCards] = useState<CardItem[]>([]);
  const [dragErrorCardId, setDragErrorCardId] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });

  const [flashRed, setFlashRed] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    desc: string;
  } | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<{
    id: number;
    x: number;
    y: number;
    points: number;
  } | null>(null);
  
  // Estados para os modais
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEnemModal, setShowEnemModal] = useState(false);

  // Referências
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Inicializa o baralho baseando-se na FASE ATUAL
  useEffect(() => {
    // Se o jogo já acabou, não faz nada para evitar erros de renderização
    if (!currentPhase) return;
    setAvailableCards([...currentPhase.cards].sort(() => Math.random() - 0.5));
    setShieldedCards([]); // Limpa a tela para a nova fase
  }, [currentPhaseIndex, currentPhase]);

  // 2. Deteta Condição de Vitória (Fim do Baralho da fase atual)
  useEffect(() => {
    if (status === "playing" && availableCards.length === 0) {
      if (currentPhaseIndex < gamePhases.length - 1) {
        setTimeout(() => setStatus("phase_transition"), 800);
      } else {
        setTimeout(() => setStatus("victory"), 800);
      }
    }
  }, [availableCards.length, status, currentPhaseIndex, gamePhases.length]);

  // 3. Sistema de Punição Educativa
  const triggerError = (title: string, desc: string, cardId: string) => {
    setFlashRed(true);
    setTimeout(() => setFlashRed(false), 300);
    setAlertMessage({ title, desc });
    setScore((prev) => Math.max(0, prev - 10));
    
    setDragErrorCardId(cardId);
    setTimeout(() => setDragErrorCardId(null), 400);
  };

  // 4. Sistema de Feedback Visual para acertos
  const triggerSuccess = (points: number, clientX: number, clientY: number) => {
    setFlashGreen(true);
    setTimeout(() => setFlashGreen(false), 300);
    const id = Date.now();
    setFloatingPoints({ id, x: clientX, y: clientY, points });
    setTimeout(() => setFloatingPoints(null), 800);
  };

  // 5. Mostrar erro de área inválida
  const showAreaError = (x: number, y: number) => {
    setAreaError({ show: true, x, y });
    setTimeout(() => setAreaError({ show: false, x: 0, y: 0 }), 800);
  };

  // --- FUNÇÃO PARA PROCESSAR O DROP ---
  const processDrop = (card: CardItem, dropX: number, dropY: number, offsetX: number, velocityX: number): boolean => {
    if (!dropzoneRef.current) return false;

    const dropzoneRect = dropzoneRef.current.getBoundingClientRect();

    const isInsideCenter =
      dropX >= dropzoneRect.left - 150 &&
      dropX <= dropzoneRect.right + 150 &&
      dropY >= dropzoneRect.top - 150 &&
      dropY <= dropzoneRect.bottom + 150;

    const isSwipeValid = (Math.abs(offsetX) > 80 || Math.abs(velocityX) > 500) && !isInsideCenter;

    if (card.type === "truth") {
      if (isInsideCenter) {
        setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));
        setShieldedCards((prev) => [...prev, card]);
        setScore((prev) => prev + 50);
        triggerSuccess(50, dropX, dropY);
        return true;
      } else {
        triggerError("Proteja a verdade!", "Arraste a VERDADE para perto do ESCUDO no centro da tela!", card.id);
        showAreaError(dropX, dropY);
        return false;
      }
    } 
    else {
      if (isSwipeValid) {
        setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));
        setScore((prev) => prev + 25);
        triggerSuccess(25, dropX, dropY);
        return true;
      } 
      else {
        if (isInsideCenter) {
          triggerError("Isso é um Mito!", "MITOS NÃO podem ser protegidos pelo escudo! Faça um SWIPE para o LADO (fora do escudo) para descartar.", card.id);
        } else {
          triggerError("Descartar Mito!", "Para descartar um MITO, faça um SWIPE rápido para a ESQUERDA ou DIREITA (fora do escudo)!", card.id);
        }
        showAreaError(dropX, dropY);
        return false;
      }
    }
  };

  if (!currentPhase) return null; // Prevenção extra enquanto carrega as fases

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden overflow-y-auto">
      {/* Efeitos visuais */}
      <AnimatePresence>
        {flashRed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600/30 z-[200] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flashGreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500/20 z-[200] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {areaError.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed z-[300] bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap pointer-events-none"
            style={{ left: areaError.x - 80, top: areaError.y - 40 }}
          >
            ⚠️ Área inválida!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {floatingPoints && (
          <motion.div
            key={floatingPoints.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -80, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed z-[300] text-2xl font-black flex items-center gap-1 pointer-events-none drop-shadow-lg"
            style={{ left: floatingPoints.x, top: floatingPoints.y }}
          >
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400">+{floatingPoints.points}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CABEÇALHO */}
      <header className="bg-[#0A1024]/95 border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center z-50 shadow-md sticky top-0 flex-shrink-0">
        <button
          onClick={() => onComplete && onComplete()}
          className="flex items-center gap-3 transition-transform active:scale-95 group"
        >
          <div className="bg-amber-600 p-2 rounded-full shadow-lg group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl hidden md:inline">Fase {currentPhaseIndex + 1}: Geografia Agrária</span>
          <span className="font-black text-xl md:hidden">Fase {currentPhaseIndex + 1}</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
            Fase {currentPhaseIndex + 1}/{gamePhases.length}
          </div>
          
          <button
  onClick={() => setShowEnemModal(true)}
  className="hidden md:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-full px-4 py-2 transition-all duration-200 shadow-md"
  title="O que cai no ENEM sobre Geografia Agrária?"
>
  <HelpCircle className="w-4 h-4" />
  <span className="text-sm font-semibold">
    O que cai no ENEM?
  </span>
</button>
          
          <button
            onClick={() => setShowEnemModal(true)}
            className="md:hidden bg-amber-500/20 hover:bg-amber-500/30 p-2 rounded-xl transition-all duration-200 group border border-amber-500/30"
            title="O que cai no ENEM sobre Geografia Agrária?"
          >
            <BookOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={() => setShowInfoModal(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 p-2 rounded-xl transition-all duration-200 group border border-amber-500/30"
            title="Informações sobre o Tema"
          >
            <Info className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2 bg-amber-600/10 px-4 py-2 rounded-xl border border-amber-500/20 shadow-inner">
            <span className="text-xs font-bold text-amber-400 uppercase">Score:</span>
            <motion.span key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-black text-amber-400">
              {score} PTS
            </motion.span>
          </div>
        </div>
      </header>

      {/* MODAL "O QUE CAI NO ENEM?" */}
      <AnimatePresence>
        {showEnemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setShowEnemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="max-w-2xl w-full bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-amber-400" />
                  <h2 className="text-2xl md:text-3xl font-black text-white">O que cai no ENEM?</h2>
                </div>
                <button
                  onClick={() => setShowEnemModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6 text-slate-300">
                <div className="bg-amber-950/30 p-5 rounded-2xl border border-amber-500/30">
                  <h3 className="text-amber-400 font-bold text-lg mb-3 flex items-center gap-2">
                    📚 Por que estudar isso?
                  </h3>
                  <p className="leading-relaxed">
                    A <strong className="text-amber-300">Geografia Agrária</strong> e a <strong className="text-amber-300">Geopolítica</strong> são temas fortíssimos na prova de Ciências Humanas do ENEM. 
                    O ENEM quer que você desenvolva a <strong className="text-amber-300">Visão Sistêmica</strong>: a capacidade de entender como tensões mundiais, 
                    clima, medidas do governo e a ação de grandes indústrias afetam o meio ambiente e a sociedade.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                  <h3 className="text-amber-400 font-bold text-lg mb-3">⚠️ Tópicos Frequentes na Prova:</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 text-lg">🏭</span>
                      <div>
                        <strong className="text-amber-300">Desastres Socioambientais:</strong>
                        <span className="text-slate-300 ml-1">Brumadinho e Mariana são muito cobrados para discutir a negligência corporativa, falhas na fiscalização do Estado e destruição de bacias hidrográficas.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 text-lg">🌡️</span>
                      <div>
                        <strong className="text-amber-300">Crises Climáticas e Agronegócio:</strong>
                        <span className="text-slate-300 ml-1">Como o aquecimento global afeta a produção de alimentos no Brasil, elevando os preços internos.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 text-lg">🛡️</span>
                      <div>
                        <strong className="text-amber-300">Protecionismo:</strong>
                        <span className="text-slate-300 ml-1">O papel do Estado em taxar importações para proteger a indústria nacional e o impacto no cidadão.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 text-lg">🤖</span>
                      <div>
                        <strong className="text-amber-300">Tecnologia e Desemprego:</strong>
                        <span className="text-slate-300 ml-1">A revolução da Inteligência Artificial causando "desemprego estrutural", exigindo requalificação profissional.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 text-center">
                  <p className="text-sm text-emerald-300">
                    💡 <strong>Dica de Mestre:</strong> Ao jogar, você estará exercitando exatamente o raciocínio de 
                    <strong className="text-emerald-200"> "causa e consequência" </strong> 
                    que as questões do ENEM exigem!
                  </p>
                </div>

                <Button
                  onClick={() => setShowEnemModal(false)}
                  className="w-full bg-amber-600 hover:bg-amber-500 font-bold"
                >
                  Entendi! Vamos jogar 🎮
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE INFORMAÇÕES ( ! ) DINÂMICO PARA CADA FASE */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <h2 className="text-2xl md:text-3xl font-black text-white">{currentPhase.title}</h2>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6 text-slate-300">
                {currentPhase.id === 1 ? (
                  // CONTEÚDO DA FASE 1 (Agricultura Familiar)
                  <>
                    <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        O que é Agricultura Familiar?
                      </h3>
                      <p className="leading-relaxed">
                        A agricultura familiar é um modelo de produção rural onde a gestão, a propriedade e a maior parte do trabalho 
                        são realizados por pessoas que possuem laços de parentesco ou convivência. No Brasil, ela é responsável por 
                        garantir a segurança alimentar da população, produzindo a maior parte dos alimentos que chegam à mesa dos brasileiros.
                      </p>
                    </div>

                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3">✅ Principais CARACTERÍSTICAS (Verdades):</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">🌱 <span><strong>Abastecimento interno:</strong> Produz cerca de 70% da comida consumida no Brasil</span></li>
                        <li className="flex items-start gap-2">👨‍🌾 <span><strong>Geração de empregos:</strong> Absorve a maior parte da mão de obra no campo</span></li>
                        <li className="flex items-start gap-2">🥬 <span><strong>Diversidade alimentar:</strong> Cultiva feijão, mandioca, hortaliças, frutas, etc.</span></li>
                        <li className="flex items-start gap-2">🏘️ <strong>Economia local:</strong> Principal fonte de renda de milhares de municípios pequenos</li>
                        <li className="flex items-start gap-2">🌳 <strong>Sustentabilidade:</strong> Preserva mais a biodiversidade que o agronegócio</li>
                        <li className="flex items-start gap-2">⚠️ <strong>Desafios:</strong> Sofre com falta de assistência técnica e crédito rural</li>
                        <li className="flex items-start gap-2">👪 <strong>Mão de obra familiar:</strong> Trabalho dividido entre os membros da família</li>
                      </ul>
                    </div>

                    <div className="bg-red-950/30 p-5 rounded-2xl border border-red-500/30">
                      <h3 className="text-red-400 font-bold text-lg mb-3">❌ Principais MITOS sobre Agricultura Familiar:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">💰 <span><strong>Financiamento:</strong> NÃO recebe a maior fatia dos financiamentos (quem recebe é o agronegócio)</span></li>
                        <li className="flex items-start gap-2">📦 <span><strong>Exportação:</strong> NÃO foca em exportação de commodities</span></li>
                        <li className="flex items-start gap-2">🏞️ <span><strong>Tamanho da terra:</strong> NÃO ocupa as maiores propriedades (são minifúndios)</span></li>
                        <li className="flex items-start gap-2">🤖 <span><strong>Tecnologia:</strong> NÃO é altamente mecanizada (baixo nível tecnológico)</span></li>
                      </ul>
                    </div>
                  </>
                ) : currentPhase.id === 2 ? (
                  // CONTEÚDO DA FASE 2 (Agronegócio)
                  <>
                    <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <Tractor className="w-5 h-5" />
                        O que é o Agronegócio?
                      </h3>
                      <p className="leading-relaxed">
                        O agronegócio (ou <em>agribusiness</em>) é uma rede complexa que envolve desde a produção no campo até à indústria, laboratórios e mercado financeiro. No Brasil, baseia-se na produção em larga escala de "commodities" (como soja, milho e carne) focada principalmente na exportação e no lucro.
                      </p>
                    </div>

                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3">✅ Principais CARACTERÍSTICAS (Verdades):</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">🌍 <span><strong>Exportação:</strong> Foco absoluto no mercado externo e ração animal</span></li>
                        <li className="flex items-start gap-2">🚜 <span><strong>Alta mecanização:</strong> Usa muita tecnologia e gera POUCOS empregos diretos</span></li>
                        <li className="flex items-start gap-2">🗺️ <span><strong>Latifúndios:</strong> Baseado na concentração de grandes extensões de terra</span></li>
                        <li className="flex items-start gap-2">🧪 <span><strong>Agroquímicos:</strong> Uso intensivo de defensivos e fertilizantes</span></li>
                        <li className="flex items-start gap-2">🏭 <span><strong>Integração:</strong> O campo está altamente ligado à indústria e bolsas de valores</span></li>
                        <li className="flex items-start gap-2">🏛️ <span><strong>Poder político:</strong> Forte influência através da Bancada Ruralista</span></li>
                      </ul>
                    </div>

                    <div className="bg-red-950/30 p-5 rounded-2xl border border-red-500/30">
                      <h3 className="text-red-400 font-bold text-lg mb-3">❌ Principais MITOS sobre o Agronegócio:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">🍽️ <span><strong>Mesa do brasileiro:</strong> NÃO garante a comida barata na nossa mesa diariamente</span></li>
                        <li className="flex items-start gap-2">🌳 <span><strong>Sustentabilidade:</strong> NÃO protege a biodiversidade (avança sobre o Cerrado e Amazónia)</span></li>
                        <li className="flex items-start gap-2">👨‍🌾 <span><strong>Pequenos produtores:</strong> NÃO é formado maioritariamente por camponeses ou cooperativas pequenas</span></li>
                        <li className="flex items-start gap-2">💼 <span><strong>Empregos:</strong> NÃO absorve a mão de obra desempregada das cidades</span></li>
                        <li className="flex items-start gap-2">⚖️ <span><strong>Desigualdade:</strong> NÃO resolveu o problema da distribuição de terras no Brasil</span></li>
                      </ul>
                    </div>
                  </>
                ) : currentPhase.id === 3 ? (
                  // CONTEÚDO DA FASE 3 (Estrutura Fundiária)
                  <>
                    <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        O que é a Estrutura Fundiária?
                      </h3>
                      <p className="leading-relaxed">
                        Refere-se à forma como as terras estão distribuídas e organizadas num país. No Brasil, ela é marcada por uma profunda desigualdade histórica: muita terra na mão de muito poucos (latifúndios) e pouca terra dividida por muitos (minifúndios).
                      </p>
                    </div>

                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3">✅ Principais CARACTERÍSTICAS (Verdades):</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">📜 <span><strong>Herança Histórica:</strong> Tem origem no sistema colonial de Sesmarias e Capitanias Hereditárias.</span></li>
                        <li className="flex items-start gap-2">⚖️ <span><strong>Lei de Terras (1850):</strong> Instituiu a terra apenas por compra, marginalizando os mais pobres, ex-escravos e indígenas.</span></li>
                        <li className="flex items-start gap-2">📊 <span><strong>Concentração extrema:</strong> O Brasil possui um dos maiores e piores Índices de Gini agrário do mundo.</span></li>
                        <li className="flex items-start gap-2">🚜 <span><strong>Revolução Verde:</strong> A modernização tecnológica e mecanização encareceu a terra e engoliu os pequenos produtores.</span></li>
                        <li className="flex items-start gap-2">⚠️ <span><strong>Conflitos rurais:</strong> A posse de terras ociosas mantidas apenas para especulação imobiliária é o grande motor da violência no campo.</span></li>
                      </ul>
                    </div>

                    <div className="bg-red-950/30 p-5 rounded-2xl border border-red-500/30">
                      <h3 className="text-red-400 font-bold text-lg mb-3">❌ Principais MITOS sobre Estrutura Fundiária:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">🤝 <span><strong>Abolição (1888):</strong> NÃO houve distribuição de terras ou qualquer integração social aos ex-escravos.</span></li>
                        <li className="flex items-start gap-2">🌍 <span><strong>Igualdade:</strong> A estrutura fundiária NÃO é considerada igualitária ou equilibrada pela ONU.</span></li>
                        <li className="flex items-start gap-2">📏 <span><strong>Pequenos produtores:</strong> Eles NÃO ocupam a maior parte das terras (ocupam a menor parte, apesar de serem maioria em número de fazendas).</span></li>
                        <li className="flex items-start gap-2">🕵️ <span><strong>Grilagem:</strong> NÃO é uma prática extinta (falsificação de documentos e roubo de terras públicas ainda é muito forte, especialmente na Amazónia).</span></li>
                      </ul>
                    </div>
                  </>
                ) : currentPhase.id === 4 ? (
                  // CONTEÚDO DA FASE 4 (MATOPIBA)
                  <>
                    <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <Leaf className="w-5 h-5" />
                        O que é o MATOPIBA?
                      </h3>
                      <p className="leading-relaxed">
                        O MATOPIBA é a mais recente e vigorosa fronteira agrícola do Brasil. A sigla é formada pelas iniciais dos estados do <strong>Ma</strong>ranhão, <strong>To</strong>cantins, <strong>Pi</strong>auí e <strong>Ba</strong>hia. A região tem sofrido rápida transformação com o avanço da monocultura de exportação, especialmente a soja.
                      </p>
                    </div>

                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3">✅ Principais CARACTERÍSTICAS (Verdades):</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">📍 <span><strong>Localização:</strong> Encontro das regiões Nordeste e Norte.</span></li>
                        <li className="flex items-start gap-2">🌳 <span><strong>Desmatamento:</strong> Expansão fortíssima sobre o bioma Cerrado.</span></li>
                        <li className="flex items-start gap-2">⚠️ <span><strong>Conflitos:</strong> Gera graves tensões com indígenas e quilombolas.</span></li>
                        <li className="flex items-start gap-2">🚜 <span><strong>Mecanização:</strong> Agricultura moderna focada em commodities.</span></li>
                        <li className="flex items-start gap-2">💧 <span><strong>Água:</strong> Causa impacto severo nos recursos hídricos locais.</span></li>
                      </ul>
                    </div>

                    <div className="bg-red-950/30 p-5 rounded-2xl border border-red-500/30">
                      <h3 className="text-red-400 font-bold text-lg mb-3">❌ Principais MITOS sobre o MATOPIBA:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">🕊️ <span><strong>Paz no campo:</strong> NÃO é uma expansão pacífica (há muita violência e grilagem).</span></li>
                        <li className="flex items-start gap-2">👨‍🌾 <span><strong>Empregos:</strong> NÃO gera milhões de empregos rurais (é altamente mecanizado).</span></li>
                        <li className="flex items-start gap-2">🗺️ <span><strong>Região Sul:</strong> NÃO fica no Sul do Brasil.</span></li>
                        <li className="flex items-start gap-2">🥗 <span><strong>Comida:</strong> NÃO é focado em alimentos orgânicos para o mercado interno.</span></li>
                      </ul>
                    </div>
                  </>
                ) : (
                  // CONTEÚDO DA FASE 5 (Reforma Agrária)
                  <>
                    <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-500/30">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        A Função Social e a Reforma Agrária
                      </h3>
                      <p className="leading-relaxed">
                        Segundo a Constituição, não basta ser dono da terra; ela tem de ser produtiva, respeitar as leis trabalhistas e preservar o meio ambiente. Se um grande latifúndio for improdutivo e servir apenas para especulação, pode ser desapropriado pelo Estado para a Reforma Agrária.
                      </p>
                    </div>

                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                      <h3 className="text-emerald-400 font-bold text-lg mb-3">✅ Principais CARACTERÍSTICAS (Verdades):</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">⚖️ <span><strong>A Lei:</strong> Terras improdutivas podem ser desapropriadas com indemnização.</span></li>
                        <li className="flex items-start gap-2">🛡️ <span><strong>Proteção:</strong> Propriedades altamente produtivas NÃO podem ser tomadas.</span></li>
                        <li className="flex items-start gap-2">🚫 <span><strong>Confisco:</strong> Terras com trabalho escravo são confiscadas SEM indemnização.</span></li>
                        <li className="flex items-start gap-2">🚜 <span><strong>Apoio:</strong> A Reforma Agrária exige também estradas e crédito, não apenas a terra.</span></li>
                      </ul>
                    </div>

                    <div className="bg-red-950/30 p-5 rounded-2xl border border-red-500/30">
                      <h3 className="text-red-400 font-bold text-lg mb-3">❌ Principais MITOS:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">🏢 <span><strong>Agronegócio:</strong> O objetivo NÃO é acabar com o agronegócio produtivo.</span></li>
                        <li className="flex items-start gap-2">💸 <span><strong>Impostos:</strong> Pagar impostos (ITR) em dia NÃO garante o cumprimento da função social.</span></li>
                        <li className="flex items-start gap-2">💰 <span><strong>Roubo:</strong> O Estado NÃO toma a terra sem pagar (há indemnização, exceto em crimes).</span></li>
                        <li className="flex items-start gap-2">📈 <span><strong>Especulação:</strong> Manter terra parada para valorizar NÃO é atividade produtiva.</span></li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-500/30 text-center">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Dica:</strong> Lembre-se: A fase atual testa exatamente estes conhecimentos. Arraste as verdades para a imagem e jogue os mitos fora!
                  </p>
                </div>

                <Button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold"
                >
                  Entendi! Vamos jogar 🎮
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TELA DE INTRODUÇÃO */}
      {status === "intro" && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 z-10">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
            <ShieldCheck className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-4">Escudo da Verdade</h1>
            <h2 className="text-emerald-400 font-bold mb-6 uppercase tracking-widest text-sm">O Desafio Agrário</h2>
            
            <div className="text-left bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-4 mb-8 text-sm text-slate-300">
              <p><strong>A Missão:</strong> Proteja a agricultura brasileira identificando o que é verdade e o que é mito ao longo de {gamePhases.length} fases surpresa!</p>
              <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/30">
                <p className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Verdades:</strong> Arraste para perto do ESCUDO no centro da tela. (Vale 50 pts)</span>
                </p>
              </div>
              <div className="bg-red-950/50 p-3 rounded-xl border border-red-500/30">
                <p className="flex items-center gap-2 text-red-300">
                  <MoveRight className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Mitos:</strong> Faça um SWIPE rápido para o lado (esquerda/direita). (Vale 25 pts)</span>
                </p>
                <p className="text-xs text-red-400 mt-1 ml-7">⚠️ IMPORTANTE: O swipe deve ser feito FORA da área do escudo!</p>
              </div>
              <div className="bg-amber-950/50 p-3 rounded-xl border border-amber-500/30">
                <p className="flex items-center gap-2 text-amber-300">
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Dica ENEM:</strong> Clique no botão <strong>"O que cai no ENEM?"</strong> no canto superior direito para saber os tópicos cobrados na prova!</span>
                </p>
              </div>
              <div className="bg-blue-950/50 p-3 rounded-xl border border-blue-500/30">
                <p className="flex items-center gap-2 text-blue-300">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Dica:</strong> Clique no botão <strong>"!"</strong> para consultar informações detalhadas sobre a fase atual!</span>
                </p>
              </div>
              <p className="text-yellow-500 text-xs text-center mt-2">⚠️ Se errar, a carta volta e você perde 10 pontos!</p>
            </div>

            <Button 
              onClick={() => {
                setAvailableCards([...gamePhases[0].cards].sort(() => Math.random() - 0.5));
                setStatus("playing");
              }} 
              className="w-full bg-emerald-600 hover:bg-emerald-500 py-8 text-xl font-black rounded-xl transition-all hover:scale-105"
            >
              Iniciar Missão
            </Button>
          </motion.div>
        </div>
      )}

      {/* JOGO PRINCIPAL */}
      {status === "playing" && (
        <div ref={containerRef} className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto relative pt-4 pb-2">
          {/* TÍTULO DINÂMICO */}
          <div className="text-center mb-6 flex-shrink-0 px-4">
            <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
              <motion.h2 
                key={currentPhase.id} 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-black text-white tracking-tight"
              >
                Tema: {currentPhase.title}
              </motion.h2>
              <button
                onClick={() => setShowInfoModal(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 p-2 rounded-full transition-all duration-200 group border border-amber-500/30"
                title="Informações sobre o Tema"
              >
                <Info className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <p className="text-slate-400 text-sm md:text-base font-medium mt-1">🛡️ Arraste as afirmações de VERDADES para perto da imagem | 👉 SWIPE nas afirmações de MITOS para descartar (FORA do escudo)</p>
          </div>

          {/* ZONA CENTRAL: ESCUDO (A imagem muda com a fase) */}
          <div className="relative w-full flex justify-center items-center py-2 md:py-8 flex-shrink-0 px-4">
            <div className="flex flex-col items-center">
             <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-full border-2 border-emerald-500/30 border-dashed animate-pulse pointer-events-none"></div>
                <div
                  ref={dropzoneRef}
                  className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] rounded-full border-4 border-dashed border-emerald-700/50 flex items-center justify-center bg-slate-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] cursor-zoom-in group transition-transform hover:scale-105 mx-auto overflow-hidden"
                  onClick={() => setZoomedImage(currentPhase.imageSrc)}
                >
                  <motion.img 
                    key={currentPhase.imageSrc}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={currentPhase.imageSrc} 
                    alt={currentPhase.title}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  
                  <div className="absolute bg-black/60 p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <ZoomIn className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  {shieldedCards.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.6)] border-4 border-emerald-500 pointer-events-none" />
                  )}
                </div>
              </div>
              <p className="text-emerald-400/70 text-[10px] mt-2 text-center">✨ Área de proteção - Solte a VERDADE aqui ✨</p>
              <p className="text-red-400/70 text-[10px] mt-1 text-center">⚠️ MITOS não podem ser soltos nesta área!</p>
            </div>
          </div>

          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/30">
              <MoveRight className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">MITOS: Arraste para LATERAL (FORA do escudo) e solte</span>
            </div>
          </div>

          {/* REGISTO DE VERDADES DA FASE */}
          <div className="flex flex-col gap-1.5 md:gap-2 w-full px-4 items-center pointer-events-none mt-2 flex-shrink-0 min-h-[80px]">
            <AnimatePresence>
              {shieldedCards.slice(-2).map((card) => (
                <motion.div key={`log-${card.id}`} initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="bg-emerald-950/95 backdrop-blur-sm border border-emerald-600/80 text-emerald-100 p-2 md:p-3 rounded-xl text-center text-[11px] md:text-sm font-bold shadow-lg w-full max-w-lg truncate">
                  <Leaf className="inline-block w-3 h-3 md:w-4 md:h-4 mr-2 text-emerald-400" />
                  {card.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {shieldedCards.length > 0 && (
              <div className="text-emerald-500 text-[10px] md:text-xs font-bold bg-slate-900/90 px-4 py-1.5 rounded-full border border-emerald-500/30 mt-1">
                Total: {shieldedCards.length} respostas corretas na Fase {currentPhaseIndex + 1}
              </div>
            )}
          </div>

          {/* --- ÁREA INFERIOR: CARTAS DE JOGAR --- */}
          <div className="flex-1 w-full relative flex items-center justify-center pb-[5%] md:pb-12 mt-4 md:mt-8 z-50 px-2 md:px-4 min-h-[160px] md:min-h-[220px] -translate-y-[30px]">
            <div className="w-full max-w-2xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-center gap-2 sm:gap-4 md:gap-5">
              <AnimatePresence mode="popLayout">
                {availableCards.slice(0, 3).map((card, index) => (
                  <motion.div
                    key={card.id}
                    layout
                    drag
                    dragSnapToOrigin={false}
                    dragElastic={0.3}
                    dragMomentum={false}
                    dragConstraints={containerRef}
                    dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                    whileDrag={{
                      scale: 1.05,
                      zIndex: 100,
                      rotate: 0,
                      cursor: "grabbing",
                      backgroundColor: "#1F2C43",
                    }}
                    onDragEnd={(event, info: PanInfo) => {
                      const dropX = info.point.x;
                      const dropY = info.point.y;
                      const offsetX = info.offset.x;
                      const velocityX = info.velocity.x;
                      
                      const wasConsumed = processDrop(card, dropX, dropY, offsetX, velocityX);
                      
                      if (!wasConsumed) {
                        setDragErrorCardId(card.id);
                        setTimeout(() => setDragErrorCardId(null), 400);
                      }
                    }}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      x: dragErrorCardId === card.id ? [0, -5, 5, -2, 2, 0] : 0
                    }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      x: { duration: 0.15 }
                    }}
                    className="bg-[#0A1024] hover:bg-[#121b36] border-2 border-[#1e2a4a] p-2 md:p-5 rounded-xl md:rounded-2xl flex-shrink-0 w-[30%] sm:w-[31%] max-w-[200px] h-[110px] sm:h-[130px] md:h-[170px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing flex items-center justify-center text-center relative touch-none transition-colors duration-200"
                    style={{ touchAction: "none" }}
                  >
                    {availableCards.length > 3 && (
                      <>
                        <div className="absolute inset-0 bg-[#070b1a] border-2 border-[#1e2a4a] rounded-xl md:rounded-2xl -z-10 translate-y-1.5 translate-x-1.5 md:translate-y-2 md:translate-x-2 opacity-70 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[#04060f] border-2 border-[#1e2a4a] rounded-xl md:rounded-2xl -z-20 translate-y-3 translate-x-3 md:translate-y-4 md:translate-x-4 opacity-40 pointer-events-none"></div>
                      </>
                    )}

                    <p className="font-bold text-white text-[9px] sm:text-[11px] md:text-sm leading-tight md:leading-relaxed pointer-events-none select-none px-1">
                      {card.text}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {availableCards.length > 0 && (
              <div className="absolute bottom-0 md:bottom-2 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest animate-pulse pointer-events-none w-full text-center">
                RESTAM {availableCards.length} CARTAS NA FASE {currentPhaseIndex + 1}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL TRANSIÇÃO DE FASE --- */}
      <AnimatePresence>
        {status === "phase_transition" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-24 h-24 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-white mb-2">Fase {currentPhaseIndex + 1} Concluída!</h2>
              <p className="text-slate-400 mb-6">Classificaste com sucesso as características da {currentPhase.title}.</p>
              
              <Button 
                onClick={() => {
                  const nextIndex = currentPhaseIndex + 1;
                  const nextPhase = gamePhases[nextIndex];
                  setAvailableCards([...nextPhase.cards].sort(() => Math.random() - 0.5));
                  setShieldedCards([]);
                  setCurrentPhaseIndex(nextIndex);
                  setStatus("playing");
                }} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-7 text-lg font-black rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
              >
                Avançar para a Fase {currentPhaseIndex + 2}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAIS GERAIS (Erros, Zoom e Vitória) */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={() => setZoomedImage(null)}>
            <button className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-[260]" onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}>
              <X size={24} />
            </button>
            <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} src={zoomedImage} alt="Zoom da Imagem Central" className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-4 right-4 md:left-auto md:right-10 md:w-96 bg-slate-900 border-2 border-red-500 rounded-2xl p-6 shadow-[0_10px_40px_rgba(220,38,38,0.4)] z-[300]">
            <div className="flex items-center gap-3 mb-3 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-black text-lg">{alertMessage.title}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">{alertMessage.desc}</p>
            <Button onClick={() => setAlertMessage(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all">Entendi (-10 PTS)</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "victory" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="max-w-md w-full bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-24 h-24 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-white mb-2">Missão Concluída!</h2>
              <p className="text-slate-400 mb-6">Dominaste todas as fases sobre Geografia Agrária e protegeste o conhecimento de todas as falsas informações.</p>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8 shadow-inner">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Pontuação Total Adquirida</p>
                <p className="text-6xl font-black text-emerald-400 drop-shadow-md">{score}</p>
              </div>
              <Button onClick={() => onSaveScore && onSaveScore(score)} className="w-full bg-emerald-600 hover:bg-emerald-500 py-7 text-lg font-black rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105">
                Salvar e Avançar (+{score})
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}