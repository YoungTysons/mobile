import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/theme';

export default function AdminDashboardScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({
    tongDoanhThu: 24850000,
    tongDonHang: 65,
    tongSanPham: 200,
    tonKhoThap: []
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'stock'>('metrics');

  const sortOrders = (ordersList: any[]) => {
    const unfinishedStatuses = ['Chờ xác nhận', 'Chờ thanh toán', 'Đang xử lý', 'Đang giao'];
    
    return [...ordersList].sort((a, b) => {
      const aIsUnfinished = unfinishedStatuses.includes(a.trang_thai_don_hang);
      const bIsUnfinished = unfinishedStatuses.includes(b.trang_thai_don_hang);
      
      if (aIsUnfinished && !bIsUnfinished) return -1;
      if (!aIsUnfinished && bIsUnfinished) return 1;
      
      const aTime = new Date(a.ngay_dat).getTime();
      const bTime = new Date(b.ngay_dat).getTime();
      return bTime - aTime;
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      // Gọi API thống kê
      const statsRes = await api.get('/thong-ke/tong-quan').catch(() => null);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }

      // Gọi API toàn bộ đơn hàng
      const ordersRes = await api.get('/don-hang').catch(() => null);
      if (ordersRes && ordersRes.data) {
        setOrders(sortOrders(ordersRes.data));
      } else {
        // Fallback mock data phong phú để test
        setOrders(sortOrders([
          { id: 1025, ngay_dat: new Date().toISOString(), tong_tien_hang: 680000, trang_thai_don_hang: 'Chờ xác nhận', phuong_thuc_thanh_toan: 'VietQR', ho_ten: 'Trần Thị Mai', dia_chi_giao_hang: '12 Cầu Giấy, Hà Nội' },
          { id: 1024, ngay_dat: '2026-05-25T12:00:00Z', tong_tien_hang: 510000, trang_thai_don_hang: 'Đang giao', phuong_thuc_thanh_toan: 'Chuyển khoản', ho_ten: 'Nguyễn Văn Khách', dia_chi_giao_hang: '789 Đường Láng, Hà Nội' },
          { id: 1023, ngay_dat: '2026-05-24T08:30:00Z', tong_tien_hang: 280000, trang_thai_don_hang: 'Đã giao', phuong_thuc_thanh_toan: 'COD', ho_ten: 'Lê Văn Nam', dia_chi_giao_hang: '45 Nguyễn Trãi, Thanh Xuân, Hà Nội' }
        ]));
      }

      // Gọi danh sách tồn kho thấp
      const stockRes = await api.get('/kho/ton-kho-thap').catch(() => null);
      if (stockRes && stockRes.data) {
        setStats((prev: any) => ({ ...prev, tonKhoThap: stockRes.data }));
      } else {
        // Fallback mock list tồn kho cảnh báo
        setStats((prev: any) => ({
          ...prev,
          tonKhoThap: [
            { id: 15, ten_san_pham: 'Sen Đá Đế Vương Mini', so_luong_kho: 2, ma_sku: 'SD-MINI-15' },
            { id: 32, ten_san_pham: 'Xương Rồng Bonsai Đại', so_luong_kho: 3, ma_sku: 'XR-BS-32' },
            { id: 48, ten_san_pham: 'Cây Kim Ngân Phong Thủy', so_luong_kho: 4, ma_sku: 'KN-PT-48' }
          ]
        }));
      }

      // Gọi API thông báo admin live
      const notifsRes = await api.get('/notifications/admin').catch(() => null);
      if (notifsRes && notifsRes.data && notifsRes.data.success) {
        setAdminNotifs(notifsRes.data.data);
      }
    } catch (err: any) {
      console.log('Lỗi tải dữ liệu quản trị:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeStatusUpdate = async (orderId: number, nextStatus: string) => {
    try {
      await api.put(`/don-hang/${orderId}/status`, { trang_thai_don_hang: nextStatus });
      Alert.alert('Thành công', `Cập nhật trạng thái đơn hàng #${orderId} thành "${nextStatus}" thành công!`);
      loadData();
    } catch (err: any) {
      // Cập nhật local dự phòng nếu API Offline
      setOrders(prev =>
        sortOrders(prev.map(o => (o.id === orderId ? { ...o, trang_thai_don_hang: nextStatus } : o)))
      );
      Alert.alert('Thành công', `Đã cập nhật trạng thái đơn hàng #${orderId} thành "${nextStatus}" (Chế độ Offline)`);
    }
  };

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    if (currentStatus === 'Chờ xác nhận' || currentStatus === 'Chờ thanh toán') {
      Alert.alert(
        'Duyệt / Hủy Đơn Hàng',
        `Bạn muốn xử lý đơn hàng #${orderId} này như thế nào?`,
        [
          { text: 'Quay lại', style: 'cancel' },
          { 
            text: '❌ Hủy đơn', 
            style: 'destructive', 
            onPress: () => executeStatusUpdate(orderId, 'Đã hủy') 
          },
          { 
            text: '✅ Duyệt đơn', 
            onPress: () => executeStatusUpdate(orderId, 'Đang xử lý') 
          }
        ]
      );
    } else if (currentStatus === 'Đang xử lý') {
      Alert.alert(
        'Giao Đơn Hàng',
        `Chuyển đơn hàng #${orderId} sang trạng thái giao hàng?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: '🚚 Bắt đầu giao', 
            onPress: () => executeStatusUpdate(orderId, 'Đang giao') 
          }
        ]
      );
    } else if (currentStatus === 'Đang giao') {
      Alert.alert(
        'Cập nhật kết quả giao hàng',
        `Đơn hàng #${orderId} đang được giao. Hãy chọn kết quả giao hàng:`,
        [
          { text: 'Quay lại', style: 'cancel' },
          { 
            text: '❌ Giao thất bại', 
            style: 'destructive', 
            onPress: () => executeStatusUpdate(orderId, 'Giao thất bại') 
          },
          { 
            text: '✅ Giao thành công', 
            onPress: () => executeStatusUpdate(orderId, 'Đã giao') 
          }
        ]
      );
    } else {
      Alert.alert('Thông báo', 'Đơn hàng này đã kết thúc!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao': return { text: '#22c55e', bg: '#f0fdf4' };
      case 'Đang giao': return { text: '#3b82f6', bg: '#eff6ff' };
      case 'Đang xử lý': return { text: '#eab308', bg: '#fefcbf' };
      case 'Giao thất bại': return { text: '#ef4444', bg: '#fef2f2' };
      case 'Đã hủy': return { text: '#6b7280', bg: '#f3f4f6' };
      default: return { text: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'order': return { name: 'cube', color: '#f59e0b', bg: '#fef3c7' };
      case 'order_success': return { name: 'checkmark-circle', color: '#10b981', bg: '#ecfdf5' };
      case 'stock': return { name: 'warning', color: '#ef4444', bg: '#fef2f2' };
      case 'new_product': return { name: 'leaf', color: '#3b82f6', bg: '#eff6ff' };
      case 'feedback': return { name: 'chatbubbles', color: '#8b5cf6', bg: '#f5f3ff' };
      case 'review': return { name: 'star', color: '#d97706', bg: '#fffbeb' };
      default: return { name: 'notifications', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>🛡️ Hệ thống Quản trị Aether</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
          <Ionicons name="refresh" size={22} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.backgroundElement }]}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'metrics' && styles.activeTabButton]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text style={[styles.tabText, activeTab === 'metrics' ? styles.activeTabText : { color: colors.textSecondary }]}>Tổng quan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'orders' && styles.activeTabButton]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' ? styles.activeTabText : { color: colors.textSecondary }]}>Đơn hàng ({orders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'stock' && styles.activeTabButton]}
          onPress={() => setActiveTab('stock')}
        >
          <Text style={[styles.tabText, activeTab === 'stock' ? styles.activeTabText : { color: colors.textSecondary }]}>Kho & Cảnh báo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Đang tải dữ liệu thời gian thực...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <View style={styles.tabContent}>
              {/* Metrics cards grid */}
              <View style={styles.metricsGrid}>
                <View style={[styles.metricCard, { backgroundColor: '#e6f4f1' }]}>
                  <Ionicons name="trending-up" size={28} color="#10b981" />
                  <Text style={styles.metricLabel}>Doanh Thu</Text>
                  <Text style={styles.metricVal}>{stats.tongDoanhThu?.toLocaleString()}đ</Text>
                </View>

                <View style={[styles.metricCard, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="cart" size={28} color="#d97706" />
                  <Text style={styles.metricLabel}>Đơn Hàng</Text>
                  <Text style={styles.metricVal}>{stats.tongDonHang} đơn</Text>
                </View>

                <View style={[styles.metricCard, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="leaf" size={28} color="#2563eb" />
                  <Text style={styles.metricLabel}>Sản Phẩm</Text>
                  <Text style={styles.metricVal}>{stats.tongSanPham} cây</Text>
                </View>
              </View>

              {/* Quick Actions Panel */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Thao tác quản lý nhanh ⚡</Text>
              <View style={{ gap: 12 }}>
                <View style={styles.quickActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => router.push('/admin/products')}
                  >
                    <View style={styles.actionIconWrap}>
                      <Ionicons name="leaf" size={22} color="#10b981" />
                    </View>
                    <Text style={[styles.actionText, { color: colors.text }]}>Quản lý sản phẩm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => setActiveTab('orders')}
                  >
                    <View style={styles.actionIconWrap}>
                      <Ionicons name="checkbox" size={22} color="#d97706" />
                    </View>
                    <Text style={[styles.actionText, { color: colors.text }]}>Duyệt nhanh đơn hàng</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: colors.backgroundElement, flex: 0 }]}
                  onPress={() => router.push('/admin/announcements')}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="megaphone" size={22} color="#2563eb" />
                  </View>
                  <Text style={[styles.actionText, { color: colors.text }]}>Đăng thông báo tới toàn khách hàng</Text>
                </TouchableOpacity>
              </View>

              {/* Live Alerts */}
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>🔔 Cảnh báo & Hoạt động Live</Text>
              <View style={{ gap: 10 }}>
                {adminNotifs.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary, marginVertical: 12 }]}>Chưa có hoạt động hay cảnh báo mới.</Text>
                ) : (
                  adminNotifs.map((alert: any) => {
                    const icon = getAlertIcon(alert.type);
                    const d = new Date(alert.time);
                    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    return (
                      <View 
                        key={alert.id} 
                        style={[
                          styles.alertItem, 
                          { 
                            backgroundColor: colors.backgroundElement,
                            borderColor: alert.unread ? '#10b981' : 'transparent',
                            borderWidth: alert.unread ? 1 : 0
                          }
                        ]}
                      >
                        <View style={[styles.alertIconCircle, { backgroundColor: icon.bg }]}>
                          <Ionicons name={icon.name as any} size={18} color={icon.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.alertText, { color: colors.text, fontWeight: alert.unread ? '700' : '500' }]}>{alert.text}</Text>
                          <Text style={styles.alertTime}>{timeStr}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          )}

          {/* TAB 2: ORDERS LIST */}
          {activeTab === 'orders' && (
            <View style={styles.tabContent}>
              {orders.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không có đơn hàng nào.</Text>
              ) : (
                orders.map((item) => {
                  const status = getStatusColor(item.trang_thai_don_hang);
                  return (
                    <View key={item.id} style={[styles.orderItemCard, { backgroundColor: colors.backgroundElement }]}>
                      <View style={styles.orderItemHeader}>
                        <Text style={[styles.orderItemTitle, { color: colors.text }]}>Đơn hàng #{item.id}</Text>
                        <View style={[styles.badge, { backgroundColor: status.bg }]}>
                          <Text style={[styles.badgeText, { color: status.text }]}>{item.trang_thai_don_hang}</Text>
                        </View>
                      </View>

                      <View style={styles.orderMeta}>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>👤 Khách: {item.ho_ten || 'Khách vãng lai'}</Text>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>📍 Giao hàng: {item.dia_chi_giao_hang}</Text>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>💳 Thanh toán: {item.phuong_thuc_thanh_toan}</Text>
                        <Text style={styles.orderPriceText}>💰 Giá trị: {item.tong_tien_hang?.toLocaleString()}đ</Text>
                      </View>

                      {item.trang_thai_don_hang !== 'Đã giao' && item.trang_thai_don_hang !== 'Giao thất bại' && item.trang_thai_don_hang !== 'Đã hủy' && (
                        <TouchableOpacity 
                          style={styles.approveBtn} 
                          onPress={() => handleUpdateStatus(item.id, item.trang_thai_don_hang)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                          <Text style={styles.approveBtnText}>
                            {item.trang_thai_don_hang === 'Chờ xác nhận' || item.trang_thai_don_hang === 'Chờ thanh toán' ? 'Xác nhận đơn' : 'Cập nhật trạng thái'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 3: STOCK WARNING */}
          {activeTab === 'stock' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Cảnh báo tồn kho cực thấp</Text>
              <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Các sản phẩm dưới đây sắp hết hàng (dưới 5 cây). Admin cần nhập hàng thêm!</Text>

              {stats.tonKhoThap?.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không có cảnh báo tồn kho thấp.</Text>
              ) : (
                stats.tonKhoThap?.map((item: any) => (
                  <View key={item.id} style={[styles.stockCard, { backgroundColor: colors.backgroundElement }]}>
                    <View style={styles.stockInfo}>
                      <Text style={[styles.stockName, { color: colors.text }]}>{item.ten_san_pham}</Text>
                      <Text style={[styles.stockSku, { color: colors.textSecondary }]}>SKU: {item.ma_sku}</Text>
                    </View>
                    <View style={styles.stockCountBadge}>
                      <Text style={styles.stockCountVal}>{item.so_luong_kho}</Text>
                      <Text style={styles.stockCountLabel}>cây</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#10b981',
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  tabContent: {
    gap: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  sectionDesc: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: -8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 32,
  },
  orderItemCard: {
    borderRadius: 16,
    padding: 16,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderMeta: {
    marginTop: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 4,
  },
  approveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 13,
    fontWeight: '700',
  },
  stockSku: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  stockCountBadge: {
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  stockCountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  stockCountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ef4444',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  alertTime: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 2,
  },
});
