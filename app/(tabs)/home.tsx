import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import AIChatbot from '../../components/AIChatbot';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useMusic } from '../../context/MusicContext';
import { useStats } from '../../context/StatsContext';
import { ARTISTS, GENRES, SONGS, getFeaturedSongs, getNewSongs, getSongsByGenre } from '../../constants/songs';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng ☀️';
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều 🌤️';
  if (hour >= 18 && hour < 23) return 'Chào buổi tối 🌙';
  return 'Đêm khuya rồi 🌃';
};

const BANNERS = [
  { id: 'b1', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', title: 'Top Hits 2024', subtitle: 'Những bài nhạc hot nhất' },
  { id: 'b2', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5fd37b5?w=800&q=80', title: 'V-Pop Trending', subtitle: 'Nhạc Việt đang hot' },
  { id: 'b3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', title: 'Chill Vibes', subtitle: 'Thư giãn với âm nhạc' },
  { id: 'b4', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80', title: 'Late Night Lofi', subtitle: 'Đêm khuya chill cùng nhạc' },
  { id: 'b5', image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80', title: 'Rap Việt', subtitle: 'Những rapper hàng đầu' },
];

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SongCard({ item, onPress, isActive, onLongPress }: { item: any; onPress: (s: any) => void; isActive: boolean; onLongPress?: (s: any) => void }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  return (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress && onLongPress(item)}
      delayLongPress={350}
    >
      <View>
        <Image source={{ uri: item.image }} style={[styles.songCardImg, isActive && styles.songCardImgActive]} />
        {isActive && (
          <View style={styles.playingBadge}>
            <Ionicons name="musical-notes" size={12} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.songCardMeta}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.songCardTitle, isActive && { color: '#c665e8' }]} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songCardArtist} numberOfLines={1}>{item.artist}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isFavorite(item.id) ? 'heart' : 'heart-outline'} size={16} color={isFavorite(item.id) ? '#c665e8' : '#555'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function GenreChip({ genre, onPress }: { genre: any; onPress: (g: any) => void }) {
  return (
    <TouchableOpacity style={[styles.genreChip, { backgroundColor: genre.color + '22', borderColor: genre.color + '66' }]} onPress={() => onPress(genre)}>
      <Ionicons name={genre.icon} size={16} color={genre.color} />
      <Text style={[styles.genreLabel, { color: genre.color }]}>{genre.label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const SIDEBAR_WIDTH = 220;

  const mainContentWidth = isLargeScreen ? Math.max(width - SIDEBAR_WIDTH, 0) : width;
  const bannerWidth = Math.max(mainContentWidth - 40, 0);

  const { user, logout, setLoginModalVisible } = useAuth();
  const { currentSong, isPlaying, playSong, playQueue } = useMusic();
  const { recentlyPlayed, addToRecentlyPlayed, playlists, addSongToPlaylist } = useFavorites();
  const { recordPlay } = useStats();

  const [bannerIndex, setBannerIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [contextMenuSong, setContextMenuSong] = useState<any>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const bannerRef = useRef<any>(null);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const greeting = useMemo(() => getGreeting(), []);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          setShowChatbot(true);
        }
      }
    })
  ).current;

  const newSongs = useMemo(() => getNewSongs(), []);
  const featuredSongs = useMemo(() => getFeaturedSongs(), []);
  const genreSongs = useMemo(() => selectedGenre ? getSongsByGenre(selectedGenre.id) : SONGS.slice(0, 8), [selectedGenre]);

  // Auto-scroll banner
  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, [bannerWidth]); // re-run if width changes

  const handlePlaySong = (song: any) => {
    playSong(song, SONGS);
    addToRecentlyPlayed(song);
    recordPlay(song, (song.duration || 180000) / 1000);
  };

  const handleLongPressSong = useCallback((song: any) => {
    setContextMenuSong(song);
  }, []);

  const Sidebar = () => (
    <View style={[styles.sidebar, { width: SIDEBAR_WIDTH }]}>
      <View style={styles.logoContainer}>
        <Ionicons name="musical-notes" size={36} color="#c665e8" />
        <Text style={styles.logoText}>MusicApp</Text>
      </View>
      {[
        { label: 'Trang Chủ', icon: 'home', active: true },
        { label: 'Tìm Kiếm', icon: 'search', onPress: () => router.push('/search') },
        { label: 'Thư Viện', icon: 'library', onPress: () => router.push('/library') },
        { label: 'Hồ Sơ', icon: 'person', onPress: () => router.push('/profile') },
      ].map((item) => (
        <TouchableOpacity key={item.label} style={[styles.menuItem, item.active && styles.menuActive]} onPress={item.onPress}>
          <Ionicons name={item.icon as any} size={22} color={item.active ? '#c665e8' : '#aaa'} />
          <Text style={[styles.menuText, item.active && { color: '#c665e8' }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.fullScreen}>
      <View style={{ flex: 1, flexDirection: isLargeScreen ? 'row' : 'column' }}>
        {isLargeScreen && <Sidebar />}

        <LinearGradient colors={['#170f23', '#1e1232', '#170f23']} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.headerTitle}>Hôm nay nghe gì?</Text>
              </View>
              {user ? (
                <TouchableOpacity onPress={() => router.push('/profile')}>
                  <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.loginBtn} onPress={() => setLoginModalVisible(true)}>
                  <Text style={styles.loginBtnText}>Đăng nhập</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Banner Carousel */}
            <View style={[styles.bannerContainer, { width: bannerWidth }]}>
              <FlatList
                ref={bannerRef}
                data={BANNERS}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(i) => i.id}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
                  setBannerIndex(idx);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity activeOpacity={0.9} style={{ width: bannerWidth, marginHorizontal: 0 }}>
                    <Image source={{ uri: item.image }} style={[styles.bannerImage, { width: bannerWidth }]} />
                    <LinearGradient colors={['transparent', '#000000cc']} style={styles.bannerOverlay}>
                      <Text style={styles.bannerTitle}>{item.title}</Text>
                      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingHorizontal: 0, gap: 0 }}
                getItemLayout={(_, index) => ({ length: bannerWidth, offset: bannerWidth * index, index })}
              />
              {/* Dots */}
              <View style={styles.dots}>
                {BANNERS.map((_, i) => (
                  <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
                ))}
              </View>
            </View>

            {/* AI Journal Banner */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/journal')}
              style={{ marginHorizontal: 20, marginBottom: 24, marginTop: 10 }}
            >
              <LinearGradient 
                colors={['#c665e8', '#4a1f8a', '#170f23']} 
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{ borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>
                    ✍️ Nhật ký Âm Nhạc AI
                  </Text>
                  <Text style={{ color: '#ffffffbb', fontSize: 13, lineHeight: 18 }}>
                    Kể AI nghe về ngày hôm nay, nhận lại 1 bài hát chữa lành riêng cho bạn.
                  </Text>
                </View>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff30', alignItems: 'center', justifyContent: 'center', marginLeft: 15 }}>
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Genre Chips */}
            <View style={styles.section}>
              <SectionHeader title="Thể Loại" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
                {GENRES.map((g) => (
                  <GenreChip
                    key={g.id}
                    genre={g}
                    onPress={(genre) => setSelectedGenre(selectedGenre?.id === genre.id ? null : genre)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Genre filtered songs */}
            <View style={styles.section}>
              <SectionHeader
                title={selectedGenre ? `🎵 ${selectedGenre.label}` : '🎵 Gợi Ý Cho Bạn'}
                onSeeAll={() => router.push('/search')}
              />
              <FlatList
                horizontal
                data={genreSongs}
                keyExtractor={(s) => s.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
                renderItem={({ item }) => (
                  <SongCard item={item} onPress={handlePlaySong} isActive={currentSong?.id === item.id} onLongPress={handleLongPressSong} />
                )}
              />
            </View>

            {/* New Songs */}
            <View style={styles.section}>
              <SectionHeader title="🔥 Mới Nhất" onSeeAll={() => router.push('/search')} />
              <FlatList
                horizontal
                data={newSongs}
                keyExtractor={(s) => s.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
                renderItem={({ item }) => (
                  <SongCard item={item} onPress={handlePlaySong} isActive={currentSong?.id === item.id} onLongPress={handleLongPressSong} />
                )}
              />
            </View>

            {/* Featured */}
            <View style={styles.section}>
              <SectionHeader title="⭐ Nổi Bật" onSeeAll={() => router.push('/search')} />
              <FlatList
                horizontal
                data={featuredSongs}
                keyExtractor={(s) => s.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
                renderItem={({ item }) => (
                  <SongCard item={item} onPress={handlePlaySong} isActive={currentSong?.id === item.id} onLongPress={handleLongPressSong} />
                )}
              />
            </View>

            {/* Artists */}
            <View style={styles.section}>
              <SectionHeader title="🎤 Nghệ Sĩ Nổi Bật" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
                {ARTISTS.map((artist) => (
                  <TouchableOpacity key={artist.id} style={styles.artistCard}>
                    <Image source={{ uri: artist.avatar }} style={styles.artistAvatar} />
                    <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
                    <Text style={styles.artistFollowers}>{artist.followers} fans</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>



            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="🕐 Nghe Gần Đây" />
                <FlatList
                  horizontal
                  data={recentlyPlayed}
                  keyExtractor={(s) => s.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 20 }}
                  renderItem={({ item }) => (
                    <SongCard item={item} onPress={handlePlaySong} isActive={currentSong?.id === item.id} onLongPress={handleLongPressSong} />
                  )}
                />
              </View>
            )}

            {/* Smart Recommendations (AI) */}
            {recentlyPlayed.length >= 2 && (() => {
              const genresSeen = [...new Set(recentlyPlayed.slice(0, 5).map((s: any) => s.genre))].filter(Boolean) as string[];
              const smartRecs = SONGS.filter(
                (s) => genresSeen.includes(s.genre) && !recentlyPlayed.find((r: any) => r.id === s.id)
              ).slice(0, 8);
              if (smartRecs.length === 0) return null;
              return (
                <View style={styles.section}>
                  <SectionHeader title="🤖 Gợi Ý Thông Minh" onSeeAll={() => {}} />
                  <FlatList
                    horizontal
                    data={smartRecs}
                    keyExtractor={(s) => s.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20 }}
                    renderItem={({ item }) => (
                      <SongCard item={item} onPress={handlePlaySong} isActive={currentSong?.id === item.id} onLongPress={handleLongPressSong} />
                    )}
                  />
                </View>
              );
            })()}

          </ScrollView>
        </LinearGradient>
      </View>

      <MiniPlayer />

      {/* Floating AI Chatbot button - Draggable */}
      <Animated.View
        style={[styles.aiBubble, { transform: pan.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
      </Animated.View>

      {/* AI Chatbot Modal */}
      <AIChatbot visible={showChatbot} onClose={() => setShowChatbot(false)} />

      {/* Context Menu Modal */}
      <Modal visible={!!contextMenuSong} transparent animationType="fade" onRequestClose={() => setContextMenuSong(null)}>
        <TouchableOpacity style={styles.ctxOverlay} activeOpacity={1} onPress={() => setContextMenuSong(null)}>
          <View style={styles.ctxBox}>
            <Text style={styles.ctxTitle} numberOfLines={1}>{contextMenuSong?.title}</Text>
            <Text style={styles.ctxArtist} numberOfLines={1}>{contextMenuSong?.artist}</Text>
            <View style={styles.ctxDivider} />
            <Text style={styles.ctxSubheader}>Thêm vào playlist</Text>
            {playlists.length === 0 ? (
              <Text style={styles.ctxEmpty}>Chưa có playlist. Tạo từ Thư Viện!</Text>
            ) : (
              playlists.map((pl: any) => (
                <TouchableOpacity
                  key={pl.id}
                  style={styles.ctxItem}
                  onPress={() => {
                    addSongToPlaylist(pl.id, contextMenuSong);
                    setContextMenuSong(null);
                    Alert.alert('✅ Đã thêm', `"${contextMenuSong?.title}" → ${pl.name}`);
                  }}
                >
                  <Ionicons name="musical-notes" size={18} color="#c665e8" />
                  <Text style={styles.ctxItemText}>{pl.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#170f23' },
  sidebar: { backgroundColor: '#12091f', paddingTop: 40, paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: '#ffffff10' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  logoText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  menuActive: { backgroundColor: '#c665e820' },
  menuText: { color: '#aaa', fontSize: 15, marginLeft: 12, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { color: '#aaa', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#c665e8' },
  loginBtn: { backgroundColor: '#c665e8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  bannerContainer: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginBottom: 8, alignSelf: 'center' },
  bannerImage: { height: 180, borderRadius: 16 },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerSubtitle: { color: '#ddd', fontSize: 12, marginTop: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 10, left: 0, right: 0, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff60' },
  dotActive: { backgroundColor: '#c665e8', width: 18 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#c665e8', fontSize: 13, fontWeight: '600' },
  songCard: { width: 150, marginRight: 14 },
  songCardImg: { width: 150, height: 150, borderRadius: 10 },
  songCardImgActive: { borderWidth: 2, borderColor: '#c665e8' },
  playingBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: '#c665e8', borderRadius: 10, padding: 3 },
  songCardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingRight: 4 },
  songCardTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  songCardArtist: { color: '#888', fontSize: 11, marginTop: 2 },
  genreChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10, gap: 6 },
  genreLabel: { fontSize: 13, fontWeight: '600' },
  artistCard: { width: 90, alignItems: 'center', marginRight: 16 },
  artistAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#c665e840' },
  artistName: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  artistFollowers: { color: '#888', fontSize: 10, marginTop: 2 },
  // Context menu styles
  ctxOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'center', alignItems: 'center' },
  ctxBox: { backgroundColor: '#1e1232', borderRadius: 20, padding: 20, width: '80%', maxWidth: 360 },
  ctxTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ctxArtist: { color: '#aaa', fontSize: 13, marginTop: 2 },
  ctxDivider: { height: 1, backgroundColor: '#ffffff15', marginVertical: 14 },
  ctxSubheader: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  ctxItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  ctxItemText: { color: '#fff', fontSize: 15 },
  ctxEmpty: { color: '#555', fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  aiBubble: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#c665e8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#c665e8',
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    zIndex: 999,
  },
});
