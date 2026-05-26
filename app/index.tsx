import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Hiệu ứng fade-in cho logo và text
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Chuỗi animation tuần tự: Logo → Tên app → Slogan → Loading dots
    Animated.sequence([
      // 1. Logo xuất hiện và phóng to
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 2. Tên app xuất hiện
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 3. Slogan xuất hiện
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Loading dots xuất hiện
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Sau 3 giây: kiểm tra phiên đăng nhập & trạng thái người dùng mới/cũ
    const timer = setTimeout(async () => {
      try {
        const [token, hasOpened] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('hasOpenedBefore'),
        ]);

        if (token) {
          // Đã đăng nhập → vào thẳng Trang chủ
          router.replace('/(tabs)');
        } else if (!hasOpened) {
          // Chưa bao giờ mở app → hiển thị Onboarding
          router.replace('/onboarding');
        } else {
          // Đã mở app trước đó nhưng chưa đăng nhập → hiển thị Đăng nhập
          router.replace('/login');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
        router.replace('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Nền gradient xanh lá đậm sang trọng */}
      <View style={styles.gradientBg}>
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />
        <View style={styles.gradientLayer3} />
      </View>

      {/* Các hình tròn trang trí mờ (decorative circles) */}
      <View style={[styles.decorCircle, styles.circle1]} />
      <View style={[styles.decorCircle, styles.circle2]} />
      <View style={[styles.decorCircle, styles.circle3]} />

      {/* Nội dung chính: Logo + Tên + Slogan */}
      <View style={styles.content}>
        {/* Icon logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="leaf" size={48} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        {/* Tên ứng dụng */}
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.appName}>DTP Care</Text>
        </Animated.View>

        {/* Slogan */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.slogan}>Chăm sóc cây, chăm sóc bạn</Text>
        </Animated.View>

        {/* Dấu chấm loading */}
        <Animated.View style={[styles.loadingDots, { opacity: dotOpacity }]}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </Animated.View>
      </View>

      {/* Phiên bản ở cuối màn hình */}
      <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10b981',
  },
  // ─── Nền gradient (dùng nhiều lớp View thay cho LinearGradient) ───
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#10b981',
  },
  gradientLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#059669',
    opacity: 0.7,
    top: height * 0.3,
  },
  gradientLayer3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#34d399',
    opacity: 0.4,
    top: height * 0.6,
  },
  // ─── Hình tròn trang trí ───
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -60,
    right: -80,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -60,
  },
  circle3: {
    width: 150,
    height: 150,
    bottom: -30,
    right: 40,
  },
  // ─── Nội dung chính ───
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // ─── Loading dots ───
  loadingDots: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dot1: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dot2: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dot3: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // ─── Phiên bản ───
  versionText: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    fontWeight: '500',
  },
});
