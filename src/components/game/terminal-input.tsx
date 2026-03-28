
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, Target, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  message: string;
  type: 'input' | 'error' | 'success' | 'info';
}

interface TerminalInputProps {
  onAddKeyword: (keyword: string) => { success: boolean; message: string };
  disabled?: boolean;
  score: number;
}

export function TerminalInput({ onAddKeyword, disabled, score }: TerminalInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { message: 'SISTEMA DE ANÁLISE GEOESPACIAL V1.0', type: 'info' },
    { message: 'AGUARDANDO ENTRADA DE DADOS DO BIOMA...', type: 'info' }
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputValue.trim();
    if (!cleanInput || disabled) return;

    setLogs(prev => [...prev, { message: `SCAN: "${cleanInput.toUpperCase()}"`, type: 'input' }]);

    const result = onAddKeyword(cleanInput);

    if (result.success) {
      setLogs(prev => [...prev, { message: result.message, type: 'success' }]);
    } else {
      setLogs(prev => [...prev, { message: result.message, type: 'error' }]);
    }

    setInputValue('');
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Score / Accuracy Display */}
      <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Precisão da Análise</span>
          </div>
          <motion.span 
            key={score}
            initial={{ scale: 1.2, color: '#60a5fa' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="font-mono text-xl font-bold"
          >
            {score.toString().padStart(3, '0')}<span className="text-[10px] text-white/40 ml-1">XP</span>
          </motion.span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((score / 300) * 100, 100)}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
          />
        </div>
      </div>

      {/* Analysis Feed */}
      <div className="flex-1 flex flex-col min-h-[250px] bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Console de Campo</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        </div>
        
        <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto scrollbar-hide">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-start gap-3",
                    log.type === 'error' ? "text-red-400/80" : 
                    log.type === 'success' ? "text-blue-400" : 
                    log.type === 'input' ? "text-white/70" : "text-white/20"
                  )}
                >
                  <span className="shrink-0 mt-0.5 opacity-50">
                    {log.type === 'input' ? <Target size={10} /> : log.type === 'info' ? <Info size={10} /> : <Zap size={10} />}
                  </span>
                  <span className="leading-relaxed">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="relative w-full group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder:text-white/20 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all border border-white/10 group-hover:border-white/20"
          placeholder="Descreva o elemento geográfico..."
        />
        <button 
          type="submit" 
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 p-2.5 rounded-xl text-white transition-all disabled:opacity-20 shadow-lg active:scale-90"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
}
