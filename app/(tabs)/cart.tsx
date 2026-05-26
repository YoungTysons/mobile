import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const { cartItems, cartCount, cartTotal, updateQuantity, removeItem } = useCart();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Giỏ hàng của bạn 🌿</Text>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          ({cartCount} sản phẩm)
        </Text>
      </View>

      {/* Cart List */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="cart-outline" size={64} color="#10b981" />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>Giỏ hàng của bạn đang trống!</Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
            Hãy lấp đầy giỏ hàng bằng những chậu cây xanh tươi tốt nhất nhé.
          </Text>
          <TouchableOpacity 
            style={styles.shopBtn}
            onPress={() => router.push('/shop')}
          >
            <Text style={styles.shopBtnText}>Tiếp tục mua sắm 🌿</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {cartItems.map((item) => (
              <View 
                key={item.id} 
                style={[styles.cartItem, { backgroundColor: colors.backgroundElement }]}
              >
                <Image
                  source={{ uri: item.anh_bia || 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800' }}
                  style={styles.itemImage}
                />
                
                <View style={styles.itemInfo}>
                  <Text numberOfLines={1} style={[styles.itemName, { color: colors.text }]}>
                    {item.ten_san_pham}
                  </Text>
                  <Text style={[styles.itemCat, { color: colors.textSecondary }]}>
                    Loại: {item.category || 'Cây Cảnh'}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {item.gia_ban.toLocaleString()}đ
                  </Text>

                  {/* Quantity Actions */}
                  <View style={styles.actionRow}>
                    <View style={styles.qtyBox}>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Ionicons name="remove" size={16} color="#10b981" />
                      </TouchableOpacity>
                      
                      <Text style={[styles.qtyText, { color: colors.text }]}>
                        {item.quantity}
                      </Text>
                      
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Ionicons name="add" size={16} color="#10b981" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pricing & Checkout Summary */}
          <View style={[styles.summaryBox, { backgroundColor: colors.background, borderTopColor: colors.backgroundElement }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tạm tính:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {cartTotal.toLocaleString()}đ
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Phí vận chuyển:</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>Miễn phí</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng thanh toán:</Text>
              <Text style={styles.totalValue}>
                {cartTotal.toLocaleString()}đ
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.checkoutBtnText}>Tiến hành thanh toán 🌿</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  itemImage: {
    width: 90,
    height: 95,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemCat: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  shopBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryBox: {
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  checkoutBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
