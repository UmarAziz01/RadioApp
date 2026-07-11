import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Animated as RNAnimated,
} from 'react-native';
import { 
  IconPlay,
  IconPause,
  IconSearch,
  IconHeart,
  IconSettings,
  IconUsers,
  IconSignal,
  IconMic,
  IconHeadphones,
  IconMenu,
  IconClock,
} from '../components/Icons';
import { 
  MainNavGroup, 
  InsightsNavGroup, 
  FooterNavGroup 
} from '../components/NavMenu';
import { useTheme } from '../theme/ThemeContext';
import { ScreenKey } from '../context/NavigationContext';

// ─── Warna ───
const C = {
  bg: '#0F1115',
  surface: '#1A1D23',
  surfaceHigh: '#282a2e',
  surfaceContainer: '#1A1D23',
  primary: '#00dbe9',
  onPrimary: '#00363a',
  primaryContainer: '#00f0ff',
  onPrimaryContainer: '#006970',
  secondary: '#ffb3b2',
  secondaryContainer: '#ff525c',
  error: '#ffb4ab',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  textMuted: '#849495',
  border: 'rgba(255,255,255,0.08)',
  glassBg: 'rgba(26, 29, 35, 0.7)',
};

// ─── Data library ───
const libraryItems = [
  { id: '1', title: 'Midnight Synthwave Mix', artist: 'Cyber Pulse', duration: '1:24:30', plays: '45.2k', image: '🎹', type: 'playlist' },
  { id: '2', title: 'Ambient Dreams Collection', artist: 'Deep Space', duration: '2:15:00', plays: '32.1k', image: '🌌', type: 'playlist' },
  { id: '3', title: 'Techno Bunker Sessions', artist: 'Machine Grind', duration: '0:58:45', plays: '28.9k', image: '🏭', type: 'playlist' },
  { id: '4', title: 'Chill Waves Vol. 3', artist: 'Ocean Drift', duration: '1:45:20', plays: '22.4k', image: '🌊', type: 'playlist' },
  { id: '5', title: 'Neon City Lights', artist: 'NightRunner', duration: '1:12:00', plays: '18.7k', image: '🌃', type: 'album' },
  { id: '6', title: 'Experimental Frequencies', artist: 'Glitch Core', duration: '0:45:30', plays: '15.2k', image: '💠', type: 'album' },
];

const recentPlays = [
  { id: '1', title: 'Interstellar Drive', artist: 'Delta Frequency', time: '2 min ago' },
  { id: '2', title: 'Neon Highway', artist: 'Synthwave Riders', time: '15 min ago' },
  { id: '3', title: 'Deep Sea Ambience', artist: 'Ocean Sounds', time: '32 min ago' },
  { id: '4', title: 'Industrial Dawn', artist: 'Machine Soul', time: '1 hour ago' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// ─── COMPONENT UTAMA ───
const LibraryScreen = () => {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<ScreenKey>('library');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Animasi sidebar
  const sidebarAnim = useRef(new RNAnimated.Value(1)).current;
  const toggleSidebar = useCallback(() => {
    const toValue = sidebarOpen ? 0 : 1;
    RNAnimated.timing(sidebarAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, sidebarAnim]);

  const sidebarWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SIDEBAR_WIDTH],
  });

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  // ─── RENDER ───
  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* ─────── SIDEBAR ─────── */}
      <RNAnimated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <View style={styles.sidebarInner}>
          <View style={styles.sidebarHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Text style={{ fontSize: 24 }}>📻</Text>
              </View>
              <Text style={styles.brandText}>SonicFlow</Text>
            </View>
          </View>

          <MainNavGroup activeNav={activeNav} onNavChange={setActiveNav} />
          <InsightsNavGroup activeNav={activeNav} onNavChange={setActiveNav} />
          <FooterNavGroup activeNav={activeNav} onNavChange={setActiveNav} />
        </View>
      </RNAnimated.View>

      {/* ─────── MAIN CONTENT ─────── */}
      <View style={[styles.mainContent, !sidebarOpen && styles.mainContentFull]}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.navbarToggle}>
            <IconMenu size={22} />
          </TouchableOpacity>

          <View style={styles.navbarCenter}>
            <Text style={styles.navbarTitle}>Library</Text>
          </View>

          <View style={styles.navbarActions}>
            <TouchableOpacity style={styles.navbarBtn}>
              <IconSearch />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navbarBtn}>
              <IconSettings />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SA</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.pageContent} showsVerticalScrollIndicator={false}>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbItem}>Dashboard</Text>
            <Text style={styles.breadcrumbSep}>/</Text>
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Library</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <IconHeadphones />
              <Text style={styles.statValue}>128</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
            <View style={styles.statCard}>
              <IconMic />
              <Text style={styles.statValue}>64</Text>
              <Text style={styles.statLabel}>Albums</Text>
            </View>
            <View style={styles.statCard}>
              <IconClock />
              <Text style={styles.statValue}>48h</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
          </View>

          <View style={styles.recentList}>
            {recentPlays.map((item) => (
              <TouchableOpacity key={item.id} style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Text style={{ fontSize: 20 }}>🎵</Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle}>{item.title}</Text>
                  <Text style={styles.recentArtist}>{item.artist}</Text>
                </View>
                <Text style={styles.recentTime}>{item.time}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Library Content */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Playlists & Albums</Text>
          </View>

          <View style={styles.stationGrid}>
            {libraryItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.stationCard}
                onPress={() => togglePlay(item.id)}
              >
                <View style={styles.stationImage}>
                  <Text style={styles.stationEmoji}>{item.image}</Text>
                  <View style={styles.stationOverlay}>
                    {playingId === item.id ? <IconPause /> : <IconPlay />}
                  </View>
                </View>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.stationName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.stationGenre}>{item.artist}</Text>
                <View style={styles.cardStats}>
                  <Text style={styles.cardStatText}>▶ {item.plays}</Text>
                  <Text style={styles.cardStatText}>⏱ {item.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ─────── BOTTOM PLAYER ─────── */}
      <View style={styles.bottomPlayer}>
        <View style={styles.playerLeft}>
          <View style={styles.playerArt}>
            <Text style={styles.playerArtText}>🎵</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTrack}>Select a track</Text>
            <Text style={styles.playerArtist}>Choose from your library</Text>
          </View>
          <TouchableOpacity style={styles.playerHeart}>
            <IconHeart />
          </TouchableOpacity>
        </View>

        <View style={styles.playerCenter}>
          <View style={styles.playerControls}>
            <TouchableOpacity>
              <Text style={styles.skipText}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playBtn}>
              <IconPlay />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.skipText}>⏭</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.playerRight}>
          <Text style={styles.playerTime}>--:--</Text>
        </View>
      </View>
    </View>
  );
};

// ─── STYLES ───
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    flexDirection: 'row',
  },

  sidebar: {
    backgroundColor: C.surfaceContainer,
    borderRightWidth: 1,
    borderRightColor: C.border,
    overflow: 'hidden',
  },
  sidebarInner: {
    flex: 1,
    paddingTop: 20,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,219,233,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.primary,
  },
  sidebarSearch: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchPlaceholder: {
    color: C.textMuted,
    fontSize: 13,
    flex: 1,
  },

  mainContent: {
    flex: 1,
    marginLeft: 0,
  },
  mainContentFull: {
    marginLeft: 0,
  },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
    backgroundColor: 'rgba(15,17,21,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navbarToggle: {
    padding: 8,
    marginLeft: -8,
  },
  navbarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
  },
  navbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navbarBtn: {
    padding: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,219,233,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,219,233,0.3)',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
  },

  pageContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 140,
  },

  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  breadcrumbItem: {
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  breadcrumbSep: {
    fontSize: 13,
    color: C.textMuted,
  },
  breadcrumbActive: {
    color: C.primary,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: C.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: C.onSurface,
  },

  recentList: {
    backgroundColor: C.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  recentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurface,
  },
  recentArtist: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  recentTime: {
    fontSize: 11,
    color: C.textMuted,
  },

  stationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  stationCard: {
    width: (SCREEN_WIDTH - 64 - 48) / 4 - 6,
    minWidth: 140,
    flex: 1,
    backgroundColor: C.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  stationImage: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationEmoji: {
    fontSize: 36,
  },
  stationOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  cardBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,219,233,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.primary,
    textTransform: 'uppercase',
  },
  stationName: {
    fontSize: 13,
    fontWeight: '500',
    color: C.onSurface,
    marginBottom: 2,
  },
  stationGenre: {
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardStatText: {
    fontSize: 10,
    color: C.textMuted,
  },

  bottomPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(40,42,46,0.85)',
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 280,
  },
  playerArt: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerArtText: {
    fontSize: 28,
  },
  playerInfo: {
    flex: 1,
  },
  playerTrack: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
  },
  playerArtist: {
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  playerHeart: {
    padding: 6,
  },
  playerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  skipText: {
    fontSize: 20,
    color: C.onSurfaceVariant,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  playerTime: {
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
});

export default LibraryScreen;