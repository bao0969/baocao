import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import { useMusic } from '../../context/MusicContext';
import { useFavorites } from '../../context/FavoritesContext';
import { SONGS } from '../../constants/songs';

type Song = {
  id: string;
  title: string;
  artist: string;
  image: string;
  genre: string;
  [key: string]: any;
};

type MoodType = {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  gradient: readonly [string, string];
  genres: string[];
};

const MOODS: MoodType[] = [
  { id: 'happy',    emoji: '😄', label: 'Vui Vẻ',     desc: 'Năng lượng tích cực, vui tươi',  gradient: ['#FFD700', '#FF8C00'] as const, genres: ['pop', 'vpop', 'edm'] },
  { id: 'sad',      emoji: '😢', label: 'Tâm Trạng',  desc: 'Nhạc buồn, nhớ nhung',           gradient: ['#4A90D9', '#1a3a6a'] as const, genres: ['ballad', 'indie'] },
  { id: 'energy',   emoji: '⚡', label: 'Năng Lượng', desc: 'Bơm máu, siêu sạc!',             gradient: ['#FF4E50', '#F9D423'] as const, genres: ['edm', 'rock', 'rap'] },
  { id: 'chill',    emoji: '😌', label: 'Thư Giãn',   desc: 'Lofi, nhẹ nhàng, chill',         gradient: ['#A8E6CF', '#3D8B6E'] as const, genres: ['chill', 'indie'] },
  { id: 'focus',    emoji: '🧠', label: 'Tập Trung',  desc: 'Nhạc học bài, làm việc',          gradient: ['#667eea', '#764ba2'] as const, genres: ['chill', 'indie', 'ballad'] },
  { id: 'romantic', emoji: '💖', label: 'Lãng Mạn',  desc: 'Tình yêu, ngọt ngào',             gradient: ['#f953c6', '#b91d73'] as const, genres: ['ballad', 'pop', 'vpop'] },
  { id: 'night',    emoji: '🌙', label: 'Đêm Khuya',  desc: 'Nhạc đêm tối, thả hồn',          gradient: ['#0f0c29', '#302b63'] as const, genres: ['chill', 'ballad', 'indie'] },
  { id: 'party',    emoji: '🎉', label: 'Party',       desc: 'Nhảy nhót, vui chơi!',            gradient: ['#12c2e9', '#c471ed'] as const, genres: ['edm', 'vpop', 'pop', 'rap'] },
];

function getMoodPlaylist(mood: MoodType): Song[] {
  const matched = (SONGS as Song[]).filter((s) => mood.genres.includes(s.genre));
  return [...matched].sort(() => 0.5 - Math.random()).slice(0, 10);
}

export default function MoodScreen() {
  const { playQueue, currentSong } = useMusic();
  const { addToRecentlyPlayed } = useFavorites();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMoodSelect = (mood: MoodType) => {
    setIsGenerating(true);
    setSelectedMood(mood);
    setTimeout(() => {
      const songs = getMoodPlaylist(mood);
      setPlaylist(songs);
      setIsGenerating(false);
    }, 800);
  };

  const handlePlayAll = () => {
    if (playlist.length === 0) return;
    playQueue(playlist, 0);
    addToRecentlyPlayed(playlist[0]);
  };

  const handlePlaySong = (song: Song, index: number) => {
    playQueue(playlist, index);
    addToRecentlyPlayed(song);
  };

  return (
    <LinearGradient colors={['#170f23', '#1e1232', '#170f23']} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎭 AI Mood Playlist</Text>
          <Text style={styles.headerSub}>Chọn tâm trạng, AI tạo playlist cho bạn</Text>
        </View>

        {/* Mood Grid */}
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[styles.moodCard, selectedMood?.id === mood.id && styles.moodCardActive]}
              onPress={() => handleMoodSelect(mood)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={mood.gradient} style={styles.moodGrad}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
                <Text style={styles.moodDesc} numberOfLines={1}>{mood.desc}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generated Playlist */}
        {selectedMood && (
          <View style={styles.playlistSection}>
            {isGenerating ? (
              <View style={styles.generatingBox}>
                <Text style={styles.generatingText}>🤖 AI đang tạo playlist...</Text>
              </View>
            ) : (
              <>
                <View style={styles.playlistHeader}>
                  <View>
                    <Text style={styles.playlistTitle}>
                      {selectedMood.emoji} Playlist {selectedMood.label}
                    </Text>
                    <Text style={styles.playlistMeta}>{playlist.length} bài hát • AI generated</Text>
                  </View>
                  <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.playAllText}>Phát tất cả</Text>
                  </TouchableOpacity>
                </View>

                {playlist.map((song, index) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <TouchableOpacity
                      key={song.id}
                      style={styles.songRow}
                      onPress={() => handlePlaySong(song, index)}
                    >
                      <Text style={styles.songIndex}>{index + 1}</Text>
                      <Image
                        source={{ uri: song.image }}
                        style={[styles.songImg, isActive && { borderColor: '#c665e8', borderWidth: 2 }]}
                      />
                      <View style={styles.songInfo}>
                        <Text style={[styles.songTitle, isActive && { color: '#c665e8' }]} numberOfLines={1}>
                          {song.title}
                        </Text>
                        <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                      </View>
                      {isActive && <Ionicons name="volume-high" size={16} color="#c665e8" />}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity style={styles.reshuffleBtn} onPress={() => handleMoodSelect(selectedMood)}>
                  <Ionicons name="shuffle" size={16} color="#c665e8" />
                  <Text style={styles.reshuffleText}>Tạo lại playlist</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
      <MiniPlayer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  headerSub: { color: '#888', fontSize: 14, marginTop: 4 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  moodCard: { width: '46%', flexGrow: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  moodCardActive: { borderColor: '#c665e8' },
  moodGrad: { padding: 20, minHeight: 110, justifyContent: 'flex-end' },
  moodEmoji: { fontSize: 32, marginBottom: 6 },
  moodLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  moodDesc: { color: '#ffffff99', fontSize: 12, marginTop: 2 },
  playlistSection: { marginHorizontal: 16, marginTop: 24, backgroundColor: '#ffffff08', borderRadius: 20, overflow: 'hidden', padding: 16 },
  generatingBox: { padding: 30, alignItems: 'center' },
  generatingText: { color: '#c665e8', fontSize: 16, fontWeight: '600' },
  playlistHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  playlistTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  playlistMeta: { color: '#888', fontSize: 12, marginTop: 3 },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#c665e8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  playAllText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  songIndex: { color: '#555', fontSize: 13, width: 24, textAlign: 'center' },
  songImg: { width: 44, height: 44, borderRadius: 8, marginHorizontal: 10 },
  songInfo: { flex: 1 },
  songTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  songArtist: { color: '#888', fontSize: 12, marginTop: 2 },
  reshuffleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#ffffff10' },
  reshuffleText: { color: '#c665e8', fontWeight: '600' },
});
