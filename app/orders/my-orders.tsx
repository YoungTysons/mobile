import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import api from '../../services/api';
import { useRouter } from 'expo-router';

interface Order {
  id: number;
  tong_tien_hang: number;
  dia_chi_giao_hang: string;
  phuong_thuc_thanh_toan: string;
  trang_thai_don_hang: string;
  ngay_dat: string;
}

interface OrderDetailItem {
  id: number;
  id_san_pham: number;
  so_luong: number;
  gia_don_vi: number;
  ten_san_pham: string;
  anh_bia: string | null;
}

export default function MyOrdersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Details Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.get('/don-hang/my-orders');
      if (res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.log('Lỗi tải đơn hàng của tôi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleOpenDetails = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setDetailsModalVisible(true);
    try {
      const res = await api.get(`/don-hang/${order.id}/details`);
      if (res.data && res.data.success) {
        setOrderDetails(res.data.data);
      }
    } catch (err) {
      console.log('Lỗi tải chi tiết đơn hàng:', err);
      setOrderDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Đã giao':
        return { text: '#22c55e', bg: '#f0fdf4' };
      case 'Đang giao':
        return { text: '#3b82f6', bg: '#eff6ff' };
      case 'Đang xử lý':
        return { text: '#eab308', bg: '#fefcbf' };
      case 'Giao thất bại':
        return { text: '#ef4444', bg: '#fef2f2' };
      case 'Đã hủy':
        return { text: '#6b7280', bg: '#f3f4f6' };
      case 'Chờ xác nhận':
      case 'Chờ thanh toán':
      default:
        return { text: '#d97706', bg: '#fef3c7' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#faf9f6' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Đơn hàng của tôi</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 13 }}>Đang tải lịch sử mua hàng...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={60} color={isDark ? '#374151' : '#d1d5db'} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Bạn chưa đặt đơn hàng nào.</Text>
              <TouchableOpacity onPress={() => router.push('/shop')} style={styles.shopBtn}>
                <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map(item => {
              const status = getStatusStyle(item.trang_thai_don_hang);
              const d = new Date(item.ngay_dat);
              const dateStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, { backgroundColor: colors.backgroundElement }]}
                  onPress={() => handleOpenDetails(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.orderId, { color: colors.text }]}>Đơn hàng #{item.id}</Text>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.text }]}>{item.trang_thai_don_hang}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardBody}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      📅 Ngày đặt: <Text style={{ color: colors.text, fontWeight: '500' }}>{dateStr}</Text>
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      💳 Thanh toán: <Text style={{ color: colors.text, fontWeight: '500' }}>{item.phuong_thuc_thanh_toan}</Text>
                    </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      📍 Địa chỉ: <Text style={{ color: colors.text, fontWeight: '500' }}>{item.dia_chi_giao_hang}</Text>
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardFooter}>
                    <Text style={[styles.clickAlertText, { color: colors.textSecondary }]}>Xem chi tiết sản phẩm</Text>
                    <Text style={styles.priceVal}>{item.tong_tien_hang?.toLocaleString()}đ</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* DETAIL MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chi tiết đơn #{selectedOrder?.id}</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalCenterWrap}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 13 }}>Đang tải thông tin sản phẩm...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                
                {/* Status card */}
                {selectedOrder && (
                  <View style={[styles.statusBanner, { backgroundColor: getStatusStyle(selectedOrder.trang_thai_don_hang).bg }]}>
                    <Ionicons name="information-circle" size={20} color={getStatusStyle(selectedOrder.trang_thai_don_hang).text} />
                    <Text style={[styles.statusBannerText, { color: getStatusStyle(selectedOrder.trang_thai_don_hang).text }]}>
                      Trạng thái đơn hàng: {selectedOrder.trang_thai_don_hang}
                    </Text>
                  </View>
                )}

                {/* Items List */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Cây cảnh đã đặt 🌿</Text>
                <View style={styles.detailsList}>
                  {orderDetails.map(item => (
                    <View key={item.id} style={styles.detailItemRow}>
                      <Image
                        source={{ uri: item.anh_bia || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=150' }}
                        style={styles.detailThumb}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.detailName, { color: colors.text }]} numberOfLines={1}>
                          {item.ten_san_pham}
                        </Text>
                        <Text style={[styles.detailQty, { color: colors.textSecondary }]}>
                          Số lượng: {item.so_luong}
                        </Text>
                        <Text style={styles.detailPrice}>{item.gia_don_vi?.toLocaleString()}đ</Text>
                      </View>
                      <Text style={[styles.detailTotal, { color: colors.text }]}>
                        {(item.gia_don_vi * item.so_luong)?.toLocaleString()}đ
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Shipping & Delivery Info */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Thông tin giao nhận</Text>
                <View style={[styles.infoBox, { borderColor: isDark ? '#333' : '#e2e8f0' }]}>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color="#10b981" />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Địa chỉ nhận hàng:</Text>
                  </View>
                  <Text style={[styles.infoVal, { color: colors.text }]}>{selectedOrder?.dia_chi_giao_hang}</Text>

                  <View style={[styles.infoRow, { marginTop: 12 }]}>
                    <Ionicons name="card" size={16} color="#10b981" />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phương thức thanh toán:</Text>
                  </View>
                  <Text style={[styles.infoVal, { color: colors.text }]}>{selectedOrder?.phuong_thuc_thanh_toan}</Text>
                </View>

                {/* Bill totals */}
                <View style={styles.totalSummaryRow}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng thanh toán:</Text>
                  <Text style={styles.totalVal}>{selectedOrder?.tong_tien_hang?.toLocaleString()}đ</Text>
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  refreshBtn: {
    padding: 4,
  },

  // Center Wrap
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Empty State
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
  },
  shopBtn: {
    backgroundColor: '#10b981',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  cardBody: {
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clickAlertText: {
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10b981',
  },

  // Modal styling
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCenterWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  detailsList: {
    gap: 12,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  detailName: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailQty: {
    fontSize: 11,
    marginVertical: 1,
  },
  detailPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  detailTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoBox: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '500',
    paddingLeft: 22,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
});
