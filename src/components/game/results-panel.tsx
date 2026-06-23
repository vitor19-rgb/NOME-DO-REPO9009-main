"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, BookOpen, ArrowRight } from 'lucide-react';
import { educationalDebrief, type EducationalDebriefOutput } from '@/ai/flows/educational-debrief-biome';
import { Button } from '@/components/ui/button';

interface ResultsPanelProps {
  score: number;
  biomeName: string;
  onNext: () => void;
}

export function ResultsPanel({ score, biomeName, onNext }: ResultsPanelProps) {
  const [aiDebrief, setAiDebrief] = useState<EducationalDebriefOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDebrief() {
      setLoading(true);
      try {
        const result = await educationalDebrief({ biomeName });
        setAiDebrief(result);
      } catch (error) {
        console.error("Failed to load AI debrief", error);
      } finally {
        setLoading(false);
      }
    }
    loadDebrief();
  }, [biomeName]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-6 md:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-accent/20 rounded-full text-accent mb-4">
            <CheckCircle2 size={36} className="md:w-12 md:h-12" />
          </div>
          <h2 className="text-xl md:text-3xl font-bold mb-2">Bioma Identificado: {biomeName}</h2>
          <p className="text-muted-foreground text-[9px] md:text-sm uppercase tracking-widest font-bold">Missão Concluída</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="bg-black/20 p-3 md:p-4 rounded-lg border border-border">
            <span className="text-[9px] md:text-[10px] uppercase text-muted-foreground block mb-1">Pontuação Final</span>
            <span className="text-2xl md:text-3xl font-bold text-accent">{score}</span>
          </div>
          <div className="bg-black/20 p-3 md:p-4 rounded-lg border border-border">
            <span className="text-[9px] md:text-[10px] uppercase text-muted-foreground block mb-1">Status de Analista</span>
            <span className="text-2xl md:text-3xl font-bold text-primary italic">Nível {biomeName === 'Caatinga' ? '1' : biomeName === 'Pampa' ? '2' : '3'}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4 text-primary">
          <BookOpen size={18} className="md:w-5 md:h-5" />
          <h3 className="font-bold uppercase text-[10px] md:text-sm tracking-widest">Debriefing Educacional (IA)</h3>
        </div>
        
        <div className="min-h-[80px] md:min-h-[100px] flex items-center">
          {loading ? (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] md:text-xs text-muted-foreground animate-pulse">Sincronizando </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-[12px] md:text-sm leading-relaxed font-body"
            >
              <div className="whitespace-pre-line">
                {aiDebrief?.summary}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-[9px] md:text-[10px] text-accent font-bold uppercase">
                <Award size={14} />
                Foco ENEM: Geoclimatologia e Biomas
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Button 
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white border border-transparent flex items-center justify-center gap-2 h-12 md:h-14 rounded-full text-base md:text-lg font-bold shadow-lg transition-all active:scale-95"
      >
        Avançar para Próxima Fase
        <ArrowRight size={18} className="md:w-5 md:h-5" />
      </Button>
    </motion.div>
  );
}
