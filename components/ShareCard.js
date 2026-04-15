import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ShareCard({ visible, onClose, song }) {
  if (!song) return null;

  const handleShare = async () => {
    try {
      const message = `🎵 Tôi đang nghe "${song.title}" của ${song.artist} trên MusicApp!\n\n📀 Album: ${song.album}\n\n🎧 Nghe cùng tôi nhé!`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: song.title, text: message });
        } else {
          await navigator.clipboard.writeText(message);
          alert('Đã copy thông tin bài hát vào clipboard!');
        }
      } else {
        await Share.share({ message, title: song.title });
      }
    } catch (_) {}
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          {/* Card design */}
          <LinearGradient colors={['#2a0a50', '#4a1580', '#1a0838']} style={styles.cardInner}>
            {/* Decorative circles */}
            <View style={styles.decCircle1} />
            <View style={styles.decCircle2} />

            {/* App branding */}
            <View style={styles.brandRow}>
              <Ionicons name="musical-notes" size={18} color="#c665e8" />
              <Text style={styles.brandText}>MusicApp</Text>
            </View>

            {/* Album art */}
            <View style={styles.artWrapper}>
              <Image source={{ uri: song.image }} style={styles.art} />
              <View style={styles.artGlow} />
            </View>

            {/* Song info */}
            <Text style={styles.songTitle} numberOfLines={2}>{song.title}</Text>
            <Text style={styles.songArtist}>{song.artist}</Text>
            <Text style={styles.songAlbum}>{song.album}</Text>

            {/* Waveform decoration */}
            <View style={styles.waveRow}>
              {[4, 8, 12, 16, 20, 16, 12, 8, 4, 6, 10, 14, 18, 14, 10, 6].map((h, i) => (
                <View key={i} style={[styles.wavBar, { height: h }]} />
              ))}
            </View>

            {/* Tagline */}
            <Text style={styles.tagline}>🎧 Nghe cùng tôi trên MusicApp</Text>
          </LinearGradient>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareBtnText}>Chia Sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, borderRadius: 24, overflow: 'hidden' },
  cardInner: { padding: 24, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  decCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#c665e820', top: -60, right: -60 },
  decCircle2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#8a2be220', bottom: -40, left: -40 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  brandText: { color: '#c665e8', fontWeight: 'bold', fontSize: 16 },
  artWrapper: { position: 'relative', marginBottom: 20 },
  art: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: '#c665e860' },
  artGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 80, shadowColor: '#c665e8', shadowOpacity: 0.8, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  songTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  songArtist: { color: '#c665e8', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  songAlbum: { color: '#888', fontSize: 13, marginBottom: 20 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 12 },
  wavBar: { width: 3, backgroundColor: '#c665e870', borderRadius: 2 },
  tagline: { color: '#ffffff80', fontSize: 12 },
  buttons: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#0d0a20' },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#c665e8', paddingVertical: 14, borderRadius: 16,
  },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff15', borderRadius: 16, paddingVertical: 14,
  },
  cancelBtnText: { color: '#aaa', fontWeight: '600', fontSize: 15 },
});
