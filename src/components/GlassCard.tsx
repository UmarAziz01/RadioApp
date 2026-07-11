import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp, StyleSheet as RNStyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../utils/responsive';

interface GlassCardProps {
  children?: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  blurRadius?: number;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  noPadding?: boolean;
  borderRadius?: number;
}

const GlassCard = ({
  children,
  intensity = 20,
  tint,
  blurRadius = 12,
  style,
  padding,
  noPadding,
  borderRadius = 16,
}: GlassCardProps) => {
  const { colors, isDark } = useTheme();
  const { width, isMobile, isDesktop } = useResponsive();

  const blurTint = tint || (isDark ? 'dark' : 'light');

  const containerStyle = useMemo(() => {
    const baseStyle = {
      borderRadius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.cardBackground,
      width: '100%',
      alignSelf: 'stretch',
      ...Platform.select({
        web: {
          boxShadow: isDark
            ? '0 32px 64px -16px rgba(105,0,179,0.15)'
            : '0 32px 64px -16px rgba(99,102,241,0.12)',
        },
        default: {
          shadowColor: isDark ? 'rgba(105,0,179,0.15)' : 'rgba(99,102,241,0.12)',
          shadowOffset: { width: 0, height: 32 },
          shadowOpacity: isDark ? 0.15 : 0.12,
          shadowRadius: 64,
          elevation: 24,
        },
      }),
    };

    const flattenedStyle = style ? RNStyleSheet.flatten(style) : {};

    return {
      ...baseStyle,
      ...flattenedStyle,
    };
  }, [borderRadius, colors, isDark, isDesktop, width, style]);

  return (
    <View style={containerStyle as any}>
      {/* Top edge highlight for dark mode */}
      {isDark && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundImage: Platform.OS === 'web'
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
              : undefined,
            zIndex: 1,
          } as any}
        />
      )}
      {/* Light leak for web dark mode */}
      {Platform.OS !== 'web' && isDark && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            zIndex: 1,
            backgroundColor: colors.glassHighlight,
            opacity: 0.5,
          }}
        />
      )}
      <BlurView intensity={isDark ? intensity : intensity * 1.5} tint={blurTint} style={styles.blur}>
        <View style={[styles.content, !noPadding && { padding: padding ?? 8 }]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  blur: {
    width: '100%',
    height: '100%',
  },
  content: {
    width: '100%',
  },
});

export default GlassCard;