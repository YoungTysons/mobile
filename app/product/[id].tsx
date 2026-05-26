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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Mock data phòng vệ chi tiết cây
const MOCK_PLANTS: Record<number, any> = {
  201: {
    id: 201,
    ten_san_pham: 'Hạt Giống Sen Đá Test 2K',
    gia_ban: 2000,
    mo_ta: 'Hạt giống sen đá và xương rồng mini cao cấp, siêu dễ gieo trồng và chăm sóc, tỷ lệ nảy mầm cao thích hợp làm quà tặng hoặc tự gieo tại nhà. Sản phẩm thiết kế riêng phục vụ kiểm thử thanh toán PayOS.',
    huong_dan_cham_soc: 'Gieo hạt: Gieo trực tiếp lên bề mặt đất ẩm, không phủ đất lên trên hạt. Tưới nước: Phun sương nhẹ giữ ẩm hàng ngày, tránh ngập úng.',
    anh_bia: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    category: 'Hạt Giống & Củ',
    diem_danh_gia_tb: 5.0,
  },
  1: {
    id: 1,
    ten_san_pham: 'Monstera Deliciosa (Trầu Bà Nam Mỹ)',
    gia_ban: 380000,
    mo_ta: 'Monstera Deliciosa (Trầu bà Nam Mỹ) nổi tiếng với những chiếc lá xẻ độc đáo mang phong cách nhiệt đới hiện đại. Cây thích hợp trồng nội thất, thanh lọc không khí cực tốt và đem lại tài lộc thịnh vượng cho gia chủ.',
    huong_dan_cham_soc: 'Tưới nước: Chỉ tưới khi đất mặt đã khô hoàn toàn (1-2 lần/tuần). Ánh sáng: Cần ánh sáng gián tiếp hoặc bóng râm bán phần, tránh nắng gắt trực tiếp làm cháy lá.',
    anh_bia: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    category: 'Cây Trong Nhà',
    diem_danh_gia_tb: 4.8,
  },
  2: {
    id: 2,
    ten_san_pham: 'Snake Plant (Cây Lưỡi Hổ)',
    gia_ban: 130000,
    mo_ta: 'Cây Lưỡi Hổ là loại cây phong thủy mang ý nghĩa trừ tà, xua đuổi điều không may. Cây cực dễ chăm sóc, có thể sống tốt trong môi trường thiếu ánh sáng và sản sinh lượng oxy lớn vào ban đêm.',
    huong_dan_cham_soc: 'Tưới nước: Rất hạn chế tưới nước, khoảng 10-15 ngày/lần. Ánh sáng: Thích nghi tốt từ bóng râm đến nắng nhẹ.',
    anh_bia: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800',
    category: 'Cây Trong Nhà',
    diem_danh_gia_tb: 4.9,
  },
  3: {
    id: 3,
    ten_san_pham: 'Peace Lily (Cây Lan Ý)',
    gia_ban: 110000,
    mo_ta: 'Cây Lan Ý có khả năng hấp thụ các chất độc hại trong không khí. Hoa lan ý màu trắng tinh khiết tạo điểm nhấn sang trọng cho bàn làm việc, phòng khách hay phòng ngủ của bạn.',
    huong_dan_cham_soc: 'Tưới nước: Thích ẩm ướt nhẹ, tưới 2 lần/tuần hoặc khi thấy lá hơi rủ xuống. Ánh sáng: Thích bóng râm mát mẻ.',
    anh_bia: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    category: 'Cây Trong Nhà',
    diem_danh_gia_tb: 4.7,
  }
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'care'>('desc');

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/san-pham/${id}`)
        .then(res => {
          if (res.data) {
            setProduct(res.data);
          }
        })
        .catch(err => {
          console.log(`Lỗi API chi tiết sản phẩm ID ${id}, dùng mock details:`, err.message);
          // Fallback phòng vệ
          const mockId = Number(id);
          const mockItem = MOCK_PLANTS[mockId] || {
            id: mockId,
            ten_san_pham: 'Cây Cảnh Aether Cao Cấp',
            gia_ban: 150000,
            mo_ta: 'Chậu cây cảnh phong cách Bắc Âu xanh mát phù hợp cho mọi không gian nội thất hiện đại.',
            huong_dan_cham_soc: 'Tưới nước 1 lần mỗi tuần. Tránh phơi nắng gắt quá lâu.',
            anh_bia: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800',
            category: 'Cây Cảnh',
            diem_danh_gia_tb: 5.0
          };
          setProduct(mockItem);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      ten_san_pham: product.ten_san_pham,
      gia_ban: product.gia_ban,
      anh_bia: product.anh_bia,
      category: product.category
    });
    Alert.alert('Thành công', `Đã thêm "${product.ten_san_pham}" vào giỏ hàng của bạn! 🌿`, [
      { text: 'Tiếp tục xem' },
      { text: 'Đến Giỏ Hàng', onPress: () => router.push('/cart') }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Không tìm thấy sản phẩm này.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Plant Image Header */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.anh_bia || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800' }}
            style={styles.image}
          />
          <SafeAreaView style={styles.headerAction} edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Product Details info */}
        <View style={styles.infoSection}>
          <View style={styles.tagRow}>
            <Text style={[styles.catTag, { color: '#10b981', backgroundColor: '#ecfdf5' }]}>
              {product.category || 'Cây Cảnh'}
            </Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.diem_danh_gia_tb ? product.diem_danh_gia_tb.toFixed(1) : '5.0'}
              </Text>
            </View>
          </View>

          <Text style={[styles.plantName, { color: colors.text }]}>{product.ten_san_pham}</Text>
          <Text style={[styles.price, { color: colors.text }]}>{product.gia_ban.toLocaleString()}đ</Text>

          {/* Premium Nav Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: colors.backgroundElement }]}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'desc' && styles.tabActive]}
              onPress={() => setActiveTab('desc')}
            >
              <Text style={[styles.tabText, activeTab === 'desc' ? styles.tabTextActive : { color: colors.textSecondary }]}>
                Mô tả chi tiết
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'care' && styles.tabActive]}
              onPress={() => setActiveTab('care')}
            >
              <Text style={[styles.tabText, activeTab === 'care' ? styles.tabTextActive : { color: colors.textSecondary }]}>
                Hướng dẫn chăm sóc
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'desc' ? (
              <Text style={[styles.descText, { color: colors.text }]}>
                {product.mo_ta || 'Sản phẩm cây cảnh trang trí cao cấp đem lại sinh khí và màu xanh tươi mới cho ngôi nhà của bạn.'}
              </Text>
            ) : (
              <Text style={[styles.descText, { color: colors.text }]}>
                {product.huong_dan_cham_soc || 'Hãy tưới nước khi đất khô, phơi nắng sáng nhẹ 1-2 giờ mỗi tuần và bón phân hữu cơ định kỳ mỗi tháng một lần.'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Action */}
      <View style={[styles.floatingBottom, { backgroundColor: colors.background, borderTopColor: colors.backgroundElement }]}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.cartBtnText}>Thêm vào giỏ hàng 🌿</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    position: 'relative',
    height: 380,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerAction: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  catTag: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  plantName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 24,
    gap: 16,
  },
  tabBtn: {
    paddingBottom: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#10b981',
  },
  tabContent: {
    paddingVertical: 16,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  floatingBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cartBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cartBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
