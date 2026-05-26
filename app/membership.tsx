import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

// Dữ liệu 2 gói thành viên
const PLANS = [
  {
    id: 'trial',
    name: 'Trial',
    label: 'Dùng thử',
    price: 'Miễn phí',
    priceNote: '14 ngày trải nghiệm',
    color: '#10b981',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    iconBg: '#dcfce7',
    features: [
      { text: 'Duyệt toàn bộ sản phẩm', included: true },
      { text: 'Chat tư vấn AI cơ bản', included: true },
      { text: 'Đặt hàng & thanh toán', included: true },
      { text: 'Ưu đãi thành viên', included: false },
      { text: 'Miễn phí vận chuyển', included: false },
      { text: 'Tư vấn chuyên gia 1-1', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    label: 'Cao cấp',
    price: '99.000đ',
    priceNote: 'mỗi tháng',
    color: '#b45309',
    bgColor: '#1a1a2e',
    borderColor: '#f59e0b',
    iconBg: '#fef3c7',
    isPopular: true,
    features: [
      { text: 'Tất cả quyền lợi Trial', included: true },
      { text: 'Chat AI không giới hạn', included: true },
      { text: 'Ưu đãi độc quyền 15%', included: true },
      { text: 'Miễn phí vận chuyển', included: true },
      { text: 'Tư vấn chuyên gia 1-1', included: true },
      { text: 'Ưu tiên xử lý đơn hàng', included: true },
    ],
  },
];

export default function MembershipScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('trial');

  const handleSelectPlan = async () => {
    try {
      // Lưu gói thành viên đã chọn vào thiết bị
      await AsyncStorage.setItem('membershipTier', selectedPlan);
      // Chuyển vào Trang chủ
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Lỗi lưu gói thành viên:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.crownIcon}>
            <Ionicons name="diamond" size={32} color="#f59e0b" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Gói Thành Viên
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Chọn gói phù hợp để trải nghiệm DTP Care trọn vẹn nhất
          </Text>
        </View>

        {/* Danh sách gói thành viên */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isPro = plan.id === 'pro';

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.8}
                style={[
                  styles.planCard,
                  isPro ? styles.planCardPro : { backgroundColor: plan.bgColor },
                  isSelected && styles.planCardSelected,
                  isSelected && { borderColor: isPro ? '#f59e0b' : '#10b981' },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {/* Badge "Phổ biến" cho gói Pro */}
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={12} color="#ffffff" />
                    <Text style={styles.popularText}>Phổ biến nhất</Text>
                  </View>
                )}

                {/* Tên gói + Giá */}
                <View style={styles.planHeader}>
                  <View>
                    <Text style={[styles.planLabel, isPro && styles.planLabelPro]}>
                      {plan.label}
                    </Text>
                    <Text style={[styles.planName, isPro && styles.planNamePro]}>
                      {plan.name}
                    </Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={[styles.planPrice, isPro && styles.planPricePro]}>
                      {plan.price}
                    </Text>
                    <Text style={[styles.planPriceNote, isPro && styles.planPriceNotePro]}>
                      {plan.priceNote}
                    </Text>
                  </View>
                </View>

                {/* Đường kẻ ngang */}
                <View style={[styles.divider, isPro && styles.dividerPro]} />

                {/* Danh sách tính năng */}
                <View style={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <View
                        style={[
                          styles.featureIcon,
                          {
                            backgroundColor: feature.included
                              ? (isPro ? 'rgba(245, 158, 11, 0.2)' : '#dcfce7')
                              : 'rgba(156, 163, 175, 0.15)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={feature.included ? 'checkmark' : 'close'}
                          size={14}
                          color={
                            feature.included
                              ? (isPro ? '#f59e0b' : '#10b981')
                              : '#9ca3af'
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.featureText,
                          isPro && styles.featureTextPro,
                          !feature.included && styles.featureTextDisabled,
                        ]}
                      >
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Nút chọn */}
                <View
                  style={[
                    styles.selectIndicator,
                    isSelected && {
                      backgroundColor: isPro ? '#f59e0b' : '#10b981',
                    },
                  ]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  ) : (
                    <View style={styles.selectCircleEmpty} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nút tiếp tục */}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selectedPlan === 'pro'
              ? styles.continueBtnPro
              : styles.continueBtnTrial,
          ]}
          onPress={handleSelectPlan}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>
            {selectedPlan === 'pro' ? 'Nâng cấp Pro ✨' : 'Bắt đầu với Trial 🌿'}
          </Text>
        </TouchableOpacity>

        {/* Lưu ý */}
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          Bạn có thể thay đổi gói bất cứ lúc nào trong phần Cài đặt.
          {'\n'}Gói Trial sẽ tự hết hạn sau 14 ngày.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // ─── Header ───
  headerSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  crownIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  // ─── Danh sách gói ───
  plansContainer: {
    gap: 16,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardPro: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  planCardSelected: {
    borderWidth: 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  // ─── Badge phổ biến ───
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  // ─── Header gói ───
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planLabelPro: {
    color: 'rgba(245, 158, 11, 0.8)',
  },
  planName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10b981',
    marginTop: 2,
  },
  planNamePro: {
    color: '#f59e0b',
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
  },
  planPricePro: {
    color: '#f59e0b',
  },
  planPriceNote: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 2,
  },
  planPriceNotePro: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  // ─── Đường kẻ ───
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
  },
  dividerPro: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  // ─── Tính năng ───
  featuresList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  featureTextPro: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  featureTextDisabled: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  // ─── Nút chọn (radio indicator) ───
  selectIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectCircleEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  // ─── Nút tiếp tục ───
  continueBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  continueBtnTrial: {
    backgroundColor: '#10b981',
  },
  continueBtnPro: {
    backgroundColor: '#f59e0b',
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // ─── Lưu ý ───
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
