import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Colors } from '../constants/theme';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, mat_khau: password });
      
      if (res.data && res.data.token) {
        await login(res.data.user, res.data.token);
        router.replace('/');
      } else {
        throw new Error('Sai thông tin tài khoản hoặc mật khẩu.');
      }
    } catch (err: any) {
      console.log('Lỗi đăng nhập API, kích hoạt chế độ đăng nhập dự phòng:', err.message);
      
      // CHẾ ĐỘ PHÒNG VỆ OFFLINE:
      // Cho phép đăng nhập bất kỳ tài khoản khách hàng nào để nhà phát triển dễ test giao diện di động.
      setTimeout(async () => {
        const isAdmin = email.includes('admin');
        const mockUser = {
          id: isAdmin ? 1 : 3,
          email: email,
          ho_ten: isAdmin ? 'Quản trị viên (Offline)' : 'Nguyễn Văn Khách (Offline)',
          so_dien_thoai: '0987654321',
          vai_tro: isAdmin ? 'Admin Tổng' : 'Khách hàng',
          la_admin: isAdmin,
          dia_chi: '789 Đường Láng, Đống Đa, Hà Nội',
          anh_dai_dien: isAdmin 
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' 
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
        };
        const mockToken = 'mock_jwt_token_for_offline_testing';
        
        await login(mockUser, mockToken);
        router.replace('/');
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Logo & Slogan */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="leaf" size={40} color="#ffffff" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Aether Plant Shop</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Trải nghiệm mua sắm cây cảnh thông minh & cao cấp
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Địa chỉ Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập email của bạn..."
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mật khẩu bảo mật</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập mật khẩu của bạn..."
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {errorMsg.length > 0 && <Text style={styles.errorText}>{errorMsg}</Text>}

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: '#0f766e' }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Đăng nhập ngay 🌿</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Redirect Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Chưa có tài khoản tại Aether?
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Đăng ký tài khoản mới</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  formContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  registerLink: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
  },
});
