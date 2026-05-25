import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { BASE_URL } from '../../services/api';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// Mock data phòng vệ trong trường hợp API local chưa khởi chạy
const MOCK_FEATURED = [
  { id: 1, ten_san_pham: 'Monstera Deliciosa (Trầu Bà Nam Mỹ)', gia_ban: 380000, diem_danh_gia_tb: 4.8, anh_bia: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800' },
  { id: 2, ten_san_pham: 'Snake Plant (Cây Lưỡi Hổ)', gia_ban: 130000, diem_danh_gia_tb: 4.9, anh_bia: 'https://images.unsplash.com/photo-1599598477150-13f898305f0a?w=800' },
  { id: 3, ten_san_pham: 'Peace Lily (Cây Lan Ý)', gia_ban: 110000, diem_danh_gia_tb: 4.7, anh_bia: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=800' }
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { currentUser } = useAuth();
  
  const [featured, setFeatured] = useState<any[]>(MOCK_FEATURED);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/san-pham/top-rated')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setFeatured(res.data);
        }
      })
      .catch(err => {
        console.log('Không kết nối được API Backend Local, sử dụng Mock Data phòng vệ:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>🌿 Chào mừng,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {currentUser ? currentUser.ho_ten : 'Khách mua hàng'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.chatbotBtn, { backgroundColor: '#e2f0ed' }]}
          onPress={() => router.push('/chatbot')}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="#0f766e" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner chính (Hero Section) */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1000' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>PHONG CÁCH SỐNG XANH URBAN JUNGLE</Text>
            <Text style={styles.heroTitle}>Mang Thiên Nhiên Vào Không Gian Sống</Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => router.push('/shop')}
            >
              <Text style={styles.heroButtonText}>Khám phá ngay 🌿</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh mục nhanh (Quick Categories) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh mục cây cảnh</Text>
          <TouchableOpacity onPress={() => router.push('/shop')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {[
            { name: 'Cây Trong Nhà', icon: 'home' },
            { name: 'Cây Ngoài Trời', icon: 'sunny' },
            { name: 'Sen Đá', icon: 'rose' },
            { name: 'Chậu Cảnh', icon: 'color-fill' }
          ].map((cat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.catCard, { backgroundColor: colors.backgroundElement }]}
              onPress={() => router.push('/shop')}
            >
              <View style={styles.catIconWrap}>
                <Ionicons name={cat.icon as any} size={22} color="#0f766e" />
              </View>
              <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cây Cảnh Nổi Bật (Featured Plants) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sản phẩm bán chạy 🌿</Text>
          <TouchableOpacity onPress={() => router.push('/shop')}>
            <Text style={styles.seeAllText}>Xem thêm</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0f766e" style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.featuredGrid}>
            {featured.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.productCard, { backgroundColor: colors.backgroundElement }]}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              >
                <Image
                  source={{ uri: item.anh_bia || 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800' }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text numberOfLines={1} style={[styles.productName, { color: colors.text }]}>
                    {item.ten_san_pham}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                      {item.diem_danh_gia_tb ? item.diem_danh_gia_tb.toFixed(1) : '5.0'}
                    </Text>
                  </View>
                  <Text style={styles.productPrice}>
                    {item.gia_ban.toLocaleString()}đ
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Lời khuyên của chuyên gia (Expert Banner) */}
        <View style={[styles.expertBanner, { backgroundColor: '#f0fbf8' }]}>
          <Ionicons name="shield-checkmark" size={32} color="#0f766e" />
          <View style={styles.expertInfo}>
            <Text style={styles.expertTitle}>Dịch vụ khách hàng cao cấp</Text>
            <Text style={styles.expertDesc}>
              Bảo hành 1 đổi 1 trong vòng 7 ngày nếu cây bị úa vàng hoặc rụng lá do lỗi vận chuyển.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  chatbotBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 16,
    justifyContent: 'center',
  },
  heroSubtitle: {
    color: '#e2f0ed',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    width: '80%',
    lineHeight: 26,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f766e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  catScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  productCard: {
    width: (width - 32) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f766e',
    marginTop: 6,
  },
  expertBanner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  expertInfo: {
    flex: 1,
  },
  expertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f766e',
  },
  expertDesc: {
    fontSize: 12,
    color: '#0f766e',
    opacity: 0.8,
    marginTop: 2,
    lineHeight: 16,
  },
});
