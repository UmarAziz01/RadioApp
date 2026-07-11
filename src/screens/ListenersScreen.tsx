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
  IconSearch,
  IconSettings,
  IconUsers,
  IconMenu,
  IconClock,
  IconGlobe,
  IconDevice,
  IconHeart,
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

// ─── Data listeners ───
const listeners = [
  { id: '1', name: 'Alex Rivera', location: 'Los Angeles, US', device: 'Web', duration: '2h 15m', favorite: 'Cyber-Pulse FM', status: 'online', avatar: '👨‍💻' },
  { id: '2', name: 'Maya Chen', location: 'Tokyo, JP', device: 'iOS', duration: '45m', favorite: 'Neon Nights', status: 'online', avatar: '👩‍🎨' },
  { id: '3', name: 'Jordan Smith', location: 'London, UK', device: 'Android', duration: '1h 30m', favorite: 'Deep Ambient', status: 'online', avatar: '🧑‍💼' },
  { id: '4', name: 'Sofia Garcia', location: 'Madrid, ES', device: 'Web', duration: '3h 20m', favorite: 'Machine Grind', status: 'offline', avatar: '👩‍🔬' },
  { id: '5', name: 'Kai Tanaka', location: 'Seoul, KR', device: 'iOS', duration: '55m', favorite: 'Glitch Core', status: 'online', avatar: '👨‍🎤' },
  { id: '6', name: 'Emma Wilson', location: 'Sydney, AU', device: 'Web', duration: '2h', favorite: 'Silent Space', status: 'offline', avatar: '👩‍🏫' },
  { id: '7', name: 'Lucas Martinez', location: 'São Paulo, BR', device: 'Android', duration: '1h 10m', favorite: 'Ocean Drift', status: 'online', avatar: '👨‍🚀' },
  { id: '8', name: 'Aria Patel', location: 'Mumbai, IN', device: 'iOS', duration: '40m', favorite: 'Neon Highway', status: 'online', avatar: '👩‍💼' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// ─── COMPONENT ───
const ListenersScreen = () => {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<ScreenKey>('listeners');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredListeners = listeners.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = listeners.filter(l => l.status === 'online').length;

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
            <Text style={styles.navbarTitle}>Listeners</Text>
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
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Listeners</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <IconUsers />
              <Text style={styles.statValue}>{listeners.length}</Text>
              <Text style={styles.statLabel}>Total Listeners</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={{ fontSize: 24 }}>🟢</Text>
              <Text style={styles.statValue}>{onlineCount}</Text>
              <Text style={styles.statLabel}>Online Now</Text>
            </View>
            <View style={styles.statCard}>
              <IconClock />
              <Text style={styles.statValue}>4,250</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statCard}>
              <IconHeart />
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Return Rate</Text>
            </View>
          </View>

          {/* Search & Filter */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchInput}>
              <IconSearch />
              <Text style={styles.searchInputText}>Search by name or location…</Text>
            </View>
          </View>

          {/* Listeners Table */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Listeners</Text>
            <Text style={styles.sectionSubtitle}>{onlineCount} online</Text>
          </View>

          <View style={styles.listenersTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colUser]}>User</Text>
              <Text style={[styles.tableHeaderText, styles.colLocation]}>Location</Text>
              <Text style={[styles.tableHeaderText, styles.colDevice]}>Device</Text>
              <Text style={[styles.tableHeaderText, styles.colDuration]}>Duration</Text>
              <Text style={[styles.tableHeaderText, styles.colFavorite]}>Favorite</Text>
              <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
            </View>

            {filteredListeners.map((listener) => (
              <View key={listener.id} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.colUser]}>
                  <View style={styles.userCell}>
                    <Text style={styles.userAvatar}>{listener.avatar}</Text>
                    <Text style={styles.userName}>{listener.name}</Text>
                  </View>
                </View>
                <View style={[styles.tableCell, styles.colLocation]}>
                  <View style={styles.locationCell}>
                    <IconGlobe size={14} />
                    <Text style={styles.locationText}>{listener.location}</Text>
                  </View>
                </View>
                <View style={[styles.tableCell, styles.colDevice]}>
                  <View style={styles.deviceBadge}>
                    <IconDevice size={12} />
                    <Text style={styles.deviceText}>{listener.device}</Text>
                  </View>
                </View>
                <View style={[styles.tableCell, styles.colDuration]}>
                  <Text style={styles.durationText}>{listener.duration}</Text>
                </View>
                <View style={[styles.tableCell, styles.colFavorite]}>
                  <Text style={styles.favoriteText} numberOfLines={1}>{listener.favorite}</Text>
                </View>
                <View style={[styles.tableCell, styles.colStatus]}>
                  <View style={[
                    styles.statusBadge,
                    listener.status === 'online' && styles.statusOnline
                  ]}>
                    <View style={[
                      styles.statusDot,
                      listener.status === 'online' && styles.statusDotOnline
                    ]} />
                    <Text style={[
                      styles.statusText,
                      listener.status === 'online' && styles.statusTextOnline
                    ]}>
                      {listener.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ─────── BOTTOM PLAYER ─────── */}
      <View style={styles.bottomPlayer}>
        <View style={styles.playerLeft}>
          <View style={styles.playerArt}>
            <Text style={styles.playerArtText}>🎧</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTrack}>Listener Activity</Text>
            <Text style={styles.playerArtist}>Real-time monitoring</Text>
          </View>
        </View>

        <View style={styles.playerCenter}>
          <View style={styles.playerStats}>
            <View style={styles.playerStat}>
              <Text style={styles.playerStatValue}>{onlineCount}</Text>
              <Text style={styles.playerStatLabel}>Online</Text>
            </View>
          </View>
        </View>

        <View style={styles.playerRight}>
          <Text style={styles.playerTime}>Live</Text>
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

  searchFilterRow: {
    marginBottom: 24,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputText: {
    flex: 1,
    fontSize: 14,
    color: C.textMuted,
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
  sectionSubtitle: {
    fontSize: 14,
    color: C.textMuted,
  },

  listenersTable: {
    backgroundColor: C.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    alignItems: 'center',
  },
  tableCell: {
    paddingRight: 12,
  },
  colUser: {
    flex: 2,
  },
  colLocation: {
    flex: 2,
  },
  colDevice: {
    width: 80,
  },
  colDuration: {
    width: 80,
  },
  colFavorite: {
    flex: 1.5,
  },
  colStatus: {
    width: 80,
  },
  userCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    fontSize: 24,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurface,
  },
  locationCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  deviceText: {
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  durationText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  favoriteText: {
    fontSize: 12,
    color: C.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(132,148,149,0.15)',
  },
  statusOnline: {
    backgroundColor: 'rgba(0,219,233,0.15)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.textMuted,
  },
  statusDotOnline: {
    backgroundColor: C.primary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'capitalize',
  },
  statusTextOnline: {
    color: C.primary,
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
  playerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 32,
  },
  playerStat: {
    alignItems: 'center',
  },
  playerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.primary,
  },
  playerStatLabel: {
    fontSize: 11,
    color: C.textMuted,
  },
  playerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  playerTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default ListenersScreen;