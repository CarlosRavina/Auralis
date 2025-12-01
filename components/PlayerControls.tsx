import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, Gauge, Volume2, VolumeX, Mic, ChevronUp, BookOpen, AlertCircle } from 'lucide-react';
import { PlayerState, PlaybackSpeed, Book } from '../types';

interface PlayerControlsProps {
  currentBook: Book | null;
  onUpdateProgress: (time: number) => void;
  onBookFinish: () => void;
  onInsightRequest: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const h = Math.floor(m / 60);
  const mRem = m % 60;
  
  if (h > 0) {
      return `${h}:${mRem < 10 ? '0' + mRem : mRem}:${s < 10 ? '0' + s : s}`;
  }
  return `${m}:${s < 10 ? '0' + s : s}`;
};

export const PlayerControls: React.FC<PlayerControlsProps> = ({ 
  currentBook, 
  onUpdateProgress,
  onBookFinish,
  onInsightRequest
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(PlaybackSpeed.X100);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize player when book changes
  useEffect(() => {
    setError(null); // Reset error state on book change
    if (currentBook && audioRef.current) {
      audioRef.current.src = currentBook.fileUrl;
      audioRef.current.currentTime = currentBook.currentTime;
      setCurrentTime(currentBook.currentTime);
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Auto-play is generally blocked by browsers unless user interacted, 
      // but if changing tracks within a session it works.
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((e) => {
             console.warn("Auto-play prevented:", e);
             setIsPlaying(false);
          });
      }
    }
  }, [currentBook?.id]); // Only re-run if ID changes

  // Handle Playback Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Sleep Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (sleepTimer !== null && isPlaying) {
      interval = setInterval(() => {
        setSleepTimer((prev) => {
          if (prev === null || prev <= 0) {
            setIsPlaying(false);
            audioRef.current?.pause();
            return null;
          }
          return prev - (1/60); // Decrease by 1 second (1/60th of a minute)
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimer, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (amount: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += amount;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const now = audioRef.current.currentTime;
      setCurrentTime(now);
      onUpdateProgress(now);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setError(null); // Clear error if metadata loads successfully
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget;
    if (audio.error) {
        let msg = "Error desconocido.";
        switch(audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                msg = "Reproducción abortada.";
                break;
            case MediaError.MEDIA_ERR_NETWORK:
                msg = "Error de red al cargar el audio.";
                break;
            case MediaError.MEDIA_ERR_DECODE:
                msg = "El audio está dañado o tiene un formato desconocido.";
                break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                msg = "Formato no soportado por este navegador (ej. WMA).";
                break;
        }
        setError(msg);
        setIsPlaying(false);
    }
  };

  if (!currentBook) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-slate-800 border-t border-slate-700 flex items-center justify-center text-slate-400">
        Selecciona un libro para comenzar a escuchar
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingPercent = duration > 0 ? 100 - progressPercent : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 pb-8 md:pb-4 transition-all z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleAudioError}
        onEnded={() => {
            setIsPlaying(false);
            onBookFinish();
        }}
      />
      
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-2">
        {/* Current Time & Percent */}
        <div className="flex flex-col items-center min-w-[3rem]">
            <span className="text-xs text-slate-300 font-medium tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-[10px] text-blue-400 font-medium">{Math.floor(progressPercent)}%</span>
        </div>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={!!error}
          className={`flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-blue-400 transition-colors ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        {/* Duration & Percent Remaining */}
        <div className="flex flex-col items-center min-w-[3rem]">
            <span className="text-xs text-slate-300 font-medium tabular-nums">{formatTime(duration)}</span>
            <span className="text-[10px] text-slate-500 font-medium">{Math.ceil(remainingPercent)}%</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        
        {/* Left Side: Info & AI */}
        {/* Changed width to auto on mobile and added max-width to title to prevent overflow */}
        <div className="flex items-center gap-3 w-auto sm:w-1/4 shrink-1 overflow-hidden">
          <div className="h-10 w-10 rounded bg-slate-800 flex items-center justify-center hidden sm:flex shrink-0">
             <BookOpen size={20} className="text-slate-500" />
          </div>
          <div className="flex flex-col overflow-hidden max-w-[120px] sm:max-w-none">
            <span className="text-sm font-medium text-white truncate">{currentBook.title}</span>
            <span className="text-xs text-slate-400 truncate">{currentBook.author}</span>
          </div>
          <button 
             onClick={onInsightRequest}
             className="ml-2 p-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition-colors shrink-0"
             title="Obtener información con IA"
          >
             <Mic size={16} />
          </button>
        </div>

        {/* Center: Playback Controls OR Error Message */}
        <div className="flex items-center gap-4 sm:gap-6 justify-center flex-1 shrink-0">
          {error ? (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-full">
                <AlertCircle size={20} />
                <span className="text-xs font-medium">{error}</span>
            </div>
          ) : (
            <>
                <button onClick={() => skip(-15)} className="text-slate-300 hover:text-white transition">
                    <SkipBack size={24} />
                </button>
                
                <button 
                    onClick={togglePlay} 
                    className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 transition-transform active:scale-95"
                >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1"/>}
                </button>

                <button onClick={() => skip(30)} className="text-slate-300 hover:text-white transition">
                    <SkipForward size={24} />
                </button>
            </>
          )}
        </div>

        {/* Right: Tools */}
        {/* Changed width to auto on mobile and justify-end */}
        <div className="flex items-center gap-2 sm:gap-4 w-auto sm:w-1/4 justify-end">

            {/* Volume Control */}
            <div className="flex items-center gap-2 mr-2 group">
                <button 
                    onClick={toggleMute}
                    className="text-slate-300 hover:text-white transition-colors"
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-slate-400 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-white transition-all hidden sm:block"
                    title="Volumen"
                />
            </div>
            
            {/* Speed Control */}
            <div className="relative">
                <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    disabled={!!error}
                    className={`flex items-center gap-1 text-slate-300 hover:text-white text-xs font-bold ${error ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <Gauge size={16} />
                    {/* Hide text on mobile */}
                    <span className="hidden sm:inline">{speed}x</span>
                </button>
                {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-1 flex flex-col gap-1 min-w-[80px]">
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                            <button 
                                key={s}
                                onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                                className={`px-3 py-2 text-left text-sm rounded hover:bg-slate-700 ${speed === s ? 'text-blue-400' : 'text-slate-300'}`}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sleep Timer */}
            <div className="relative">
                <button 
                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                    disabled={!!error}
                    className={`flex items-center gap-1 hover:text-white text-xs font-bold ${sleepTimer ? 'text-blue-400' : 'text-slate-300'} ${error ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <Clock size={16} />
                    {/* Hide text on mobile */}
                    {sleepTimer && <span className="hidden sm:inline">{Math.ceil(sleepTimer)}m</span>}
                </button>
                {showSleepMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-1 flex flex-col gap-1 min-w-[120px]">
                        <div className="px-3 py-1 text-xs text-slate-500 uppercase tracking-wider font-semibold">Temporizador</div>
                        {[15, 30, 45, 60].map((m) => (
                            <button 
                                key={m}
                                onClick={() => { setSleepTimer(m); setShowSleepMenu(false); }}
                                className="px-3 py-2 text-left text-sm rounded hover:bg-slate-700 text-slate-300"
                            >
                                {m} min
                            </button>
                        ))}
                        <button 
                             onClick={() => { setSleepTimer(null); setShowSleepMenu(false); }}
                             className="px-3 py-2 text-left text-sm rounded hover:bg-red-900/30 text-red-400"
                        >
                            Apagado
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};