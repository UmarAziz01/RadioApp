import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { 
  IconRadio, 
  IconHeadphones, 
  IconMic, 
  IconSignal, 
  IconUsers, 
  IconSettings, 
  IconLogout 
} from './Icons';
import { useNavigation, ScreenKey } from '../context/NavigationContext';

// Colors from the app
const C = {
  primary: '#00dbe9',
  textMuted: '#849495',
  onSurfaceVariant: '#b9cacb',
  border: 'rgba(255,255,255,0.08)',
  error: '#ffb4ab',
  surfaceContainer: '#1A1D23',
};

// Navigation item interface
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: { color?: string };
}

// Navigation item component
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onPress, style }) => (
  <TouchableOpacity
    style={[
      styles.navItem,
      active && styles.navItemActive,
      style && { borderColor: style.color || 'transparent' },
    ]}
    onPress={onPress}
  >
    <View style={[styles.navIcon, active && styles.navIconActive]}>{icon}</View>
    <Text
      style={[
        styles.navLabel,
        active && styles.navLabelActive,
        style && { color: style.color },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// Navigation group interface
interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

// Navigation group component
const NavGroup: React.FC<NavGroupProps> = ({ title, children }) => (
  <View style={styles.navGroup}>
    <Text style={styles.navGroupTitle}>{title}</Text>
    {children}
  </View>
);

// Hook to get navigation context with fallback to local state
const useNavHandler = (localActiveNav?: ScreenKey, localOnNavChange?: (nav: ScreenKey) => void) => {
  try {
    const context = useNavigation();
    return {
      activeNav: context.activeScreen,
      onNavChange: context.setActiveScreen,
    };
  } catch {
    // If no context available, use local props
    return {
      activeNav: localActiveNav || 'live',
      onNavChange: localOnNavChange,
    };
  }
};

// Main navigation menu component - combines all navigation groups
interface NavMenuProps {
  activeNav?: ScreenKey;
  onNavChange?: (nav: ScreenKey) => void;
}

// Combined navigation menu component
const NavMenu: React.FC<NavMenuProps> = ({ activeNav, onNavChange }) => {
  const { activeNav: contextActiveNav, onNavChange: contextOnNavChange } = useNavHandler(activeNav, onNavChange);
  
  // Map navigation keys to screen names
  const getNavKey = (screenName: string): ScreenKey => {
    switch (screenName) {
      case 'Live Stream':
        return 'live';
      case 'Library':
        return 'library';
      case 'Recordings':
        return 'recordings';
      case 'Stations':
        return 'stations';
      case 'Listeners':
        return 'listeners';
      case 'Analytics':
        return 'analytics';
      case 'Settings':
        return 'settings';
      case 'Log out':
        return 'logout';
      default:
        return screenName.toLowerCase() as ScreenKey;
    }
  };

  const handleNavPress = (screenName: string) => {
    if (onNavChange) {
      onNavChange(getNavKey(screenName));
    }
  };

  return (
    <ScrollView style={styles.navScroll}>
      <NavGroup title="Main">
        <NavItem 
          icon={<IconRadio />} 
          label="Root" 
          active={contextActiveNav === 'root'} 
          onPress={() => contextOnNavChange && contextOnNavChange('root')} 
        />
        <NavItem 
          icon={<IconRadio />} 
          label="Live Stream" 
          active={contextActiveNav === 'live'} 
          onPress={() => contextOnNavChange && contextOnNavChange('live')} 
        />
        <NavItem 
          icon={<IconHeadphones />} 
          label="Library" 
          active={contextActiveNav === 'library'} 
          onPress={() => contextOnNavChange && contextOnNavChange('library')} 
        />
        <NavItem 
          icon={<IconMic />} 
          label="Recordings" 
          active={contextActiveNav === 'recordings'} 
          onPress={() => contextOnNavChange && contextOnNavChange('recordings')} 
        />
        <NavItem 
          icon={<IconSignal />} 
          label="Stations" 
          active={contextActiveNav === 'stations'} 
          onPress={() => contextOnNavChange && contextOnNavChange('stations')} 
        />
      </NavGroup>

      <NavGroup title="Insights">
        <NavItem 
          icon={<IconUsers />} 
          label="Listeners" 
          active={contextActiveNav === 'listeners'} 
          onPress={() => contextOnNavChange && contextOnNavChange('listeners')} 
        />
        <NavItem 
          icon={<IconSignal />} 
          label="Analytics" 
          active={contextActiveNav === 'analytics'} 
          onPress={() => contextOnNavChange && contextOnNavChange('analytics')} 
        />
      </NavGroup>

      <View style={styles.footerNav}>
        <View style={styles.divider} />
        <NavItem 
          icon={<IconSettings />} 
          label="Settings" 
          active={contextActiveNav === 'settings'} 
          onPress={() => contextOnNavChange && contextOnNavChange('settings')} 
        />
        <NavItem 
          icon={<IconLogout />} 
          label="Log out" 
          style={{ color: C.error }}
          onPress={() => contextOnNavChange && contextOnNavChange('logout')} 
        />
      </View>
    </ScrollView>
  );
};

// Export individual navigation groups for use in screens that have their own sidebar
export const MainNavGroup: React.FC<NavMenuProps> = ({ activeNav, onNavChange }) => {
  const { activeNav: contextActiveNav, onNavChange: contextOnNavChange } = useNavHandler(activeNav, onNavChange);
  
  return (
    <NavGroup title="Main">
      <NavItem 
        icon={<IconRadio />} 
        label="Root" 
        active={contextActiveNav === 'root'} 
        onPress={() => contextOnNavChange && contextOnNavChange('root')} 
      />
      <NavItem 
        icon={<IconRadio />} 
        label="Live Stream" 
        active={contextActiveNav === 'live'} 
        onPress={() => contextOnNavChange && contextOnNavChange('live')} 
      />
      <NavItem 
        icon={<IconHeadphones />} 
        label="Library" 
        active={contextActiveNav === 'library'} 
        onPress={() => contextOnNavChange && contextOnNavChange('library')} 
      />
      <NavItem 
        icon={<IconMic />} 
        label="Recordings" 
        active={contextActiveNav === 'recordings'} 
        onPress={() => contextOnNavChange && contextOnNavChange('recordings')} 
      />
      <NavItem 
        icon={<IconSignal />} 
        label="Stations" 
        active={contextActiveNav === 'stations'} 
        onPress={() => contextOnNavChange && contextOnNavChange('stations')} 
      />
    </NavGroup>
  );
};

// Insights navigation group
export const InsightsNavGroup: React.FC<NavMenuProps> = ({ activeNav, onNavChange }) => {
  const { activeNav: contextActiveNav, onNavChange: contextOnNavChange } = useNavHandler(activeNav, onNavChange);
  
  return (
    <NavGroup title="Insights">
      <NavItem 
        icon={<IconUsers />} 
        label="Listeners" 
        active={contextActiveNav === 'listeners'} 
        onPress={() => contextOnNavChange && contextOnNavChange('listeners')} 
      />
      <NavItem 
        icon={<IconSignal />} 
        label="Analytics" 
        active={contextActiveNav === 'analytics'} 
        onPress={() => contextOnNavChange && contextOnNavChange('analytics')} 
      />
    </NavGroup>
  );
};

// Footer navigation (Settings, Logout) - works with or without props
export const FooterNavGroup: React.FC<NavMenuProps> = ({ activeNav, onNavChange }) => {
  const { activeNav: contextActiveNav, onNavChange: contextOnNavChange } = useNavHandler(activeNav, onNavChange);
  
  return (
    <View style={styles.footerNav}>
      <View style={styles.divider} />
      <NavItem 
        icon={<IconSettings />} 
        label="Settings" 
        active={contextActiveNav === 'settings'} 
        onPress={() => contextOnNavChange && contextOnNavChange('settings')} 
      />
      <NavItem 
        icon={<IconLogout />} 
        label="Log out" 
        style={{ color: C.error }}
        onPress={() => contextOnNavChange && contextOnNavChange('logout')} 
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  navScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  navGroup: {
    marginBottom: 8,
  },
  navGroupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(0,219,233,0.12)',
  },
  navIcon: {
    width: 22,
    alignItems: 'center',
  },
  navIconActive: {},
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurfaceVariant,
    flex: 1,
  },
  navLabelActive: {
    color: C.primary,
    fontWeight: '600',
  },
  footerNav: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 8,
    marginHorizontal: 8,
  },
});

export default NavMenu;