import React, { useState, useRef, useEffect } from 'react';
import { Tabs, usePathname } from 'expo-router';
import {
  useColorScheme,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import api from '../../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CHAT_HEIGHT = SCREEN_HEIGHT * 0.78;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const pathname = usePathname();

  // Màu chủ đạo
  const activeColor = '#10b981';
  const inactiveColor = colors.textSecondary;

  // Ẩn trợ lý AI ở màn hình cá nhân (profile) và admin
  const hideFloatingAI = pathname.includes('/profile') || pathname.includes('/admin');

  // ── Chat overlay state ──
  const [chatOpen, setChatOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(CHAT_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Keyboard height state for dynamic resizing ──
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const currentPanelHeight = keyboardHeight > 0 
    ? Math.min(CHAT_HEIGHT, SCREEN_HEIGHT - keyboardHeight - (Platform.OS === 'ios' ? 40 : 20))
    : CHAT_HEIGHT;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Xin chào! Em là trợ lý ảo của Aether Plant Shop 🌿. Em có thể giúp anh/chị chọn lựa hoặc tư vấn cách chăm sóc các loại cây cảnh không ạ?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading, chatOpen]);

  const openChat = () => {
    setChatOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeChat = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: CHAT_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setChatOpen(false));
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userText = inputText.trim();
    setInputText('');

    const updatedMessages = [...messages, { role: 'user', text: userText } as Message];
    setMessages(updatedMessages);
    setLoading(true);

    const history = updatedMessages.slice(1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    try {
      const res = await api.post('/chatbot/chat', { message: userText, history });
      if (res.data?.text) {
        setMessages(prev => [...prev, { role: 'model', text: res.data.text }]);
      } else {
        throw new Error();
      }
    } catch {
      setTimeout(() => {
        let reply = 'Dạ, hiện tại hệ thống AI đang nâng cấp. Cửa hàng Aether có các cây bán chạy cực đẹp như Kim Tiền (150.000đ) hoặc Monstera (380.000đ). Anh/chị cần tư vấn loại nào ạ?';
        const q = userText.toLowerCase();
        if (q.includes('chăm') || q.includes('nước') || q.includes('héo')) {
          reply = 'Đối với cây cảnh trong nhà, tưới nước vừa đủ khi đất mặt se khô (1-2 lần/tuần), phơi nắng nhẹ 2 tiếng mỗi tuần để lá luôn xanh mướt nhé!';
        } else if (q.includes('vận chuyển') || q.includes('ship')) {
          reply = 'Dạ Aether miễn phí giao hàng toàn quốc! Cây được đóng gói 3 lớp bảo vệ chuyên nghiệp, đảm bảo an toàn tuyệt đối ạ.';
        }
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.backgroundElement,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 88 : 64,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        {/* 1. Cửa hàng */}
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Cửa hàng',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* 2. Giỏ hàng */}
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Giỏ hàng',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* 3. TRANG CHỦ (giữa – nổi bật) */}
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={[
                styles.homeBtnOuter,
                {
                  backgroundColor: focused ? activeColor : (isDark ? '#1f2937' : '#ecfdf5'),
                  borderColor: isDark ? '#374151' : '#d1fae5',
                },
              ]}>
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={24}
                  color={focused ? '#ffffff' : activeColor}
                />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />

        {/* 4. Thông báo */}
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Thông báo',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* 5. Cá nhân */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* Ẩn chatbot khỏi tab bar */}
        <Tabs.Screen
          name="chatbot"
          options={{ href: null }}
        />
      </Tabs>

      {/* ══════════ NÚT NỔI TRỢ LÝ CÂY AI ══════════ */}
      {!chatOpen && !hideFloatingAI && (
        <TouchableOpacity
          style={[
            styles.floatingAI,
            { bottom: Platform.OS === 'ios' ? 100 : 76 },
          ]}
          onPress={openChat}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* ══════════ CHAT OVERLAY 70% ══════════ */}
      {chatOpen && !hideFloatingAI && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Backdrop mờ */}
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeChat} />
          </Animated.View>

          {/* KeyboardAvoidingView bao bọc toàn bộ Panel trượt để tự động dịch chuyển thông minh */}
          <KeyboardAvoidingView
            style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
            pointerEvents="box-none"
          >
            {/* Panel chat trượt từ dưới lên với chiều cao động tránh tràn viền */}
            <Animated.View
              style={[
                styles.chatPanel,
                {
                  height: currentPanelHeight,
                  backgroundColor: isDark ? '#111' : '#ffffff',
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* ── Chat Header ── */}
              <View style={[styles.chatHeader, { borderBottomColor: isDark ? '#222' : '#f1f5f9' }]}>
                {/* Thanh kéo */}
                <View style={[styles.dragHandle, { backgroundColor: isDark ? '#444' : '#d1d5db' }]} />

                <View style={styles.chatHeaderRow}>
                  <View style={styles.botProfile}>
                    <View style={styles.botAvatarWrap}>
                      <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200' }}
                        style={styles.botAvatar}
                      />
                      <View style={styles.activeIndicator} />
                    </View>
                    <View>
                      <Text style={[styles.botName, { color: colors.text }]}>Trợ lý Aether 🌿</Text>
                      <Text style={styles.botStatus}>Đang trực tuyến</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeChat} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Messages ── */}
              <ScrollView
                ref={scrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg, index) => {
                  const isModel = msg.role === 'model';
                  return (
                    <View
                      key={index}
                      style={[styles.msgRow, isModel ? styles.msgRowBot : styles.msgRowUser]}
                    >
                      {isModel && (
                        <Image
                          source={{ uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200' }}
                          style={styles.msgAvatar}
                        />
                      )}
                      <View
                        style={[
                          styles.msgBubble,
                          isModel
                            ? [styles.bubbleBot, { backgroundColor: isDark ? '#1f2937' : '#f0fdf4' }]
                            : styles.bubbleUser,
                        ]}
                      >
                        <Text style={[styles.msgText, isModel ? { color: colors.text } : styles.textUser]}>
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {loading && (
                  <View style={[styles.msgRow, styles.msgRowBot]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200' }}
                      style={styles.msgAvatar}
                    />
                    <View style={[styles.msgBubble, styles.bubbleBot, { backgroundColor: isDark ? '#1f2937' : '#f0fdf4', paddingVertical: 12 }]}>
                      <ActivityIndicator size="small" color="#10b981" />
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* ── Input ── */}
              <View style={[styles.inputContainer, { borderTopColor: isDark ? '#222' : '#f1f5f9' }]}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }]}
                  placeholder="Hỏi về cách chăm sóc cây, giá bán..."
                  placeholderTextColor={colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[styles.sendBtn, { backgroundColor: inputText.trim() ? '#10b981' : '#e2e8f0' }]}
                  onPress={handleSend}
                  disabled={!inputText.trim()}
                >
                  <Ionicons name="send" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Nút Trang chủ nổi bật ──
  homeBtnOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
    }),
  },

  // ── FAB – Nút nổi Trợ lý AI ──
  floatingAI: {
    position: 'absolute',
    right: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
      web: {
        boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
        cursor: 'pointer',
      },
    }),
  },
  fabIconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabChatDot: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.15)' },
    }),
  },

  // ── Backdrop ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // ── Chat Panel ──
  chatPanel: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
      web: { boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' },
    }),
  },
  chatHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  botProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatarWrap: {
    position: 'relative',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'cover',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  botName: {
    fontSize: 15,
    fontWeight: '700',
  },
  botStatus: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // ── Messages ──
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 14,
    paddingBottom: 20,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '85%',
    gap: 8,
  },
  msgRowBot: {
    alignSelf: 'flex-start',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignSelf: 'flex-end',
  },
  msgBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  bubbleUser: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  textUser: {
    color: '#ffffff',
  },

  // ── Input ──
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '500',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
