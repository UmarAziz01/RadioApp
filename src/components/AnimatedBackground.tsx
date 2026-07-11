import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../utils/responsive';

const STAR_COUNT = 90;

// 1. Definisikan tipe untuk Data Bintang dan Cache
interface StarData {
  key: string;
  x: Animated.Value;
  y: Animated.Value;
}

interface AnimationCache {
  values: StarData[] | null;
  key: string | null;
}

// Module-level cache for animated values
const starAnimationCache: AnimationCache = {
  values: null,
  key: null,
};

const getStarPositions = (width: number, height: number) => {
  const positions = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    positions.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  return positions;
};

const initializeStars = (width: number, height: number, count: number): StarData[] => {
  const positions = getStarPositions(width, height);
  const stars: StarData[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      key: `star-${i}`,
      x: new Animated.Value(positions[i]?.x ?? Math.random() * width),
      y: new Animated.Value(positions[i]?.y ?? Math.random() * height),
    });
  }
  return stars;
};

// 2. Definisikan tipe Props untuk StarComponent
interface StarComponentProps {
  animatedX: Animated.Value;
  animatedY: Animated.Value;
  size: number;
  color: string;
  opacity: number;
}

const StarComponent = React.memo(({ animatedX, animatedY, size, color, opacity }: StarComponentProps) => {
  const twinkleAnim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const twinkle = Animated.sequence([
      Animated.timing(twinkleAnim, {
        toValue: 0.05,
        duration: 2000 + Math.random() * 2000,
        useNativeDriver: true,
      }),
      Animated.timing(twinkleAnim, {
        toValue: opacity,
        duration: 2000 + Math.random() * 2000,
        useNativeDriver: true,
      }),
    ]);

    const twinkleLoop = Animated.loop(twinkle);
    twinkleLoop.start();

    return () => twinkleLoop.stop();
  }, [opacity, twinkleAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: animatedX as any, // Bypass style type check untuk Animated.Value
        top: animatedY as any,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: twinkleAnim,
      }}
    />
  );
});

// 3. Definisikan tipe Props untuk MovingStar
interface MovingStarProps extends StarComponentProps {
  duration: number;
  width: number;
  height: number;
}

const MovingStar = React.memo(({ animatedX, animatedY, size, color, opacity, duration, width, height }: MovingStarProps) => {
  const moveInProgress = useRef(false);

  const moveToNewPosition = useCallback(() => {
    if (moveInProgress.current) return;
    moveInProgress.current = true;

    const targetX = Math.random() * Math.max(width - size, 10);
    const targetY = Math.random() * Math.max(height - size, 10);

    Animated.parallel([
      Animated.timing(animatedX, {
        toValue: targetX,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedY, {
        toValue: targetY,
        duration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      moveInProgress.current = false;
      moveToNewPosition();
    });
  }, [width, height, size, duration, animatedX, animatedY]);

  useEffect(() => {
    moveToNewPosition();
    return () => {};
  }, [moveToNewPosition]);

  return (
    <StarComponent
      animatedX={animatedX}
      animatedY={animatedY}
      size={size}
      color={color}
      opacity={opacity}
    />
  );
});

// 4. Definisikan tipe Props untuk AnimatedBackground
interface AnimatedBackgroundProps {
  children?: ReactNode;
}

const AnimatedBackground = ({ children }: AnimatedBackgroundProps) => {
  const { colors, isDark } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, isMobile, isTablet } = useResponsive();

  const glowSize = isMobile
    ? SCREEN_WIDTH * 0.6
    : isTablet
      ? SCREEN_WIDTH * 0.45
      : SCREEN_WIDTH * 0.35;

  const bottomGlowSize = isMobile
    ? SCREEN_WIDTH * 0.7
    : isTablet
      ? SCREEN_WIDTH * 0.5
      : SCREEN_WIDTH * 0.4;

  const starCount = isMobile ? 20 : isTablet ? 30 : STAR_COUNT;
  
  const starData = React.useMemo(() => {
    const cacheKey = `${starCount}-${SCREEN_WIDTH}-${SCREEN_HEIGHT}`;
    
    let cachedStars: StarData[];
    if (starAnimationCache.key === cacheKey && starAnimationCache.values) {
      cachedStars = starAnimationCache.values;
    } else {
      cachedStars = initializeStars(SCREEN_WIDTH, SCREEN_HEIGHT, starCount);
      starAnimationCache.key = cacheKey;
      starAnimationCache.values = cachedStars;
    }

    const palette = [colors.primary, colors.secondary, colors.tertiary];
    return cachedStars.map((star, i) => ({
      key: star.key,
      animatedX: star.x,
      animatedY: star.y,
      size: 2 + Math.random() * 3,
      color: palette[i % palette.length],
      opacity: 0.3 + Math.random() * 0.5,
      duration: 4000 + Math.random() * 8000,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    }));
  }, [starCount, SCREEN_WIDTH, SCREEN_HEIGHT, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: colors.primary,
            opacity: 0.08,
            ...(Platform.OS === 'web' 
              ? { filter: `blur(${isMobile ? '80px' : '120px'})` } as any
              : {}),
          }}
        />
        {Platform.OS !== 'web' && (
          <View
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              backgroundColor: 'transparent',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 120,
            }}
          />
        )}
        
        <View
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: bottomGlowSize,
            height: bottomGlowSize,
            borderRadius: bottomGlowSize / 2,
            backgroundColor: colors.secondary,
            opacity: 0.08,
            ...(Platform.OS === 'web' 
              ? { filter: `blur(${isMobile ? '100px' : '150px'})` } as any
              : {}),
          }}
        />
        {Platform.OS !== 'web' && (
          <View
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: bottomGlowSize,
              height: bottomGlowSize,
              borderRadius: bottomGlowSize / 2,
              backgroundColor: 'transparent',
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 150,
            }}
          />
        )}
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT * 0.12,
            left: SCREEN_WIDTH * 0.08,
            width: isMobile ? 100 : 160,
            height: isMobile ? 100 : 160,
            borderRadius: isMobile ? 50 : 80,
            backgroundColor: colors.primary,
            opacity: 0.08,
            ...(Platform.OS === 'web'
              ? { filter: `blur(${isMobile ? '40px' : '60px'})` as any }
              : {}),
          }}
        />
        {Platform.OS !== 'web' && (
          <View
            style={{
              position: 'absolute',
              top: SCREEN_HEIGHT * 0.12,
              left: SCREEN_WIDTH * 0.08,
              width: isMobile ? 100 : 160,
              height: isMobile ? 100 : 160,
              borderRadius: isMobile ? 50 : 80,
              backgroundColor: 'transparent',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 60,
            }}
          />
        )}

        <View
          style={{
            position: 'absolute',
            bottom: SCREEN_HEIGHT * 0.12,
            right: SCREEN_WIDTH * 0.08,
            width: isMobile ? 100 : 160,
            height: isMobile ? 100 : 160,
            borderRadius: isMobile ? 50 : 80,
            backgroundColor: colors.secondary,
            opacity: 0.08,
            ...(Platform.OS === 'web'
              ? { filter: `blur(${isMobile ? '40px' : '60px'})` as any }
              : {}),
          }}
        />
        {Platform.OS !== 'web' && (
          <View
            style={{
              position: 'absolute',
              bottom: SCREEN_HEIGHT * 0.12,
              right: SCREEN_WIDTH * 0.08,
              width: isMobile ? 100 : 160,
              height: isMobile ? 100 : 160,
              borderRadius: isMobile ? 50 : 80,
              backgroundColor: 'transparent',
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.08,
              shadowRadius: 60,
            }}
          />
        )}
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {starData.map((star) => (
          <MovingStar
            key={star.key}
            animatedX={star.animatedX}
            animatedY={star.animatedY}
            size={star.size}
            color={star.color}
            opacity={star.opacity}
            duration={star.duration}
            width={star.width}
            height={star.height}
          />
        ))}
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default AnimatedBackground;