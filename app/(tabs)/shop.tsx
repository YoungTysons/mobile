import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

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

  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tất cả');

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

  // Lọc sản phẩm theo danh mục cục bộ
  const filteredProducts = products.filter(p => {
    if (selectedCat === 'Tất cả') return true;
    
    // So khớp danh mục
    const pCat = p.category || '';
    if (selectedCat === 'Sen Đá & Xương Rồng') {
      return pCat.includes('Sen Đá') || pCat.includes('Xương Rồng');
    }
    return pCat.toLowerCase() === selectedCat.toLowerCase();
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Cửa hàng cây cảnh 🌿</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Tìm cây cảnh, chậu hoa, đất trồng..."
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
      </View>

      {/* Horizontal Category Badges */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat, idx) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.filterBadge,
                  { backgroundColor: active ? '#10b981' : colors.backgroundElement }
                ]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[
                  styles.filterText,
                  { color: active ? '#ffffff' : colors.text }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
          renderItem={({ item }) => (
            <TouchableOpacity
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
                  {item.score && item.score > 0 && (
                    <View style={styles.matchScoreBadge}>
                      <Text style={styles.matchScoreText}>Khớp {Math.round(item.score)}%</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.productPrice, { color: colors.text }]}>
                  {item.gia_ban.toLocaleString()}đ
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
  filterScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
  },
  filterBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
    height: 150,
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
    flexWrap: 'wrap',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchScoreBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  matchScoreText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
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
