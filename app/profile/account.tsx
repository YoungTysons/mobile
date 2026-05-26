import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useRouter } from 'expo-router';

export default function MyAccountScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { currentUser } = useAuth();

  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSaveAccount = async () => {
    const payload: any = {};

    if (password.trim()) {
      if (!currentPassword.trim()) {
        alert('Vui lòng nhập mật khẩu cũ để xác thực thay đổi.');
        return;
      }
      if (password.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Xác nhận mật khẩu mới không trùng khớp.');
        return;
      }
      payload.mat_khau = password;
      payload.mat_khau_cu = currentPassword;
    } else {
      alert('Bạn không có thay đổi nào cần cập nhật.');
      return;
    }

    setLoading(true);
    try {
      // Gọi API cập nhật thông tin tài khoản (chỉ đổi mật khẩu vì email ở dạng hiển thị chỉ đọc)
      const res = await api.put(`/nguoi-dung/profile/${currentUser?.id}`, payload);

      if (res.data) {
        alert('Mật khẩu tài khoản của bạn đã được thay đổi thành công! 🎉');
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        router.back();
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật tài khoản:', err);
      alert(err.response?.data?.error || 'Mật khẩu cũ không chính xác hoặc không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tài khoản của tôi</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin tài khoản 🔒</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Địa chỉ email định danh và quản lý đổi mật khẩu bảo mật của tài khoản.
          </Text>

          {/* Form phẳng cùng màu nền */}
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            
            {/* Email/Gmail (Chỉ hiển thị, không được phép chọn hay chỉnh sửa) */}
            <Text style={[styles.label, { color: colors.text }]}>Địa chỉ Email (Gmail)</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#222' : '#e5e7eb', backgroundColor: isDark ? '#111' : '#f3f4f6' }]}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textSecondary }]}
                value={email}
                editable={false}
                selectTextOnFocus={false}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#222' : '#e5e7eb' }]} />

            <Text style={[styles.changePasswordTitle, { color: colors.text }]}>Đổi mật khẩu bảo mật 🔑</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary, marginBottom: 16 }]}>
              Vui lòng nhập mật khẩu hiện tại cùng mật khẩu mới để tiến hành thay đổi.
            </Text>

            {/* Mật khẩu cũ */}
            <Text style={[styles.label, { color: colors.text }]}>Mật khẩu hiện tại (cũ)</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#10b981" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập mật khẩu hiện tại của bạn..."
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            {/* Mật khẩu mới */}
            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Mật khẩu mới</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#10b981" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Xác nhận mật khẩu mới */}
            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Xác nhận mật khẩu mới</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#10b981" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Xác nhận lại mật khẩu mới..."
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Nút lưu */}
            <TouchableOpacity onPress={handleSaveAccount} disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitText}>Đổi mật khẩu</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Form
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 20,
  },
  changePasswordTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },

  // Submit
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
