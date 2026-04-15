import { Audio } from 'expo-av';
import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { SONGS } from '../constants/songs';
import { useStats } from './StatsContext';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [queue, setQueue] = useState(SONGS);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isLoading, setIsLoading] = useState(false);
  const [sleepTimer, setSleepTimerState] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null); // seconds remaining

  // Use refs to access current values inside callbacks without stale closures
  const soundRef = useRef(null);
  const queueRef = useRef(SONGS);
  const queueIndexRef = useRef(0);
  const shuffleRef = useRef(false);
  const repeatRef = useRef('off');
  const volumeRef = useRef(1.0);
  const positionRef = useRef(0);
  const sleepTimerTimeoutRef = useRef(null);
  const sleepTimerIntervalRef = useRef(null);

  const { recordPlay } = useStats();

  // --- STATS TRACKING LOGIC ---
  useEffect(() => {
    let playStart = null;
    if (isPlaying) {
      playStart = Date.now();
    }
    
    return () => {
      // Cleanup runs when isPlaying or currentSong changes
      if (playStart && currentSong && recordPlay) {
        const elapsed = (Date.now() - playStart) / 1000;
        if (elapsed > 1) { // Lọc nhiễu (nghe trên 1s mới tính)
          recordPlay(currentSong, elapsed);
        }
      }
    };
  }, [isPlaying, currentSong, recordPlay]);
  // ----------------------------

  const setSleepTimer = (minutes) => {
    // Clear existing timers
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }

    setSleepTimerState(minutes);
    setSleepTimerRemaining(minutes ? minutes * 60 : null);

    if (minutes) {
      let remaining = minutes * 60;
      // Countdown interval
      sleepTimerIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setSleepTimerRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(sleepTimerIntervalRef.current);
          sleepTimerIntervalRef.current = null;
        }
      }, 1000);
      // Actual pause timeout
      sleepTimerTimeoutRef.current = setTimeout(() => {
        pauseSong();
        setSleepTimerState(null);
        setSleepTimerRemaining(null);
        sleepTimerTimeoutRef.current = null;
      }, minutes * 60 * 1000);
    }
  };

  const playSongInternal = async (song, newQueue, idx) => {
    try {
      setIsLoading(true);

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true, volume: volumeRef.current }
      );

      soundRef.current = newSound;
      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
      setPosition(0);
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setPosition(status.positionMillis);
        positionRef.current = status.positionMillis;
        setDuration(status.durationMillis || 0);

        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          // Handle auto-play next - use refs to avoid stale closure
          const q = queueRef.current;
          const currentIdx = queueIndexRef.current;
          const repeat = repeatRef.current;
          const shuffle = shuffleRef.current;

          if (repeat === 'one') {
            playSongInternal(q[currentIdx], q, currentIdx);
          } else {
            let nextIdx;
            if (shuffle) {
              nextIdx = Math.floor(Math.random() * q.length);
            } else {
              nextIdx = currentIdx + 1;
            }
            if (nextIdx < q.length) {
              queueIndexRef.current = nextIdx;
              setQueueIndex(nextIdx);
              playSongInternal(q[nextIdx], q, nextIdx);
            } else if (repeat === 'all') {
              queueIndexRef.current = 0;
              setQueueIndex(0);
              playSongInternal(q[0], q, 0);
            }
          }
        }
      });
    } catch (error) {
      console.log('Lỗi phát nhạc:', error);
      setIsLoading(false);
    }
  };

  const playSong = async (song, newQueue = null) => {
    const q = newQueue || queueRef.current;
    const idx = q.findIndex((s) => s.id === song.id);
    const finalIdx = idx >= 0 ? idx : 0;
    if (newQueue) {
      queueRef.current = newQueue;
      setQueue(newQueue);
    }
    queueIndexRef.current = finalIdx;
    setQueueIndex(finalIdx);
    await playSongInternal(song, q, finalIdx);
  };

  const playQueue = async (songs, startIndex = 0) => {
    queueRef.current = songs;
    queueIndexRef.current = startIndex;
    setQueue(songs);
    setQueueIndex(startIndex);
    await playSongInternal(songs[startIndex], songs, startIndex);
  };

  const pauseSong = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSong = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const nextSong = async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    let nextIdx;
    if (shuffleRef.current) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else {
      nextIdx = (idx + 1) % q.length;
    }
    queueIndexRef.current = nextIdx;
    setQueueIndex(nextIdx);
    await playSongInternal(q[nextIdx], q, nextIdx);
  };

  const prevSong = async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (positionRef.current > 3000) {
      await seekTo(0);
      return;
    }
    const prevIdx = (idx - 1 + q.length) % q.length;
    queueIndexRef.current = prevIdx;
    setQueueIndex(prevIdx);
    await playSongInternal(q[prevIdx], q, prevIdx);
  };

  const seekTo = async (value) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
      setPosition(value);
    }
  };

  const changeVolume = async (value) => {
    volumeRef.current = value;
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(value);
    }
    setVolume(value);
  };

  const toggleShuffle = () => {
    shuffleRef.current = !shuffleRef.current;
    setShuffleMode((prev) => !prev);
  };

  const toggleRepeat = () => {
    const next = repeatRef.current === 'off' ? 'all' : repeatRef.current === 'all' ? 'one' : 'off';
    repeatRef.current = next;
    setRepeatMode(next);
  };

  const addToQueue = (song) => {
    setQueue((prev) => {
      if (prev.find((s) => s.id === song.id)) return prev;
      const updated = [...prev, song];
      queueRef.current = updated;
      return updated;
    });
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong, isPlaying, isLoading,
        duration, position, volume,
        queue, queueIndex, shuffleMode, repeatMode,
        sleepTimer, sleepTimerRemaining, setSleepTimer,
        playlist: SONGS,
        playSong, playQueue, pauseSong, resumeSong,
        nextSong, prevSong, seekTo, changeVolume,
        toggleShuffle, toggleRepeat, addToQueue,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);