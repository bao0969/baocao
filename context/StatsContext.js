import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const StatsContext = createContext();

const STATS_KEY = '@musicapp_stats_v1';

const defaultStats = {
  totalListenSeconds: 0,
  songPlayCount: {},      // { songId: count }
  artistPlayCount: {},    // { artistName: count }
  genrePlayCount: {},     // { genre: count }
  dailyStats: {},         // { 'YYYY-MM-DD': seconds }
  weekdayStats: [0,0,0,0,0,0,0], // Mon-Sun
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState(defaultStats);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((json) => {
      if (json) {
        try {
          const parsed = JSON.parse(json);
          setStats({ ...defaultStats, ...parsed });
        } catch (_) {}
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats)).catch(() => {});
  }, [stats, isLoaded]);

  const recordPlay = useCallback((song, durationSeconds = 0) => {
    if (!song) return;
    const today = new Date().toISOString().slice(0, 10);
    const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat

    setStats((prev) => {
      const songCount = { ...prev.songPlayCount };
      songCount[song.id] = (songCount[song.id] || 0) + 1;

      const artistCount = { ...prev.artistPlayCount };
      artistCount[song.artist] = (artistCount[song.artist] || 0) + 1;

      const genreCount = { ...prev.genrePlayCount };
      if (song.genre) {
        genreCount[song.genre] = (genreCount[song.genre] || 0) + 1;
      }

      const daily = { ...prev.dailyStats };
      daily[today] = (daily[today] || 0) + Math.round(durationSeconds);

      const weekday = [...prev.weekdayStats];
      weekday[dayOfWeek] = weekday[dayOfWeek] + Math.round(durationSeconds);

      return {
        ...prev,
        totalListenSeconds: prev.totalListenSeconds + Math.round(durationSeconds),
        songPlayCount: songCount,
        artistPlayCount: artistCount,
        genrePlayCount: genreCount,
        dailyStats: daily,
        weekdayStats: weekday,
      };
    });
  }, []);

  const getTopSongs = useCallback((limit = 5, songsList = []) => {
    const counts = stats.songPlayCount;
    return songsList
      .filter((s) => counts[s.id])
      .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
      .slice(0, limit);
  }, [stats.songPlayCount]);

  const getTopArtists = useCallback((limit = 3) => {
    return Object.entries(stats.artistPlayCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }, [stats.artistPlayCount]);

  const getTotalHours = useCallback(() => {
    return (stats.totalListenSeconds / 3600).toFixed(1);
  }, [stats.totalListenSeconds]);

  const getLast7Days = useCallback(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({
        date: key,
        label: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        seconds: stats.dailyStats[key] || 0,
      });
    }
    return result;
  }, [stats.dailyStats]);

  const resetStats = useCallback(() => {
    setStats(defaultStats);
  }, []);

  return (
    <StatsContext.Provider value={{
      stats,
      recordPlay,
      getTopSongs,
      getTopArtists,
      getTotalHours,
      getLast7Days,
      resetStats,
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => useContext(StatsContext);
