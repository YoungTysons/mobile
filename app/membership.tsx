import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function MembershipScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [currentTier, setCurrentTier] = useState<string>('trial');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMembership();
  }, []);

  const loadMembership = async () => {
    try {
      const tier = await AsyncStorage.getItem('membershipTier');
      if (tier) {
        setCurrentTier(tier);
      } else {
        // Mặc định ban đầu là gói trial
        setCurrentTier('trial');
      }
    } catch (err) {
      console.error('Lỗi đọc gói thành viên:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push({
      pathname: '/checkout',
      params: { type: 'membership' }
    });
  };

  const isPro = currentTier === 'pro';

  // Danh sách quyền hạn
  const trialFeatures = [
    'Duyệt xem toàn bộ danh mục & sản phẩm cây cảnh 🌿',
    'Thêm sản phẩm yêu thích vào giỏ hàng 🛒',
    'Thực hiện đặt hàng & thanh toán nhanh trực tuyến 💳',
    'Quản lý danh sách đơn hàng & địa chỉ cá nhân 📦',
  ];

  const proFeatures = [
    'Duyệt xem toàn bộ danh mục & sản phẩm cây cảnh 🌿',
    'Đặt hàng & thanh toán trực tuyến nhanh chóng 💳',
    'Đặc quyền giảm giá 15% cho mọi hóa đơn mua hàng 🏷️',
    'Miễn phí vận chuyển toàn quốc cho mọi đơn hàng 🚚',
    'Ưu tiên xử lý, chuẩn bị và giao hàng sớm nhất ⚡',
    'Tư vấn trực tiếp 1-1 với kỹ sư nông nghiệp chuyên nghiệp 🧑‍🌾',
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Đang tải gói thành viên...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gói thành viên của tôi</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Thẻ hiển thị Gói Hiện Tại */}
        <View style={[
          styles.membershipCard, 
          isPro ? styles.cardPro : styles.cardTrial,
          { borderColor: isPro ? '#f59e0b' : '#10b981' }
        ]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.badge, { backgroundColor: isPro ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name={isPro ? 'diamond' : 'leaf'} size={14} color={isPro ? '#f59e0b' : '#10b981'} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: isPro ? '#f59e0b' : '#10b981' }]}>
                {isPro ? 'GÓI CAO CẤP' : 'GÓI DÙNG THỬ'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>
            {isPro ? 'DTP CARE PRO ✨' : 'DTP CARE TRIAL 🌿'}
          </Text>

          <Text style={styles.cardPrice}>
            {isPro ? '99.000đ / tháng' : 'Miễn phí trải nghiệm'}
          </Text>

          <View style={styles.cardDivider} />

          <Text style={styles.cardDesc}>
            {isPro 
              ? 'Xin chúc mừng! Bạn đang sử dụng đặc quyền VIP cao cấp nhất của DTP Care. Mọi quyền lợi đã được mở khóa hoàn toàn.'
              : 'Gói dùng thử giúp bạn làm quen với các tính năng cơ bản của cửa hàng cây cảnh. Hãy nâng cấp lên gói Pro để mở khóa ưu đãi 15%.'
            }
          </Text>
        </View>

        {/* 2. Danh sách quyền hạn có thể làm */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quyền hạn bạn sở hữu 🛡️</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Dưới đây là danh sách những tính năng và đặc quyền bạn được phép thực hiện trên tài khoản này:
        </Text>

        <View style={styles.featuresList}>
          {(isPro ? proFeatures : trialFeatures).map((feature, idx) => (
            <View key={idx} style={[styles.featureItem, { backgroundColor: isDark ? '#111' : '#f8fafc', borderColor: isDark ? '#222' : '#f1f5f9' }]}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* 3. Nút hành động nếu là gói Trial */}
        {!isPro && (
          <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
            <Ionicons name="sparkles" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.upgradeBtnText}>Nâng cấp lên gói PRO (Giảm 15%)</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Membership Card
  membershipCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  cardTrial: {
    backgroundColor: '#064e3b',
  },
  cardPro: {
    backgroundColor: '#1a1a2e',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  cardPrice: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  cardDesc: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Permissions section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },

  // Upgrade Button
  upgradeBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  upgradeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
