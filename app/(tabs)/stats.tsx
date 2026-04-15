import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import { useStats } from '../../context/StatsContext';
import { useMusic } from '../../context/MusicContext';
import { SONGS } from '../../constants/songs';

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration, useNativeDriver: false }).start();
    anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeAllListeners();
  }, [value]);

  return <Text style={styles.bigNumber}>{display}</Text>;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function StatsScreen() {
  const { stats, getTopSongs, getTopArtists, getTotalHours, getLast7Days, resetStats } = useStats();
  const { playSong } = useMusic();

  const totalHours = parseFloat(getTotalHours());
  const totalMins = Math.round(stats.totalListenSeconds / 60);
  const topSongs = getTopSongs(5, SONGS);
  const topArtists = getTopArtists(3);
  const last7 = getLast7Days();
  const maxSec = Math.max(...last7.map((d: any) => d.seconds), 1);

  return (
    <LinearGradient colors={['#170f23', '#1e1232', '#170f23']} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#4a1f8a', '#2a1060']} style={styles.header}>
          <Text style={styles.headerTitle}>📊 Thống Kê Nghe Nhạc</Text>
          <Text style={styles.headerSub}>Hành trình âm nhạc của bạn</Text>
        </LinearGradient>

        {/* Total Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="time" size={22} color="#c665e8" />
            <AnimatedNumber value={totalMins} />
            <Text style={styles.statLabel}>Phút nghe</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="musical-notes" size={22} color="#FFD700" />
            <AnimatedNumber value={Object.keys(stats.songPlayCount).length} />
            <Text style={styles.statLabel}>Bài đã nghe</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="person" size={22} color="#4ECDC4" />
            <AnimatedNumber value={Object.keys(stats.artistPlayCount).length} />
            <Text style={styles.statLabel}>Nghệ sĩ</Text>
          </View>
        </View>

        {/* Hours Banner */}
        {totalHours > 0 && (
          <LinearGradient colors={['#4a1f8a', '#c665e860']} style={styles.hoursBanner}>
            <Ionicons name="headset" size={36} color="#fff" />
            <View>
              <Text style={styles.hoursNum}>{totalHours} giờ</Text>
              <Text style={styles.hoursSub}>Tổng thời gian nghe nhạc 🎧</Text>
            </View>
          </LinearGradient>
        )}

        {/* Last 7 Days Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 7 Ngày Gần Nhất</Text>
          <View style={styles.chartCard}>
            <View style={styles.barsRow}>
              {last7.map((day: any, i: number) => {
                const barH = Math.max((day.seconds / maxSec) * 100, day.seconds > 0 ? 6 : 2);
                return (
                  <View key={i} style={styles.dayCol}>
                    <Text style={styles.dayMins}>
                      {day.seconds > 0 ? `${Math.round(day.seconds / 60)}p` : ''}
                    </Text>
                    <View style={[styles.dayBar, { height: barH, backgroundColor: day.seconds > 0 ? '#c665e8' : '#ffffff15' }]} />
                    <Text style={styles.dayLabel}>{day.label}</Text>
                  </View>
                );
              })}
            </View>
            {last7.every((d: any) => d.seconds === 0) && (
              <Text style={styles.noDataText}>Chưa có dữ liệu. Hãy nghe nhạc để xem thống kê! 🎵</Text>
            )}
          </View>
        </View>

        {/* Top Songs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top Bài Nghe Nhiều Nhất</Text>
          {topSongs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chưa có dữ liệu. Hãy nghe nhạc nào! 🎵</Text>
            </View>
          ) : (
            topSongs.map((song: any, i: number) => {
              const count = stats.songPlayCount[song.id] || 0;
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              return (
                <TouchableOpacity key={song.id} style={styles.topSongRow} onPress={() => playSong(song, SONGS)}>
                  <Text style={styles.medal}>{medals[i]}</Text>
                  <Text style={styles.topSongTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.topSongArtist} numberOfLines={1}>{song.artist}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count}x</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎤 Nghệ Sĩ Yêu Thích</Text>
            {topArtists.map((a: any, i: number) => (
              <View key={a.name} style={styles.artistRow}>
                <Text style={styles.artistRank}>#{i + 1}</Text>
                <Text style={styles.artistName}>{a.name}</Text>
                <Text style={styles.artistPlays}>{a.count} lượt nghe</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reset */}
        <TouchableOpacity style={styles.resetBtn} onPress={resetStats}>
          <Ionicons name="refresh" size={16} color="#FF6B6B" />
          <Text style={styles.resetText}>Đặt lại thống kê</Text>
        </TouchableOpacity>

      </ScrollView>
      <MiniPlayer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#ccc', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginTop: -20, marginBottom: 16 },
  statCard: {
    backgroundColor: '#1e1232', borderRadius: 18, padding: 16, alignItems: 'center', gap: 6,
    width: '30%', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  bigNumber: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 11, textAlign: 'center' },
  hoursBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: 16, borderRadius: 18, padding: 20, marginBottom: 8,
  },
  hoursNum: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  hoursSub: { color: '#ffffffcc', fontSize: 13, marginTop: 2 },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  chartCard: { backgroundColor: '#ffffff08', borderRadius: 18, padding: 16 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 130 },
  dayCol: { alignItems: 'center', gap: 4, flex: 1 },
  dayMins: { color: '#888', fontSize: 10, height: 14 },
  dayBar: { width: 22, borderRadius: 11, minHeight: 2 },
  dayLabel: { color: '#888', fontSize: 11 },
  noDataText: { color: '#666', textAlign: 'center', paddingVertical: 12, fontSize: 13 },
  emptyCard: { backgroundColor: '#ffffff08', borderRadius: 16, padding: 20, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 14 },
  topSongRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff08',
    borderRadius: 12, padding: 12, marginBottom: 8, gap: 10,
  },
  medal: { fontSize: 20, width: 28 },
  topSongTitle: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  topSongArtist: { color: '#888', fontSize: 12, flex: 1 },
  countBadge: { backgroundColor: '#c665e830', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#c665e860' },
  countText: { color: '#c665e8', fontWeight: 'bold', fontSize: 12 },
  artistRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff08',
    borderRadius: 12, padding: 14, marginBottom: 8, gap: 12,
  },
  artistRank: { color: '#c665e8', fontWeight: 'bold', fontSize: 18, width: 28 },
  artistName: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  artistPlays: { color: '#888', fontSize: 13 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, marginTop: 20, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1, borderColor: '#FF6B6B44', backgroundColor: '#FF6B6B11',
  },
  resetText: { color: '#FF6B6B', fontWeight: '600' },
});
