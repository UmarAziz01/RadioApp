import { useWindowDimensions, Platform, ScaledSize } from 'react-native';

// Breakpoints
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
};

// Screen size types
export const SCREEN_SIZE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
};

/**
 * Determine screen size based on width.
 * @param {number} width
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export const getScreenSize = (width:number) => {
  if (width >= BREAKPOINTS.DESKTOP_MIN) return SCREEN_SIZE.DESKTOP;
  if (width >= BREAKPOINTS.TABLET_MIN) return SCREEN_SIZE.TABLET;
  return SCREEN_SIZE.MOBILE;
};

/**
 * React hook that returns responsive layout values based on screen size.
 * @returns {{
 *   width: number,
 *   height: number,
 *   screenSize: 'mobile' | 'tablet' | 'desktop',
 *   isMobile: boolean,
 *   isTablet: boolean,
 *   isDesktop: boolean,
 *   cardWidth: number,
 *   cardPadding: number,
 *   formMaxWidth: number,
 *   horizontalPadding: number,
 *   fontSize: { brand: number, title: number, subtitle: number, body: number, small: number },
 * }}
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const screenSize = getScreenSize(width);
  const isMobile = screenSize === SCREEN_SIZE.MOBILE;
  const isTablet = screenSize === SCREEN_SIZE.TABLET;
  const isDesktop = screenSize === SCREEN_SIZE.DESKTOP;

  // Responsive card width
  let cardWidth;
  if (isMobile) {
    cardWidth = '100%';
  } else if (isTablet) {
    cardWidth = Math.min(width * 0.7, 480);
  } else {
    // Desktop: centered with a max-width
    cardWidth = Math.min(width * 0.5, 520);
  }

  // Responsive padding inside card
  const cardPadding = isMobile ? 28 : isTablet ? 36 : 44;

  // Max-width for the form container
  const formMaxWidth = 480;

  // Horizontal padding for the scroll view wrapper
  let horizontalPadding;
  if (isMobile) {
    horizontalPadding = 16;
  } else if (isTablet) {
    horizontalPadding = width * 0.08;
  } else {
    horizontalPadding = width * 0.12;
  }

  // Responsive font sizes
  const fontSize = {
    brand: isMobile ? 32 : isTablet ? 36 : 42,
    title: isMobile ? 24 : isTablet ? 26 : 30,
    subtitle: isMobile ? 15 : isTablet ? 16 : 17,
    body: isMobile ? 15 : isTablet ? 16 : 16,
    small: isMobile ? 12 : isTablet ? 12 : 13,
    label: isMobile ? 11 : isTablet ? 12 : 12,
    footer: isMobile ? 14 : isTablet ? 15 : 15,
  };

  return {
    width,
    height,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    cardWidth,
    cardPadding,
    formMaxWidth,
    horizontalPadding,
    fontSize,
  };
};