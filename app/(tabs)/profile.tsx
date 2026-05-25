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
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Colors } from '../../constants/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const { currentUser, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingOrders(true);
      api.get('/don-hang/my-orders')
        .then(res => {
          if (res.data) {
            setOrders(res.data);
          }
        })
        .catch(err => {
          console.log('API my-orders lỗi, dùng mock orders:', err.message);
          // Mock data phòng vệ
          setOrders([
            { id: 1024, ngay_dat: new Date().toISOString(), tong_tien_hang: 510000, trang_thai_don_hang: 'Đang giao', phuong_thuc_thanh_toan: 'VietQR' },
            { id: 981, ngay_dat: '2026-05-15T08:30:00Z', tong_tien_hang: 280000, trang_thai_don_hang: 'Đã giao', phuong_thuc_thanh_toan: 'COD' }
          ]);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao': return { text: '#22c55e', bg: '#f0fdf4' };
      case 'Đang giao': return { text: '#3b82f6', bg: '#eff6ff' };
      case 'Đang xử lý': return { text: '#eab308', bg: '#fefcbf' };
      default: return { text: '#ef4444', bg: '#fef2f2' };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {currentUser ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Card Header */}
          <View style={[styles.profileCard, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: currentUser.anh_dai_dien || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.profileName, { color: colors.text }]}>{currentUser.ho_ten}</Text>
            <Text style={[styles.profileRole, { color: '#0f766e', backgroundColor: '#e2f0ed' }]}>
              {currentUser.vai_tro}
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            <View style={styles.contactInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={18} color="#0f766e" />
                <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={18} color="#0f766e" />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {currentUser.so_dien_thoai || 'Chưa cung cấp SĐT'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={18} color="#0f766e" />
                <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={2}>
                  {currentUser.dia_chi || 'Chưa cung cấp địa chỉ nhận hàng'}
                </Text>
              </View>
            </View>
          </View>

          {/* Admin Control Panel (Only for admin) */}
          {(currentUser.vai_tro?.includes('Admin') || currentUser.la_admin) && (
            <TouchableOpacity 
              style={styles.adminBtn} 
              onPress={() => router.push('/admin/dashboard')}
            >
              <Ionicons name="shield-checkmark" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.adminText}>🛡️ Bảng điều khiển Admin</Text>
            </TouchableOpacity>
          )}

          {/* Lịch sử đơn hàng (My Orders) */}
          <View style={styles.ordersSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lịch sử đặt hàng 📦</Text>
            
            {loadingOrders ? (
              <ActivityIndicator size="small" color="#0f766e" style={{ marginVertical: 16 }} />
            ) : orders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Ionicons name="basket-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyOrdersText, { color: colors.textSecondary }]}>
                  Bạn chưa đặt mua đơn hàng nào.
                </Text>
              </View>
            ) : (
              orders.map((order) => {
                const status = getStatusColor(order.trang_thai_don_hang);
                return (
                  <View 
                    key={order.id} 
                    style={[styles.orderCard, { backgroundColor: colors.backgroundElement }]}
                  >
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderId, { color: colors.text }]}>Đơn hàng #{order.id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>
                          {order.trang_thai_don_hang}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: colors.background }]} />

                    <View style={styles.orderFooter}>
                      <View>
                        <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Ngày đặt:</Text>
                        <Text style={[styles.orderValue, { color: colors.text }]}>
                          {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.orderLabel, { color: colors.textSecondary }]}>Tổng tiền:</Text>
                        <Text style={styles.orderPrice}>
                          {order.tong_tien_hang.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.loginWelcome}>
          <View style={[styles.welcomeIconWrap, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="person-outline" size={64} color="#0f766e" />
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Tài khoản cá nhân 🌿</Text>
          <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>
            Đăng nhập tài khoản để theo dõi hồ sơ cá nhân, nhận mã giảm giá và xem chi tiết lịch sử đơn hàng của bạn.
          </Text>
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>Đăng nhập ngay 🌿</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerLinkText}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#0f766e',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0f766e',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileRole: {
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  contactInfo: {
    alignSelf: 'stretch',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  ordersSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyOrdersText: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  orderValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f766e',
  },
  adminBtn: {
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  adminText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  loginWelcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  welcomeIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 8,
  },
  registerLinkText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '600',
  },
});
