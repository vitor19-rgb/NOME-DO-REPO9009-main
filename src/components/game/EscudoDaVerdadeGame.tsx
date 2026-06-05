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

// --- DADOS DA FASE 1 (15 Cartas: 9 Verdades, 6 Mitos) ---
const INITIAL_CARDS: CardItem[] = [
  // --- 9 VERDADES ---
  {
    id: "c1",
    text: "Produz cerca de 70% da comida que chega à nossa mesa.",
    type: "truth",
    explanation:
      "Correto! A agricultura familiar é a base do abastecimento alimentar interno do Brasil.",
  },
  {
    id: "c2",
    text: "Absorve a maior parte da mão de obra no campo.",
    type: "truth",
    explanation:
      "Exato! Por ser menos mecanizada que o agronegócio, ela gera muito mais empregos diretos.",
  },
  {
    id: "c3",
    text: "Garante a diversidade de alimentos no mercado interno.",
    type: "truth",
    explanation:
      "Correto! Enquanto o agronegócio foca em monocultura (soja, milho), a familiar planta feijão, mandioca, hortaliças, etc.",
  },
  {
    id: "c4",
    text: "É a principal fonte de renda para a maioria dos municípios pequenos.",
    type: "truth",
    explanation:
      "Correto! A economia de muitas cidades do interior gira em torno do pequeno produtor.",
  },
  {
    id: "c5",
    text: "Preserva mais a biodiversidade local que o agronegócio.",
    type: "truth",
    explanation:
      "Exato! O uso de policulturas e técnicas tradicionais agride menos o meio ambiente.",
  },
  {
    id: "c6",
    text: "Sofre com a falta de assistência técnica e crédito rural.",
    type: "truth",
    explanation:
      "Correto! Historicamente, o Estado brasileiro privilegia os grandes latifundiários nas políticas de crédito.",
  },
  {
    id: "c7",
    text: "Utiliza predominantemente mão de obra do próprio núcleo familiar.",
    type: "truth",
    explanation:
      "Correto! A gestão e o trabalho são divididos entre os membros da família.",
  },
  {
    id: "c8",
    text: "Tem forte ligação com a posse histórica e cultural da terra.",
    type: "truth",
    explanation:
      "Exato! Muitos pequenos produtores têm uma relação de ancestralidade com o lote que cultivam.",
  },
  {
    id: "c9",
    text: "É essencial para a segurança alimentar do país.",
    type: "truth",
    explanation:
      "Perfeito! Sem a agricultura familiar, o Brasil enfrentaria escassez de alimentos básicos.",
  },

  // --- 6 MITOS ---
  {
    id: "c10",
    text: "Recebe a maior fatia dos financiamentos do governo.",
    type: "myth",
    explanation:
      "Mito! O agronegócio exportador é quem recebe a esmagadora maioria do crédito (ex: Plano Safra).",
  },
  {
    id: "c11",
    text: "Seu foco principal é a exportação de commodities para a Ásia.",
    type: "myth",
    explanation:
      "Mito! O foco da agricultura familiar é o mercado interno. Quem exporta commodities é o grande agronegócio.",
  },
  {
    id: "c12",
    text: "Ocupa as maiores e mais extensas propriedades de terra do Brasil.",
    type: "myth",
    explanation:
      "Mito! Eles ocupam a menor parcela das terras (minifúndios). A maior parte das terras férteis está nos latifúndios.",
  },
  {
    id: "c13",
    text: "É altamente mecanizada e utiliza drones em larga escala.",
    type: "myth",
    explanation:
      "Mito! A agricultura familiar costuma ter baixo nível tecnológico devido à falta de capital.",
  },
  {
    id: "c14",
    text: "Planta principalmente soja para a fabricação de ração.",
    type: "myth",
    explanation:
      "Mito! O foco da agricultura familiar é a comida (arroz, feijão, alface). A soja é o foco do latifúndio.",
  },
  {
    id: "c15",
    text: "É responsável pelo grande desmatamento da Amazônia.",
    type: "myth",
    explanation:
      "Mito! O grande desmatamento é causado pelo avanço da fronteira agrícola (gado e soja) dos grandes produtores.",
  },
];

export default function EscudoDaVerdadeGame({
  playerName,
  onComplete,
  onSaveScore,
}: EscudoDaVerdadeProps) {
  // --- ESTADOS DO JOGO ---
  const [status, setStatus] = useState<"intro" | "playing" | "victory">(
    "intro"
  );
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

  // 1. Inicializa o baralho embaralhado
  useEffect(() => {
    setAvailableCards([...INITIAL_CARDS].sort(() => Math.random() - 0.5));
  }, []);

  // 2. Deteta Condição de Vitória (Fim do Baralho)
  useEffect(() => {
    if (availableCards.length === 0 && status === "playing") {
      setTimeout(() => setStatus("victory"), 800);
    }
  }, [availableCards.length, status]);

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

  // --- FUNÇÃO PARA PROCESSAR O DROP (DRAG END) - CORRIGIDA ---
  const processDrop = (card: CardItem, dropX: number, dropY: number, offsetX: number, velocityX: number): boolean => {
    if (!dropzoneRef.current) return false;

    const dropzoneRect = dropzoneRef.current.getBoundingClientRect();

    // ZONA DO ESCUDO - Com margem para aceitar verdades
    const isInsideCenter =
      dropX >= dropzoneRect.left - 150 &&
      dropX <= dropzoneRect.right + 150 &&
      dropY >= dropzoneRect.top - 150 &&
      dropY <= dropzoneRect.bottom + 150;

    // Para ser considerado um SWIPE válido, precisa de:
    // 1. Distância mínima de 80px OU velocidade alta (> 500 px/s)
    // 2. Não pode estar dentro da área do escudo (senão é tentativa de proteger)
    const isSwipeValid = (Math.abs(offsetX) > 80 || Math.abs(velocityX) > 500) && !isInsideCenter;

    // Para VERDADES: aceita em qualquer lugar que esteja dentro da zona do escudo
    if (card.type === "truth") {
      if (isInsideCenter) {
        // SUCESSO: Verdade - carta some e ganha pontos
        setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));
        setShieldedCards((prev) => [...prev, card]);
        setScore((prev) => prev + 50);
        triggerSuccess(50, dropX, dropY);
        return true;
      } else {
        // Só dá erro se soltar MUITO longe do escudo
        triggerError("Proteja a verdade!", "Arraste a VERDADE para perto do ESCUDO no centro da tela!", card.id);
        showAreaError(dropX, dropY);
        return false;
      }
    } 
    // Para MITOS
    else {
      // Mito SÓ pode ser removido com SWIPE válido (fora da área do escudo)
      if (isSwipeValid) {
        // SWIPE válido = acerto (remove o mito)
        setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));
        setScore((prev) => prev + 25);
        triggerSuccess(25, dropX, dropY);
        return true;
      } 
      else {
        // Qualquer outra situação = erro
        // Se tentou jogar no escudo, mensagem específica
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
          <span className="font-black text-xl hidden md:inline">Fase 1: Geografia Agrária</span>
          <span className="font-black text-xl md:hidden">Fase 1</span>
        </button>
        
        <div className="flex items-center gap-3">
          {/* Botão "O que cai no ENEM?" - NOVO */}
          <button
            onClick={() => setShowEnemModal(true)}
            className="hidden md:flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-2 rounded-xl transition-all duration-200 group border border-amber-500/30"
            title="O que cai no ENEM sobre Geografia Agrária?"
          >
            <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">O que cai no ENEM?</span>
          </button>
          
          {/* Versão mobile do botão ENEM (apenas ícone) */}
          <button
            onClick={() => setShowEnemModal(true)}
            className="md:hidden bg-amber-500/20 hover:bg-amber-500/30 p-2 rounded-xl transition-all duration-200 group border border-amber-500/30"
            title="O que cai no ENEM sobre Geografia Agrária?"
          >
            <BookOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Botão de Informação da Agricultura Familiar ( ! ) */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 p-2 rounded-xl transition-all duration-200 group border border-amber-500/30"
            title="Informações sobre Agricultura Familiar"
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
                {/* Por que estudar isso? */}
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

                {/* ⚠️ Tópicos Frequentes na Prova */}
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

                {/* Dica de Mestre */}
                <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 text-center">
                  <p className="text-sm text-emerald-300">
                    💡 <strong>Dica de Mestre:</strong> Ao completar os relatórios deste jogo, você estará exercitando exatamente o raciocínio de 
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

      {/* MODAL DE INFORMAÇÕES DA AGRICULTURA FAMILIAR ( ! ) */}
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
                  <Tractor className="w-8 h-8 text-emerald-400" />
                  <h2 className="text-2xl md:text-3xl font-black text-white">Agricultura Familiar</h2>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6 text-slate-300">
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
                    <li className="flex items-start gap-2">📜 <strong>Ligação cultural:</strong> Forte relação com a posse histórica da terra</li>
                    <li className="flex items-start gap-2">🍽️ <strong>Segurança alimentar:</strong> Essencial para evitar fome e escassez</li>
                  </ul>
                </div>

                <div className="bg-red-950/30 p-5 rounded-2xl border border-red-500/30">
                  <h3 className="text-red-400 font-bold text-lg mb-3">❌ Principais MITOS sobre Agricultura Familiar:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">💰 <span><strong>Financiamento:</strong> NÃO recebe a maior fatia dos financiamentos (quem recebe é o agronegócio)</span></li>
                    <li className="flex items-start gap-2">📦 <span><strong>Exportação:</strong> NÃO foca em exportação de commodities (foco é o mercado interno)</span></li>
                    <li className="flex items-start gap-2">🏞️ <span><strong>Tamanho da terra:</strong> NÃO ocupa as maiores propriedades (são minifúndios)</span></li>
                    <li className="flex items-start gap-2">🤖 <span><strong>Tecnologia:</strong> NÃO é altamente mecanizada (baixo nível tecnológico)</span></li>
                    <li className="flex items-start gap-2">🌽 <span><strong>Cultivo:</strong> NÃO planta principalmente soja (planta alimentos, não commodities)</span></li>
                    <li className="flex items-start gap-2">🌲 <span><strong>Desmatamento:</strong> NÃO é responsável pelo desmatamento da Amazônia (quem causa é o agronegócio)</span></li>
                  </ul>
                </div>

                <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-500/30 text-center">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Dica:</strong> Lembre-se: A agricultura familiar alimenta o Brasil, gera empregos e preserva a cultura local. 
                    Já o agronegócio foca na exportação de commodities (soja, milho, carne) em larga escala.
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
            <h2 className="text-emerald-400 font-bold mb-6 uppercase tracking-widest text-sm">Agricultura Familiar</h2>
            
            <div className="text-left bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-4 mb-8 text-sm text-slate-300">
              <p><strong>A Missão:</strong> Proteja a agricultura brasileira identificando o que é verdade e o que é mito!</p>
              <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/30">
                <p className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                  <span><strong>Verdades:</strong> Arraste para perto do ESCUDO no centro da tela. (Vale 50 pts)</span>
                </p>
              </div>
              <div className="bg-red-950/50 p-3 rounded-xl border border-red-500/30">
                <p className="flex items-center gap-2 text-red-300">
                  <MoveRight className="w-5 h-5" />
                  <span><strong>Mitos:</strong> Faça um SWIPE rápido para o lado (esquerda/direita). (Vale 25 pts)</span>
                </p>
                <p className="text-xs text-red-400 mt-1 ml-7">⚠️ IMPORTANTE: O swipe deve ser feito FORA da área do escudo!</p>
              </div>
              <div className="bg-amber-950/50 p-3 rounded-xl border border-amber-500/30">
                <p className="flex items-center gap-2 text-amber-300">
                  <BookOpen className="w-5 h-5" />
                  <span><strong>Dica ENEM:</strong> Clique no botão <strong>"O que cai no ENEM?"</strong> no canto superior direito para saber os tópicos cobrados na prova!</span>
                </p>
              </div>
              <div className="bg-blue-950/50 p-3 rounded-xl border border-blue-500/30">
                <p className="flex items-center gap-2 text-blue-300">
                  <Info className="w-5 h-5" />
                  <span><strong>Dica:</strong> Clique no botão <strong>"!"</strong> para consultar informações detalhadas sobre Agricultura Familiar!</span>
                </p>
              </div>
              <p className="text-yellow-500 text-xs text-center mt-2">⚠️ Se errar, a carta volta e você perde 10 pontos!</p>
            </div>

            <Button onClick={() => setStatus("playing")} className="w-full bg-emerald-600 hover:bg-emerald-500 py-8 text-xl font-black rounded-xl transition-all hover:scale-105">
              Iniciar Missão
            </Button>
          </motion.div>
        </div>
      )}

      {/* JOGO PRINCIPAL */}
      {status === "playing" && (
        <div ref={containerRef} className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto relative pt-4 pb-2">
          {/* TÍTULO */}
          <div className="text-center mb-6 flex-shrink-0 px-4">
            <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Tema: Agricultura Familiar</h2>
              <button
                onClick={() => setShowInfoModal(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 p-2 rounded-full transition-all duration-200 group border border-amber-500/30"
                title="Informações sobre Agricultura Familiar"
              >
                <Info className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <p className="text-slate-400 text-sm md:text-base font-medium mt-1">🛡️ Arraste as afirmações de VERDADES para perto da imagem | 👉 SWIPE nas afirmações de MITOS para descartar (FORA do escudo)</p>
          </div>

          {/* ZONA CENTRAL: ESCUDO */}
          <div className="relative w-full flex justify-center items-center py-2 md:py-8 flex-shrink-0 px-4">
            <div className="flex flex-col items-center">
            
              {/* Área de detecção visualmente indicada por um anel ao redor */}
             {/* Área de detecção visualmente indicada */}
             <div className="relative">
  <div className="absolute inset-0 -m-8 rounded-full border-2 border-emerald-500/30 border-dashed animate-pulse pointer-events-none"></div>
  <div
    ref={dropzoneRef}
    className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] rounded-full border-4 border-dashed border-emerald-700/50 flex items-center justify-center bg-slate-900 shadow-[0_0_40px_rgba(0,0,0,0.5)] cursor-zoom-in group transition-transform hover:scale-105 mx-auto overflow-hidden"
    onClick={() => setZoomedImage("/images/geografia/agricultura-familiar.png")}
  >
    {/* IMAGEM COM AS CORES NORMAIS (removido o mix-blend-luminosity e a opacidade) */}
    <img 
      src="/images/geografia/agricultura-familiar.png" 
      alt="Agricultura Familiar"
      className="w-full h-full object-cover rounded-full"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
    
    <div className="absolute bg-black/60 p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
      <ZoomIn className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </div>
    
    {/* O ícone do Trator foi totalmente removido daqui */}
    
    {shieldedCards.length > 0 && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.6)] border-4 border-emerald-500 pointer-events-none" />
    )}
  </div>
</div>
              <p className="text-emerald-400/70 text-[10px] mt-2 text-center">✨ Área de proteção - Solte a VERDADE aqui ✨</p>
              <p className="text-red-400/70 text-[10px] mt-1 text-center">⚠️ MITOS não podem ser soltos nesta área!</p>
            </div>
          </div>

          {/* DICA DE SWIPE */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/30">
              <MoveRight className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">MITOS: Arraste para LATERAL (FORA do escudo) e solte</span>
            </div>
          </div>

          {/* REGISTO DE VERDADES */}
          <div className="flex flex-col gap-1.5 md:gap-2 w-full px-4 items-center pointer-events-none mt-2 flex-shrink-0">
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
                Total: {shieldedCards.length} respostas corretas
              </div>
            )}
          </div>

        {/* --- ÁREA INFERIOR: CARTAS DE JOGAR --- */}
          {/* Adicionámos -translate-y-[10px] no final desta div para a mover 10 pixels para cima */}
          <div className="flex-1 w-full relative flex items-center justify-center pb-[5%] md:pb-12 mt-4 md:mt-8 z-50 px-2 md:px-4 min-h-[160px] md:min-h-[220px] -translate-y-[30px]">
            
            {/* O container interno agora usa Flexbox Wrappable no mobile para não sobrepor */}
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
                      
                      const wasConsumed = processDrop(card, dropX, dropY, offsetX);
                      
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
                    // CLASSES RESPONSIVAS:
                    // No telemóvel, as cartas ficam ligeiramente mais estreitas e baixas, ocupando um pouco menos de um terço do espaço.
                    // Em ecrãs médios (md:), expandem para o tamanho original.
                    className="bg-[#0A1024] hover:bg-[#121b36] border-2 border-[#1e2a4a] p-2 md:p-5 rounded-xl md:rounded-2xl flex-shrink-0 w-[30%] sm:w-[31%] max-w-[200px] h-[110px] sm:h-[130px] md:h-[170px] shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center text-center relative touch-none transition-colors duration-200"
                    style={{ touchAction: "none" }}
                  >
                    {availableCards.length > 3 && (
                      <>
                        <div className="absolute inset-0 bg-[#070b1a] border-2 border-[#1e2a4a] rounded-xl md:rounded-2xl -z-10 translate-y-1 translate-x-1 md:translate-y-1.5 md:translate-x-1.5 opacity-60 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[#04060f] border-2 border-[#1e2a4a] rounded-xl md:rounded-2xl -z-20 translate-y-2 translate-x-2 md:translate-y-3 md:translate-x-3 opacity-30 pointer-events-none"></div>
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
                RESTAM {availableCards.length} CARTAS
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAIS */}
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
              <h2 className="text-3xl font-black text-white mb-2">Fase Concluída!</h2>
              <p className="text-slate-400 mb-6">Você formou o Escudo da Verdade e protegeu a Agricultura Familiar de todas as falsas informações.</p>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8 shadow-inner">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Pontuação Adquirida</p>
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