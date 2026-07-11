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
  IconMic,
  IconMenu,
  IconClock,
  IconDownload,
  IconTrash,
  IconShare,
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

// ─── Data recordings ───
const recordings = [
  { id: '1', title: 'Live Session - Cyber Pulse FM', date: '2024-01-15', duration: '2:45:30', size: '1.2GB', type: 'live' },
  { id: '2', title: 'Ambient Mix Vol. 45', date: '2024-01-14', duration: '1:30:00', size: '650MB', type: 'mix' },
  { id: '3', title: 'Techno Bunker Recording', date: '2024-01-13', duration: '3:15:00', size: '1.5GB', type: 'live' },
  { id: '4', title: 'Chill Waves Session', date: '2024-01-12', duration: '1:45:00', size: '780MB', type: 'mix' },
  { id: '5', title: 'Deep Space Broadcast', date: '2024-01-11', duration: '2:00:00', size: '920MB', type: 'live' },
  { id: '6', title: 'Neon Nights Archive', date: '2024-01-10', duration: '1:15:00', size: '540MB', type: 'mix' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// ─── COMPONENT ───
const RecordingsScreen = () => {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<ScreenKey>('recordings');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);

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

  const toggleSelect = (id: string) => {
    setSelectedRecordings(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
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
            <Text style={styles.navbarTitle}>Recordings</Text>
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
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Recordings</Text>
          </View>

          {/* Storage Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <IconMic />
              <Text style={styles.statValue}>24.5GB</Text>
              <Text style={styles.statLabel}>Total Storage</Text>
            </View>
            <View style={styles.statCard}>
              <IconClock />
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>Recordings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={{ fontSize: 24 }}>📅</Text>
              <Text style={styles.statValue}>12h</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* Bulk Actions */}
          {selectedRecordings.length > 0 && (
            <View style={styles.bulkActions}>
              <Text style={styles.bulkText}>{selectedRecordings.length} selected</Text>
              <TouchableOpacity style={styles.bulkBtn}>
                <IconDownload />
                <Text style={styles.bulkBtnText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bulkBtn, styles.bulkBtnDanger]}>
                <IconTrash />
                <Text style={[styles.bulkBtnText, styles.bulkBtnTextDanger]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recordings List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Recordings</Text>
          </View>

          <View style={styles.recordingsList}>
            {recordings.map((rec) => (
              <View key={rec.id} style={styles.recordingItem}>
                <TouchableOpacity 
                  style={styles.recCheckbox}
                  onPress={() => toggleSelect(rec.id)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedRecordings.includes(rec.id) && styles.checkboxChecked
                  ]}>
                    {selectedRecordings.includes(rec.id) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.recPlayBtn}
                  onPress={() => togglePlay(rec.id)}
                >
                  {playingId === rec.id ? <IconPause /> : <IconPlay />}
                </TouchableOpacity>

                <View style={styles.recInfo}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <View style={styles.recMeta}>
                    <Text style={styles.recMetaText}>{rec.date}</Text>
                    <Text style={styles.recMetaSep}>•</Text>
                    <Text style={styles.recMetaText}>{rec.duration}</Text>
                    <Text style={styles.recMetaSep}>•</Text>
                    <Text style={styles.recMetaText}>{rec.size}</Text>
                  </View>
                </View>

                <View style={[
                  styles.recTypeBadge,
                  rec.type === 'live' && styles.recTypeLive
                ]}>
                  <Text style={[
                    styles.recTypeText,
                    rec.type === 'live' && styles.recTypeTextLive
                  ]}>
                    {rec.type}
                  </Text>
                </View>

                <View style={styles.recActions}>
                  <TouchableOpacity style={styles.recActionBtn}>
                    <IconDownload />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.recActionBtn}>
                    <IconShare />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.recActionBtn}>
                    <IconTrash />
                  </TouchableOpacity>
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
            <Text style={styles.playerArtText}>🎙️</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTrack}>Select a recording</Text>
            <Text style={styles.playerArtist}>Choose from your recordings</Text>
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

  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 20,
  },
  bulkText: {
    flex: 1,
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,219,233,0.1)',
  },
  bulkBtnDanger: {
    backgroundColor: 'rgba(255,82,82,0.1)',
  },
  bulkBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
  },
  bulkBtnTextDanger: {
    color: C.secondaryContainer,
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

  recordingsList: {
    backgroundColor: C.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  recCheckbox: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  checkmark: {
    fontSize: 12,
    color: C.bg,
    fontWeight: '700',
  },
  recPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recInfo: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurface,
    marginBottom: 4,
  },
  recMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recMetaText: {
    fontSize: 11,
    color: C.textMuted,
  },
  recMetaSep: {
    fontSize: 11,
    color: C.textMuted,
  },
  recTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,219,233,0.1)',
  },
  recTypeLive: {
    backgroundColor: 'rgba(255,179,178,0.15)',
  },
  recTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.primary,
    textTransform: 'uppercase',
  },
  recTypeTextLive: {
    color: C.secondary,
  },
  recActions: {
    flexDirection: 'row',
    gap: 8,
  },
  recActionBtn: {
    padding: 6,
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

export default RecordingsScreen;