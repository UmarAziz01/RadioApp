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
  useWindowDimensions,
} from 'react-native';
import { 
  IconSearch,
  IconSettings,
  IconMenu,
  IconUsers,
  IconClock,
  IconHeart,
  IconSignal,
  IconTrendingUp,
  IconTrendingDown,
  IconRadio,
  IconChart,
  IconMixer,
  IconMoon,
  IconWave,
  IconFactory,
  IconDiamond,
} from '../components/Icons';
import { 
  MainNavGroup, 
  InsightsNavGroup, 
  FooterNavGroup 
} from '../components/NavMenu';
import { useTheme } from '../theme/ThemeContext';
import { ScreenKey } from '../context/NavigationContext';

// ─── Constants ───
const BREAKPOINT_TABLET = 600;
const BREAKPOINT_DESKTOP = 1024;

// ─── Warna ───
const C = {
  bg: '#0F1115',
  surface: '#1A1D23',
  surfaceHigh: '#282a2e',
  surfaceContainer: '#1A1D23',
  primary: '#00dbe9',
  muted: '#849495',
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

// ─── Data analytics ───
const weeklyData = [
  { day: 'Mon', listeners: 1240, hours: 3200 },
  { day: 'Tue', listeners: 1380, hours: 3500 },
  { day: 'Wed', listeners: 1520, hours: 3800 },
  { day: 'Thu', listeners: 1490, hours: 3650 },
  { day: 'Fri', listeners: 1680, hours: 4200 },
  { day: 'Sat', listeners: 1890, hours: 4800 },
  { day: 'Sun', listeners: 1720, hours: 4400 },
];

const topStations = [
  { id: '1', name: 'Cyber-Pulse FM', listeners: '12.4k', growth: '+12%', icon: 'IconMixer' },
  { id: '2', name: 'Neon Nights', listeners: '8.2k', growth: '+8%', icon: 'IconMoon' },
  { id: '3', name: 'Deep Ambient', listeners: '6.1k', growth: '+5%', icon: 'IconWave' },
  { id: '4', name: 'Machine Grind', listeners: '5.4k', growth: '-2%', icon: 'IconFactory' },
  { id: '5', name: 'Glitch Core', listeners: '4.2k', growth: '+15%', icon: 'IconDiamond' },
];

const timeRanges = ['Today', 'Yesterday', 'This Week', 'This Month', 'This Year'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

const AnalyticsScreen = () => {
  const { colors } = useTheme();
  const { width: winWidth } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRange, setSelectedRange] = useState('This Week');

  const isDesktop = winWidth >= BREAKPOINT_DESKTOP;
  const isTablet = winWidth >= BREAKPOINT_TABLET && winWidth < BREAKPOINT_DESKTOP;

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'IconMixer': return <IconMixer size={24} color={C.onSurface} />;
      case 'IconMoon': return <IconMoon size={24} color={C.onSurface} />;
      case 'IconWave': return <IconWave size={24} color={C.onSurface} />;
      case 'IconFactory': return <IconFactory size={24} color={C.onSurface} />;
      case 'IconDiamond': return <IconDiamond size={24} color={C.onSurface} />;
      default: return null;
    }
  };

  const maxListeners = Math.max(...weeklyData.map(d => d.listeners));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Sidebar */}
      <View style={[styles.sidebar, { width: sidebarOpen ? SIDEBAR_WIDTH : 0, display: sidebarOpen ? 'flex' : 'none' }]}>
        <View style={styles.sidebarInner}>
          <View style={styles.sidebarHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <IconRadio size={24} color={C.primary} />
              </View>
              <Text style={styles.brandText}>Suara Muslim</Text>
            </View>
          </View>

          <View style={styles.sidebarSearch}>
            <View style={styles.searchRow}>
              <IconSearch size={16} color={C.textMuted} />
              <TextInput 
                style={styles.searchPlaceholder} 
                placeholder="Search insights..." 
                placeholderTextColor={C.textMuted}
              />
            </View>
          </View>

          <MainNavGroup />
          <InsightsNavGroup />
          <FooterNavGroup />
        </View>
      </View>

      {/* Main Content */}
      <View style={[styles.mainContent, !sidebarOpen && styles.mainContentFull]}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.navbarToggle}>
            <IconMenu size={22} color={C.onSurface} />
          </TouchableOpacity>

          <View style={styles.navbarCenter}>
            <Text style={[styles.navbarTitle, { color: colors.primary }]}>Analytics</Text>
          </View>

          <View style={styles.navbarActions}>
            <TouchableOpacity style={styles.navbarBtn}>
              <IconSearch size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navbarBtn}>
              <IconSettings size={20} color={C.onSurfaceVariant} />
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
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Analytics</Text>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeRow}>
            <Text style={[styles.timeRangeLabel, { color: C.onSurface }]}>Time Range:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.timeRangeTags}>
                {timeRanges.map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.timeRangeTag,
                      selectedRange === range && styles.timeRangeTagActive,
                    ]}
                    onPress={() => setSelectedRange(range)}
                  >
                    <Text style={[
                      styles.timeRangeTagText,
                      selectedRange === range && styles.timeRangeTagTextActive,
                    ]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: C.border }]}>
              <View style={styles.statHeader}>
                <IconUsers size={20} color={colors.primary} />
                <View style={styles.statTrend}>
                  <IconTrendingUp size={14} color={C.primary} />
                  <Text style={styles.statTrendText}>+12%</Text>
                </View>
              </View>
              <Text style={[styles.statValue, { color: C.onSurface }]}>10,920</Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>Total Listeners</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: C.border }]}>
              <View style={styles.statHeader}>
                <IconClock size={20} color={colors.primary} />
                <View style={styles.statTrend}>
                  <IconTrendingUp size={14} color={C.primary} />
                  <Text style={styles.statTrendText}>+8%</Text>
                </View>
              </View>
              <Text style={[styles.statValue, { color: C.onSurface }]}>27,650</Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>Listening Hours</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: C.border }]}>
              <View style={styles.statHeader}>
                <IconHeart size={20} color={colors.primary} />
                <View style={styles.statTrend}>
                  <IconTrendingDown size={14} color={C.secondaryContainer} />
                  <Text style={[styles.statTrendText, styles.statTrendDown]}>-3%</Text>
                </View>
              </View>
              <Text style={[styles.statValue, { color: C.onSurface }]}>89%</Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>Engagement Rate</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: C.border }]}>
              <View style={styles.statHeader}>
                <IconSignal size={20} color={colors.primary} />
                <View style={styles.statTrend}>
                  <IconTrendingUp size={14} color={C.primary} />
                  <Text style={styles.statTrendText}>+5%</Text>
                </View>
              </View>
              <Text style={[styles.statValue, { color: C.onSurface }]}>24</Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>Active Stations</Text>
            </View>
          </View>

          {/* Weekly Chart */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>Weekly Performance</Text>
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: C.border }]}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>5k</Text>
              <Text style={styles.chartYLabel}>4k</Text>
              <Text style={styles.chartYLabel}>3k</Text>
              <Text style={styles.chartYLabel}>2k</Text>
              <Text style={styles.chartYLabel}>1k</Text>
              <Text style={styles.chartYLabel}>0</Text>
            </View>
            <View style={styles.chartArea}>
              <View style={styles.chartGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.chartGridLine} />
                ))}
              </View>
              <View style={styles.chartBars}>
                {weeklyData.map((data, index) => (
                  <View key={index} style={styles.chartBarContainer}>
                    <View 
                      style={[
                        styles.chartBar,
                        { height: (data.listeners / maxListeners) * 180, backgroundColor: colors.primary },
                      ]} 
                    />
                    <Text style={styles.chartBarLabel}>{data.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Top Stations */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>Top Performing Stations</Text>
          </View>

          <View style={[styles.topStationsList, { backgroundColor: colors.background, borderColor: C.border }]}>
            {topStations.map((station, index) => (
              <View key={station.id} style={styles.topStationItem}>
                <View style={styles.topStationRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.topStationImage}>
                  {getIconComponent(station.icon)}
                </View>
                <View style={styles.topStationInfo}>
                  <Text style={[styles.topStationName, { color: C.onSurface }]}>{station.name}</Text>
                  <Text style={[styles.topStationListeners, { color: C.onSurfaceVariant }]}>{station.listeners} listeners</Text>
                </View>
                <View style={[
                  styles.growthBadge,
                  station.growth.startsWith('+') ? styles.growthPositive : styles.growthNegative
                ]}>
                  <Text style={[
                    styles.growthText,
                    station.growth.startsWith('+') ? styles.growthTextPositive : styles.growthTextNegative
                  ]}>
                    {station.growth}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Player */}
      <View style={styles.bottomPlayer}>
        <View style={styles.playerLeft}>
          <View style={styles.playerArt}>
            <IconChart size={28} color={colors.primary} />
          </View>
          <View style={styles.playerInfo}>
            <Text style={[styles.playerTrack, { color: colors.primary }]}>Analytics Dashboard</Text>
            <Text style={[styles.playerArtist, { color: C.onSurfaceVariant }]}>Real-time insights</Text>
          </View>
        </View>

        <View style={styles.playerCenter}>
          <View style={styles.playerStats}>
            <View style={styles.playerStat}>
              <Text style={[styles.playerStatValue, { color: colors.primary }]}>10.9k</Text>
              <Text style={[styles.playerStatLabel, { color: C.textMuted }]}>Listeners</Text>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  timeRangeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeRangeTags: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: C.border,
  },
  timeRangeTagActive: {
    backgroundColor: 'rgba(0,219,233,0.15)',
    borderColor: C.primary,
  },
  timeRangeTagText: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  timeRangeTagTextActive: {
    color: C.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statTrendText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.primary,
  },
  statTrendDown: {
    color: C.secondaryContainer,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  chartCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  chartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  chartYLabel: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    height: 200,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: 'space-between',
  },
  chartGridLine: {
    height: 1,
    backgroundColor: C.border,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  chartBarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: C.textMuted,
  },
  topStationsList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topStationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  topStationRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,219,233,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  topStationImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topStationInfo: {
    flex: 1,
  },
  topStationName: {
    fontSize: 14,
    fontWeight: '500',
  },
  topStationListeners: {
    fontSize: 12,
  },
  growthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  growthPositive: {
    backgroundColor: 'rgba(0,219,233,0.15)',
  },
  growthNegative: {
    backgroundColor: 'rgba(255,82,82,0.15)',
  },
  growthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  growthTextPositive: {
    color: C.primary,
  },
  growthTextNegative: {
    color: C.secondaryContainer,
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
  },
  playerArtist: {
    fontSize: 12,
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

export default AnalyticsScreen;