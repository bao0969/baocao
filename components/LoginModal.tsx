import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { isLoginModalVisible, setLoginModalVisible, loginFacebook, loginZalo } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleSocialLogin = async (platform: 'Facebook' | 'Zalo') => {
    setLoading(true);
    let success = false;
    if (platform === 'Facebook') {
        success = await loginFacebook();
    } else {
        success = await loginZalo();
    }
    setLoading(false);

    if (success) {
        Alert.alert('Thành công', `Đã kết nối tài khoản ${platform}!`);
        setLoginModalVisible(false);
    }
  };

  return (
    <Modal visible={isLoginModalVisible} transparent animationType="fade" onRequestClose={() => setLoginModalVisible(false)}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backgroundTouch} activeOpacity={1} onPress={() => setLoginModalVisible(false)} />
        
        {loading && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#c665e8" />
              <Text style={{color:'#fff', marginTop: 10}}>Đang kết nối...</Text>
          </View>
        )}

        <View style={styles.modalCard} pointerEvents="box-none">
          <Text style={styles.modalTitle}>Đăng nhập</Text>
          <Text style={styles.modalSubtitle}>Âm nhạc không giới hạn</Text>

          {/* Nút Đăng nhập MXH */}
          <TouchableOpacity 
            style={[styles.socialButton, {backgroundColor: '#1877F2', marginBottom: 12}]}
            onPress={() => handleSocialLogin('Facebook')}
          >
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={styles.socialText}>Đăng nhập Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, {backgroundColor: '#0068FF'}]}
            onPress={() => handleSocialLogin('Zalo')}
          >
            <View style={{width: 20, height: 20, borderRadius: 4, backgroundColor: '#fff', alignItems:'center', justifyContent:'center'}}>
              <Text style={{color: '#0068FF', fontWeight:'bold', fontSize: 13}}>Z</Text>
            </View>
            <Text style={styles.socialText}>Đăng nhập Zalo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  backgroundTouch: { ...StyleSheet.absoluteFillObject },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', maxWidth: 360, backgroundColor: '#2d1b4e', borderRadius: 24, padding: 24, paddingVertical: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
  modalTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  socialButton: { flexDirection: 'row', height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 10 },
  socialText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});
