import React, { useRef } from 'react';
import { Book } from '../types';
import { Plus, PlayCircle, Headphones, Trash2, BookOpen } from 'lucide-react';

interface LibraryProps {
  books: Book[];
  currentBookId: string | undefined;
  onSelectBook: (book: Book) => void;
  onAddBook: (files: FileList) => void;
  onRemoveBook: (id: string) => void;
}

const formatTimeShort = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export const Library: React.FC<LibraryProps> = ({ books, currentBookId, onSelectBook, onAddBook, onRemoveBook }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddBook(e.target.files);
    }
  };

  return (
    <div className="p-4 pb-32 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Mi Biblioteca</h1>
            <p className="text-slate-400 text-xs">Continúa donde lo dejaste</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 text-sm"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Añadir</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple
          accept="audio/mpeg,audio/mp4,audio/ogg,audio/flac,audio/aac,audio/wma,audio/x-m4a,audio/x-m4b,audio/x-ms-wma,.mp3,.m4a,.m4b,.flac,.ogg,.aac,.wma"
          onChange={handleFileChange}
        />
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <Headphones size={48} className="mb-4 opacity-50" />
          <p>Tu biblioteca está vacía.</p>
          <button onClick={() => fileInputRef.current?.click()} className="text-blue-400 hover:underline mt-2">
            Sube un archivo de audio
          </button>
        </div>
      ) : (
        /* Dense Grid Layout */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {books.map((book) => {
            const isPlaying = currentBookId === book.id;
            const progress = book.duration > 0 ? (book.currentTime / book.duration) * 100 : 0;
            const remainingSeconds = Math.max(0, book.duration - book.currentTime);
            const remainingPercent = 100 - progress;
            
            return (
              <div 
                key={book.id} 
                className={`group relative bg-slate-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ring-1 ${isPlaying ? 'ring-blue-500' : 'ring-slate-700'}`}
              >
                {/* Compact Icon Header (Reduced height from h-32 to h-24) */}
                <div className="h-24 w-full relative bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    
                    {/* The Icon (Scaled down) */}
                    <div className="text-slate-500/50 group-hover:text-slate-400/80 transition-colors">
                        <BookOpen size={32} strokeWidth={1.5} />
                    </div>

                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button 
                            onClick={() => onSelectBook(book)}
                            className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-blue-500 hover:text-white text-white transition-all transform scale-90 group-hover:scale-100"
                         >
                            <PlayCircle size={28} fill="currentColor" className="text-white" />
                         </button>
                         <button
                            onClick={(e) => { e.stopPropagation(); onRemoveBook(book.id); }}
                            className="bg-red-500/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-red-500/80 text-white transition-all transform scale-90 group-hover:scale-100"
                            title="Eliminar de la biblioteca"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    
                    {/* Progress Bar Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/50">
                        <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Compact Metadata */}
                <div className="p-2">
                  <h3 className="font-semibold text-white truncate text-xs leading-tight mb-0.5" title={book.title}>{book.title}</h3>
                  <p className="text-slate-400 text-[10px] truncate">{book.author}</p>
                  
                  {/* Stats Row */}
                  <div className="flex flex-col mt-2 text-[9px] font-medium text-slate-500">
                    <div className="flex justify-between items-center">
                        <span className={progress > 0 ? "text-blue-400" : ""}>{Math.floor(progress)}%</span>
                        <span>{Math.ceil(remainingPercent)}% falta</span>
                    </div>
                    {book.duration > 0 && (
                        <div className="text-right text-[8px] opacity-75 mt-0.5">
                        {formatTimeShort(remainingSeconds)}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};