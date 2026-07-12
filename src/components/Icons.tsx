import React from 'react';
import Svg, { Path, Circle, Rect, G, Line, Polygon, Ellipse, Polyline } from 'react-native-svg';

// Base icon component that applies --illus-accent color
// The color can be overridden via the color prop
interface BaseIconProps {
  size?: number;
  color?: string;
  style?: object;
}

// SVG icons shaded from a single accent color
// Users can customize the color by passing the color prop

export const IconDashboard = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconRadio = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconPlay = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polygon points="5,3 19,12 5,21" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);

export const IconPause = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="5" y="3" width="4" height="18" rx="1" fill={color} stroke={color} strokeWidth="2" />
    <Rect x="15" y="3" width="4" height="18" rx="1" fill={color} stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconStop = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="4" y="4" width="16" height="16" rx="2" fill={color} stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconSkipPrev = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polygon points="11,5 4,12 11,19" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Rect x="4" y="4" width="3" height="16" rx="1" fill={color} stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconSkipNext = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polygon points="13,5 20,12 13,19" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Rect x="17" y="4" width="3" height="16" rx="1" fill={color} stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconVolume = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconVolumeX = ({ size = 20, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Line x1="23" y1="9" x2="17" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="17" y1="9" x2="23" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconSearch = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="11" cy="11" r="6" stroke={color} strokeWidth="2" />
    <Line x1="15" y1="15" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconHeart = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
      fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);

export const IconSettings = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" 
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconQueue = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconUsers = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="19" cy="7" r="3" stroke={color} strokeWidth="2" />
    <Path d="M21 21v-2a3 3 0 0 0-2-2.83" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconSignal = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M2 20h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 20v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 20v-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 20V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 16v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconMic = ({ size = 20, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={color} stroke={color} strokeWidth="2" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="19" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="23" x2="16" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconHeadphones = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" 
      stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconLogout = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconLive = ({ size = 12, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="10" fill={color} />
  </Svg>
);

// Additional utility icons
export const IconMenu = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconChevronRight = ({ size = 16, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polyline points="9,5 15,12 9,19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconClock = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Polyline points="12,6 12,12 16,14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconMusic = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M9 18V5l12-2v13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconDownload = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="7,10 12,15 17,10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconTrash = ({ size = 20, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconShare = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2" />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconPlus = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconFilter = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconGlobe = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconDevice = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconTrendingUp = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="17,6 23,6 23,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconTrendingDown = ({ size = 20, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polyline points="23,18 13.5,8.5 8.5,13.5 1,6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="17,18 23,18 23,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconMoreVertical = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="5" r="1.5" fill={color} />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Circle cx="12" cy="19" r="1.5" fill={color} />
  </Svg>
);

export const IconEdit = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconGear = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33A1.65 1.65 0 0 0 15 19.4V21a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1.6a1.65 1.65 0 0 0-1.51-1.51A1.65 1.65 0 0 0 5.6 15l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 4.6 9H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33A1.65 1.65 0 0 0 9 4.6V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.6a1.65 1.65 0 0 0 .33 1.82z" stroke={color} strokeWidth="2" />
    <Path d="M12 15.5a3.5 3.5 0 1 0 0-7" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82l.06-.06a2 2 0 0 1 2.83-2.83l-.06.06a1.65 1.65 0 0 0-1.82.33A1.65 1.65 0 0 0 15 4.6V3a2 2 0 0 1-2-2h-2a2 2 0 0 1-2 2v1.6a1.65 1.65 0 0 0-1.51 1.51A1.65 1.65 0 0 0 5.6 9l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 4.6 3H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82-.33A1.65 1.65 0 0 0 9-4.6V3a2 2 0 0 1-2-2h-2a2 2 0 0 1-2-2v1.6a1.65" stroke={color} strokeWidth="2" />
    <Path d="M12-4.6V3a2 2 0 0 1-2-2h-2a2 2 0 0 1-2-2v1.6a1.65 1.65 0 0 0-1.51 1.51A1.65 1.65 0 0 0 5.6 9l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 4.6 3H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0_ 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82-.33A1.65 1.65 0 0 0 9-4.6V3a2 2 0 0 1-2-2h-2a2 2 0 0 1-2-2v1.6a1.65" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconDashboard1 = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M3 12h4l3-8v16l-3-8H3zM17 12h4l-3-8v16l3-8h-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconClose = ({ size = 20, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconTrash2 = ({ size = 20, color = 'var(--illus-accent, #ff525c)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M3 6h18M9 6v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);IconPause

export const IconMoon = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconWave = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 6 8 6c1.3 0 2.5 1 3.8 1 1.2 0 2.4-1 3.7-1 1.3 0 2.5 1 3.8 1 1.2 0 2.4-1 3.7-1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 3.5-1 1.3 0 2.5 1 3.8 1 1.2 0 2.4-1 3.7-1 1.3 0 2.5 1 3.8 1 1.2 0 2.4-1 3.7-1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 3.5-1 1.3 0 2.5 1 3.8 1 1.2 0 2.4-1 3.7-1 1.3 0 2.5 1 3.8 1 1.2 0 2.4-1 3.7-1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconFactory = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H2v18z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconDiamond = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M12 2l9 7-9 13-9-13 9-7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 9h20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 22V9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconCalendar = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconRoad = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
  </Svg>
);

export const IconUser = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

export const IconCheck = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconOnline = ({ size = 12, color = '#10b981', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="10" fill={color} />
  </Svg>
);

export const IconMixer = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Line x1="4" y1="21" x2="4" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="10" x2="4" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="21" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="8" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="20" y1="21" x2="20" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="20" y1="12" x2="20" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="1" y1="14" x2="7" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="9" y1="8" x2="15" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="17" y1="16" x2="23" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconChart = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconCity = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M3 21h18M3 10h18M3 3h18M3 14h18M3 17h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 21V10M9 21V14M12 21V17M15 21V10M18 21V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IconKeyboard = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="2" y="5" width="20" height="14" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="6" y1="9" x2="6.01" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="10" y1="9" x2="10.01" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="14" y1="9" x2="14.01" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="18" y1="9" x2="18.01" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="6" y1="13" x2="6.01" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="10" y1="13" x2="10.01" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="14" y1="13" x2="14.01" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="18" y1="13" x2="18.01" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const IconStar = ({ size = 20, color = 'var(--illus-accent, #00dbe9)', style }: BaseIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);






// Export all icons as default
export default {
  IconDashboard,
  IconRadio,
  IconPlay,
  IconPause,
  IconStop,
  IconSkipPrev,
  IconSkipNext,
  IconVolume,
  IconVolumeX,
  IconSearch,
  IconHeart,
  IconSettings,
  IconQueue,
  IconUsers,
  IconSignal,
  IconMic,
  IconHeadphones,
  IconLogout,
  IconLive,
  IconMenu,
  IconChevronRight,
  IconClock,
  IconMusic,
  IconDownload,
  IconTrash,
  IconShare,
  IconPlus,
  IconFilter,
  IconGlobe,
  IconDevice,
  IconTrendingUp,
  IconTrendingDown,
  IconMoreVertical,
  IconEdit,
  IconClose,
  IconTrash2,
  IconMoon,
  IconWave,
  IconFactory,
  IconDiamond,
  IconCalendar,
  IconRoad,
  IconUser,
  IconCheck,
  IconOnline,
  IconMixer,
  IconChart,
};
