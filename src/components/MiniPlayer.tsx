import React, { useState, useRef } from 'react';
import {
  SkipBack,
  SkipForward,
  X,
  Music,
  Play,
  Pause,
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
    nextTrack,
    prevTrack,
    togglePlay,
    closeMiniPlayer,
    openMiniPlayer
  } = useMusicPlayer();

  const [closeToast, setCloseToast] = useState<boolean>(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMusicSection = activeSection === 'kurtimusic' || activeSection === 'kurti-music';
  const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const embedUrl = currentTrack
    ? `https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1&origin=${originParam}&rel=0&controls=0&playsinline=1`
    : '';

  // The global player mounts YouTube only while playing; Kurti Music owns its visible player.
  const backgroundAudioPlayer = !isMusicSection && currentTrack && isPlaying ? (
    <div style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0.001, pointerEvents: 'none', bottom: 0, left: 0, zIndex: -9999, overflow: 'hidden' }} aria-hidden="true">
      <iframe
        key={`bg-audio-${currentTrack.youtubeId}`}
        src={embedUrl}
        title={`Áudio Kurti - ${currentTrack.title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  ) : null;

  if (!currentTrack) return null;

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

        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[#ff2b66]/30">
          <a href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-[#ffb8cb] hover:text-white">
            Abrir no YouTube <ExternalLink className="w-3 h-3" />
          </a>
          <div className="flex items-center gap-3">
            <button type="button" onClick={prevTrack} className="p-2 rounded-full text-white bg-[#220d15] hover:bg-[#ff2b66]" title="Faixa anterior" aria-label="Faixa anterior">
              <SkipBack className="w-4 h-4" />
            </button>
            <button type="button" onClick={togglePlay} className="w-11 h-11 rounded-full text-white bg-[#ff2b66] flex items-center justify-center" title={isPlaying ? 'Pausar música' : 'Tocar música'} aria-label={isPlaying ? 'Pausar' : 'Tocar'}>
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button type="button" onClick={nextTrack} className="p-2 rounded-full text-white bg-[#220d15] hover:bg-[#ff2b66]" title="Faixa seguinte" aria-label="Faixa seguinte">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
