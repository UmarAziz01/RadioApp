import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

// 1. Tambahkan interface untuk mendefinisikan tipe data props
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const GlassButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
  size = 'large',
}: GlassButtonProps) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isSmall = size === 'small';
  const isMedium = size === 'medium';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const buttonHeight = isSmall ? 44 : isMedium ? 50 : 56;
  const fontSize = isSmall ? 14 : isMedium ? 15 : 16;
  const borderRadius = 12;

  if (variant === 'primary') {
    // App gradient button with glow
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              disabled
                ? [colors.textSecondary, colors.textSecondary]
                : [colors.gradientStart, colors.gradientEnd]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              { height: buttonHeight, borderRadius },
              // Shadow glow effect matching design.md: 0 4px 15px rgba(192,193,255,0.3)
              Platform.select({
                web: {
                  boxShadow: `0 4px 15px ${colors.glow}`,
                } as any, // Bypass TS error untuk boxShadow di Web
                default: {
                  shadowColor: colors.glow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 8,
                },
              }),
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                {icon && <Text style={styles.iconText}>{icon} </Text>}
                <Text
                  style={[
                    styles.text,
                    { color: colors.onPrimary, fontSize },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Secondary / ghost variant with glassmorphism
  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
        { borderRadius, overflow: 'hidden' },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.button,
            {
              height: buttonHeight,
              borderRadius,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <View style={styles.buttonContent}>
              {icon && (
                <Text style={[styles.iconText, { color: colors.primary }]}>
                  {icon}{' '}
                </Text>
              )}
              <Text
                style={[
                  styles.text,
                  {
                    color: disabled ? colors.textSecondary : colors.primary,
                    fontSize,
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    fontSize: 16,
  },
  iconText: {
    fontSize: 16,
  },
});

export default GlassButton;