import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { useMusic } from '../context/MusicContext';
import { SONGS } from '../constants/songs';

const GEMINI_API_KEY = 'AIzaSyA5ACYCB6kMhOiC0AiK0J9D-_PcLKeIKJY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SONG_CONTEXT = SONGS.map((s) => `- "${s.title}" bởi ${s.artist} (thể loại: ${s.genre || 'nhạc'}, album: ${s.album})`).join('\n');

const SYSTEM_PROMPT = `Bạn là AI trợ lý âm nhạc xuất sắc của MusicApp.
Bạn có 2 nhiệm vụ chính:
1. Gợi ý bài hát có sẵn: Dựa vào yêu cầu, tìm trong danh sách bài hát CÓ SẴN.
2. Sáng tác bài hát mới: Nếu người dùng yêu cầu "sáng tác", "tạo nhạc", "viết bài hát"... bạn sẽ hóa thân thành nhạc sĩ tạo ra bài hát mới tinh. Tự đặt Tên bài hát, chọn Thể loại, và viết Lời bài hát.

DANH SÁCH BÀI HÁT CÓ SẴN TRONG APP:
${SONG_CONTEXT}

QUAN TRỌNG: Bạn BẮT BUỘC phải trả về định dạng JSON tuần tự. Khuôn mẫu JSON:
{
  "type": "chat" | "generate", // "chat" nếu muốn nói chuyện/gợi ý bài có sẵn, "generate" nếu người dùng bắt tạo bài hát mới
  "text": "Câu trả lời thân thiện (có emoji). Nếu tạo bài hát, hãy khoe là bãn đã làm xong. Nếu không có bài hát có sẵn nào phù hợp, bảo người dùng là bạn không tìm thấy.",
  "suggestedSongTitle": "Tên bài hát CÓ SẴN (nếu muốn gợi ý, bằng không để trống)",
  "generatedSong": { // Điền nếu type là "generate"
    "title": "Tên bài hát sáng tác",
    "genre": "pop", // pop, ballad, chill, rap, lo-fi, edm
    "lyrics": "Lời bài hát, có ký tự \\n để xuống dòng"
  }
}`;

function suggestSongFromText(title, songs) {
  if (!title) return null;
  const lower = title.toLowerCase();
  return songs.find((s) => lower.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(lower)) || null;
}

const QUICK_PROMPTS = [
  '🎹 Sáng tác bài hát buồn',
  '🎤 Viết bài rap cực căng',
  '🎵 Nhạc chill để thư giãn',
  '⚡ Nhạc tập gym năng lượng',
  '🌙 Nhạc đêm khuya',
];

export default function AIChatbot({ visible, onClose }) {
  const { playSong } = useMusic();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'ai',
      text: 'Xin chào! 👋 Tôi là AI trợ lý âm nhạc. Bạn muốn nghe gì hay muốn tôi sáng tác một bài hát mới cho bạn? 🎵',
      suggestedSong: null,
      generatedSong: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const listRef = useRef(null);
  const recognitionRef = useRef(null);

  const startListening = () => {
    setIsListening(true);
    
    if (Platform.OS === 'web' && typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
           const fullText = (input ? input + ' ' : '') + transcript;
           setInput('');
           setIsListening(false);
           sendMessage(fullText);
        } else {
           setIsListening(false);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      alert('Thiết bị của bạn chưa hỗ trợ nhận diện giọng nói gốc.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setIsListening(false);
  };

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send text without role tagging for history if mixing user/model manually,
      // but Gemini expects user/model switching.
      // Ensure correct history alternating:
      let filteredHistory = messages.filter(m => m.id !== '0').slice(-6);
      
      // Need strict alternating roles for Gemini
      const historyParts = [];
      filteredHistory.forEach(m => {
          // Flatten texts
          const lastRole = historyParts.length > 0 ? historyParts[historyParts.length - 1].role : null;
          const currentRole = m.role === 'user' ? 'user' : 'model';
          
          if (lastRole === currentRole) {
              historyParts[historyParts.length - 1].parts[0].text += `\n${m.text}`;
          } else {
              historyParts.push({
                  role: currentRole,
                  parts: [{ text: m.text }]
              });
          }
      });

      const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...historyParts,
          { role: 'user', parts: [{ text }] },
        ],
        generationConfig: { 
          temperature: 0.8, 
          maxOutputTokens: 1024,
          responseMimeType: "application/json"
        },
      };

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const aiResponseRaw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      let aiResponse;
      try {
        aiResponse = JSON.parse(aiResponseRaw);
      } catch (e) {
        aiResponse = { type: 'chat', text: "Xin lỗi, tôi gặp sự cố khi xử lý dữ liệu. Bạn thử lại nhé! 😅" };
      }

      let suggestedSong = null;
      let generatedSong = null;

      if (aiResponse.type === 'generate' && aiResponse.generatedSong) {
        generatedSong = {
          id: 'gen_' + Date.now().toString(),
          title: aiResponse.generatedSong.title,
          artist: 'AI Music Assistant',
          album: 'AI Generated Collection',
          genre: aiResponse.generatedSong.genre || 'chill',
          image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=500&q=80',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Mock beat
          duration: 198000,
          isNew: true,
          lyrics: aiResponse.generatedSong.lyrics,
        };
      } else if (aiResponse.suggestedSongTitle) {
        suggestedSong = suggestSongFromText(aiResponse.suggestedSongTitle, SONGS);
      }

      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: aiResponse.text || 'Đây là kết quả của bạn.', 
        suggestedSong,
        generatedSong
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Tự động phát nhạc luôn và đóng cửa sổ Chatbot
      if (generatedSong) {
        playSong(generatedSong, [generatedSong, ...SONGS]);
        setTimeout(() => onClose(), 2000);
      } else if (suggestedSong) {
        playSong(suggestedSong, SONGS);
        setTimeout(() => onClose(), 2000);
      }
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Có lỗi kết nối. Hãy thử lại sau nhé! 😅',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#c665e8" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
          {item.suggestedSong && (
            <TouchableOpacity
              style={styles.playBubble}
              onPress={() => { playSong(item.suggestedSong, SONGS); onClose(); }}
            >
              <Ionicons name="play-circle" size={18} color="#fff" />
              <Text style={styles.playBubbleText}>Nghe bài: {item.suggestedSong.title}</Text>
            </TouchableOpacity>
          )}
          {item.generatedSong && (
            <TouchableOpacity
              style={[styles.playBubble, { backgroundColor: '#4ECDC4' }]}
              onPress={() => { 
                playSong(item.generatedSong, [item.generatedSong, ...SONGS]); 
                onClose(); 
              }}
            >
              <Ionicons name="musical-notes" size={18} color="#111" />
              <Text style={[styles.playBubbleText, { color: '#111' }]}>
                Phát bài hát AI: {item.generatedSong.title}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.overlay}>
          <LinearGradient colors={['#1a0838', '#0d0a20']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.aiDot} />
                <View>
                  <Text style={styles.headerTitle}>AI Music Assistant</Text>
                  <Text style={styles.headerSub}>Sáng tác & Gợi ý nhạc ✨</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color="#c665e8" />
                <Text style={styles.typingText}>AI đang suy nghĩ (và sáng tác bài hát)...</Text>
              </View>
            )}

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <FlatList
                horizontal
                data={QUICK_PROMPTS}
                keyExtractor={(q) => q}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickList}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.quickChip} onPress={() => sendMessage(item)}>
                    <Text style={styles.quickText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Input */}
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.micBtn}
                onPress={isListening ? stopListening : startListening}
              >
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={26} color={isListening ? "#ff4d4d" : "#888"} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={isListening ? "Đang lắng nghe..." : "Ví dụ: sáng tác bài hát về mưa..."}
                placeholderTextColor="#666"
                value={input}
                onChangeText={setInput}
                multiline
                onKeyPress={(e) => {
                  if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { height: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#ffffff10',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#c665e820', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#c665e860' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: '#c665e8', fontSize: 12, marginTop: 1 },
  messageList: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#c665e820', borderWidth: 1, borderColor: '#c665e840',
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%', borderRadius: 20, padding: 12,
  },
  bubbleAi: { backgroundColor: '#2a1550', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: '#c665e8', borderBottomRightRadius: 4 },
  bubbleText: { color: '#e0d0f0', fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  playBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, backgroundColor: '#c665e8', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
  },
  playBubbleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  typingText: { color: '#888', fontSize: 13, fontStyle: 'italic' },
  quickList: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  quickChip: {
    backgroundColor: '#c665e820', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#c665e840',
  },
  quickText: { color: '#c665e8', fontSize: 13 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#ffffff10',
    backgroundColor: '#0d0a20',
  },
  micBtn: {
    padding: 6,
  },
  input: {
    flex: 1, backgroundColor: '#ffffff10', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15,
    maxHeight: 100, borderWidth: 1, borderColor: '#ffffff15',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#c665e8', alignItems: 'center', justifyContent: 'center',
  },
});
