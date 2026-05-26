import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Dữ liệu 3 slide onboarding
const SLIDES = [
  {
    id: 1,
    icon: 'people-outline' as const,
    title: 'Bạn là người dùng mới?',
    description: 'Chào mừng bạn đến với DTP Care! Hãy để chúng tôi đồng hành cùng bạn trong hành trình chăm sóc cây xanh.',
    emoji: '👋',
    bgColor: '#10b981',
  },
  {
    id: 2,
    icon: 'leaf-outline' as const,
    title: 'Bạn là người yêu thích cây',
    description: 'Khám phá hàng trăm giống cây cảnh độc đáo, được tuyển chọn kỹ lưỡng và chăm sóc bởi chuyên gia.',
    emoji: '🌿',
    bgColor: '#059669',
  },
  {
    id: 3,
    icon: 'sparkles-outline' as const,
    title: 'Sẵn sàng khám phá!',
    description: 'Trải nghiệm mua sắm thông minh với AI tư vấn, giao hàng tận nơi và bảo hành cây cảnh toàn diện.',
    emoji: '🚀',
    bgColor: '#34d399',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hiệu ứng chuyển slide
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const finishOnboarding = async () => {
    // Đánh dấu đã mở app rồi → lần sau sẽ bỏ qua Onboarding
    await AsyncStorage.setItem('hasOpenedBefore', 'true');
    router.replace('/login');
  };

  const goToNextSlide = () => {
    if (currentSlide === SLIDES.length - 1) {
      // Slide cuối → hoàn thành Onboarding
      finishOnboarding();
      return;
    }

    // Hiệu ứng fade-out → chuyển slide → fade-in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSlide((prev) => prev + 1);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: slide.bgColor }]}>
      {/* Hình tròn trang trí nền */}
      <View style={[styles.decorCircle, styles.circle1]} />
      <View style={[styles.decorCircle, styles.circle2]} />

      {/* Nút Skip góc trên bên phải */}
      <TouchableOpacity style={styles.skipBtn} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Bỏ qua</Text>
        <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {/* Nội dung slide */}
      <View style={styles.content}>
        {/* Emoji lớn */}
        <Animated.View
          style={[
            styles.emojiContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </Animated.View>

        {/* Icon minh họa */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={slide.icon} size={40} color="#ffffff" />
          </View>
        </Animated.View>

        {/* Tiêu đề */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.title}>{slide.title}</Text>
        </Animated.View>

        {/* Mô tả */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </View>

      {/* Thanh điều hướng dưới cùng: Chấm tròn + Nút tiếp tục */}
      <View style={styles.bottomBar}>
        {/* Chấm tròn chỉ vị trí slide (o o o) */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Nút mũi tên tiếp tục (→) */}
        <TouchableOpacity style={styles.nextBtn} onPress={goToNextSlide}>
          {currentSlide === SLIDES.length - 1 ? (
            <Text style={styles.nextBtnTextFinal}>Bắt đầu</Text>
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#10b981" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── Hình trang trí nền ───
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 350,
    height: 350,
    top: -100,
    left: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    bottom: 50,
    right: -80,
  },
  // ─── Nút Skip ───
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  // ─── Nội dung slide ───
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  // ─── Thanh điều hướng dưới cùng ───
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    width: 28,
    borderRadius: 5,
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextBtnTextFinal: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '800',
  },
});
