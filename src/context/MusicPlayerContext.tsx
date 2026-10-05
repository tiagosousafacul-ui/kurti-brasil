import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { YouTubeTrack, RecentlyWatchedTrack } from '../types';
import { INITIAL_YOUTUBE_TRACKS } from '../data/youtubeTracks';

interface MusicPlayerContextType {
  currentTrack: YouTubeTrack;
  isPlaying: boolean;
  isMiniPlayerOpen: boolean;
  isCollapsedPill: boolean;
  tracks: YouTubeTrack[];
  recentlyWatched: RecentlyWatchedTrack[];
  favorites: YouTubeTrack[];
  isFavorite: (youtubeId: string) => boolean;
  toggleFavorite: (track: YouTubeTrack) => void;
  playTrack: (track: YouTubeTrack) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  togglePlay: () => void;
  closeMiniPlayer: () => void;
  openMiniPlayer: () => void;
  toggleMiniPlayer: () => void;
  toggleCollapsePill: () => void;
  saveAndPersistTrack: (track: YouTubeTrack) => void;
  removeRecentTrack: (youtubeId: string) => void;
  clearRecentHistory: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial tracks (saved custom tracks + verified tracks)
  const [tracks, setTracks] = useState<YouTubeTrack[]>(() => {
    try {
      const saved = localStorage.getItem('kurti-custom-tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validCustom = (Array.isArray(parsed) ? parsed : []).filter(
          (t: any) => t && t.youtubeId && t.youtubeId !== '3kxUo1s_23U' && t.youtubeId !== 'o-w3hY-U51Y'
        );
        const seenIds = new Set<string>();
        const combined: YouTubeTrack[] = [];
        for (const t of validCustom) {
          if (!seenIds.has(t.youtubeId)) {
            seenIds.add(t.youtubeId);
            combined.push(t);
          }
        }
        for (const t of INITIAL_YOUTUBE_TRACKS) {
          if (!seenIds.has(t.youtubeId)) {
            seenIds.add(t.youtubeId);
            combined.push(t);
          }
        }
        return combined;
      }
    } catch {
      // fallback
    }
    return INITIAL_YOUTUBE_TRACKS;
  });

  // 2. Recently watched tracks from localStorage
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedTrack[]>(() => {
    try {
      const saved = localStorage.getItem('kurti-recently-watched');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item: any) => item && item.youtubeId && typeof item.watchedAt === 'number'
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // 3. Favorites tracks from localStorage
  const [favoriteTracks, setFavoriteTracks] = useState<YouTubeTrack[]>(() => {
    try {
      const saved = localStorage.getItem('kurti-favorite-tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => t && t.youtubeId);
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const isFavorite = (youtubeId: string): boolean => {
    return favoriteTracks.some((t) => t.youtubeId === youtubeId);
  };

  const toggleFavorite = (track: YouTubeTrack) => {
    if (!track || !track.youtubeId) return;
    setFavoriteTracks((prev) => {
      const exists = prev.some((t) => t.youtubeId === track.youtubeId);
      let updated: YouTubeTrack[];
      if (exists) {
        updated = prev.filter((t) => t.youtubeId !== track.youtubeId);
      } else {
        const itemToSave: YouTubeTrack = {
          ...track,
          id: track.id || `fav-${track.youtubeId}`
        };
        updated = [itemToSave, ...prev];
        saveAndPersistTrack(itemToSave);
      }
      try {
        localStorage.setItem('kurti-favorite-tracks', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // 4. Current active track
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack>(() => {
    try {
      const savedRecent = localStorage.getItem('kurti-recently-watched');
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.youtubeId) {
          return parsed[0];
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_YOUTUBE_TRACKS[0];
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kurti-miniplayer-open');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
    return true;
  });
  const [isCollapsedPill, setIsCollapsedPill] = useState<boolean>(false);

  // Automatically save any added / played / searched song with the other tracks permanently
  const saveAndPersistTrack = (newTrack: YouTubeTrack) => {
    if (!newTrack || !newTrack.youtubeId) return;

    setTracks((prev) => {
      const existsIndex = prev.findIndex((t) => t.youtubeId === newTrack.youtubeId);
      let updated: YouTubeTrack[];
      if (existsIndex >= 0) {
        const existing = prev[existsIndex];
        const rest = prev.filter((_, idx) => idx !== existsIndex);
        updated = [existing, ...rest];
      } else {
        const itemToSave: YouTubeTrack = {
          ...newTrack,
          id: newTrack.id || `custom-${newTrack.youtubeId}-${Date.now()}`
        };
        updated = [itemToSave, ...prev];
      }

      try {
        const initialSet = new Set(INITIAL_YOUTUBE_TRACKS.map((t) => t.youtubeId));
        const customToSave = updated.filter(
          (t) => !initialSet.has(t.youtubeId) || t.id.startsWith('custom-') || t.id.startsWith('saved-') || t.id.startsWith('yt-')
        );
        localStorage.setItem('kurti-custom-tracks', JSON.stringify(customToSave));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Record into recently watched
  const recordToHistory = (track: YouTubeTrack) => {
    if (!track || !track.youtubeId) return;
    setRecentlyWatched((prev) => {
      const filtered = prev.filter((item) => item.youtubeId !== track.youtubeId);
      const newEntry: RecentlyWatchedTrack = {
        ...track,
        watchedAt: Date.now()
      };
      const updated = [newEntry, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('kurti-recently-watched', JSON.stringify(updated));
      } catch {
        // storage disabled or full
      }
      return updated;
    });
  };

  const playTrack = (track: YouTubeTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsMiniPlayerOpen(true);
    saveAndPersistTrack(track);
    recordToHistory(track);
  };

  const nextTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.youtubeId === currentTrack.youtubeId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const prevTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.youtubeId === currentTrack.youtubeId);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const closeMiniPlayer = () => {
    setIsMiniPlayerOpen(false);
    try {
      localStorage.setItem('kurti-miniplayer-open', 'false');
    } catch {}
  };

  const openMiniPlayer = () => {
    setIsMiniPlayerOpen(true);
    setIsCollapsedPill(false);
    try {
      localStorage.setItem('kurti-miniplayer-open', 'true');
    } catch {}
  };

  const toggleMiniPlayer = () => {
    setIsMiniPlayerOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kurti-miniplayer-open', String(next));
      } catch {}
      return next;
    });
    setIsCollapsedPill(false);
  };

  const toggleCollapsePill = () => {
    setIsCollapsedPill((prev) => !prev);
  };

  const removeRecentTrack = (youtubeId: string) => {
    setRecentlyWatched((prev) => {
      const updated = prev.filter((t) => t.youtubeId !== youtubeId);
      try {
        localStorage.setItem('kurti-recently-watched', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentHistory = () => {
    setRecentlyWatched([]);
    try {
      localStorage.removeItem('kurti-recently-watched');
    } catch {
      // ignore
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMiniPlayerOpen,
        isCollapsedPill,
        tracks,
        recentlyWatched,
        favorites: favoriteTracks,
        isFavorite,
        toggleFavorite,
        playTrack,
        nextTrack,
        prevTrack,
        togglePlay,
        closeMiniPlayer,
        openMiniPlayer,
        toggleMiniPlayer,
        toggleCollapsePill,
        saveAndPersistTrack,
        removeRecentTrack,
        clearRecentHistory
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
