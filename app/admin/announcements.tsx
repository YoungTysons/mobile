import React, { useState } from 'react';
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
import api from '../../services/api';
import { useRouter } from 'expo-router';

export default function AdminAnnouncementsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [tieu_de, setTieuDe] = useState('');
  const [noi_dung, setNoiDung] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostAnnounce = async () => {
    if (!tieu_de.trim() || !noi_dung.trim()) {
      Alert.alert('Cảnh báo', 'Vui lòng điền đầy đủ Tiêu đề và Nội dung!');
      return;
    }

    Alert.alert(
      'Xác nhận phát hành',
      'Thông báo này sẽ được gửi tới TOÀN BỘ khách hàng trên ứng dụng. Bạn chắc chắn muốn đăng?',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: '🚀 Đăng & Phát hành',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await api.post('/notifications/announce', {
                tieu_de: tieu_de.trim(),
                noi_dung: noi_dung.trim(),
              });
              if (res.data && res.data.success) {
                Alert.alert('Thành công', 'Đã phát hành thông báo tới toàn bộ người dùng thành công!');
                setTieuDe('');
                setNoiDung('');
                router.back();
              }
            } catch (err: any) {
              console.error('Lỗi đăng thông báo:', err);
              Alert.alert('Thất bại', err.response?.data?.message || 'Lỗi gửi thông báo lên hệ thống.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#faf9f6' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Đăng thông báo mới</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          
          {/* Card Soạn thảo */}
          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            
            {/* Tiêu đề */}
            <Text style={[styles.label, { color: colors.text }]}>Tiêu đề thông báo</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
              <Ionicons name="megaphone-outline" size={20} color="#10b981" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ví dụ: 🌿 Siêu Khuyến Mãi Flash Sale..."
                placeholderTextColor={colors.textSecondary}
                value={tieu_de}
                onChangeText={setTieuDe}
              />
            </View>

            {/* Nội dung */}
            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Nội dung chi tiết</Text>
            <View style={[styles.inputContainer, { borderColor: isDark ? '#333' : '#e2e8f0', alignItems: 'flex-start', height: 160 }]}>
              <Ionicons name="document-text-outline" size={20} color="#10b981" style={[styles.inputIcon, { marginTop: 12 }]} />
              <TextInput
                style={[styles.input, { color: colors.text, height: '100%', paddingVertical: 12 }]}
                placeholder="Nhập nội dung thông điệp chi tiết muốn gửi tới toàn bộ khách hàng..."
                placeholderTextColor={colors.textSecondary}
                multiline={true}
                numberOfLines={6}
                value={noi_dung}
                onChangeText={setNoiDung}
                textAlignVertical="top"
              />
            </View>

            {/* Hướng dẫn */}
            <View style={styles.tipBox}>
              <Ionicons name="information-circle-outline" size={18} color="#1565c0" />
              <Text style={styles.tipText}>
                Khách hàng sẽ nhìn thấy thông điệp này ngay lập tức trong mục "Thông báo" trên ứng dụng di động của họ dưới dạng tin tức khuyến mãi.
              </Text>
            </View>

            {/* Nút gửi */}
            <TouchableOpacity onPress={handlePostAnnounce} disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitText}>Phát hành ngay</Text>
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
  card: {
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
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

  // Tip
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#1565c0',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Submit
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
