import { Book, PlayerState } from '../types';
import { STORAGE_KEYS, SAMPLE_BOOKS } from '../constants';

export const getStoredLibrary = (): Book[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LIBRARY);
    if (stored) {
      const parsedBooks: Book[] = JSON.parse(stored);
      // For this demo, we can't persist local Blob URLs across refreshes.
      // We filter out local books that might have broken blob links or reset them.
      // In a real app, we'd use IndexedDB.
      // We will merge stored progress with SAMPLE_BOOKS to allow resuming samples.
      
      return parsedBooks.map(b => {
         // If it was a sample book, ensure the URL is correct from constants (in case we updated code)
         const sample = SAMPLE_BOOKS.find(sb => sb.id === b.id);
         if (sample) {
             return { ...sample, currentTime: b.currentTime, lastPlayed: b.lastPlayed };
         }
         return b;
      }).filter(b => !b.isLocal); // Remove local files on refresh as blobs expire
    }
  } catch (e) {
    console.error("Failed to load library", e);
  }
  return [...SAMPLE_BOOKS];
};

export const saveLibraryToStorage = (books: Book[]) => {
  try {
    // We save metadata. 
    // Note: Saving "isLocal" books here is futile for persistence across reload 
    // because blob URLs are session-bound. We save them to persist the LIST, 
    // but the user would technically need to re-upload. 
    // For this UX, we'll strip local books before saving to avoid broken links on reload.
    const persistentBooks = books.filter(b => !b.isLocal || !b.fileUrl.startsWith('blob:')); 
    
    // However, we DO want to save progress for sample books.
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(persistentBooks));
  } catch (e) {
    console.error("Failed to save library", e);
  }
};

export const saveLastPlayedId = (id: string) => {
  localStorage.setItem(STORAGE_KEYS.LAST_PLAYED_ID, id);
};

export const getLastPlayedId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_PLAYED_ID);
};
