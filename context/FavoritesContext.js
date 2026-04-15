import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext();

const STORAGE_KEYS = {
  FAVORITES: '@musicapp_favorites',
  PLAYLISTS: '@musicapp_playlists',
  RECENTLY_PLAYED: '@musicapp_recently_played',
};

const DEFAULT_PLAYLISTS = [
  { id: 'pl1', name: 'Nhạc Buồn', songs: [], cover: null },
  { id: 'pl2', name: 'Chill Playlist', songs: [], cover: null },
];

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState(DEFAULT_PLAYLISTS);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Load data từ AsyncStorage khi khởi động ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [favJson, plJson, rpJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS),
          AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED),
        ]);
        if (favJson) setFavorites(JSON.parse(favJson));
        if (plJson) setPlaylists(JSON.parse(plJson));
        if (rpJson) setRecentlyPlayed(JSON.parse(rpJson));
      } catch (e) {
        console.warn('Lỗi load dữ liệu:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // --- Auto-save khi data thay đổi (chỉ sau khi đã load xong) ---
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists)).catch(() => {});
  }, [playlists, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(recentlyPlayed)).catch(() => {});
  }, [recentlyPlayed, isLoaded]);

  const isFavorite = useCallback(
    (songId) => favorites.some((s) => s.id === songId),
    [favorites]
  );

  const toggleFavorite = useCallback((song) => {
    setFavorites((prev) => {
      const exists = prev.find((s) => s.id === song.id);
      if (exists) return prev.filter((s) => s.id !== song.id);
      return [song, ...prev];
    });
  }, []);

  const addToRecentlyPlayed = useCallback((song) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      return [song, ...filtered].slice(0, 20);
    });
  }, []);

  const createPlaylist = useCallback((name) => {
    const newPl = {
      id: `pl_${Date.now()}`,
      name,
      songs: [],
      cover: null,
    };
    setPlaylists((prev) => [...prev, newPl]);
    return newPl.id;
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  }, []);

  const addSongToPlaylist = useCallback((playlistId, song) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.songs.find((s) => s.id === song.id)) return p;
        return {
          ...p,
          songs: [...p.songs, song],
          cover: p.cover || song.image,
        };
      })
    );
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        return { ...p, songs: p.songs.filter((s) => s.id !== songId) };
      })
    );
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        playlists,
        recentlyPlayed,
        isFavorite,
        toggleFavorite,
        addToRecentlyPlayed,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
