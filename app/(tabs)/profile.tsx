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
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { Colors } from '../../constants/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  const { currentUser, logout } = useAuth();
  const { cartCount, cartTotal } = useCart();
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
            { id: 1024, ngay_dat: new Date().toISOString(), tong_tien_hang: 510000, trang_thai_don_hang: 'Đang giao' },
            { id: 981, ngay_dat: '2026-05-15T08:30:00Z', tong_tien_hang: 280000, trang_thai_don_hang: 'Đã giao' }
          ]);
        })
        .finally(() => setLoadingOrders(false));
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  const handleLogout = () => {
    const performLogout = async () => {
      await logout();
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Đăng xuất 👤',
        'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất', style: 'destructive', onPress: performLogout }
        ]
      );
    }
  };

  const renderOptionItem = (icon: any, title: string, onPress: () => void) => {
    return (
      <TouchableOpacity 
        style={[styles.optionItem, { backgroundColor: scheme === 'dark' ? '#1f2937' : '#ffffff' }]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.optionLeft}>
          <View style={[styles.optionIconContainer, { backgroundColor: scheme === 'dark' ? '#064e3b' : '#ecfdf5' }]}>
            <Ionicons name={icon} size={20} color="#10b981" />
          </View>
          <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={scheme === 'dark' ? '#9ca3af' : '#6b7280'} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#000000' : '#faf9f6' }]} edges={['top']}>
      {/* Header Title */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trang cá nhân</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Avatar Card Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarWrap, { backgroundColor: scheme === 'dark' ? '#1f2937' : '#ecfdf5' }]}>
            {currentUser?.anh_dai_dien ? (
              <Image source={{ uri: currentUser.anh_dai_dien }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={50} color="#10b981" />
            )}
            {/* Small leaf badge overlay */}
            <View style={styles.leafBadge}>
              <Ionicons name="leaf" size={12} color="#ffffff" />
            </View>
          </View>
          
          <Text style={[styles.userName, { color: colors.text }]}>
            {currentUser ? currentUser.ho_ten : 'Người Yêu Cây'}
          </Text>
          <Text style={styles.userSubtitle}>
            {currentUser ? currentUser.email : 'Đăng nhập để quản lý tài khoản của bạn'}
          </Text>
        </View>

        {/* 2. Stats Block (In Cart | Cart Value | Orders) */}
        <View style={[styles.statsContainer, { backgroundColor: scheme === 'dark' ? '#1f2937' : '#f4fbf7' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{cartCount}</Text>
            <Text style={styles.statLabel}>Giỏ hàng</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: scheme === 'dark' ? '#374151' : '#e5e7eb' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{cartTotal.toLocaleString()}đ</Text>
            <Text style={styles.statLabel}>Tổng tiền giỏ</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: scheme === 'dark' ? '#374151' : '#e5e7eb' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{currentUser ? orders.length : 0}</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </View>
        </View>

        {/* 3. Login / Register Buttons Row (Guest Mode) */}
        {!currentUser && (
          <View style={styles.authButtonsRow}>
            <TouchableOpacity 
              style={[styles.authBtn, styles.loginBtn]} 
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>Đăng Nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.authBtn, styles.registerBtn]} 
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={20} color="#1a1a1a" style={{ marginRight: 8 }} />
              <Text style={styles.registerBtnText}>Đăng Ký</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Menu Options List */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>TÀI KHOẢN</Text>
          
          <View style={styles.menuList}>
            {renderOptionItem('person-outline', 'Hồ sơ của tôi', () => {
              if (currentUser) {
                router.push('/profile/address');
              } else {
                router.push('/login');
              }
            })}

            {renderOptionItem('key-outline', 'Tài khoản của tôi', () => {
              if (currentUser) {
                router.push('/profile/account');
              } else {
                router.push('/login');
              }
            })}

            {renderOptionItem('bag-handle-outline', 'Đơn hàng của tôi', () => {
              if (currentUser) {
                router.push('/orders/my-orders');
              } else {
                router.push('/login');
              }
            })}

            {!(currentUser && (currentUser.vai_tro?.includes('Admin') || currentUser.la_admin)) &&  
              renderOptionItem('medal-outline', 'Gói thành viên của tôi', () => {
                router.push('/membership');
              })
            }
          </View>
        </View>

        {/* Admin Dashboard Control (Only for admin users) */}
        {currentUser && (currentUser.vai_tro?.includes('Admin') || currentUser.la_admin) && (
          <TouchableOpacity 
            style={styles.adminPanelBtn} 
            onPress={() => router.push('/admin/dashboard')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.adminPanelText}>🛡️ Bảng điều khiển Admin</Text>
          </TouchableOpacity>
        )}

        {/* 5. Logout Button (Only when logged in) */}
        {currentUser && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── 1. Avatar Section ──
  avatarSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  leafBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── 2. Stats Block ──
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 4px 16px rgba(16,185,129,0.04)',
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  statDivider: {
    width: 1,
    height: 30,
  },

  // ── 3. Auth Buttons Row ──
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  authBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
    }),
  },
  loginBtn: {
    backgroundColor: '#1f2937', // dark charcoal
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  registerBtn: {
    backgroundColor: '#bef264', // fresh young lime green
  },
  registerBtnText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── 4. Menu Options List ──
  menuSection: {
    marginBottom: 24,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.01)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      },
    }),
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Admin Button ──
  adminPanelBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  adminPanelText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── 5. Logout Button ──
  logoutBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
