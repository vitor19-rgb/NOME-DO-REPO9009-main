"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Satellite, Microscope, X, ZoomIn, Sparkles } from 'lucide-react';

interface MissionBriefingProps {
  landscapeId: string;
  detailId: string;
}

export function MissionBriefing({ landscapeId, detailId }: MissionBriefingProps) {
  const satellite = PlaceHolderImages.find(img => img.id === landscapeId);
  const soil = PlaceHolderImages.find(img => img.id === detailId);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleZoom = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    setZoomedImage(imageUrl);
  };

  const handleCloseZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomedImage(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        {/* CABEÇALHO DO PAINEL VISUAL */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Satellite size={22} />
            </div>
            <div>
              <h2 className="text-white font-black text-lg md:text-xl tracking-tight leading-tight">
                Investigação Visual do Bioma
              </h2>
              <p className="text-slate-400 text-xs md:text-sm font-medium">
                Analise os padrões de vegetação, relevo e composição do solo
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ZoomIn size={14} /> Clique nas fotos para ampliar
          </span>
        </div>

        {/* 1. IMAGEM PRINCIPAL: VISTA DE SATÉLITE */}
        <div className="relative group w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => satellite && handleZoom(e, satellite.imageUrl)}
            className="relative aspect-[16/9] w-full rounded-2xl md:rounded-3xl overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-slate-900 cursor-zoom-in transition-all duration-300"
          >
            {satellite && (
              <Image
                src={satellite.imageUrl}
                alt={satellite.description}
                fill
                priority
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                data-ai-hint={satellite.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
            
            {/* BADGES SOBRE A IMAGEM DE SATÉLITE */}
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex items-center gap-2 bg-blue-600/90 backdrop-blur-md px-3.5 py-1.5 md:py-2 rounded-xl border border-white/20 shadow-lg">
              <Satellite size={16} className="text-white" />
              <span className="text-white font-black text-xs md:text-sm uppercase tracking-wider">Vista de Satélite</span>
            </div>

            <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white/90 text-xs px-3 py-1.5 rounded-full border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={14} />
              <span className="font-semibold hidden sm:inline">Ampliar</span>
            </div>
          </motion.div>
        </div>

        {/* 2. LINHA INFERIOR: PERFIL DO SOLO (50%) + RELATÓRIO DE ANÁLISE (50%) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full items-stretch flex-1">
          
          {/* FOTO 2: PERFIL DO SOLO */}
          <div className="relative group w-full h-full min-h-[220px]">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={(e) => soil && handleZoom(e, soil.imageUrl)}
              className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden border-2 border-emerald-500/20 group-hover:border-emerald-500/50 shadow-md bg-slate-900 cursor-zoom-in transition-all duration-300"
            >
              {soil && (
                <Image
                  src={soil.imageUrl}
                  alt={soil.description}
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  data-ai-hint={soil.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black uppercase text-white border border-white/20 shadow-md">
                <Microscope size={14} />
                <span>Perfil do Solo & Vegetação</span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white/80 text-[11px] px-2.5 py-1 rounded-full border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={12} />
              </div>
            </motion.div>
          </div>

          {/* CARD DO RELATÓRIO DE ANÁLISE & RECOMPENSAS */}
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-lg backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-emerald-400">
              <Info size={90} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-white font-black text-xs md:text-sm uppercase tracking-wider">
                  Protocolo de Avaliação
                </h4>
              </div>

              <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-4">
                O satélite detectou <span className="text-emerald-400 font-bold">10 características</span> deste bioma. Selecione as palavras correspondentes no banco ao lado:
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-300 text-[11px] font-bold">🧪 Termos Científicos</span>
                <span className="text-emerald-400 font-black text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md">+50 XP</span>
              </div>
              <div className="flex items-center justify-between bg-blue-950/40 p-2 rounded-xl border border-blue-500/30">
                <span className="text-blue-300 text-[11px] font-bold">📍 Termos Regionais</span>
                <span className="text-blue-400 font-black text-xs bg-blue-500/20 px-2 py-0.5 rounded-md">+30 XP</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded-xl border border-slate-700">
                <span className="text-slate-300 text-[11px] font-bold">🌿 Termos Gerais</span>
                <span className="text-slate-400 font-black text-xs bg-slate-700 px-2 py-0.5 rounded-md">+10 XP</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE ZOOM FULLSCREEN */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => handleCloseZoom()}
          >
            <motion.div
              layoutId={zoomedImage}
              className="relative w-full h-full max-w-[90vw] max-h-[88vh] flex items-center justify-center"
            >
              <Image 
                src={zoomedImage} 
                alt="Zoomed view" 
                fill
                style={{objectFit: 'contain'}}
                className="rounded-2xl"
              />
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-5 right-5 text-white bg-slate-800/80 hover:bg-slate-700 p-3 rounded-full transition-colors border border-white/20 shadow-xl"
              onClick={(e) => handleCloseZoom(e)}
              aria-label="Fechar zoom"
            >
              <X size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
