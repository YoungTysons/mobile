import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/theme';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatbotScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Xin chào! Em là trợ lý ảo của Aether Plant Shop 🌿. Em có thể giúp anh/chị chọn lựa hoặc tư vấn cách chăm sóc các loại cây cảnh không ạ?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    
    // Thêm tin nhắn của User vào luồng
    const updatedMessages = [...messages, { role: 'user', text: userText } as Message];
    setMessages(updatedMessages);
    setLoading(true);

    // Chuyển lịch sử hội thoại sang chuẩn API (lược bỏ tin nhắn chào ban đầu để khớp định dạng)
    const history = updatedMessages.slice(1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    try {
      const res = await api.post('/chatbot/chat', {
        message: userText,
        history: history
      });

      if (res.data && res.data.text) {
        setMessages(prev => [...prev, { role: 'model', text: res.data.text }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.log('API Chatbot offline hoặc lỗi, sử dụng fallback response:', err);
      // Fallback phản hồi thông minh nếu API local lỗi
      setTimeout(() => {
        let reply = 'Dạ, hiện tại hệ thống AI đang nâng cấp một chút. Cửa hàng Aether có sẵn các loại cây bán chạy cực đẹp như: Cây Kim Tiền mang tài lộc (150.000đ) hoặc Trầu Bà Nam Mỹ Monstera (380.000đ). Anh/chị cần em hỗ trợ tư vấn loại nào ạ?';
        
        const q = userText.toLowerCase();
        if (q.includes('chăm') || q.includes('nước') || q.includes('héo')) {
          reply = 'Đối với các cây cảnh trong nhà, anh/chị chú ý tưới nước vừa đủ khi đất mặt se khô (khoảng 1-2 lần/tuần), phơi nắng sáng nhẹ khoảng 2 tiếng mỗi tuần để lá luôn xanh mướt nhé!';
        } else if (q.includes('vận chuyển') || q.includes('ship')) {
          reply = 'Dạ Aether miễn phí giao hàng toàn quốc cho mọi đơn hàng cây cảnh! Cây được đóng gói 3 lớp bảo vệ chuyên nghiệp nên đảm bảo an toàn tuyệt đối khi giao đến tay anh/chị ạ.';
        }
        
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Bot Info Header */}
      <View style={[styles.header, { borderBottomColor: colors.backgroundElement }]}>
        <View style={styles.botProfile}>
          <View style={styles.botAvatarWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200' }}
              style={styles.botAvatar}
            />
            <View style={styles.activeIndicator} />
          </View>
          <View>
            <Text style={[styles.botName, { color: colors.text }]}>Trợ lý Aether AI 🌿</Text>
            <Text style={styles.botStatus}>Đang trực tuyến</Text>
          </View>
        </View>
        <Ionicons name="sparkles" size={20} color="#10b981" />
      </View>

      {/* Messages Stream */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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
                style={[
                  styles.msgRow,
                  isModel ? styles.msgRowBot : styles.msgRowUser
                ]}
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
                      ? [styles.bubbleBot, { backgroundColor: colors.backgroundElement }]
                      : styles.bubbleUser
                  ]}
                >
                  <Text style={[
                    styles.msgText,
                    isModel ? { color: colors.text } : styles.textUser
                  ]}>
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
              <View style={[styles.msgBubble, styles.bubbleBot, { backgroundColor: colors.backgroundElement, paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color="#10b981" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Text Box */}
        <View style={[styles.inputContainer, { borderTopColor: colors.backgroundElement }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundElement }]}
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
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  botProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botAvatarWrap: {
    position: 'relative',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  botName: {
    fontSize: 16,
    fontWeight: '700',
  },
  botStatus: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignSelf: 'flex-end',
  },
  msgBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  bubbleUser: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  textUser: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
