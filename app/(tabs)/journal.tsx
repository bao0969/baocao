import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import { useJournal } from '../../context/JournalContext';
import { useMusic } from '../../context/MusicContext';
import { SONGS } from '../../constants/songs';

const GEMINI_API_KEY = 'AIzaSyA5ACYCB6kMhOiC0AiK0J9D-_PcLKeIKJY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SONG_CONTEXT = SONGS.map((s) => `- Tên bài: "${s.title}" | Artist: ${s.artist} | ID: ${s.id}`).join('\n');

const SYSTEM_PROMPT = `Bạn là một Nhà Tâm Lý Học và Chuyên gia Âm nhạc.
Người dùng sẽ viết nhật ký về ngày hôm nay của họ. 
Nhiệm vụ:
1. Đọc hiểu sâu sắc tâm lý người dùng.
2. Viết 1 câu trích dẫn (quote) đậm chất thơ hoặc triết lý để tóm tắt, bao dung hoặc chữa lành cho họ.
3. Gắn 2-3 nhãn (tags) cảm xúc định dạng chuẩn (VD: #Buồn, #HyVọng, #ChôngChênh, #BìnhYên).
4. Gợi ý một mảng (array) gồm từ 3 đến 5 BÀI HÁT có trong danh sách dưới đây để tạo thành một Playlist đồng cảm cùng họ.
5. Trả về đúng định dạng JSON, tuyệt đối không trả về markdown hay các text dư thừa khác.

JSON Format:
{
  "emoji": "1 emoji miêu tả cảm xúc",
  "quote": "1 câu trích dẫn sâu sắc, đậm chất thơ",
  "tags": ["#Tag1", "#Tag2"],
  "songIds": ["id bài 1", "id bài 2", "id bài 3"],
  "colors": ["màu hex chính (ví dụ #4a90e2 cho buồn, #ff7e5f cho vui)", "màu hex phụ để làm gradient"]
}

Danh sách bài hát:
${SONG_CONTEXT}
`;

// Helper: Sinh ra +- 14 ngày quanh ngày hôm nay
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = -14; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

// Font chữ "có chân" sang chảnh giống sách (tuỳ HĐH)
const SERIF_FONT = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export default function JournalScreen() {
  const router = useRouter();
  const { entries, addEntry, deleteEntry } = useJournal();
  const { playSong } = useMusic();

  const [modalVisible, setModalVisible] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const datesList = useMemo(() => generateDates(), []);
  const calendarRef = useRef<ScrollView>(null);

  // Cuộn lịch tới gân Ngày Hiện Tại khi load trang
  useEffect(() => {
    setTimeout(() => {
      calendarRef.current?.scrollTo({ x: 14 * 60 - 150, animated: true });
    }, 500);
  }, []);

  const formatDateString = (dateObj: Date) => {
    return dateObj.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const selectedDateString = formatDateString(selectedDate);
  const filteredEntries = entries.filter((e: any) => e.date === selectedDateString);

  // Hàm kiểm tra xem 1 Date object có chứa bài nhật ký nào không (để vẽ thẻ "•")
  const hasEntryOnDate = (dateObj: Date) => {
    const str = formatDateString(dateObj);
    return entries.some((e: any) => e.date === str);
  };

  const handleCreateEntry = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: inputText }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      });

      const data = await res.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiText) {
        let result;
        try {
          let cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
          result = JSON.parse(cleanedText);
        } catch(e) {
          console.log("JSON parse error, falling back", aiText);
          result = { emoji: '✨', quote: 'Một nốt lặng giữa bản nhạc cuộc đời.', tags: ['#TĩnhLặng', '#ÂmNhạc'], songIds: ['1', '2', '3'], colors: ['#c665e8', '#4a1f8a'] };
        }

        let finalSongIds = [];
        if (result.songIds && Array.isArray(result.songIds)) {
          finalSongIds = result.songIds.map(String);
        } else if (result.songId) {
          finalSongIds = [String(result.songId)];
        } else {
          finalSongIds = ['1'];
        }

        const playlistSongs = finalSongIds.map((id: string) => SONGS.find((s: any) => s.id === id)).filter(Boolean);
        const mappedSongs = playlistSongs.length > 0 ? playlistSongs : [SONGS[0]];

        const newEntry = {
          id: Date.now().toString(),
          date: selectedDateString, // TRỌNG ĐIỂM: Time-travel logging
          title: inputTitle.trim() || 'Trang nhật ký vô danh',
          text: inputText,
          reply: result.quote || result.reply || '',
          tags: result.tags || ['#NhậtKý'],
          emoji: result.emoji || '📖',
          songIds: mappedSongs.map((s: any) => s.id),
          colors: result.colors || ['#2b184a', '#170f23']
        };

        await addEntry(newEntry);
        setModalVisible(false);
        setInputTitle('');
        setInputText('');
        
        // Auto play the playlist
        playSong(mappedSongs[0], mappedSongs);
      }
    } catch (error) {
      console.log('Lỗi gọi AI Journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEntry = ({ item }: { item: any }) => {
    // Thích ứng ngược
    const itemSongIds = item.songIds || (item.songId ? [item.songId] : []);
    const playlist = itemSongIds.map((id: string) => SONGS.find(s => s.id === id)).filter(Boolean);
    if (!playlist.length) return null;

    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={item.colors || ['#1e1232', '#170f23']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Top Row: Date & Actions */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Ionicons name="bookmark" size={16} color="#ffffff90" />
               <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteEntry(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={18} color="#ffffff60" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.diaryTitle}>
            {item.title || (item.text.length > 20 ? item.text.substring(0, 20) + '...' : item.text)}
          </Text>

          {/* Tags */}
          {(item.tags && item.tags.length > 0) && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag: string, i: number) => (
                <View key={i} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* User's Text */}
          <Text style={styles.userText}>{item.text}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* AI Quote Section */}
          <View style={styles.aiQuoteBox}>
            <Text style={{ fontSize: 28, marginRight: 16 }}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiQuoteText}>
                "{item.reply}"
              </Text>
            </View>
          </View>

          {/* Mini Playlist */}
          <View style={styles.playlistBox}>
             <Text style={styles.playlistHeader}>ĐƠN THUỐC ÂM NHẠC CHO BẠN (PLAYLIST)</Text>
             {playlist.map((song: any, index: number) => (
                <View key={song.id + index} style={styles.songRow}>
                   <View style={styles.songIndexBox}>
                     <Text style={styles.songIndexText}>{index + 1}</Text>
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                     <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                   </View>
                </View>
             ))}
             
             {/* Play All Button */}
            <TouchableOpacity 
              style={styles.playAllBtn}
              onPress={() => playSong(playlist[0], playlist)}
              activeOpacity={0.8}
            >
              <Ionicons name="headset" size={18} color="#fff" />
              <Text style={styles.playAllText}>Chữa Lành Ngay</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const isToday = selectedDate.getDate() === new Date().getDate();

  return (
    <LinearGradient colors={['#170f23', '#0a0710']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sổ Tay Tâm Hồn ✒️</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarContainer}>
        <ScrollView 
          ref={calendarRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {datesList.map((d, index) => {
             const isSelected = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
             const hasEntry = hasEntryOnDate(d);
             const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T');
             
             return (
               <TouchableOpacity 
                 key={index}
                 activeOpacity={0.7}
                 onPress={() => setSelectedDate(d)}
                 style={[styles.dateItem, isSelected && styles.dateItemActive]}
               >
                 <Text style={[styles.dayNameText, isSelected && styles.selectedDateText]}>{dayName}</Text>
                 <Text style={[styles.dayNumText, isSelected && styles.selectedDateText]}>{d.getDate()}</Text>
                 {hasEntry && <View style={[styles.dotMarker, isSelected && { backgroundColor: '#fff' }]} />}
               </TouchableOpacity>
             );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="book-outline" size={48} color="#c665e8" />
            </View>
            <Text style={styles.emptyTitle}>Trang giấy trắng</Text>
            <Text style={styles.emptySub}>
              {isToday 
                ? "Cuốn sổ đang chờ bạn trải lòng về ngày hôm nay..."
                : "Không có dòng hồi ức nào được ghi lại vào ngày này. Bạn có muốn viết bù không?"}
            </Text>
          </View>
        }
      />

      {/* FAB Write Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient colors={['#c665e8', '#7b40ad']} style={styles.fabGradient}>
          <Ionicons name="pencil" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <MiniPlayer />

      {/* Write Modal - Premium Fullscreen */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0d0a14' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.composeScreen}>
            <View style={styles.composeHeader}>
              <View>
                <Text style={styles.composeTitleDate}>{selectedDateString}</Text>
                <Text style={styles.composeTitleInfo}>Trang nhật ký mới</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#ffffffbb" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.composeTitleInput}
              placeholder="Tựa đề ngày hôm nay..."
              placeholderTextColor="#ffffff40"
              value={inputTitle}
              onChangeText={setInputTitle}
            />

            <View style={styles.elegantDivider} />

            <TextInput
              style={styles.composeBodyInput}
              placeholder="Hãy trút bỏ muộn phiền nơi những dòng chữ này..."
              placeholderTextColor="#ffffff30"
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.composeBottom}>
               <TouchableOpacity 
                 style={[styles.saveBtn, (!inputText.trim() || loading) && { opacity: 0.5 }]}
                 onPress={handleCreateEntry}
                 disabled={!inputText.trim() || loading}
               >
                 {loading ? (
                   <ActivityIndicator color="#fff" />
                 ) : (
                   <LinearGradient colors={['#c665e8', '#4a1f8a']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.saveBtnGradient}>
                     <Ionicons name="color-wand-outline" size={18} color="#fff" />
                     <Text style={styles.saveBtnText}>Lưu Trang & Gọi AI Chữa Lành</Text>
                   </LinearGradient>
                 )}
               </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 65 : 55, paddingHorizontal: 20, paddingBottom: 20,
  },
  backBtn: { width: 30, opacity: 0.8 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700', fontFamily: SERIF_FONT, letterSpacing: 0.8 },
  
  // Calendar Strip
  calendarContainer: { height: 90, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 15 },
  dateItem: { width: 60, height: 72, marginHorizontal: 6, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  dateItemActive: { backgroundColor: '#c665e8', shadowColor: '#c665e8', shadowOpacity: 0.8, shadowRadius: 12, elevation: 8, borderColor: '#c665e8' },
  dayNameText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', marginBottom: 6, fontWeight: '700', letterSpacing: 1 },
  dayNumText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  selectedDateText: { color: '#fff' },
  dotMarker: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(198, 101, 232, 0.8)', marginTop: 4, position: 'absolute', bottom: 8 },

  listContainer: { padding: 20, paddingBottom: 160 },
  
  // Scapbook Card
  cardContainer: { marginBottom: 35, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 8, shadowOffset: { width: 0, height: 12 } },
  cardGradient: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 8 },
  diaryTitle: { color: '#fff', fontSize: 28, fontWeight: '700', fontFamily: SERIF_FONT, marginBottom: 16, lineHeight: 36, letterSpacing: 0.3 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  tagBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tagText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  
  userText: { color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 30, marginBottom: 24, fontFamily: SERIF_FONT, letterSpacing: 0.2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
  
  // AI Quote Book style
  aiQuoteBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 20, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  aiQuoteText: { color: '#e2cdfa', fontSize: 16, fontStyle: 'italic', lineHeight: 28, fontFamily: SERIF_FONT, letterSpacing: 0.3 },
  
  // Mini Playlist
  playlistBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 18, marginTop: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  playlistHeader: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 16, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  songRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  songIndexBox: { width: 32, alignItems: 'center' },
  songIndexText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '700' },
  songTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  songArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  playAllBtn: { backgroundColor: '#c665e8', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 12, shadowColor: '#c665e8', shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
  playAllText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5 },

  // FAB 
  fab: { position: 'absolute', right: 24, bottom: 120, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 15, elevation: 12, shadowOffset: { width: 0, height: 8 } },
  fabGradient: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  
  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 30 },
  emptyIconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(198, 101, 232, 0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 30, borderWidth: 1, borderColor: 'rgba(198, 101, 232, 0.2)' },
  emptyTitle: { color: '#fff', fontSize: 24, fontWeight: '700', fontFamily: SERIF_FONT, letterSpacing: 0.5 },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', marginTop: 14, lineHeight: 28, fontFamily: SERIF_FONT },
  
  // Premium Compose Modal
  composeScreen: { flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  composeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  composeTitleDate: { color: '#c665e8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  composeTitleInfo: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: SERIF_FONT, letterSpacing: 0.5 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  
  composeTitleInput: { color: '#fff', fontSize: 36, fontWeight: '700', fontFamily: SERIF_FONT, marginBottom: 24, lineHeight: 46 },
  elegantDivider: { height: 2, width: 80, backgroundColor: '#c665e8', marginBottom: 30, borderRadius: 2, opacity: 0.8 },
  composeBodyInput: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: 20, lineHeight: 32, fontFamily: SERIF_FONT, letterSpacing: 0.3 },
  
  composeBottom: { paddingVertical: 20, paddingBottom: Platform.OS === 'ios' ? 45 : 30 },
  saveBtn: { overflow: 'hidden', borderRadius: 30, shadowColor: '#c665e8', shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  saveBtnGradient: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.8 },
});
