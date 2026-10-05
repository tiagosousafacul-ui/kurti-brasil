import React, { useState, useEffect, useRef } from 'react';
import {
  SkipBack,
  SkipForward,
  Maximize2,
  X,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  ExternalLink,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

interface MiniPlayerProps {
  activeSection: string;
  onNavigateToMusic: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  activeSection,
  onNavigateToMusic
}) => {
  const {
    currentTrack,
    isPlaying,
    isMiniPlayerOpen,
    tracks,
    playTrack,
    nextTrack,
    prevTrack,
    togglePlay,
    closeMiniPlayer,
    openMiniPlayer
  } = useMusicPlayer();

  // Progress simulation state
  const [progressSec, setProgressSec] = useState<number>(24);
  const [durationSec, setDurationSec] = useState<number>(210);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [closeToast, setCloseToast] = useState<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse track duration if available (e.g. "3:45")
  useEffect(() => {
    if (currentTrack?.duration) {
      const parts = currentTrack.duration.split(':').map((p) => parseInt(p, 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setDurationSec(parts[0] * 60 + parts[1]);
      } else {
        setDurationSec(210);
      }
    } else {
      setDurationSec(210);
    }
    setProgressSec(0);
  }, [currentTrack?.youtubeId, currentTrack?.duration]);

  // Advance progress simulation while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgressSec((prev) => {
        if (prev >= durationSec) {
          if (isRepeat) return 0;
          nextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, durationSec, isRepeat, nextTrack]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setProgressSec(Math.floor(ratio * durationSec));
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
    if (!isShuffle && tracks.length > 1) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex]);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Robust Close Handler
  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    closeMiniPlayer();
    setCloseToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setCloseToast(false);
    }, 4000);
  };

  // Robust Open Handler
  const handleOpen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    openMiniPlayer();
    setCloseToast(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isMusicSection = activeSection === 'kurtimusic' || activeSection === 'kurti-music';
  const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const embedUrl = currentTrack
    ? `https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1&origin=${originParam}&rel=0&controls=0&playsinline=1`
    : '';

  // Background Audio Worker: Plays only on non-music sections to prevent duplicate audio
  const backgroundAudioPlayer = !isMusicSection && currentTrack && isPlaying ? (
    <div
      style={{
        position: 'fixed',
        width: '1px',
        height: '1px',
        opacity: 0.001,
        pointerEvents: 'none',
        bottom: 0,
        left: 0,
        zIndex: -9999,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <iframe
        key={`bg-audio-${currentTrack.youtubeId}`}
        src={embedUrl}
        title={`Áudio Kurti - ${currentTrack.title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  ) : null;

  if (!currentTrack) {
    return backgroundAudioPlayer;
  }

  // =========================================================================
  // 1. ESTADO FECHADO / MINIMIZADO: DOCK FLUTUANTE DE ALTO CONTRASTE (FUNDO ESCURO, TEXTO BRANCO E ROSA)
  // =========================================================================
  if (!isMiniPlayerOpen) {
    return (
      <>
        {backgroundAudioPlayer}

        {/* Notificação Temporária de Minimização */}
        {closeToast && (
          <div
            role="status"
            className="fixed bottom-[135px] lg:bottom-20 right-3 lg:right-6 z-50 bg-[#0e0608] text-white text-xs px-4 py-2.5 rounded-2xl border-2 border-[#ff2b66] shadow-[0_12px_40px_rgba(255,43,102,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[310px]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2b66] animate-ping shrink-0" />
              <p className="font-sans leading-tight text-white font-medium">
                Player minimizado. Toque em <strong className="text-[#ff668a]">Abrir Player</strong> para expandir a qualquer momento!
              </p>
            </div>
          </div>
        )}

        {/* Dock Flutuante para Reabrir a Qualquer Momento */}
        <aside
          aria-label="Reabrir player de música"
          className="fixed bottom-[74px] lg:bottom-5 right-3 lg:right-6 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-2 bg-[#0e0608] p-1.5 pr-2.5 rounded-full border-2 border-[#ff2b66] shadow-[0_10px_35px_rgba(255,43,102,0.5),0_4px_16px_rgba(0,0,0,0.95)]">
            {/* Botão de Expandir Clicando na Capa e Título */}
            <button
              type="button"
              onClick={handleOpen}
              className="flex items-center gap-3 text-left cursor-pointer group pl-1"
              title="Abrir MiniPlayer completo"
            >
              {/* Miniatura Colorida com Borda Rosa */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#ff2b66] shadow-md shrink-0 bg-black">
                <img
                  src={`https://img.youtube.com/vi/${currentTrack.youtubeId}/hqdefault.jpg`}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentTrack.youtubeId}/mqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff2b66] border border-white" />
                </div>
              </div>

              {/* Informações da Faixa em Branco Puro e Rosa Vibrante */}
              <div className="flex flex-col max-w-[130px] sm:max-w-[190px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#ff2b66] px-1.5 py-0.2 rounded-sm shadow-xs">
                    {isPlaying ? 'Tocando' : 'Música'}
                  </span>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 bg-white rounded-full h-full animate-[pulse_0.7s_infinite]" />
                      <span className="w-0.5 bg-[#ff668a] rounded-full h-2/3 animate-[pulse_0.9s_infinite_100ms]" />
                      <span className="w-0.5 bg-white rounded-full h-4/5 animate-[pulse_0.6s_infinite_200ms]" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-white truncate drop-shadow-sm leading-tight mt-0.5">
                  {currentTrack.title}
                </span>
                <span className="text-[11px] font-extrabold text-[#ff668a] truncate leading-tight">
                  {currentTrack.artist}
                </span>
              </div>
            </button>

            {/* Ações Rápidas no Dock: Play/Pause e Botão Abrir */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#ff2b66] hover:bg-[#ff1a53] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Tocar'}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleOpen}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#200c14] hover:bg-[#ff2b66] text-white rounded-full text-xs font-extrabold border border-[#ff2b66]/60 transition-all cursor-pointer shadow-xs group"
                title="Expandir player completo"
              >
                <span>Abrir</span>
                <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // =========================================================================
  // 2. ESTADO ABERTO / EXPANDIDO: CORES CONTRASTANTES (FUNDO ESCURO, TEXTO BRANCO E ROSA)
  // =========================================================================
  return (
    <>
      {backgroundAudioPlayer}
      <aside
        aria-label="Mini player de música ativo"
        className="fixed bottom-[72px] lg:bottom-5 left-2 right-2 sm:left-auto sm:right-6 z-50 sm:w-[490px] bg-[#0e0608] text-white rounded-3xl border-2 border-[#ff2b66] shadow-[0_16px_55px_rgba(255,43,102,0.45),0_6px_25px_rgba(0,0,0,0.95)] p-3.5 sm:p-4 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200"
      >
        {/* BARRA SUPERIOR: BADGE DE STATUS + AÇÕES FECHAR / MINIMIZAR */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#ff2b66]/30">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ff2b66] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              <span className={`w-2 h-2 rounded-full bg-white ${isPlaying ? 'animate-ping' : ''}`} />
              {isPlaying ? 'Tocando Agora' : 'Pausado'}
            </span>
            <span className="text-xs font-bold text-white bg-[#220d15] px-2.5 py-0.5 rounded-md border border-[#ff2b66]/40 truncate max-w-[150px]">
              {currentTrack.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Abrir Página Completa Kurti Music */}
            <button
              type="button"
              onClick={onNavigateToMusic}
              className="px-2.5 py-1 bg-[#220d15] hover:bg-[#ff2b66] text-[#ff668a] hover:text-white rounded-full text-xs font-extrabold flex items-center gap-1 border border-[#ff2b66]/50 transition-all cursor-pointer shadow-xs"
              title="Abrir no Kurti Music"
            >
              <span>Kurti Music</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Botão Minimizar */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 bg-[#220d15] hover:bg-[#ff2b66] text-white rounded-full border border-white/20 transition-all cursor-pointer"
              title="Minimizar para o dock flutuante"
              aria-label="Minimizar"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Botão Fechar com Contraste Alto */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 bg-[#ff2b66] hover:bg-[#ff1a53] text-white rounded-full shadow-md active:scale-90 transition-transform cursor-pointer"
              title="Fechar (você pode reabrir a qualquer momento)"
              aria-label="Fechar mini player"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* CORPO CENTRAL: CAPA COLORIDA + TÍTULO EM BRANCO PURO + ARTISTA EM ROSA VIBRANTE */}
        <div className="flex items-center gap-3.5">
          {/* Capa do Álbum Colorida com Borda Rosa de Alto Contraste */}
          <div
            onClick={onNavigateToMusic}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-[#ff2b66] shadow-[0_4px_22px_rgba(255,43,102,0.6)] cursor-pointer group bg-black"
            title="Abrir no Kurti Music"
          >
            <img
              src={`https://img.youtube.com/vi/${currentTrack.youtubeId}/hqdefault.jpg`}
              alt={`${currentTrack.title} - ${currentTrack.artist}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentTrack.youtubeId}/mqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2b66] shadow-[0_0_8px_#ff2b66]" />
              <Music className="w-4 h-4 text-white drop-shadow-sm" />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Textos em Branco e Rosa de Alta Legibilidade */}
          <div className="flex-1 min-w-0">
            <h4
              onClick={onNavigateToMusic}
              className="font-serif text-base sm:text-lg font-bold text-white truncate cursor-pointer hover:text-[#ff668a] transition-colors leading-snug drop-shadow-sm"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </h4>

            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-xs sm:text-sm text-[#ff668a] font-extrabold truncate drop-shadow-xs">
                {currentTrack.artist}
              </p>

              {/* Equalizador Ativo */}
              <div className="flex items-end gap-1 h-4 shrink-0 px-1.5 py-0.5 bg-[#200c14] rounded-md border border-[#ff2b66]/30">
                <span
                  className={`w-1 bg-[#ff2b66] rounded-full transition-all ${
                    isPlaying ? 'h-full animate-[pulse_0.6s_ease-in-out_infinite]' : 'h-1.5 opacity-40'
                  }`}
                />
                <span
                  className={`w-1 bg-white rounded-full transition-all ${
                    isPlaying ? 'h-3/4 animate-[pulse_0.8s_ease-in-out_infinite_100ms]' : 'h-1 opacity-40'
                  }`}
                />
                <span
                  className={`w-1 bg-[#ff668a] rounded-full transition-all ${
                    isPlaying ? 'h-4/5 animate-[pulse_0.7s_ease-in-out_infinite_200ms]' : 'h-2 opacity-40'
                  }`}
                />
                <span
                  className={`w-1 bg-white rounded-full transition-all ${
                    isPlaying ? 'h-1/2 animate-[pulse_0.9s_ease-in-out_infinite_150ms]' : 'h-1 opacity-40'
                  }`}
                />
                <span
                  className={`w-1 bg-[#ff2b66] rounded-full transition-all ${
                    isPlaying ? 'h-5/6 animate-[pulse_0.75s_ease-in-out_infinite_50ms]' : 'h-1.5 opacity-40'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO: CONTRASTE ALTO COM FUNDO PRETO E PREENCHIMENTO ROSA */}
        <div className="mt-3">
          <div
            onClick={handleSeek}
            className="group/seek relative w-full h-3 flex items-center cursor-pointer"
            role="slider"
            aria-label="Barra de progresso da música"
            aria-valuenow={progressSec}
            aria-valuemin={0}
            aria-valuemax={durationSec}
          >
            <div className="w-full h-2 bg-[#250d17] rounded-full overflow-hidden group-hover/seek:h-2.5 transition-all border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-[#ff2b66] via-[#ff668a] to-white rounded-full shadow-[0_0_12px_rgba(255,43,102,0.9)] transition-all duration-200"
                style={{ width: `${Math.min(100, (progressSec / durationSec) * 100)}%` }}
              />
            </div>
            {/* Marcador Branco com Borda Rosa */}
            <div
              className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#ff2b66] shadow-[0_0_10px_white,0_2px_6px_rgba(0,0,0,0.8)] transform -translate-x-1/2 transition-transform group-hover/seek:scale-125"
              style={{ left: `${Math.min(100, (progressSec / durationSec) * 100)}%` }}
            />
          </div>

          {/* Tempos em Branco Puro em Fonte Mono Legível */}
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white px-0.5 mt-0.5">
            <span className="text-[#ffb8cb]">{formatTime(progressSec)}</span>
            <span className="text-white">{formatTime(durationSec)}</span>
          </div>
        </div>

        {/* CONTROLES PRINCIPAIS: BOTÕES NÍTIDOS, BRANCOS E ROSA */}
        <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-[#ff2b66]/30">
          {/* Aleatório e Repetição */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShuffleToggle}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isShuffle
                  ? 'text-white bg-[#ff2b66] shadow-[0_0_12px_#ff2b66]'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
              title={isShuffle ? 'Modo aleatório ativado' : 'Ativar modo aleatório'}
              aria-label="Modo aleatório"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isRepeat
                  ? 'text-white bg-[#ff2b66] shadow-[0_0_12px_#ff2b66]'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
              title={isRepeat ? 'Repetir faixa ativado' : 'Ativar repetição'}
              aria-label="Repetir música"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Botões Centrais (Anterior, Play/Pause Grande, Próxima) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevTrack}
              className="p-2 rounded-full text-white bg-[#220d15] hover:bg-[#ff2b66] hover:text-white transition-all cursor-pointer active:scale-90 border border-white/20 shadow-xs"
              title="Faixa anterior"
              aria-label="Faixa anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* BOTÃO PLAY/PAUSE PRINCIPAL EM ROSA NEON */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-12 h-12 rounded-full text-white bg-gradient-to-tr from-[#ff2b66] via-[#ff1a53] to-[#ff5983] hover:scale-108 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-[0_4px_25px_rgba(255,43,102,0.9),0_0_15px_rgba(255,43,102,0.7)] border-2 border-white/50"
              title={isPlaying ? 'Pausar música' : 'Tocar música'}
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 rounded-full text-white bg-[#220d15] hover:bg-[#ff2b66] hover:text-white transition-all cursor-pointer active:scale-90 border border-white/20 shadow-xs"
              title="Próxima faixa"
              aria-label="Próxima faixa"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Controle de Volume */}
          <div className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMuteToggle}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="p-2 rounded-full text-white bg-[#220d15] hover:bg-[#ff2b66] transition-colors cursor-pointer border border-white/20"
              title={isMuted ? 'Desmutar som' : 'Mutar som'}
              aria-label="Controle de volume"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 50 ? (
                <Volume1 className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Slider de Volume Nítido */}
            <div
              className={`flex items-center transition-all ${
                showVolumeSlider ? 'w-20 opacity-100' : 'w-0 sm:w-20 opacity-0 sm:opacity-100 overflow-hidden'
              }`}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value, 10));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#ff2b66]"
                title={`Volume: ${isMuted ? 0 : volume}%`}
                aria-label="Ajustar volume"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
