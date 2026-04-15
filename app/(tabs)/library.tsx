import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';
import { useFavorites } from '../../context/FavoritesContext';
import { useMusic } from '../../context/MusicContext';

const TABS = ['Playlist', 'Yêu Thích', 'Album', 'Nghệ Sĩ'];

export default function LibraryScreen() {
  const router = useRouter();
  const { currentSong, playSong, playQueue } = useMusic();
  const {
    favorites, playlists, isFavorite, toggleFavorite,
    createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, addToRecentlyPlayed,
  } = useFavorites();

  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedSongToAdd, setSelectedSongToAdd] = useState<any>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handlePlayPlaylist = (pl: any) => {
    if (pl.songs.length === 0) return Alert.alert('Thông báo', 'Playlist này chưa có bài hát!');
    playQueue(pl.songs, 0);
    addToRecentlyPlayed(pl.songs[0]);
  };

  const handlePlaySong = (song: any) => {
    playSong(song, favorites);
    addToRecentlyPlayed(song);
  };

  // Get unique albums from favorites
  const albums = [...new Map(favorites.map((s: any) => [s.album, { album: s.album, artist: s.artist, image: s.image, songs: favorites.filter((x: any) => x.album === s.album) }])).values()];
  // Get unique artists from favorites
  const artists = [...new Map(favorites.map((s: any) => [s.artist, { artist: s.artist, image: s.image, count: favorites.filter((x: any) => x.artist === s.artist).length }])).values()];

  const renderSongRow = (song: any, showRemove: boolean = false, playlistId: string | null = null) => {
    const isActive = currentSong?.id === song.id;
    return (
      <TouchableOpacity style={styles.songRow} onPress={() => handlePlaySong(song)}>
        <Image source={{ uri: song.image }} style={[styles.songImg, isActive && { borderColor: '#c665e8', borderWidth: 2 }]} />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isActive && { color: '#c665e8' }]} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
        </View>
        {showRemove && playlistId ? (
          <TouchableOpacity onPress={() => removeSongFromPlaylist(playlistId, song.id)}>
            <Ionicons name="remove-circle" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => { setSelectedSongToAdd(song); setShowAddToPlaylistModal(true); }}>
              <Ionicons name="add-circle-outline" size={22} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(song)}>
              <Ionicons name={isFavorite(song.id) ? 'heart' : 'heart-outline'} size={20} color={isFavorite(song.id) ? '#c665e8' : '#555'} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#170f23', '#1e1232', '#170f23']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thư Viện</Text>
        {activeTab === 0 && (
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Tạo mới</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
        {/* PLAYLIST TAB */}
        {activeTab === 0 && (
          <>
            {playlists.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes-outline" size={56} color="#555" />
                <Text style={styles.emptyText}>Chưa có playlist nào</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreateModal(true)}>
                  <Text style={styles.emptyBtnText}>Tạo playlist đầu tiên</Text>
                </TouchableOpacity>
              </View>
            )}
            {playlists.map((pl: any) => (
              <View key={pl.id}>
                <TouchableOpacity style={styles.playlistRow} onPress={() => setExpandedPlaylist(expandedPlaylist === pl.id ? null : pl.id)}>
                  {pl.cover ? (
                    <Image source={{ uri: pl.cover }} style={styles.playlistCover} />
                  ) : (
                    <View style={[styles.playlistCover, styles.playlistCoverPlaceholder]}>
                      <Ionicons name="musical-notes" size={24} color="#c665e8" />
                    </View>
                  )}
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{pl.name}</Text>
                    <Text style={styles.playlistMeta}>{pl.songs.length} bài hát</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePlayPlaylist(pl)} style={{ marginRight: 12 }}>
                    <Ionicons name="play-circle" size={34} color="#c665e8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Xoá Playlist', `Xoá "${pl.name}"?`, [
                    { text: 'Huỷ', style: 'cancel' },
                    { text: 'Xoá', style: 'destructive', onPress: () => deletePlaylist(pl.id) },
                  ])}>
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </TouchableOpacity>
                {expandedPlaylist === pl.id && (
                  <View style={styles.playlistSongs}>
                    {pl.songs.length === 0 ? (
                      <Text style={styles.emptySongs}>Playlist trống. Thêm bài từ màn hình Tìm Kiếm.</Text>
                    ) : (
                      pl.songs.map((s: any) => (
                        <View key={s.id}>
                          {renderSongRow(s, true, pl.id)}
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* FAVORITES TAB */}
        {activeTab === 1 && (
          <>
            {favorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={56} color="#555" />
                <Text style={styles.emptyText}>Chưa có bài yêu thích</Text>
                <Text style={styles.emptySubText}>Nhấn ❤️ trên bài hát để thêm vào đây</Text>
              </View>
            ) : (
              favorites.map((s: any) => <View key={s.id}>{renderSongRow(s)}</View>)
            )}
          </>
        )}

        {/* ALBUM TAB */}
        {activeTab === 2 && (
          <>
            {albums.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="disc-outline" size={56} color="#555" />
                <Text style={styles.emptyText}>Chưa có album nào</Text>
                <Text style={styles.emptySubText}>Thêm bài hát yêu thích để xem album</Text>
              </View>
            ) : (
              <View style={styles.albumGrid}>
                {albums.map((a: any, i) => (
                  <TouchableOpacity key={i} style={styles.albumCard} onPress={() => playQueue(a.songs, 0)}>
                    <Image source={{ uri: a.image }} style={styles.albumImg} />
                    <Text style={styles.albumName} numberOfLines={1}>{a.album}</Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>{a.artist}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* ARTISTS TAB */}
        {activeTab === 3 && (
          <>
            {artists.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="person-outline" size={56} color="#555" />
                <Text style={styles.emptyText}>Chưa có nghệ sĩ nào</Text>
                <Text style={styles.emptySubText}>Thêm bài hát yêu thích để xem nghệ sĩ</Text>
              </View>
            ) : (
              artists.map((a: any, i) => (
                <View key={i} style={styles.artistRow}>
                  <Image source={{ uri: a.image }} style={styles.artistAvatar} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.artistName}>{a.artist}</Text>
                    <Text style={styles.artistCount}>{a.count} bài yêu thích</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Create Playlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tạo Playlist Mới</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên playlist..."
              placeholderTextColor="#888"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalCancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreate} onPress={handleCreatePlaylist}>
                <Text style={styles.modalCreateText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add To Playlist Modal */}
      <Modal visible={showAddToPlaylistModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddToPlaylistModal(false)}>
          <View style={styles.sheetBox} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Thêm vào Playlist</Text>
            {playlists.length === 0 ? (
              <Text style={{ color: '#aaa', textAlign: 'center', marginBottom: 20 }}>Bạn chưa có playlist nào.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {playlists.map((pl: any) => (
                  <TouchableOpacity
                    key={pl.id}
                    style={styles.sheetItem}
                    onPress={() => {
                      if (selectedSongToAdd) {
                        addSongToPlaylist(pl.id, selectedSongToAdd);
                        Alert.alert('Thành công', `Đã thêm vào playlist "${pl.name}"`);
                      }
                      setShowAddToPlaylistModal(false);
                    }}
                  >
                    <Ionicons name="musical-notes" size={20} color="#c665e8" style={{ marginRight: 12 }} />
                    <Text style={styles.sheetItemText}>{pl.name}</Text>
                    <Text style={{ color: '#666', fontSize: 13, marginLeft: 'auto' }}>{pl.songs.length} bài</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <MiniPlayer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 55, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#c665e8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabBar: { flexGrow: 0, marginBottom: 4 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ffffff20' },
  tabActive: { backgroundColor: '#c665e830', borderColor: '#c665e8' },
  tabText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#c665e8' },
  songRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  songImg: { width: 50, height: 50, borderRadius: 8 },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  songArtist: { color: '#888', fontSize: 12, marginTop: 2 },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  playlistCover: { width: 56, height: 56, borderRadius: 8 },
  playlistCoverPlaceholder: { backgroundColor: '#c665e820', alignItems: 'center', justifyContent: 'center' },
  playlistInfo: { flex: 1, marginLeft: 12 },
  playlistName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  playlistMeta: { color: '#888', fontSize: 12, marginTop: 3 },
  playlistSongs: { backgroundColor: '#ffffff08', paddingTop: 4, paddingBottom: 4 },
  emptySongs: { color: '#666', fontSize: 13, padding: 16, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyText: { color: '#aaa', fontSize: 17, fontWeight: '600', marginTop: 14 },
  emptySubText: { color: '#666', fontSize: 13, marginTop: 6, textAlign: 'center' },
  emptyBtn: { marginTop: 20, backgroundColor: '#c665e8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 },
  albumCard: { width: '46%', margin: '2%' },
  albumImg: { width: '100%', aspectRatio: 1, borderRadius: 10 },
  albumName: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 8 },
  albumArtist: { color: '#888', fontSize: 11, marginTop: 2 },
  artistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  artistAvatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#c665e840' },
  artistName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  artistCount: { color: '#888', fontSize: 12, marginTop: 3 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#1e1232', borderRadius: 20, padding: 24, width: '80%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalInput: { backgroundColor: '#ffffff12', color: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#ffffff20', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ffffff12', alignItems: 'center' },
  modalCancelText: { color: '#aaa', fontWeight: '600' },
  modalCreate: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#c665e8', alignItems: 'center' },
  modalCreateText: { color: '#fff', fontWeight: 'bold' },
  sheetBox: { width: '100%', backgroundColor: '#1e1232', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, marginTop: 'auto' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#ffffff30', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ffffff10' },
  sheetItemText: { color: '#fff', fontSize: 16 },
});
