import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import { useFavorites } from '../../context/FavoritesContext';
import { useMusic } from '../../context/MusicContext';
import { useStats } from '../../context/StatsContext';
import { GENRES, SONGS, searchSongs } from '../../constants/songs';

const GENRE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#F7797D', '#c665e8', '#F8B500', '#00B4DB'];

export default function SearchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width > 1024 ? 6 : width > 768 ? 4 : 2;
  const contentWidth = width > 768 ? width - 220 : width;

  const { currentSong, isPlaying, pauseSong, resumeSong, playSong, addToQueue } = useMusic();
  const { isFavorite, toggleFavorite, addToRecentlyPlayed } = useFavorites();
  const { stats } = useStats();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<any>(null);

  // Thêm state cho mock voice/melody search
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchSongs(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const stopListening = () => {
    setIsListening(false);
    pulseAnim.stopAnimation();
    if (recognitionRef.current) {
       try { recognitionRef.current.stop(); } catch(e){}
       recognitionRef.current = null;
    }
  };

  const fallbackMelodyMock = () => {
    stopListening();
    const randomSong = SONGS[Math.floor(Math.random() * SONGS.length)];
    setQuery(randomSong.title);
  };

  const startListening = () => {
    setIsListening(true);
    pulseAnim.setValue(1);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
      ])
    ).start();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      let hasResult = false;

      recognition.onresult = (event: any) => {
        hasResult = true;
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          stopListening();
          inputRef.current?.focus();
        } else {
          fallbackMelodyMock();
        }
      };

      recognition.onend = () => {
        if (!hasResult && recognitionRef.current) {
          fallbackMelodyMock();
        }
      };

      recognition.onerror = () => {
        hasResult = true; // Chặn onend gọi lại fallback
        if (recognitionRef.current) {
          fallbackMelodyMock();
        }
      };
      
      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        fallbackMelodyMock();
      }
    } else {
      // Fallback giả lập (cho native app hoặc web không hỗ trợ)
      setTimeout(() => fallbackMelodyMock(), 3000);
    }
  };

  const handlePlay = (song: any) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pauseSong() : resumeSong();
    } else {
      playSong(song, results.length > 0 ? results : SONGS);
      addToRecentlyPlayed(song);
    }
  };

  const getRecommendations = () => {
    const topArtistEntry = Object.entries(stats.artistPlayCount || {}).sort((a: any, b: any) => b[1] - a[1])[0];
    const topArtistName = topArtistEntry ? topArtistEntry[0] : null;

    const topGenreEntry = Object.entries(stats.genrePlayCount || {}).sort((a: any, b: any) => b[1] - a[1])[0];
    const topGenreId = topGenreEntry ? topGenreEntry[0] : null;

    let artistSongs: any[] = [];
    if (topArtistName) {
      artistSongs = SONGS.filter((s: any) => s.artist === topArtistName && (stats.songPlayCount[s.id] || 0) < 3).slice(0, 5);
      if (artistSongs.length === 0) {
        artistSongs = SONGS.filter((s: any) => s.artist === topArtistName).slice(0, 5);
      }
    }

    let genreSongs: any[] = [];
    if (topGenreId) {
      genreSongs = SONGS.filter((s: any) => s.genre === topGenreId && (stats.songPlayCount[s.id] || 0) < 3 && s.artist !== topArtistName).slice(0, 5);
      if (genreSongs.length === 0) {
        genreSongs = SONGS.filter((s: any) => s.genre === topGenreId && s.artist !== topArtistName).slice(0, 5);
      }
    }

    let fallbackSongs: any[] = [];
    if (artistSongs.length === 0 && genreSongs.length === 0) {
      fallbackSongs = [...SONGS].sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    const genreLabel = GENRES.find(g => g.id === topGenreId)?.label || topGenreId;

    return { topArtistName, topGenreLabel: genreLabel, artistSongs, genreSongs, fallbackSongs };
  };

  const { topArtistName, topGenreLabel, artistSongs, genreSongs, fallbackSongs } = getRecommendations();

  const renderSuggestItem = (item: any) => {
    const isActive = currentSong?.id === item.id;
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.suggestCard} 
        onPress={() => handlePlay(item)}
      >
        <Image source={{ uri: item.image }} style={[styles.suggestImg, isActive && { borderColor: '#c665e8', borderWidth: 2 }]} />
        <Text style={[styles.suggestTitle, isActive && { color: '#c665e8' }]} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.suggestArtist} numberOfLines={1}>{item.artist}</Text>
      </TouchableOpacity>
    );
  };

  const renderSongItem = ({ item }: { item: any }) => {
    const isActive = currentSong?.id === item.id;
    return (
      <TouchableOpacity style={styles.songRow} onPress={() => handlePlay(item)}>
        <Image source={{ uri: item.image }} style={[styles.songRowImg, isActive && { borderColor: '#c665e8', borderWidth: 2 }]} />
        <View style={styles.songRowInfo}>
          <Text style={[styles.songRowTitle, isActive && { color: '#c665e8' }]} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songRowArtist} numberOfLines={1}>{item.artist} • {item.album}</Text>
        </View>

        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={() => {
            addToQueue(item);
            Alert.alert('Đã thêm', `"${item.title}" vào danh sách phát`);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleFavorite(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={isFavorite(item.id) ? 'heart' : 'heart-outline'} size={20} color={isFavorite(item.id) ? '#c665e8' : '#555'} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => handlePlay(item)}>
          <Ionicons name={isActive ? 'volume-high' : 'play'} size={20} color="#aaa" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#170f23', '#1e1232', '#170f23']} style={styles.container}>
      <View style={{ flex: 1, alignSelf: 'center', width: contentWidth, maxWidth: 1200 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tìm Kiếm</Text>
        </View>

        {/* Search Input */}
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Ionicons name="search" size={20} color={isFocused ? '#c665e8' : '#888'} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Bạn muốn nghe bài hát, nghệ sĩ nào?"
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => startListening()}>
              <Ionicons name="mic" size={22} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {query.trim().length === 0 ? (
          // Discover / Recommendations + Genre Grid
          <FlatList
            key={numColumns}
            data={GENRES}
            keyExtractor={(g) => g.id}
            numColumns={numColumns}
            contentContainerStyle={styles.genreGrid}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                {/* Horizontal Auto-Suggest Blocks */}
                <View style={{ marginBottom: 16 }}>
                  {fallbackSongs.length > 0 ? (
                    <View>
                      <Text style={styles.browseTitle}>✨ Có thể bạn sẽ thích</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        {fallbackSongs.map(renderSuggestItem)}
                      </ScrollView>
                    </View>
                  ) : (
                    <>
                      {artistSongs.length > 0 && (
                        <View style={{ marginBottom: 28 }}>
                          <Text style={styles.browseTitle}>🔥 Bắt tần số Fan cứng của {topArtistName}</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {artistSongs.map(renderSuggestItem)}
                          </ScrollView>
                        </View>
                      )}
                      
                      {genreSongs.length > 0 && (
                        <View style={{ marginBottom: 16 }}>
                          <Text style={styles.browseTitle}>⚡ Thâm nhập vào gu nhạc {topGenreLabel}</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {genreSongs.map(renderSuggestItem)}
                          </ScrollView>
                        </View>
                      )}
                    </>
                  )}
                </View>

                <Text style={[styles.browseTitle, { marginTop: 16 }]}>Duyệt theo thể loại</Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.genreBlock, { backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length] + '33', borderColor: GENRE_COLORS[index % GENRE_COLORS.length] + '66' }]}
                onPress={() => {
                  setQuery(item.label);
                  inputRef.current?.focus();
                }}
              >
                <Ionicons name={item.icon as any} size={32} color={GENRE_COLORS[index % GENRE_COLORS.length]} />
                <Text style={[styles.genreBlockLabel, { color: GENRE_COLORS[index % GENRE_COLORS.length] }]}>{item.label}</Text>
                <Text style={styles.genreSongCount}>{SONGS.filter(s => s.genre === item.id).length} bài</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          // Search Results
          <FlatList
            data={results}
            keyExtractor={(s) => s.id}
            renderItem={renderSongItem}
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultCount}>
                {results.length > 0 ? `${results.length} kết quả cho "${query}"` : `Không tìm thấy "${query}"`}
              </Text>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes-outline" size={60} color="#555" />
                <Text style={styles.emptyText}>Không có kết quả nào</Text>
                <Text style={styles.emptySubText}>Thử tìm theo tên bài, nghệ sĩ hoặc album</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modal Lắng nghe giả lập + Thật (Voice/Melody) */}
      <Modal visible={isListening} transparent animationType="fade">
        <View style={styles.listenOverlay}>
          <Text style={styles.listenTitle}>
            Đang nghe... Nói tên bài hát hoặc lẩm nhẩm giai điệu
          </Text>
          <View style={styles.pulseContainer}>
             <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
             <Ionicons name="mic" size={44} color="#fff" />
          </View>
          <TouchableOpacity 
            style={styles.listenCancelBtn} 
            onPress={stopListening}
          >
            <Text style={styles.listenCancelTxt}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <MiniPlayer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff12', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    marginHorizontal: 20, marginBottom: 20, gap: 10,
    borderWidth: 1, borderColor: '#ffffff15',
  },
  searchBarFocused: { borderColor: '#c665e8', backgroundColor: '#c665e815' },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  
  // horizontal suggested cards
  suggestCard: { width: 140, marginRight: 16, marginTop: 10 },
  suggestImg: { width: 140, height: 140, borderRadius: 12, marginBottom: 8, backgroundColor: '#ffffff10' },
  suggestTitle: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  suggestArtist: { color: '#888', fontSize: 11, marginTop: 4 },

  browseTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6, paddingHorizontal: 20 },
  genreGrid: { paddingHorizontal: 12, paddingBottom: 140 },
  genreBlock: {
    flex: 1, margin: 6, padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, minHeight: 110, gap: 8,
  },
  genreBlockLabel: { fontSize: 16, fontWeight: 'bold' },
  genreSongCount: { color: '#aaa', fontSize: 11 },
  resultCount: { color: '#aaa', fontSize: 13, paddingHorizontal: 20, marginBottom: 12 },
  songRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#ffffff08',
  },
  songRowImg: { width: 52, height: 52, borderRadius: 8 },
  songRowInfo: { flex: 1, marginLeft: 12 },
  songRowTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  songRowArtist: { color: '#888', fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#aaa', fontSize: 16, fontWeight: '600', marginTop: 16 },
  emptySubText: { color: '#666', fontSize: 13, marginTop: 6, textAlign: 'center' },
  
  // Listening UI styles
  listenOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
    paddingBottom: 50,
  },
  listenTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 80, textAlign: 'center', paddingHorizontal: 20 },
  pulseContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#c665e8',
    alignItems: 'center', justifyContent: 'center', marginBottom: 100
  },
  pulseCircle: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#c665e860',
  },
  listenCancelBtn: {
    paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30,
    borderWidth: 1, borderColor: '#666', backgroundColor: '#ffffff10'
  },
  listenCancelTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
