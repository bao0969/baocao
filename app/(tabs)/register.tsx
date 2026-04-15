import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#170f23', '#2a1b3d', '#170f23']} style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Tạo tài khoản</Text>
      <Text style={styles.subtitle}>Bắt đầu trải nghiệm âm nhạc ngay</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên hiển thị"
          placeholderTextColor="#888"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
          returnKeyType="send"
          onSubmitEditing={() => router.replace('/home')}
        />

        <TouchableOpacity style={styles.registerButton} onPress={() => router.replace('/home')}>
          <Text style={styles.buttonText}>ĐĂNG KÝ</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  backButton: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#ffffff10', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20 
  },
  headerTitle: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  subtitle: { color: '#aaa', fontSize: 14, marginTop: 5, marginBottom: 30 },
  inputContainer: { width: '100%' },
  input: {
    backgroundColor: '#ffffff08',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffffff20'
  },
  registerButton: {
    backgroundColor: '#c665e8',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#c665e8', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});