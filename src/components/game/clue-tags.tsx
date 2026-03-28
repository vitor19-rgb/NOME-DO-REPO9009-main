"use client"

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Keyword {
  text: string;
  points: number;
}

interface ClueTagsProps {
  keywords: Keyword[];
  onRemove: (text: string) => void;
}

export function ClueTags({ keywords, onRemove }: ClueTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
      <AnimatePresence>
        {keywords.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-[10px] text-gray-400 italic w-full py-4 uppercase tracking-widest font-semibold"
          >
            Nenhuma característica...
          </motion.p>
        ) : (
          keywords.map((kw, i) => (
            <motion.div
              key={`${kw.text}-${i}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Badge 
                variant="secondary" 
                className="bg-white text-[#6c7893] font-bold py-1.5 px-4 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors border-none"
              >
                <span className="capitalize">{kw.text}</span>
                <button 
                  onClick={() => onRemove(kw.text)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </Badge>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}