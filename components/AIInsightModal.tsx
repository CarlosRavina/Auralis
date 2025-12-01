import React, { useRef } from 'react';
import { X, Sparkles, BookOpen, Users, Lightbulb } from 'lucide-react';
import { AIInsight, Book } from '../types';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  insight: AIInsight | null;
  book: Book | null;
  error: string | null;
}

export const AIInsightModal: React.FC<AIInsightModalProps> = ({ isOpen, onClose, isLoading, insight, book, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={20} />
            <h2 className="font-semibold text-lg text-white">Información de Gemini</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm animate-pulse">Consultando la base de conocimientos de IA...</p>
             </div>
          ) : error ? (
             <div className="text-center py-8">
                 <p className="text-red-400 mb-2">No se pudo generar la información.</p>
                 <p className="text-slate-500 text-sm">{error}</p>
             </div>
          ) : insight && book ? (
             <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{book.title}</h3>
                    <p className="text-sm text-slate-400">Análisis por Google Gemini</p>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-blue-400 mb-2 text-sm font-semibold uppercase tracking-wider">
                        <BookOpen size={16} /> Resumen
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        {insight.summary}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 text-green-400 mb-3 text-sm font-semibold uppercase tracking-wider">
                            <Lightbulb size={16} /> Temas Clave
                        </div>
                        <ul className="space-y-2">
                            {insight.themes.map((theme, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 mt-1.5 shrink-0" />
                                    {theme}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 text-pink-400 mb-3 text-sm font-semibold uppercase tracking-wider">
                            <Users size={16} /> Personajes
                        </div>
                        <ul className="space-y-2">
                            {insight.characters.map((char, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 mt-1.5 shrink-0" />
                                    {char}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
             </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};