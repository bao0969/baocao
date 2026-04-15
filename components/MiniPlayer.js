import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { useFavorites } from '../context/FavoritesContext';
import { useMusic } from '../context/MusicContext';

const formatTime = (millis) => {
  if (!millis) return '0:00';
  const s = Math.floor(millis / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

export default function MiniPlayer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const { currentSong, isPlaying, pauseSong, resumeSong, nextSong, duration, position, volume, changeVolume } = useMusic();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!currentSong) return null;

  const progress = duration > 0 ? position / duration : 0;
  
  // Tính padding bottom để không bị đè bởi tab bar. Tab bar height ~ 60 trên mobile.
  const bottomSpace = isLargeScreen ? 0 : 60; 

  return (
    <View style={[styles.container, { bottom: bottomSpace }]}>
      {/* Progress bar thin strip */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Content row */}
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.9}
        onPress={() => router.push('/player')}
      >
        <Image source={{ uri: currentSong.image }} style={styles.art} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        <View style={styles.controls}>
          {isLargeScreen && (
            <View style={styles.volumeContainer}>
              <Ionicons name={volume === 0 ? "volume-mute" : "volume-medium"} size={18} color="#aaa" />
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                minimumTrackTintColor="#c665e8"
                maximumTrackTintColor="#ffffff30"
                thumbTintColor="#fff"
                onValueChange={changeVolume}
              />
            </View>
          )}

          <TouchableOpacity
            onPress={() => toggleFavorite(currentSong)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite(currentSong.id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite(currentSong.id) ? '#c665e8' : '#aaa'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (isPlaying ? pauseSong() : resumeSong())}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={38}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextSong}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="play-skip-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#1e1030',
    borderTopWidth: 1,
    borderTopColor: '#ffffff15',
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 20,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#ffffff20',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#c665e8',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  art: {
    width: 46,
    height: 46,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  artist: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    width: 140,
  },
  volumeSlider: {
    flex: 1,
    height: 30,
    marginLeft: 6,
  },
});
