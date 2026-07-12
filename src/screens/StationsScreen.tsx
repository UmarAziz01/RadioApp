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
  IconRadio,
  IconUsers,
  IconSignal,
  IconMenu,
  IconPlus,
  IconFilter,
  IconMixer,
  IconMoon,
  IconWave,
  IconFactory,
  IconDiamond,
  IconRoad,
  IconSkipPrev,
  IconSkipNext,
  IconStop,
  IconGlobe,
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

// ─── Data stasiun radio ───
const stations = [
  { id: '1', name: 'Cyber-Pulse FM', genre: 'Synthwave • Electronic', listeners: '12.4k', icon: 'IconMixer', status: 'live' },
  { id: '2', name: 'Neon Nights', genre: 'Synthwave • 2.1k', listeners: '2.1k', icon: 'IconMoon', status: 'live' },
  { id: '3', name: 'Deep Ambient', genre: 'Chill • 1.4k', listeners: '1.4k', icon: 'IconWave', status: 'live' },
  { id: '4', name: 'Machine Grind', genre: 'Techno • 3.8k', listeners: '3.8k', icon: 'IconFactory', status: 'live' },
  { id: '5', name: 'Silent Space', genre: 'Downtempo • 940', listeners: '940', icon: 'IconDiamond', status: 'offline' },
  { id: '6', name: 'Glitch Core', genre: 'Experimental • 1.1k', listeners: '1.1k', icon: 'IconDiamond', status: 'live' },
  { id: '7', name: 'Neon Highway', genre: 'Synthwave • 890', listeners: '890', icon: 'IconRoad', status: 'live' },
  { id: '8', name: 'Ocean Drift', genre: 'Chill • 780', listeners: '780', icon: 'IconWave', status: 'live' },
];

const genres = ['All', 'Synthwave', 'Techno', 'Chill', 'Ambient', 'Experimental'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// ─── COMPONENT ───
const StationsScreen = () => {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<ScreenKey>('stations');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState('All');

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

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'IconMixer': return <IconMixer size={36} color={C.onSurface} />;
      case 'IconMoon': return <IconMoon size={36} color={C.onSurface} />;
      case 'IconWave': return <IconWave size={36} color={C.onSurface} />;
      case 'IconFactory': return <IconFactory size={36} color={C.onSurface} />;
      case 'IconDiamond': return <IconDiamond size={36} color={C.onSurface} />;
      case 'IconRoad': return <IconRoad size={36} color={C.onSurface} />;
      case 'IconGlobe': return <IconGlobe size={36} color={C.onSurface} />;
      default: return <IconRadio size={36} color={C.onSurface} />;
    }
  };

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  const filteredStations = selectedGenre === 'All' 
    ? stations 
    : stations.filter(s => s.genre.includes(selectedGenre));

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
                <IconRadio size={24} color={C.primary} />
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
            <Text style={styles.navbarTitle}>Stations</Text>
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
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Stations</Text>
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

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <IconRadio />
              <Text style={styles.statValue}>59</Text>
              <Text style={styles.statLabel}>Total Stations</Text>
            </View>
            <View style={styles.statCard}>
              <IconUsers />
              <Text style={styles.statValue}>4,732</Text>
              <Text style={styles.statLabel}>Active Listeners</Text>
            </View>
            <View style={styles.statCard}>
              <IconSignal />
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Live Now</Text>
            </View>
          </View>

          {/* Genre Filters */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Genres</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.genreTags}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreTag,
                      selectedGenre === genre && styles.genreTagActive,
                    ]}
                    onPress={() => setSelectedGenre(genre)}
                  >
                    <Text style={[
                      styles.genreTagText,
                      selectedGenre === genre && styles.genreTagTextActive,
                    ]}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Add Station Button */}
          <TouchableOpacity style={styles.addStationBtn}>
            <IconPlus />
            <Text style={styles.addStationText}>Add New Station</Text>
          </TouchableOpacity>

          {/* Stations Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedGenre === 'All' ? 'All Stations' : `${selectedGenre} Stations`}
            </Text>
            <TouchableOpacity style={styles.filterBtn}>
              <IconFilter />
              <Text style={styles.filterBtnText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stationGrid}>
            {filteredStations.map((station) => (
              <TouchableOpacity 
                key={station.id} 
                style={styles.stationCard}
                onPress={() => togglePlay(station.id)}
              >
                <View style={styles.stationImage}>
                  {getIconComponent(station.icon)}
                  <View style={styles.stationOverlay}>
                    {playingId === station.id ? <IconPause size={36} color={'#fff'} /> : <IconPlay size={36} color={'#fff'} />}
                  </View>
                  {station.status === 'live' && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
                <Text style={styles.stationGenre}>{station.genre}</Text>
                <View style={styles.stationStats}>
                  <IconUsers />
                  <Text style={styles.stationListenerText}>{station.listeners}</Text>
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
            <IconRadio size={28} color={C.primary} />
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTrack}>Select a station</Text>
            <Text style={styles.playerArtist}>Choose from stations</Text>
          </View>
          <TouchableOpacity style={styles.playerHeart}>
            <IconHeart />
          </TouchableOpacity>
        </View>

        <View style={styles.playerCenter}>
          <View style={styles.playerControls}>
            <TouchableOpacity>
              <IconSkipPrev size={24} color={C.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playBtn}>
              {playingId ? <IconPause size={30} color={C.onPrimary} /> : <IconPlay size={30} color={C.onPrimary} />}
            </TouchableOpacity>
            <TouchableOpacity>
              <IconSkipNext size={24} color={C.onSurfaceVariant} />
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

  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 12,
  },
  genreTags: {
    flexDirection: 'row',
    gap: 8,
  },
  genreTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: C.border,
  },
  genreTagActive: {
    backgroundColor: 'rgba(0,219,233,0.15)',
    borderColor: C.primary,
  },
  genreTagText: {
    fontSize: 13,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  genreTagTextActive: {
    color: C.primary,
  },

  addStationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0,219,233,0.1)',
    borderWidth: 1,
    borderColor: C.primary,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addStationText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
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
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterBtnText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
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
  liveBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,82,82,0.9)',
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
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
  stationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  stationListenerText: {
    fontSize: 11,
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

export default StationsScreen;