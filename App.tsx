import React, { useState, useEffect, useCallback } from 'react';
import { Book, AIInsight } from './types';
import { getStoredLibrary, saveLibraryToStorage, saveLastPlayedId, getLastPlayedId } from './services/storageService';
import { generateBookInsight } from './services/geminiService';
import { PlayerControls } from './components/PlayerControls';
import { Library } from './components/Library';
import { AIInsightModal } from './components/AIInsightModal';
import { ConfirmationModal } from './components/ConfirmationModal';

const App: React.FC = () => {
  const [library, setLibrary] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  
  // Insight State
  const [isInsightOpen, setInsightOpen] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightData, setInsightData] = useState<AIInsight | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Delete Confirmation State
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  // Load Library on Mount
  useEffect(() => {
    const books = getStoredLibrary();
    setLibrary(books);

    const lastId = getLastPlayedId();
    if (lastId) {
      const found = books.find(b => b.id === lastId);
      if (found) setCurrentBook(found);
    }
  }, []);

  // Persist Library updates (progress)
  useEffect(() => {
    if (library.length > 0) {
      saveLibraryToStorage(library);
    }
  }, [library]);

  const handleSelectBook = (book: Book) => {
    setCurrentBook(book);
    saveLastPlayedId(book.id);
  };

  const handleUpdateProgress = useCallback((time: number) => {
    if (!currentBook) return;

    // We debounce state updates or simply update the ref logic, 
    // but here we update the library state to persist progress 
    // slightly less frequently or just on pause/unload ideally. 
    // For simplicity in React, we update local state every few seconds or on pause.
    // However, to keep UI responsive, we'll update the 'library' object which drives the UI.
    
    // Optimization: Only update library state if difference > 5 seconds to avoid re-renders
    if (Math.abs(currentBook.currentTime - time) > 1) {
        setLibrary(prevLib => prevLib.map(b => 
            b.id === currentBook.id 
            ? { ...b, currentTime: time, lastPlayed: Date.now() } 
            : b
        ));
        // Also update currentBook ref so the player knows
        setCurrentBook(prev => prev ? { ...prev, currentTime: time } : null);
    }
  }, [currentBook]);

  const handleAddBook = (files: FileList) => {
    const newBooks: Book[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      author: 'Autor Desconocido', // Metadata parsing requires complex libs (music-metadata-browser) not used here
      coverUrl: '', // No external cover used
      fileUrl: URL.createObjectURL(file),
      duration: 0, // Will be set by audio element on load
      currentTime: 0,
      lastPlayed: Date.now(),
      isLocal: true,
    }));

    setLibrary(prev => [...prev, ...newBooks]);
  };

  const handleRequestRemove = (id: string) => {
    setBookToDelete(id);
  };

  const handleConfirmRemove = () => {
    if (!bookToDelete) return;

    setLibrary(prev => prev.filter(b => b.id !== bookToDelete));
    if (currentBook?.id === bookToDelete) {
        setCurrentBook(null);
    }
    setBookToDelete(null);
    
    // Explicitly update storage immediately to ensure deletion persists even if library was empty
    const updatedLibrary = library.filter(b => b.id !== bookToDelete);
    saveLibraryToStorage(updatedLibrary);
  };

  const handleInsightRequest = async () => {
    if (!currentBook) return;
    
    setInsightOpen(true);
    setInsightLoading(true);
    setInsightError(null);
    setInsightData(null);

    try {
      const data = await generateBookInsight(currentBook.title, currentBook.author);
      setInsightData(data);
    } catch (err: any) {
      setInsightError(err.message || "Error al obtener información");
    } finally {
      setInsightLoading(false);
    }
  };

  const getBookTitleToDelete = () => {
      return library.find(b => b.id === bookToDelete)?.title || "este libro";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
                    A
                </div>
                <span className="text-xl font-bold tracking-tight">Auralis</span>
            </div>
        </div>
      </nav>

      <main>
        <Library 
            books={library} 
            currentBookId={currentBook?.id} 
            onSelectBook={handleSelectBook} 
            onAddBook={handleAddBook}
            onRemoveBook={handleRequestRemove}
        />
      </main>

      <PlayerControls 
        currentBook={currentBook}
        onUpdateProgress={handleUpdateProgress}
        onBookFinish={() => console.log("Libro terminado")}
        onInsightRequest={handleInsightRequest}
      />

      <AIInsightModal 
        isOpen={isInsightOpen}
        onClose={() => setInsightOpen(false)}
        isLoading={insightLoading}
        insight={insightData}
        book={currentBook}
        error={insightError}
      />

      <ConfirmationModal
        isOpen={!!bookToDelete}
        title="Eliminar Audiolibro"
        message={`¿Estás seguro de que quieres eliminar "${getBookTitleToDelete()}" de tu biblioteca? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmRemove}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  );
};

export default App;