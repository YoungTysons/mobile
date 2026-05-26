import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: number;
  type: 'order' | 'promo' | 'system' | 'review';
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'promo',
    title: '🌿 Flash Sale cuối tuần!',
    message: 'Giảm đến 30% toàn bộ cây cảnh trong nhà. Chỉ còn 2 ngày!',
    time: '5 phút trước',
    read: false,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
  },
  {
    id: 2,
    type: 'order',
    title: 'Đơn hàng #1042 đang giao',
    message: 'Shipper đang trên đường giao Monstera Deliciosa đến bạn. Dự kiến 30 phút nữa.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    type: 'system',
    title: 'Chào mừng thành viên mới! 🎉',
    message: 'Bạn đã đăng ký thành công. Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên.',
    time: '3 giờ trước',
    read: true,
  },
  {
    id: 4,
    type: 'review',
    title: 'Đánh giá sản phẩm',
    message: 'Bạn hãy đánh giá Peace Lily mà bạn đã mua tuần trước nhé!',
    time: '1 ngày trước',
    read: true,
  },
  {
    id: 5,
    type: 'promo',
    title: '🎋 Bộ sưu tập mới!',
    message: 'Cây cảnh nhiệt đới phiên bản giới hạn vừa ra mắt. Khám phá ngay!',
    time: '2 ngày trước',
    read: true,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200',
  },
  {
    id: 6,
    type: 'order',
    title: 'Đơn hàng #1038 đã giao thành công ✅',
    message: 'Cây Kim Tiền đã được giao thành công. Cảm ơn bạn đã tin tưởng Aether!',
    time: '3 ngày trước',
    read: true,
  },
  {
    id: 7,
    type: 'system',
    title: 'Mẹo chăm sóc cây mùa hè 🌞',
    message: 'Tưới nước vào sáng sớm hoặc chiều muộn để tránh cháy lá. Đọc thêm...',
    time: '5 ngày trước',
    read: true,
  },
];

function getTypeIcon(type: Notification['type']): { name: string; color: string; bg: string } {
  switch (type) {
    case 'order':
      return { name: 'cube', color: '#0284c7', bg: '#e0f2fe' };
    case 'promo':
      return { name: 'pricetag', color: '#dc2626', bg: '#fee2e2' };
    case 'system':
      return { name: 'information-circle', color: '#10b981', bg: '#d1fae5' };
    case 'review':
      return { name: 'star', color: '#f59e0b', bg: '#fef3c7' };
    default:
      return { name: 'notifications', color: '#6b7280', bg: '#f3f4f6' };
  }
}

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = async () => {
    try {
      // 1. Lấy thông báo cá nhân/khuyến mãi của user
      const res = await api.get('/notifications');
      let personalNotifs = [];
      if (res.data && res.data.success) {
        personalNotifs = res.data.data.map((item: any) => {
          let type: 'order' | 'promo' | 'system' | 'review' = 'system';
          if (item.loai === 'DonHang') type = 'order';
          else if (item.loai === 'promo') type = 'promo';
          else if (item.loai === 'system') type = 'system';

          return {
            id: `personal-${item.id}`,
            dbId: item.id,
            type,
            title: item.tieu_de,
            message: item.noi_dung,
            time: new Date(item.ngay_tao),
            read: !!item.da_doc,
            isAdminAlert: false
          };
        });
      }

      // 2. Lấy thêm thông báo quản trị live nếu user có vai trò Admin
      let adminNotifs = [];
      if (currentUser && (currentUser.la_admin || currentUser.vai_tro?.includes('Admin'))) {
        const adminRes = await api.get('/notifications/admin').catch(() => null);
        if (adminRes && adminRes.data && adminRes.data.success) {
          adminNotifs = adminRes.data.data.map((item: any) => {
            let type: 'order' | 'promo' | 'system' | 'review' = 'system';
            if (item.type === 'order' || item.type === 'order_success') type = 'order';
            else if (item.type === 'stock') type = 'system';
            else if (item.type === 'feedback') type = 'system';
            else if (item.type === 'review') type = 'review';

            return {
              id: `admin-${item.id}`,
              type,
              title: item.type === 'order' ? '🛒 Đơn hàng mới!' : 
                     item.type === 'order_success' ? '✅ Giao thành công!' :
                     item.type === 'stock' ? '⚠️ Cảnh báo tồn kho!' :
                     item.type === 'feedback' ? '💬 Phản hồi mới!' : '⭐ Đánh giá mới!',
              message: item.text,
              time: new Date(item.time),
              read: !item.unread, // unread === true nghĩa là read === false
              isAdminAlert: true
            };
          });
        }
      }

      // 3. Ghép và sắp xếp giảm dần theo thời gian
      const combined = [...adminNotifs, ...personalNotifs];
      combined.sort((a, b) => b.time.getTime() - a.time.getTime());

      // 4. Format thời gian hiển thị
      const formatted = combined.map(item => {
        const timeStr = item.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + item.time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return {
          ...item,
          time: timeStr
        };
      });

      setNotifications(formatted);
    } catch (err) {
      console.log('Lỗi tải thông báo từ API:', err);
      // Fallback sang mock nếu bị lỗi
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]); // Nạp lại khi user đăng nhập/thay đổi trạng thái

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.log('Lỗi đọc tất cả:', err);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const markRead = async (item: any) => {
    if (item.isAdminAlert) {
      // Đối với thông báo quản trị live, đánh dấu đã đọc cục bộ
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
      );
      return;
    }

    try {
      await api.put(`/notifications/${item.dbId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.log('Lỗi đọc thông báo:', err);
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
  };

  const renderNotification = (item: any) => {
    const icon = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.notifCard,
          {
            backgroundColor: item.read
              ? (isDark ? '#111' : '#ffffff')
              : (isDark ? '#0c2a1e' : '#f0fdf4'),
            borderColor: item.read
              ? (isDark ? '#222' : '#f1f5f9')
              : (isDark ? '#166534' : '#bbf7d0'),
          },
        ]}
        onPress={() => markRead(item)}
        activeOpacity={0.8}
      >
        {/* Chấm xanh chưa đọc */}
        {!item.read && <View style={styles.unreadDot} />}

        <View style={styles.notifRow}>
          {/* Icon loại thông báo */}
          <View style={[styles.iconCircle, { backgroundColor: isDark ? `${icon.bg}22` : icon.bg }]}>
            <Ionicons name={icon.name as any} size={20} color={icon.color} />
          </View>

          {/* Nội dung */}
          <View style={styles.notifContent}>
            <Text
              style={[
                styles.notifTitle,
                { color: colors.text, fontWeight: item.read ? '600' : '700' },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.notifMessage, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={styles.notifTime}>{item.time}</Text>
          </View>

          {/* Ảnh thumbnail (nếu có) */}
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.notifThumb} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#faf9f6' }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundElement }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Thông báo</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>
              {unreadCount} thông báo chưa đọc
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={18} color="#10b981" />
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách thông báo */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 14 }}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
          }
        >
          {/* Phần chưa đọc */}
          {unreadCount > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MỚI</Text>
              {notifications.filter(n => !n.read).map(renderNotification)}
            </>
          )}

          {/* Phần đã đọc */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: unreadCount > 0 ? 20 : 0 }]}>
            TRƯỚC ĐÓ
          </Text>
          {notifications.filter(n => n.read).map(renderNotification)}

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="checkmark-circle" size={36} color={isDark ? '#374151' : '#d1d5db'} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Bạn đã xem hết thông báo
            </Text>
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },

  // ── List ──
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // ── Notification Card ──
  notifCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
    }),
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 3,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  notifThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    resizeMode: 'cover',
  },

  // ── Footer ──
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
