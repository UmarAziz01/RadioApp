import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Image,
  AppState,
  Animated as RNAnimated,
} from 'react-native';
// Audio playback pakai expo-audio (bukan expo-av).
// NOTE (config native untuk background audio yang sesungguhnya):
//   app.json -> ios.infoPlist.UIBackgroundModes: ["audio"]
import {
  createAudioPlayer,
  setAudioModeAsync,
  AudioPlayer,
} from 'expo-audio';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../utils/responsive';
import { useNavigation } from '../context/NavigationContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { 
  IconDashboard,
  IconPlay,
  IconPause,
  IconStop,
  IconSkipPrev,
  IconSkipNext,
  IconVolume,
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
  IconMixer,
  IconMoon,
  IconWave,
  IconFactory,
  IconCity,
  IconDiamond,
} from '../components/Icons';
import { 
  MainNavGroup, 
  InsightsNavGroup, 
  FooterNavGroup 
} from '../components/NavMenu';

// ─── Aset ikon radio (favicon dipakai sebagai logo/ikon radio di seluruh layar) ───
const RADIO_LOGO = require('../assets/favicon.png');

const RadioIcon = ({ size = 24, style, rounded = true }: { size?: number; style?: any; rounded?: boolean }) => (
  <Image
    source={RADIO_LOGO}
    resizeMode="contain"
    style={[
      { width: size, height: size, borderRadius: rounded ? size * 0.22 : 0 },
      style,
    ]}
  />
);

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

// ─── Data stasiun radio ───
const liveStations = [
  { id: '1', name: 'Cyber-Pulse FM', genre: 'Synthwave • Electronic', listeners: '12.4k', icon: 'IconMixer', status: 'live' },
  { id: '2', name: 'Neon Nights', genre: 'Synthwave • 2.1k', listeners: '2.1k', icon: 'IconCity', status: 'live' },
  { id: '3', name: 'Deep Ambient', genre: 'Chill • 1.4k', listeners: '1.4k', icon: 'IconWave', status: 'live' },
  { id: '4', name: 'Machine Grind', genre: 'Techno • 3.8k', listeners: '3.8k', icon: 'IconFactory', status: 'live' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// ─── COMPONENT UTAMA ───
const LiveScreen = () => {
  const { colors, isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activeScreen: activeNav, setActiveScreen: setActiveNav } = useNavigation();
  const [currentTime] = useState('03:42');

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

  // Player audio native (expo-audio) disimpan di ref supaya tetap hidup
  // lintas render dan bisa terus berputar di latar belakang / layar mati.
  const nativePlayerRef = useRef<AudioPlayer | null>(null);
  const nativeSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamUrl = 'https://pu.klikhost.com/proxy/suaramuslim/stream';

  // Konfigurasi audio session sekali di awal supaya siaran tetap jalan
  // walau app pindah ke latar belakang atau layar dikunci.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    }).catch((e) => console.error('Gagal mengatur audio mode:', e));
  }, []);

  // Beberapa OS mereset audio session saat app kembali aktif dari
  // background/lock screen — pasang ulang supaya tetap konsisten.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        }).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      } else {
        nativeSubscriptionRef.current?.remove();
        nativeSubscriptionRef.current = null;
        if (nativePlayerRef.current) {
          nativePlayerRef.current.pause();
          nativePlayerRef.current.remove();
          nativePlayerRef.current = null;
        }
      }
    };
  }, []);

  const playRadio = async () => {
    setIsLoading(true);

    if (Platform.OS === 'web') {
      try {
        const audio = new (window as any).Audio(streamUrl) as HTMLAudioElement;
        audioRef.current = audio;
        audio.addEventListener('playing', () => setIsLoading(false));
        audio.addEventListener('error', (e) => {
          console.error('Failed to play radio (web):', e);
          setIsLoading(false);
        });
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('Failed to play radio (web):', e);
        setIsLoading(false);
      }
      return;
    }

    try {
      const player = createAudioPlayer({ uri: streamUrl });
      nativePlayerRef.current = player;
      nativeSubscriptionRef.current = player.addListener('playbackStatusUpdate', (status) => {
        if (status.playing) {
          setIsPlaying(true);
          setIsLoading(false);
        }
      });
      player.play();
    } catch (e) {
      console.error('Failed to play radio:', e);
      setIsLoading(false);
    }
  };

  const stopRadio = async () => {
    if (Platform.OS === 'web') {
      try {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audioRef.current = null;
        }
        setIsPlaying(false);
      } catch (e) {
        console.error('Failed to stop radio (web):', e);
      }
      return;
    }

    try {
      nativeSubscriptionRef.current?.remove();
      nativeSubscriptionRef.current = null;
      if (nativePlayerRef.current) {
        nativePlayerRef.current.pause();
        nativePlayerRef.current.remove();
        nativePlayerRef.current = null;
      }
    } catch (e) {
      console.error('Failed to stop radio:', e);
    } finally {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const sidebarWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SIDEBAR_WIDTH],
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'IconMixer': return <IconMixer size={36} color={C.onSurface} />;
      case 'IconCity': return <IconCity size={36} color={C.onSurface} />;
      case 'IconWave': return <IconWave size={36} color={C.onSurface} />;
      case 'IconFactory': return <IconFactory size={36} color={C.onSurface} />;
      case 'IconDiamond': return <IconDiamond size={36} color={C.onSurface} />;
      default: return <RadioIcon size={36} />;
    }
  };

  // ─── RENDER ───
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* ─────── SIDEBAR ─────── */}
      <RNAnimated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <View style={styles.sidebarInner}>
          {/* Brand */}
          <View style={styles.sidebarHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <RadioIcon size={24} />
              </View>
              <Text style={styles.brandText}>SonicFlow</Text>
            </View>
          </View>

          {/* Navigation */}
          <MainNavGroup activeNav={activeNav} onNavChange={setActiveNav} />
          <InsightsNavGroup activeNav={activeNav} onNavChange={setActiveNav} />
          <FooterNavGroup activeNav={activeNav} onNavChange={setActiveNav} />
        </View>
      </RNAnimated.View>

      {/* ─────── MAIN CONTENT ─────── */}
      <View style={[styles.mainContent, !sidebarOpen && styles.mainContentFull]}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.navbarToggle} activeOpacity={0.7}>
            <IconMenu size={22} />
          </TouchableOpacity>

          <View style={styles.navbarCenter}>
            <Text style={styles.navbarTitle}>Live Stream</Text>
          </View>

          <View style={styles.navbarActions}>
            <TouchableOpacity style={styles.navbarBtn} activeOpacity={0.7}>
              <IconSearch />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navbarBtn} activeOpacity={0.7}>
              <IconSettings />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SA</Text>
            </View>
          </View>
        </View>

        {/* Page Content */}
        <ScrollView style={styles.pageContent} showsVerticalScrollIndicator={false}>
          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbItem}>Dashboard</Text>
            <Text style={styles.breadcrumbSep}>/</Text>
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Live Stream</Text>
          </View>

          {/* Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchField}>
              <IconSearch size={16} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search stations…"
                placeholderTextColor={C.textMuted}
              />
            </View>
          </View>

          {/* Hero / Now Playing */}
          <View style={styles.heroCard}>
            <View style={styles.heroBg} />
            <View style={styles.heroContent}>
              <View style={styles.heroLogoSection}>
                <View style={styles.heroLogoContainer}>
                  <View style={styles.heroGlow} />
                  <View style={styles.heroLogo}>
                    <RadioIcon size={104} style={styles.heroLogoImage} />
                  </View>
                </View>
              </View>

              <View style={styles.heroInfo}>
                <View style={styles.liveBadge}>
                  <IconLive />
                  <Text style={styles.liveBadgeText}>LIVE NOW</Text>
                </View>
                <Text style={styles.heroTitle}>Cyber-Pulse FM</Text>
                <Text style={styles.heroDesc}>
                  Broadcasting the future of ambient electronics and industrial techno.
                </Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <IconUsers />
                    <Text style={styles.heroStatText}>12.4k Listeners</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <IconSignal />
                    <Text style={styles.heroStatText}>320kbps High-Fi</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Live Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <RadioIcon size={22} rounded={false} />
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Live Stations</Text>
            </View>
            <View style={styles.statCard}>
              <IconUsers />
              <Text style={styles.statValue}>18.7k</Text>
              <Text style={styles.statLabel}>Total Listeners</Text>
            </View>
            <View style={styles.statCard}>
              <IconMic />
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Broadcasting</Text>
            </View>
          </View>

          {/* Live Stations */}
           <View style={styles.sectionHeader}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <IconLive size={20} color={C.secondaryContainer} />
               <Text style={styles.sectionTitle}>Live Now</Text>
             </View>
           </View>

          <View style={styles.stationGrid}>
            {liveStations.map((station) => (
              <TouchableOpacity key={station.id} style={styles.stationCard} activeOpacity={0.85}>
                <View style={styles.stationImage}>
                  {getIconComponent(station.icon)}
                  <View style={styles.stationOverlay}>
                    <IconPlay size={36} color={'#fff'} />
                  </View>
                </View>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
                <Text style={styles.stationGenre}>{station.genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ─────── BOTTOM PLAYER ─────── */}
      <View style={styles.bottomPlayer}>
        <View style={styles.playerLeft}>
          <View style={styles.playerArt}>
            <RadioIcon size={32} />
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTrack}>Cyber-Pulse Live</Text>
            <Text style={styles.playerArtist}>Delta Frequency - Interstellar Mix</Text>
          </View>
          <TouchableOpacity style={styles.playerHeart} activeOpacity={0.7}>
            <IconHeart />
          </TouchableOpacity>
        </View>

        <View style={styles.playerCenter}>
          <View style={styles.playerControls}>
            <TouchableOpacity activeOpacity={0.7}>
              <IconSkipPrev />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={isPlaying ? stopRadio : playRadio}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <IconSkipNext />
            </TouchableOpacity>
            <TouchableOpacity onPress={stopRadio} activeOpacity={0.7}>
              <IconStop />
            </TouchableOpacity>
          </View>
          <View style={styles.playerProgress}>
            <Text style={styles.progressTime}>{currentTime}</Text>
            <View style={styles.progressTrackSmall}>
              <View style={[styles.progressBarSmall, { width: '45%' }]} />
            </View>
            <Text style={styles.progressTime}>{isLoading ? 'BUFFERING' : 'LIVE'}</Text>
          </View>
        </View>

        <View style={styles.playerRight}>
          <IconVolume />
          <View style={styles.volumeTrack}>
            <View style={[styles.volumeBar, { width: '70%' }]} />
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <IconQueue />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <IconSignal />
          </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: 'rgba(0,219,233,0.25)',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.primary,
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

  searchSection: {
    marginBottom: 24,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.onSurface,
    paddingVertical: 0,
  },

  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 240,
    backgroundColor: C.glassBg,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  heroBg: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(0,219,233,0.04)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
    gap: 32,
  },
  heroLogoSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoContainer: {
    position: 'relative',
    width: 180,
    height: 180,
  },
  heroGlow: {
    ...(StyleSheet.absoluteFill as object),
    borderRadius: 180,
    backgroundColor: 'rgba(0,219,233,0.15)',
    transform: [{ scale: 1.3 }],
  },
  heroLogo: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  heroLogoImage: {
    borderRadius: 20,
  },
  heroInfo: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,179,178,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,178,0.3)',
    marginBottom: 16,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: C.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 24,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 16,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.glassBg,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroStatText: {
    fontSize: 12,
    fontWeight: '500',
    color: C.onSurfaceVariant,
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
  stationOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.secondaryContainer,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.secondaryContainer,
    letterSpacing: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
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
    overflow: 'hidden',
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
    maxWidth: 560,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  playerProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  progressTime: {
    fontSize: 11,
    color: C.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressTrackSmall: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarSmall: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 4,
  },
  playerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 260,
    justifyContent: 'flex-end',
  },
  volumeTrack: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    backgroundColor: C.onSurfaceVariant,
    borderRadius: 4,
  },
});

export default LiveScreen;