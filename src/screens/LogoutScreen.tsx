import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated as RNAnimated } from 'react-native';
import { IconLogout } from '../components/Icons';
import { useTheme } from '../theme/ThemeContext';
// ─── Warna ───
const C = {
  bg: '#0F1115',
  primary: '#00dbe9',
  onSurface: '#e2e2e8',
  textMuted: '#849495',
};
// ─── COMPONENT ───
const LogoutScreen = () => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;

  useEffect(() => {
    // Entry animations
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // ─── RENDER ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <RNAnimated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <IconLogout size={64} />
        </View>

        <Text style={styles.title}>Logged Out</Text>
        <Text style={styles.subtitle}>You have been successfully logged out</Text>

        <View style={styles.redirectInfo}>
          <Text style={styles.redirectText}>Redirecting to home...</Text>
        </View>
      </RNAnimated.View>

      {/* ─────── BOTTOM HINT ─────── */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>Thank you for using SonicFlow</Text>
      </View>
    </View>
  );
};

// ─── STYLES ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,82,82,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,82,82,0.3)',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: C.onSurface,
    textAlign: 'center',
    marginBottom: 32,
  },

  redirectInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,219,233,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,219,233,0.2)',
  },

  redirectText: {
    fontSize: 14,
    color: C.primary,
    fontWeight: '500',
  },

  bottomHint: {
    position: 'absolute',
    bottom: 40,
  },

  hintText: {
    fontSize: 14,
    color: C.textMuted,
  },
});

export default LogoutScreen;