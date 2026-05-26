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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

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

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderNotification = (item: Notification) => {
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
        onPress={() => markRead(item.id)}
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
