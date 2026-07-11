import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../theme/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  Switch,
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
  IconMenu,
  IconLogout,
} from '../components/Icons';
import { ScreenKey } from '../context/NavigationContext';
import { 
  MainNavGroup, 
  InsightsNavGroup, 
  FooterNavGroup 
} from '../components/NavMenu';

// ─── Warna ───
const C = {
  bg: '#0F1115',
  surface: '#1A1D23',
  surfaceHigh: '#282a2e',
  surfaceContainer: '#1A1D23',
  primary: '#00dbe9',
  onPrimary: '#00363a',
  secondary: '#ffb3b2',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  textMuted: '#849495',
  border: 'rgba(255,255,255,0.08)',
  glassBg: 'rgba(26, 29, 35, 0.7)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

// ─── COMPONENT ───
const SettingsScreen = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState<ScreenKey>('settings');
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [requirePasscode, setRequirePasscode] = useState(false);
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
                <Text style={{ fontSize: 24 }}>⚙️</Text>
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
            <Text style={styles.navbarTitle}>Settings</Text>
          </View>

          <View style={styles.navbarActions}>
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
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActive]}>Settings</Text>
          </View>

          {/* Search bar */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchBox}>
              <IconSearch />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search settings..."
                placeholderTextColor={C.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Appearance Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Use dark theme throughout the app</Text>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={isDark ? C.surface : C.surfaceHigh}
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Receive alerts for new content</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={notifications ? C.surface : C.surfaceHigh}
              />
            </View>
          </View>

          {/* Playback Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Playback</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Play</Text>
                <Text style={styles.settingDesc}>Play station automatically when opened</Text>
              </View>
              <Switch 
                value={autoPlay} 
                onValueChange={setAutoPlay}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={autoPlay ? C.surface : C.surfaceHigh}
              />
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Require Passcode</Text>
                <Text style={styles.settingDesc}>Protect app with a passcode</Text>
              </View>
              <Switch 
                value={requirePasscode} 
                onValueChange={setRequirePasscode}
                trackColor={{ false: C.border, true: C.primary }}
                thumbColor={requirePasscode ? C.surface : C.surfaceHigh}
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn}>
            <IconLogout size={20} color={C.secondary} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ─────── BOTTOM PLAYER ─────── */}
      <View style={styles.bottomPlayer}>
        <View style={styles.playerLeft}>
          <View style={styles.playerArt}>
            <Text style={styles.playerArtText}>⚙️</Text>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTrack}>Settings</Text>
            <Text style={styles.playerArtist}>Configure your experience</Text>
          </View>
        </View>

        <View style={styles.playerCenter}>
          <View style={styles.playerStats}>
            <View style={styles.playerStat}>
              <Text style={styles.playerStatValue}>8</Text>
              <Text style={styles.playerStatLabel}>Options</Text>
            </View>
          </View>
        </View>

        <View style={styles.playerRight}>
          <Text style={styles.playerTime}>—</Text>
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

  searchFilterRow: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    color: C.onSurface,
    padding: 0,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: C.onSurface,
  },

  settingsCard: {
    backgroundColor: C.glassBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: C.onSurface,
  },
  settingDesc: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.secondary,
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
    color: C.textMuted,
  },
});

export default SettingsScreen;