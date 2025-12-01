import { Book } from './types';

export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'sample-1',
    title: 'La Guerra de los Mundos',
    author: 'H.G. Wells',
    coverUrl: '', // No longer using external images
    fileUrl: 'https://archive.org/download/war_of_the_worlds_librivox/war_of_the_worlds_01_wells_64kb.mp3', // LibriVox public domain
    duration: 1450, // Approx duration of first chapter
    currentTime: 0,
    lastPlayed: Date.now(),
    isLocal: false,
  },
  {
    id: 'sample-2',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    coverUrl: '',
    fileUrl: 'https://archive.org/download/frankenstein_1307_librivox/frankenstein_01_shelley_64kb.mp3',
    duration: 1200,
    currentTime: 0,
    lastPlayed: Date.now() - 10000,
    isLocal: false,
  }
];

export const STORAGE_KEYS = {
  LIBRARY: 'auralis_library_v1',
  LAST_PLAYED_ID: 'auralis_last_id',
};