import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  FlatList,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

// Hàm lấy nhãn badge phù hợp
function getBadgeInfo(item: any, index: number) {
  const label = item.nhan_san_pham;
  if (label === 'Bestseller' || label === 'Bán chạy') return { text: 'Bán chạy', color: '#16a34a', bg: '#dcfce7' };
  if (label === 'Mới' || label === 'New') return { text: 'Mới', color: '#0284c7', bg: '#e0f2fe' };
  if (label === 'Giảm giá' || label === 'Sale') return { text: 'Giảm giá', color: '#dc2626', bg: '#fee2e2' };
  if (label === 'Popular' || label === 'Phổ biến') return { text: 'Yêu thích', color: '#7c3aed', bg: '#ede9fe' };
  if (label === 'Hot') return { text: 'Hot', color: '#ea580c', bg: '#fff7ed' };
  
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

// Mock data phòng vệ trong trường hợp backend chưa bật hoặc chưa kết nối
const MOCK_PRODUCTS = [
  { id: 201, ten_san_pham: 'Hạt Giống Sen Đá Test 2K', gia_ban: 2000, diem_danh_gia_tb: 5.0, category: 'Hạt Giống & Củ', anh_bia: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
  { id: 1, ten_san_pham: 'Monstera Deliciosa (Trầu Bà Nam Mỹ)', gia_ban: 380000, diem_danh_gia_tb: 4.8, category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800' },
  { id: 2, ten_san_pham: 'Snake Plant (Cây Lưỡi Hổ)', gia_ban: 130000, diem_danh_gia_tb: 4.9, category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800' },
  { id: 3, ten_san_pham: 'Peace Lily (Cây Lan Ý)', gia_ban: 110000, diem_danh_gia_tb: 4.7, category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800' },
  { id: 4, ten_san_pham: 'Fiddle Leaf Fig (Bàng Singapore)', gia_ban: 280000, diem_danh_gia_tb: 4.6, category: 'Cây Trong Nhà', anh_bia: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800' },
  { id: 5, ten_san_pham: 'Golden Barrel Cactus (Xương Rồng Tròn)', gia_ban: 90000, diem_danh_gia_tb: 4.5, category: 'Sen Đá & Xương Rồng', anh_bia: 'https://images.unsplash.com/photo-1551893665-f843f600794e?w=800' },
  { id: 6, ten_san_pham: 'Echeveria Elegans (Sen Đá Thạch Ngọc)', gia_ban: 40000, diem_danh_gia_tb: 4.6, category: 'Sen Đá & Xương Rồng', anh_bia: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800' }
];

export default function ShopScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tất cả');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');

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

  // Danh mục bộ lọc
  const categories = ['Tất cả', 'Cây Trong Nhà', 'Cây Ngoài Trời', 'Sen Đá & Xương Rồng', 'Hạt Giống & Củ'];

  // Hàm tải dữ liệu từ API hoặc fuzzy search
  const loadProducts = useCallback((queryStr = '') => {
    setLoading(true);
    const endpoint = queryStr.trim() ? `/san-pham/search?q=${encodeURIComponent(queryStr)}` : '/san-pham';
    
    api.get(endpoint)
      .then(res => {
        if (res.data) {
          setProducts(res.data);
        }
      })
      .catch(err => {
        console.log('Không gọi được API, giữ danh sách sản phẩm mẫu:', err.message);
        // Lọc mock data theo từ khóa nếu API lỗi
        if (queryStr.trim()) {
          const q = queryStr.toLowerCase();
          setProducts(MOCK_PRODUCTS.filter(p => p.ten_san_pham.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Gọi API ban đầu
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Xử lý thay đổi ô tìm kiếm
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Chạy tìm kiếm (nếu backend hỗ trợ debounce, ở đây gọi trực tiếp đơn giản)
    loadProducts(text);
  };

  // Lọc sản phẩm theo danh mục cục bộ & Sắp xếp theo giá
  const filteredProducts = products
    .filter(p => {
      if (selectedCat === 'Tất cả') return true;
      
      const pCat = p.category || '';
      if (selectedCat === 'Sen Đá & Xương Rồng') {
        return pCat.includes('Sen Đá') || pCat.includes('Xương Rồng');
      }
      return pCat.toLowerCase() === selectedCat.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.gia_ban - b.gia_ban;
      }
      if (sortBy === 'price_desc') {
        return b.gia_ban - a.gia_ban;
      }
      return 0;
    });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Cửa hàng cây cảnh 🌿</Text>
        
        {/* Hàng tìm kiếm + Nút bộ lọc */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.backgroundElement, flex: 1 }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm cây cảnh, chậu hoa..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.backgroundElement }]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={22} color={colors.text} />
            {(selectedCat !== 'Tất cả' || sortBy !== 'default') && (
              <View style={styles.filterActiveDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Cửa sổ Modal Bộ Lọc */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleText, { color: colors.text }]}>Bộ lọc sản phẩm 🌿</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Section 1: Chọn Danh Mục (Tích chọn Loại) */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>Danh mục sản phẩm</Text>
              <View style={styles.categoryList}>
                {categories.map((cat, idx) => {
                  const isSelected = selectedCat === cat;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.categoryRow, { borderBottomColor: colors.backgroundElement }]}
                      onPress={() => setSelectedCat(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.categoryText, { color: isSelected ? '#10b981' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                        {cat}
                      </Text>
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={isSelected ? "#10b981" : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Sắp Xếp Theo Giá */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>Sắp xếp theo giá</Text>
              <View style={styles.sortOptionsRow}>
                <TouchableOpacity
                  style={[
                    styles.sortChip,
                    { backgroundColor: colors.backgroundElement },
                    sortBy === 'default' && styles.sortChipActive
                  ]}
                  onPress={() => setSortBy('default')}
                >
                  <Text style={[styles.sortChipText, { color: sortBy === 'default' ? '#ffffff' : colors.text }]}>
                    Mặc định 🌿
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortChip,
                    { backgroundColor: colors.backgroundElement },
                    sortBy === 'price_asc' && styles.sortChipActive
                  ]}
                  onPress={() => setSortBy('price_asc')}
                >
                  <Text style={[styles.sortChipText, { color: sortBy === 'price_asc' ? '#ffffff' : colors.text }]}>
                    Giá tăng dần 📈
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortChip,
                    { backgroundColor: colors.backgroundElement },
                    sortBy === 'price_desc' && styles.sortChipActive
                  ]}
                  onPress={() => setSortBy('price_desc')}
                >
                  <Text style={[styles.sortChipText, { color: sortBy === 'price_desc' ? '#ffffff' : colors.text }]}>
                    Giá giảm dần 📉
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalResetBtn, { borderColor: colors.textSecondary }]}
                onPress={() => {
                  setSelectedCat('Tất cả');
                  setSortBy('default');
                }}
              >
                <Text style={[styles.modalResetText, { color: colors.text }]}>Đặt lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalApplyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Không tìm thấy cây cảnh nào phù hợp.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const badge = getBadgeInfo(item, index);
            const categoryLabel = getCategoryLabel(item.category);
            const rating = item.diem_danh_gia_tb || 4.5;
            const reviewCount = item.tong_luot_danh_gia || 0;
            const hasOldPrice = item.gia_cu && item.gia_cu > item.gia_ban;

            return (
              <TouchableOpacity
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
                    {item.score && item.score > 0 && (
                      <View style={styles.matchScoreBadge}>
                        <Text style={styles.matchScoreText}>Khớp {Math.round(item.score)}%</Text>
                      </View>
                    )}
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
          }}
        />
      )}

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
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  // ── Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: '800',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  categoryText: {
    fontSize: 15,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sortChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalResetBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalResetText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalApplyBtn: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalApplyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
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
  matchScoreBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  matchScoreText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
