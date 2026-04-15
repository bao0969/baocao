import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useMusic } from '../../context/MusicContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setLoginModalVisible } = useAuth();
  const { favorites, playlists } = useFavorites();
  const { sleepTimer, sleepTimerRemaining, setSleepTimer } = useMusic();
  const { isDark, toggleTheme } = useTheme();

  const [highQuality, setHighQuality] = useState(true);
  const [notifications, setNotifications] = useState(true);


  const stats = [
    { label: 'Yêu Thích', value: favorites.length, icon: 'heart' },
    { label: 'Playlist', value: playlists.length, icon: 'musical-notes' },
    { label: 'Nghệ Sĩ', value: [...new Set(favorites.map((s: any) => s.artist))].length, icon: 'person' },
  ];

  const SLEEP_OPTIONS = [
    { label: 'Tắt', value: null },
    { label: '15 phút', value: 15 },
    { label: '30 phút', value: 30 },
    { label: '45 phút', value: 45 },
    { label: '60 phút', value: 60 },
  ];

  const formatCountdown = (seconds: number | null) => {
    if (!seconds || seconds <= 0) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
        logout();
      }
    } else {
      Alert.alert('Đăng Xuất', 'Bạn có chắc muốn đăng xuất?', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => { logout(); } },
      ]);
    }
  };

  return (
    <LinearGradient colors={['#170f23', '#1e1232', '#170f23']} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#4a1f8a', '#2a1060']} style={styles.profileHeader}>
          {user ? (
            <>
              <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/300?img=12' }} style={styles.avatar} />
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userType}>{user.type === 'facebook' ? '📘 Facebook' : user.type === 'zalo' ? '💙 Zalo' : '📧 Email'}</Text>
            </>
          ) : (
            <>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#c665e8" />
              </View>
              <Text style={styles.userName}>Khách</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => setLoginModalVisible(true)}>
                <Text style={styles.loginBtnText}>Đăng nhập / Đăng ký</Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={20} color="#c665e8" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Cài Đặt</Text>

        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="musical-note" size={20} color="#c665e8" />
              <Text style={styles.settingLabel}>Chất lượng cao</Text>
            </View>
            <Switch
              value={highQuality}
              onValueChange={setHighQuality}
              trackColor={{ false: '#444', true: '#c665e8' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color="#c665e8" />
              <Text style={styles.settingLabel}>Thông báo</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#444', true: '#c665e8' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color="#c665e8" />
              <Text style={styles.settingLabel}>{isDark ? 'Chế độ tối' : 'Chế độ sáng'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#FFD700', true: '#c665e8' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/stats' as any)}>
            <View style={styles.settingLeft}>
              <Ionicons name="bar-chart" size={20} color="#c665e8" />
              <Text style={styles.settingLabel}>Thống kê nghe nhạc</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Sleep Timer */}
        <Text style={styles.sectionTitle}>Hẹn Giờ Tắt Nhạc</Text>
        <View style={styles.settingsGroup}>
          {sleepTimerRemaining && (
            <View style={styles.countdownBanner}>
              <Ionicons name="moon" size={16} color="#c665e8" />
              <Text style={styles.countdownText}>Tắt nhạc sau: <Text style={{ color: '#c665e8', fontWeight: 'bold' }}>{formatCountdown(sleepTimerRemaining)}</Text></Text>
              <TouchableOpacity onPress={() => setSleepTimer(null)} style={styles.cancelTimer}>
                <Ionicons name="close-circle" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.sleepTimerRow}>
            <Ionicons name="moon" size={20} color="#c665e8" style={{ marginRight: 8 }} />
            {SLEEP_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.sleepOption, sleepTimer === opt.value && styles.sleepOptionActive]}
                onPress={() => {
                  setSleepTimer(opt.value);
                  if (opt.value) Alert.alert('Hẹn giờ', `Nhạc sẽ tắt sau ${opt.value} phút`);
                }}
              >
                <Text style={[styles.sleepOptionText, sleepTimer === opt.value && styles.sleepOptionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>Thông Tin</Text>
        <View style={styles.settingsGroup}>
          {[
            { label: 'Phiên bản', value: '2.0.0', icon: 'information-circle' },
            { label: 'Điều khoản sử dụng', icon: 'document-text', onPress: () => {} },
            { label: 'Chính sách riêng tư', icon: 'shield-checkmark', onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingRow} onPress={item.onPress}>
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon as any} size={20} color="#c665e8" />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              {item.value ? (
                <Text style={styles.settingValue}>{item.value}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={16} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
      <MiniPlayer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingTop: 55, paddingBottom: 30, paddingHorizontal: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#c665e8', marginBottom: 12 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#c665e820', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  userType: { color: '#ccc', fontSize: 14, marginTop: 4 },
  loginBtn: { marginTop: 14, backgroundColor: '#c665e8', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#ffffff08', marginHorizontal: 20, marginVertical: 20, borderRadius: 16, padding: 20 },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12 },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginHorizontal: 20, marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  settingsGroup: { backgroundColor: '#ffffff08', marginHorizontal: 20, borderRadius: 16, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { color: '#fff', fontSize: 15 },
  settingValue: { color: '#888', fontSize: 14 },
  sleepTimerRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, alignItems: 'center' },
  sleepOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ffffff20' },
  sleepOptionActive: { backgroundColor: '#c665e830', borderColor: '#c665e8' },
  sleepOptionText: { color: '#888', fontSize: 13 },
  sleepOptionTextActive: { color: '#c665e8', fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FF6B6B22', borderWidth: 1, borderColor: '#FF6B6B44', gap: 8 },
  logoutText: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 15 },
  countdownBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#c665e810', borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  countdownText: { color: '#ccc', fontSize: 13, flex: 1 },
  cancelTimer: { padding: 4 },
});
