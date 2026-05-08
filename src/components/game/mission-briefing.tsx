"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Satellite, Microscope, X } from 'lucide-react';

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
      <div className="space-y-12">
        <div className="relative group">
          <div className="absolute top-6 md:top-10 left-0 right-0 z-10 px-4">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-black text-2xl md:text-4xl lg:text-5xl drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)] text-center leading-tight tracking-tighter"
            >
              Analise e Identifique os Elementos desta Paisagem
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => satellite && handleZoom(e, satellite.imageUrl)}
            className="relative aspect-[4/3] md:aspect-video w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border-[6px] md:border-[10px] border-white/5 shadow-2xl bg-slate-900 cursor-zoom-in"
          >
            {satellite && (
              <Image
                src={satellite.imageUrl}
                alt={satellite.description}
                fill
                priority
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                data-ai-hint={satellite.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex items-center gap-3 bg-blue-600/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
              <Satellite size={20} className="text-white" />
              <span className="text-white font-black text-sm md:text-base uppercase tracking-wider">Vista de Satélite</span>
            </div>
          </motion.div>
        </div>

        <div className="group relative">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={(e) => soil && handleZoom(e, soil.imageUrl)}
            className="glass-panel p-2 rounded-[2rem] overflow-hidden aspect-[4/3] relative border-white/10 bg-slate-900/40 shadow-xl h-full cursor-zoom-in"
          >
            {soil && (
              <Image
                src={soil.imageUrl}
                alt={soil.description}
                fill
                className="object-cover rounded-[1.8rem] transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint={soil.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-[1.8rem]" />
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-emerald-500/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs md:text-sm font-black uppercase border border-white/20">
              <Microscope size={16} />
              Perfil do Solo
            </div>
          </motion.div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[2rem] flex flex-col justify-center bg-blue-500/10 border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Info size={100} />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-400/20 p-2 rounded-lg">
              <Info size={20} className="text-blue-400" />
            </div>
            <h4 className="text-blue-400 font-black text-sm uppercase tracking-[0.2em]">Relatório de Análise</h4>
          </div>
          
          <p className="text-white/80 text-base leading-relaxed mb-6 font-medium">
            O BioGuesser detectou <span className="text-blue-400 font-bold">10 elementos geográficos</span>. Valide as características observadas.
          </p>
          
          <div className="space-y-3 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 uppercase font-black tracking-[0.2em]">Protocolo de Recompensa:</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                <span className="text-emerald-400 text-xs font-bold uppercase">▪ Termos Científicos</span>
                <span className="text-emerald-400 font-black text-sm">+50 XP</span>
              </div>
              <div className="flex items-center justify-between bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                <span className="text-blue-300 text-xs font-bold uppercase">▪ Termos Regionais</span>
                <span className="text-blue-300 font-black text-sm">+30 XP</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-white/40 text-xs font-bold uppercase">▪ Termos Comuns</span>
                <span className="text-white/40 font-black text-sm">+10 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => handleCloseZoom()}
          >
            <motion.div
              layoutId={zoomedImage}
              className="relative w-full h-full max-w-[90vw] max-h-[90vh]"
            >
              <Image 
                src={zoomedImage} 
                alt="Zoomed view" 
                fill
                style={{objectFit: 'contain'}}
              />
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-5 right-5 text-white bg-black/40 rounded-full p-2 transition-colors hover:bg-black/70"
              onClick={(e) => handleCloseZoom(e)}
              aria-label="Close zoomed image"
            >
              <X size={28} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
