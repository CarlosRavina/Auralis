import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100">
        <div className="p-6">
          <div className="flex items-center gap-3 text-amber-500 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-900/30 transition-colors text-sm"
            >
              Eliminar Libro
            </button>
          </div>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};