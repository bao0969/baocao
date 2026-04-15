import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const EQ_BANDS = ['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'];
const STORAGE_KEY = '@musicapp_eq';

const PRESETS = {
  Normal:     [0, 0, 0, 0, 0],
  'Bass Boost': [8, 6, 0, -2, -3],
  Pop:        [-1, 3, 5, 3, -1],
  Rock:       [5, 3, -1, 3, 5],
  Jazz:       [3, 0, 2, 3, 5],
  Classical:  [4, 3, -1, 2, 4],
  Electronic: [5, 3, 0, 4, 5],
};

export default function EqualizerModal({ visible, onClose }) {
  const [values, setValues] = useState([0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState('Normal');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      if (json) {
        try {
          const { values: v, preset: p } = JSON.parse(json);
          if (v) setValues(v);
          if (p) setActivePreset(p);
        } catch (_) {}
      }
    });
  }, []);

  const applyPreset = (name) => {
    const v = PRESETS[name];
    setValues(v);
    setActivePreset(name);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ values: v, preset: name })).catch(() => {});
  };

  const changeValue = (index, delta) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = Math.max(-12, Math.min(12, next[index] + delta));
      setActivePreset('Custom');
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ values: next, preset: 'Custom' })).catch(() => {});
      return next;
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>🎛️ Equalizer</Text>

          {/* Presets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {Object.keys(PRESETS).map((name) => (
              <TouchableOpacity
                key={name}
                style={[styles.presetBtn, activePreset === name && styles.presetActive]}
                onPress={() => applyPreset(name)}
              >
                <Text style={[styles.presetText, activePreset === name && styles.presetTextActive]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* EQ Bars */}
          <View style={styles.eqRow}>
            {EQ_BANDS.map((band, i) => {
              const val = values[i];
              const normalizedHeight = ((val + 12) / 24) * 140; // 0-140px
              const barColor = val > 0 ? '#c665e8' : val < 0 ? '#FF6B6B' : '#555';
              return (
                <View key={band} style={styles.eqBand}>
                  <Text style={styles.dbLabel}>{val > 0 ? '+' : ''}{val}dB</Text>
                  {/* Up button */}
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => changeValue(i, 1)}>
                    <Ionicons name="chevron-up" size={16} color="#c665e8" />
                  </TouchableOpacity>
                  {/* Track */}
                  <View style={styles.track}>
                    <View style={[styles.trackFill, {
                      height: normalizedHeight,
                      backgroundColor: barColor,
                    }]} />
                  </View>
                  {/* Down button */}
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => changeValue(i, -1)}>
                    <Ionicons name="chevron-down" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                  <Text style={styles.bandLabel}>{band}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1a0f30',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingBottom: 36,
  },
  handle: { width: 40, height: 4, backgroundColor: '#ffffff30', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  presetsScroll: { flexGrow: 0, marginBottom: 24 },
  presetBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ffffff20',
  },
  presetActive: { backgroundColor: '#c665e830', borderColor: '#c665e8' },
  presetText: { color: '#888', fontWeight: '600', fontSize: 13 },
  presetTextActive: { color: '#c665e8' },
  eqRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 24 },
  eqBand: { alignItems: 'center', gap: 6 },
  dbLabel: { color: '#aaa', fontSize: 11, fontWeight: '600', height: 16 },
  arrowBtn: { padding: 4 },
  track: {
    width: 28, height: 140, backgroundColor: '#ffffff10',
    borderRadius: 14, overflow: 'hidden', justifyContent: 'flex-end',
  },
  trackFill: { width: '100%', borderRadius: 14 },
  bandLabel: { color: '#666', fontSize: 11, marginTop: 4 },
  closeBtn: {
    marginHorizontal: 20, paddingVertical: 14, borderRadius: 16,
    backgroundColor: '#c665e8', alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
