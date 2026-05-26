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

export default function ShippingAddressScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { currentUser, updateUser } = useAuth();

  const [ho_ten, setHoTen] = useState(currentUser?.ho_ten || '');
  const [so_dien_thoai, setSoDienThoai] = useState(currentUser?.so_dien_thoai || '');
  const [dia_chi, setDiaChi] = useState(currentUser?.dia_chi || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setHoTen(currentUser.ho_ten || '');
      setSoDienThoai(currentUser.so_dien_thoai || '');
      setDiaChi(currentUser.dia_chi || '');
    }
  }, [currentUser]);

  const handleSaveAddress = async () => {
    if (!ho_ten.trim()) {
      alert('Vui lòng điền Họ và tên.');
      return;
    }
    if (!so_dien_thoai.trim()) {
      alert('Vui lòng điền Số điện thoại.');
      return;
    }
    if (!dia_chi.trim()) {
      alert('Vui lòng điền Địa chỉ.');
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi API cập nhật thông tin địa chỉ & điện thoại lên SQL thông qua profile
      const res = await api.put(`/nguoi-dung/profile/${currentUser?.id}`, {
        ho_ten: ho_ten.trim(),
        so_dien_thoai: so_dien_thoai.trim(),
        dia_chi: dia_chi.trim(),
      });

      if (res.data) {
        // 2. Cập nhật vào AuthContext & AsyncStorage
        await updateUser({
          ho_ten: ho_ten.trim(),
          so_dien_thoai: so_dien_thoai.trim(),
          dia_chi: dia_chi.trim(),
        });

        alert('Thông tin hồ sơ cá nhân của bạn đã được cập nhật thành công! 🎉');
        router.back();
      }
    } catch (err: any) {
      console.error('Lỗi lưu địa chỉ mặc định:', err);
      alert(err.response?.data?.error || 'Không thể kết nối lên máy chủ để cập nhật.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hồ sơ của tôi</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin hồ sơ cá nhân 📝</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Cập nhật Họ và tên, Số điện thoại và Địa chỉ nhận hàng của bạn để hoàn thiện hồ sơ.
          </Text>

          {/* Form phẳng cùng màu nền */}
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            
            {/* Tên người nhận */}
            <Text style={[styles.label, { color: colors.text }]}>Họ và tên</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
              <Ionicons name="person-outline" size={20} color="#10b981" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập họ và tên..."
                placeholderTextColor={colors.textSecondary}
                value={ho_ten}
                onChangeText={setHoTen}
              />
            </View>

            {/* Số điện thoại */}
            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Số điện thoại</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
              <Ionicons name="call-outline" size={20} color="#10b981" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ví dụ: 0987654321"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={so_dien_thoai}
                onChangeText={setSoDienThoai}
              />
            </View>

            {/* Địa chỉ giao hàng */}
            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Địa chỉ</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0', alignItems: 'flex-start', height: 100 }]}>
              <Ionicons name="location-outline" size={20} color="#10b981" style={[styles.inputIcon, { marginTop: 12 }]} />
              <TextInput
                style={[styles.input, { color: colors.text, height: '100%', paddingVertical: 12 }]}
                placeholder="Số nhà, ngõ ngách, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                placeholderTextColor={colors.textSecondary}
                multiline={true}
                numberOfLines={3}
                value={dia_chi}
                onChangeText={setDiaChi}
                textAlignVertical="top"
              />
            </View>

            {/* Nút lưu */}
            <TouchableOpacity onPress={handleSaveAddress} disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitText}>Lưu thông tin</Text>
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
