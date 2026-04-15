import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useMusic } from '../context/MusicContext';
import AudioVisualizer from '../components/AudioVisualizer';
import EqualizerModal from '../components/EqualizerModal';
import ShareCard from '../components/ShareCard';

const formatTime = (millis: number) => {
  if (!millis) return '0:00';
  const s = Math.floor(millis / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

export default function PlayerScreen() {
  const router = useRouter();
  const { width: W } = useWindowDimensions();
  // Constrain max width of the art to 400px so it doesn't get huge on desktop
  const artSize = Math.min(W * 0.65, 320);

  const {
    currentSong, isPlaying, isLoading,
    duration, position, volume,
    shuffleMode, repeatMode,
    playSong, pauseSong, resumeSong, nextSong, prevSong,
    seekTo, changeVolume, toggleShuffle, toggleRepeat,
    queue,
  } = useMusic();
  const { isFavorite, toggleFavorite, playlists, addSongToPlaylist } = useFavorites();

  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'lyrics'
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Album art rotation animation
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef<ReturnType<typeof Animated.loop> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      rotationAnimation.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationAnimation.current.start();
    } else {
      rotationAnimation.current?.stop();
    }
  }, [isPlaying]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Swipe down logic
  const panY = useRef(new Animated.Value(0)).current;
  const lyricsScrollRef = useRef<ScrollView>(null);
  const lastLineIndexRef = useRef<number>(-1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only set responder if moving vertically significantly
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 10;
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          // Swipe down threshold met, close screen
          Animated.timing(panY, {
            toValue: W * 1.5, // Slide all the way down
            duration: 200,
            useNativeDriver: false,
          }).start(() => router.back());
        } else {
          // Reset position
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Auto scroll lyrics based on position
  useEffect(() => {
    if (activeTab === 'lyrics' && currentSong?.lyrics && duration > 0 && lyricsScrollRef.current) {
      const lines = currentSong.lyrics.split('\n');
      const progress = position / duration;
      const currentLineIndex = Math.min(Math.floor(progress * lines.length), lines.length - 1);
      
      if (lastLineIndexRef.current !== currentLineIndex) {
        lastLineIndexRef.current = currentLineIndex;

        const doScroll = () => {
          if (currentLineIndex > 2) {
            lyricsScrollRef.current?.scrollTo({ y: (currentLineIndex - 2) * 35, animated: true });
          } else {
            lyricsScrollRef.current?.scrollTo({ y: 0, animated: true });
          }
        };

        doScroll();
        // Fallback setTimeout for when the view is just mounted and hasn't calculated layout yet
        const timer = setTimeout(doScroll, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [position, activeTab, currentSong, duration]);

  // Reset scroll memory when leaving tab or changing song to force snap
  useEffect(() => {
    if (activeTab !== 'lyrics') {
      lastLineIndexRef.current = -1;
    }
  }, [activeTab, currentSong?.id]);

  if (!currentSong) {
    return (
      <Animated.View style={[styles.container, { transform: [{ translateY: panY }] }]} {...panResponder.panHandlers}>
        <LinearGradient colors={['#170f23', '#2a1060']} style={styles.emptyContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="musical-notes-outline" size={80} color="#555" />
          <Text style={styles.emptyText}>Chưa có bài hát đang phát</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => { router.back(); }}>
            <Text style={styles.browseBtnText}>Chọn bài hát</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: panY }] }]} {...panResponder.panHandlers}>
      <LinearGradient colors={['#0d0820', '#1e1040', '#0d0820']} style={styles.flexContainer}>
        <View style={styles.contentWrapper}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topInfo}>
            <Text style={styles.topLabel}>ĐANG PHÁT</Text>
            <Text style={styles.topAlbum} numberOfLines={1}>{currentSong.album}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowPlaylistModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tab selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity onPress={() => setActiveTab('player')} style={[styles.tabBtn, activeTab === 'player' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'player' && styles.tabBtnTextActive]}>Trình phát</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('lyrics')} style={[styles.tabBtn, activeTab === 'lyrics' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === 'lyrics' && styles.tabBtnTextActive]}>Lời bài hát</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'player' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Album Art */}
            <View style={styles.artContainer}>
              <View style={[styles.artShadow, { width: artSize, height: artSize, borderRadius: artSize / 2 }]}>
                <Animated.Image
                  source={{ uri: currentSong.image }}
                  style={[styles.artImage, { borderRadius: artSize / 2, transform: [{ rotate: spin }] }]}
                />
                {/* Vinyl hole */}
                <View style={styles.vinylHole} />
              </View>
            </View>

            {/* Audio Visualizer */}
            <AudioVisualizer isPlaying={isPlaying} color="#c665e8" height={50} />

            {/* Song info + Heart */}
            <View style={styles.songHeader}>
              <View style={styles.songMeta}>
                <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{currentSong.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => currentSong && toggleFavorite(currentSong)}>
                <Ionicons
                  name={isFavorite(currentSong.id) ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isFavorite(currentSong.id) ? '#c665e8' : '#aaa'}
                />
              </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration || 1}
                value={position}
                minimumTrackTintColor="#c665e8"
                maximumTrackTintColor="#ffffff30"
                thumbTintColor="#c665e8"
                onSlidingComplete={seekTo}
              />
              <View style={styles.timers}>
                <Text style={styles.timerText}>{formatTime(position)}</Text>
                <Text style={styles.timerText}>{formatTime(duration)}</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={toggleShuffle}>
                <Ionicons name="shuffle" size={24} color={shuffleMode ? '#c665e8' : '#aaa'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={prevSong}>
                <Ionicons name="play-skip-back" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => isPlaying ? pauseSong() : resumeSong()}
              >
                <Ionicons name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'} size={34} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextSong}>
                <Ionicons name="play-skip-forward" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleRepeat}>
                <Ionicons
                  name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
                  size={24}
                  color={repeatMode !== 'off' ? '#c665e8' : '#aaa'}
                />
                {repeatMode === 'one' && (
                  <View style={styles.repeatOneBadge}><Text style={styles.repeatOneText}>1</Text></View>
                )}
              </TouchableOpacity>
            </View>

            {/* Extra buttons: EQ + Share */}
            <View style={styles.extraBtns}>
              <TouchableOpacity style={styles.extraBtn} onPress={() => setShowEqualizer(true)}>
                <Ionicons name="options" size={18} color="#c665e8" />
                <Text style={styles.extraBtnText}>EQ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.extraBtn} onPress={() => setShowShare(true)}>
                <Ionicons name="share-social" size={18} color="#c665e8" />
                <Text style={styles.extraBtnText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>

            {/* Volume */}
            <View style={styles.volumeRow}>
              <Ionicons name="volume-low" size={18} color="#aaa" />
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#ffffff30"
                thumbTintColor="#fff"
                onValueChange={changeVolume}
              />
              <Ionicons name="volume-high" size={18} color="#aaa" />
            </View>

            {/* Up Next */}
            <View style={styles.upNext}>
              <Text style={styles.upNextLabel}>Tiếp theo trong queue</Text>
              {queue.slice(0, 3).map((s: any) => (
                <TouchableOpacity key={s.id} style={styles.queueItem} onPress={() => playSong(s, queue)}>
                  <Image source={{ uri: s.image }} style={styles.queueImg} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.queueTitle, currentSong.id === s.id && { color: '#c665e8' }]} numberOfLines={1}>{s.title}</Text>
                    <Text style={styles.queueArtist} numberOfLines={1}>{s.artist}</Text>
                  </View>
                  {currentSong.id === s.id && <Ionicons name="volume-high" size={14} color="#c665e8" />}
                </TouchableOpacity>
              ))}
            </View>
            {/* Add padding to the bottom so it can scroll fully */}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          /* Lyrics Tab */
          <ScrollView ref={lyricsScrollRef} style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
            {currentSong.lyrics ? (
              currentSong.lyrics.split('\n').map((line: string, index: number, arr: string[]) => {
                const progress = position / (duration || 1);
                const currentLineIndex = Math.min(Math.floor(progress * arr.length), arr.length - 1);
                const isCurrent = index === currentLineIndex;

                return (
                  <Text
                    key={index}
                    style={[
                      styles.lyricsText,
                      isCurrent && { color: '#c665e8', fontWeight: 'bold', fontSize: 19 },
                      line.trim() === '' && { marginVertical: 8 }
                    ]}
                  >
                    {line}
                  </Text>
                );
              })
            ) : (
              <Text style={styles.lyricsText}>Chưa có lời bài hát.</Text>
            )}
            <View style={{ height: 150 }} />
          </ScrollView>
        )}
      </View>

      {/* Add to Playlist Modal */}
      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPlaylistModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Thêm vào Playlist</Text>
            {playlists.map((pl: any) => (
              <TouchableOpacity
                key={pl.id}
                style={styles.modalItem}
                onPress={() => {
                  addSongToPlaylist(pl.id, currentSong);
                  setShowPlaylistModal(false);
                }}
              >
                {pl.cover ? (
                  <Image source={{ uri: pl.cover }} style={styles.modalItemImg} />
                ) : (
                  <View style={[styles.modalItemImg, { backgroundColor: '#c665e820', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="musical-notes" size={18} color="#c665e8" />
                  </View>
                )}
                <Text style={styles.modalItemText}>{pl.name}</Text>
                <Text style={styles.modalItemCount}>{pl.songs.length} bài</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Equalizer Modal */}
      <EqualizerModal visible={showEqualizer} onClose={() => setShowEqualizer(false)} />

      {/* Share Modal */}
      <ShareCard visible={showShare} onClose={() => setShowShare(false)} song={currentSong} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0820' },
  flexContainer: { flex: 1 },
  contentWrapper: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: 640 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, width: '100%', alignSelf: 'center' },
  backBtn: { position: 'absolute', top: 52, left: 20, zIndex: 10 },
  emptyText: { color: '#aaa', fontSize: 16 },
  browseBtn: { backgroundColor: '#c665e8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  browseBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 10 },
  topInfo: { alignItems: 'center', flex: 1 },
  topLabel: { color: '#aaa', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  topAlbum: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 2 },
  tabSelector: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ffffff20' },
  tabBtnActive: { backgroundColor: '#c665e830', borderColor: '#c665e8' },
  tabBtnText: { color: '#aaa', fontWeight: '600', fontSize: 13 },
  tabBtnTextActive: { color: '#c665e8' },
  artContainer: { alignItems: 'center', paddingVertical: 20, marginTop: 10 },
  artShadow: {
    shadowColor: '#c665e8', shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
    elevation: 30, position: 'relative',
  },
  artImage: { width: '100%', height: '100%', borderWidth: 4, borderColor: '#ffffff15' },
  vinylHole: { position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: 10, backgroundColor: '#0d0820', transform: [{ translateX: -10 }, { translateY: -10 }], borderWidth: 2, borderColor: '#ffffff30' },
  songHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, marginBottom: 16 },
  songMeta: { flex: 1 },
  songTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  songArtist: { color: '#aaa', fontSize: 16, marginTop: 4 },
  progressSection: { paddingHorizontal: 20 },
  slider: { width: '100%', height: 30 },
  timers: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  timerText: { color: '#888', fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, marginVertical: 18 },
  extraBtns: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 10 },
  extraBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#c665e815', borderWidth: 1, borderColor: '#c665e840' },
  extraBtnText: { color: '#c665e8', fontWeight: '600', fontSize: 13 },
  playBtn: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#c665e8',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#c665e8', shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 12,
  },
  repeatOneBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#c665e8', borderRadius: 6, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  repeatOneText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
  volumeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, gap: 8 },
  volumeSlider: { flex: 1, height: 28 },
  upNext: { marginTop: 16, paddingHorizontal: 20 },
  upNextLabel: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  queueItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  queueImg: { width: 44, height: 44, borderRadius: 6 },
  queueTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  queueArtist: { color: '#888', fontSize: 12, marginTop: 2 },
  lyricsScroll: { flex: 1, paddingHorizontal: 28, marginTop: 10 },
  lyricsText: { color: '#ccc', fontSize: 16, lineHeight: 35, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end', alignItems: 'center' },
  modalSheet: { width: '100%', maxWidth: 640, backgroundColor: '#1e1232', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, backgroundColor: '#ffffff30', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  modalItemImg: { width: 46, height: 46, borderRadius: 8 },
  modalItemText: { flex: 1, color: '#fff', fontSize: 15, marginLeft: 12 },
  modalItemCount: { color: '#888', fontSize: 12 },
});
