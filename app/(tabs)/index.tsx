import React, { useState, useEffect, useRef } from 'react';
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
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { BASE_URL } from '../../services/api';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

// Mock data phòng vệ trong trường hợp API local chưa khởi chạy
const MOCK_FEATURED = [
  { id: 201, ten_san_pham: 'Hạt Giống Sen Đá Test 2K', gia_ban: 2000, gia_cu: 5000, diem_danh_gia_tb: 5.0, tong_luot_danh_gia: 99, nhan_san_pham: 'Mới', category: 'Hạt Giống & Củ', anh_bia: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
  { id: 1, ten_san_pham: 'Monstera Deliciosa', gia_ban: 380000, gia_cu: 450000, diem_danh_gia_tb: 4.8, tong_luot_danh_gia: 128, nhan_san_pham: 'Bestseller', category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800' },
  { id: 2, ten_san_pham: 'HyperFresh Plant', gia_ban: 130000, gia_cu: null, diem_danh_gia_tb: 4.9, tong_luot_danh_gia: 96, nhan_san_pham: 'Mới', category: 'Cây Nhiệt Đới', anh_bia: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800' },
  { id: 3, ten_san_pham: 'Peace Lily', gia_ban: 110000, gia_cu: 150000, diem_danh_gia_tb: 4.7, tong_luot_danh_gia: 84, nhan_san_pham: 'Popular', category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
  { id: 4, ten_san_pham: 'Snake Plant', gia_ban: 90000, gia_cu: null, diem_danh_gia_tb: 4.6, tong_luot_danh_gia: 72, nhan_san_pham: null, category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800' },
];

// Hàm lấy nhãn badge phù hợp
function getBadgeInfo(item: any, index: number) {
  const label = item.nhan_san_pham;
  if (label === 'Bestseller' || label === 'Bán chạy') return { text: 'Bán chạy', color: '#16a34a', bg: '#dcfce7' };
  if (label === 'Mới' || label === 'New') return { text: 'Mới', color: '#0284c7', bg: '#e0f2fe' };
  if (label === 'Giảm giá' || label === 'Sale') return { text: 'Giảm giá', color: '#dc2626', bg: '#fee2e2' };
  if (label === 'Popular' || label === 'Phổ biến') return { text: 'Yêu thích', color: '#7c3aed', bg: '#ede9fe' };
  if (label === 'Hot') return { text: 'Hot', color: '#ea580c', bg: '#fff7ed' };
  // Mặc định xen kẽ badge cho đẹp nếu không có nhãn
  const defaults = [
    { text: 'Bán chạy', color: '#16a34a', bg: '#dcfce7' },
    { text: 'Mới', color: '#0284c7', bg: '#e0f2fe' },
    { text: 'Yêu thích', color: '#7c3aed', bg: '#ede9fe' },
  ];
  return defaults[index % defaults.length];
}

// Hàm lấy tên danh mục viết hoa
function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return 'CÂY CẢNH';
  const map: Record<string, string> = {
    'Cây Trong Nhà': 'TRONG NHÀ',
    'Cây Ngoài Trời': 'NGOÀI TRỜI',
    'Cây Nhiệt Đới': 'NHIỆT ĐỚI',
    'Sen Đá & Xương Rồng': 'SEN ĐÁ',
    'Hạt Giống & Củ': 'HẠT GIỐNG',
    'Chậu & Phụ Kiện': 'PHỤ KIỆN',
    'Chậu & Bình Hoa': 'CHẬU HOA',
    'Chăm Sóc Cây': 'CHĂM SÓC',
  };
  return map[category] || category.toUpperCase();
}

// Hàm format tiền VND
function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)}K`;
  }
  return `${price}đ`;
}

// Hàm render sao đánh giá
function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Ionicons key={`full-${i}`} name="star" size={11} color="#f59e0b" />);
  }
  if (halfStar) {
    stars.push(<Ionicons key="half" name="star-half" size={11} color="#f59e0b" />);
  }
  const remaining = 5 - fullStars - (halfStar ? 1 : 0);
  for (let i = 0; i < remaining; i++) {
    stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={11} color="#d1d5db" />);
  }
  return stars;
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addToCart, cartCount } = useCart();
  
  const [featured, setFeatured] = useState<any[]>(MOCK_FEATURED);
  const [loading, setLoading] = useState(false);

  // Custom Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToastNotification = (productName: string) => {
    setToastMessage(`Đã thêm "${productName}" vào giỏ hàng! 🌿`);
    setToastVisible(true);
    
    toastAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setToastVisible(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    api.get('/san-pham/top-rated')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setFeatured(res.data);
        }
      })
      .catch(err => {
        console.log('Không kết nối được API, sử dụng Mock Data:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Render từng thẻ sản phẩm theo thiết kế mẫu
  const renderProductCard = (item: any, index: number) => {
    const badge = getBadgeInfo(item, index);
    const categoryLabel = getCategoryLabel(item.category);
    const rating = item.diem_danh_gia_tb || 4.5;
    const reviewCount = item.tong_luot_danh_gia || 0;
    const hasOldPrice = item.gia_cu && item.gia_cu > item.gia_ban;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.productCard, { backgroundColor: scheme === 'dark' ? '#1a1a1a' : '#ffffff' }]}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        activeOpacity={0.85}
      >
        {/* Ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.anh_bia || 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800' }}
            style={styles.productImage}
          />
          
          {/* Badge nhãn */}
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>

          {/* Nút + (thêm vào giỏ) */}
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              addToCart({
                id: item.id,
                ten_san_pham: item.ten_san_pham,
                gia_ban: item.gia_ban,
                anh_bia: item.anh_bia,
                category: item.category,
              });
              showToastNotification(item.ten_san_pham);
            }}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.productInfo}>
          {/* Tên danh mục */}
          <Text style={styles.categoryLabel}>{categoryLabel}</Text>

          {/* Tên sản phẩm */}
          <Text numberOfLines={1} style={[styles.productName, { color: colors.text }]}>
            {item.ten_san_pham}
          </Text>

          {/* Sao đánh giá + lượt đánh giá */}
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {renderStars(rating)}
            </View>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>

          {/* Giá */}
          <View style={styles.priceRow}>
            <Text style={[styles.productPrice, { color: colors.text }]}>
              {item.gia_ban.toLocaleString()}đ
            </Text>
            {hasOldPrice && (
              <Text style={styles.oldPrice}>
                {item.gia_cu.toLocaleString()}đ
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#000' : '#faf9f6' }]} edges={['top']}>
      {/* Header: Logo + Cart */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={18} color="#ffffff" />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>Aether</Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {/* Badge giỏ hàng */}
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
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

        {/* Section Header: OUR COLLECTION + Featured Plants */}
        <View style={styles.collectionHeader}>
          <View style={styles.collectionLabelWrap}>
            <View style={styles.collectionLabelBar} />
            <Text style={styles.collectionLabelText}>BỘ SƯU TẬP CỦA CHÚNG TÔI</Text>
          </View>
          <View style={styles.featuredHeaderRow}>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>Cây Cảnh Nổi Bật</Text>
            <TouchableOpacity
              style={[styles.seeAllBtn, { borderColor: scheme === 'dark' ? '#333' : '#e5e7eb' }]}
              onPress={() => router.push('/shop')}
            >
              <Text style={[styles.seeAllText, { color: colors.text }]}>Xem tất cả</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.text} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Grid 2 cột */}
        {loading ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 32 }} />
        ) : (
          <View style={styles.productGrid}>
            {featured.map((item, index) => renderProductCard(item, index))}
          </View>
        )}

        {/* Lời khuyên chuyên gia */}
        <View style={[styles.expertBanner, { backgroundColor: scheme === 'dark' ? '#064e3b' : '#ecfdf5' }]}>
          <Ionicons name="shield-checkmark" size={32} color="#10b981" />
          <View style={styles.expertInfo}>
            <Text style={styles.expertTitle}>Dịch vụ khách hàng cao cấp</Text>
            <Text style={styles.expertDesc}>
              Bảo hành 1 đổi 1 trong vòng 7 ngày nếu cây bị úa vàng hoặc rụng lá do lỗi vận chuyển.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Custom Toast Notification */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: scheme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: scheme === 'dark' ? '#374151' : '#e5e7eb',
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.toastInner}>
            <View style={styles.toastIconCircle}>
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            </View>
            <Text numberOfLines={2} style={[styles.toastText, { color: colors.text }]}>
              {toastMessage}
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  cartBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: '#10b981',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },

  // ── ScrollView ──
  scrollContent: {
    paddingBottom: 32,
  },

  // ── Hero Banner ──
  heroBanner: {
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginTop: 4,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
    padding: 20,
    justifyContent: 'center',
  },
  heroSubtitle: {
    color: '#ecfdf5',
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
    backgroundColor: '#10b981',
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

  // ── Collection Header ──
  collectionHeader: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    marginTop: 28,
    marginBottom: 16,
  },
  collectionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionLabelBar: {
    width: 3,
    height: 16,
    backgroundColor: '#10b981',
    borderRadius: 2,
    marginRight: 8,
  },
  collectionLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1.5,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Product Grid ──
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },

  // ── Product Card ──
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 0.85,
    backgroundColor: '#f3f4f6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(15,118,110,0.35)',
      },
    }),
  },

  // ── Product Info ──
  productInfo: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  reviewCount: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  oldPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  // ── Expert Banner ──
  expertBanner: {
    flexDirection: 'row',
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginTop: 28,
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
    color: '#10b981',
  },
  expertDesc: {
    fontSize: 12,
    color: '#10b981',
    opacity: 0.8,
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Custom Toast Notification ──
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    width: SCREEN_WIDTH - 40,
    maxWidth: 450,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        position: 'fixed',
        top: 20,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      },
    }),
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
