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
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  // Background slow breathing animation
  const breatheAnim = useRef(new Animated.Value(0)).current;

  // Dots wave animations
  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Initial fade-in sequence for logo and text
    Animated.sequence([
      // Logo springs & fades in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Slogan fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Loading dots fade in
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Slow breathing background circles
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Dot wave bounces
    const createDotAnimation = (value: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: -12,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ])
        ),
      ]);
    };

    Animated.parallel([
      createDotAnimation(dot1Y, 0),
      createDotAnimation(dot2Y, 150),
      createDotAnimation(dot3Y, 300),
    ]).start();

    // 4. Session check and navigation delay (3.5 seconds to show off beautiful animation)
    const timer = setTimeout(async () => {
      try {
        const [token, hasOpened] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('hasOpenedBefore'),
        ]);

        if (token) {
          router.replace('/(tabs)');
        } else if (!hasOpened) {
          router.replace('/onboarding');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
        router.replace('/login');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Interpolations for background circles breathing
  const circleScale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  const circleOpacity = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.09],
  });

  return (
    <View style={styles.container}>
      {/* Premium smooth linear gradient background */}
      <LinearGradient
        colors={['#16a34a', '#22c55e', '#4ade80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      {/* Breathing glowing decorative circles */}
      <Animated.View
        style={[
          styles.decorCircle,
          styles.circle1,
          {
            opacity: circleOpacity,
            transform: [{ scale: circleScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle,
          styles.circle2,
          {
            opacity: circleOpacity,
            transform: [
              { scale: circleScale },
              { translateY: breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) }
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle,
          styles.circle3,
          {
            opacity: circleOpacity,
            transform: [
              { scale: circleScale },
              { translateX: breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }
            ],
          },
        ]}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Glow Logo outer */}
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
              <Ionicons name="leaf" size={52} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        {/* Glow Text App Name */}
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.appName}>DTP Care</Text>
        </Animated.View>

        {/* Elegant Slogan */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.slogan}>Chăm sóc cây • Chăm sóc bạn</Text>
        </Animated.View>

        {/* Interactive Bouncing Wave Loading Dots */}
        <Animated.View style={[styles.loadingDots, { opacity: dotOpacity }]}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot1Y }],
                backgroundColor: '#ffffff',
                opacity: 1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot2Y }],
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                opacity: 0.85,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot3Y }],
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                opacity: 0.6,
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* Elegant Version Footer */}
      <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  // ─── Glowing Decorative Circles ───
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  circle1: {
    width: 320,
    height: 320,
    top: -50,
    right: -70,
  },
  circle2: {
    width: 240,
    height: 240,
    bottom: 120,
    left: -80,
  },
  circle3: {
    width: 160,
    height: 160,
    bottom: -40,
    right: 30,
  },
  // ─── Main Content Layout ───
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 28,
  },
  logoOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // ─── Waving Bouncing Loading Dots ───
  loadingDots: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 20, // Ensure height for translateY movement
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  // ─── Version Footer ───
  versionText: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
