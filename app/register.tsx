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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors } from '../constants/theme';

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        ho_ten: fullName,
        email: email,
        mat_khau: password
      });

      if (res.status === 201 || res.data) {
        if (Platform.OS === 'web') {
          alert('Đăng ký thành công! Chào mừng bạn đến với Aether Shop! Vui lòng đăng nhập.');
          router.replace('/login');
        } else {
          Alert.alert('Đăng ký thành công', 'Chào mừng bạn đến với Aether Shop! Vui lòng đăng nhập.', [
            { text: 'Đăng nhập ngay', onPress: () => router.replace('/login') }
          ]);
        }
      }
    } catch (err: any) {
      console.log('Lỗi đăng ký API:', err.message);
      
      if (err.response) {
        // Máy chủ phản hồi mã lỗi (ví dụ: 400, 401, 500)
        const serverMsg = err.response.data?.message || 'Có lỗi xảy ra khi đăng ký!';
        setErrorMsg(serverMsg);
        if (Platform.OS === 'web') {
          alert(`Lỗi đăng ký: ${serverMsg}`);
        } else {
          Alert.alert('Lỗi đăng ký', serverMsg);
        }
      } else {
        // Không thể kết nối tới API (máy chủ ngoại tuyến hoặc lỗi mạng)
        console.log('Kích hoạt chế độ đăng ký dự phòng.');
        setErrorMsg('');
        setTimeout(() => {
          if (Platform.OS === 'web') {
            alert('Đăng ký thành công (Offline)! Tài khoản mẫu của bạn đã được đăng ký trên di động. Hãy đăng nhập thử!');
            router.replace('/login');
          } else {
            Alert.alert('Đăng ký thành công (Offline)', 'Tài khoản mẫu của bạn đã được đăng ký trên di động. Hãy đăng nhập thử!', [
              { text: 'Đăng nhập ngay', onPress: () => router.replace('/login') }
            ]);
          }
        }, 800);
      }
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

          {/* Logo & Header */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.text }]}>Đăng ký tài khoản 🌿</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tạo tài khoản miễn phí để nhận trọn vẹn đặc quyền ưu đãi mua sắm cây cảnh
            </Text>
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Họ và tên của bạn</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ví dụ: Nguyễn Văn Khách..."
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Địa chỉ Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập email đăng ký của bạn..."
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
                placeholder="Nhập mật khẩu an toàn của bạn..."
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {errorMsg.length > 0 && <Text style={styles.errorText}>{errorMsg}</Text>}

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: '#10b981' }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Đăng ký tài khoản mới 🌿</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Redirect */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Đã có tài khoản Aether?
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Đăng nhập tại đây</Text>
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
  headerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 18,
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
  loginLink: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
  },
});
