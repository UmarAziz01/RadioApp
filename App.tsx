import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { View, StyleSheet, Platform } from 'react-native';
import ThemeToggle from './src/components/ThemeToggle';
import RootRadioScreen from './src/screens/RootRadioScreen';
import LiveScreen from './src/screens/LiveScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ListenersScreen from './src/screens/ListenersScreen';
import LogoutScreen from './src/screens/LogoutScreen';
import RecordingsScreen from './src/screens/RecordingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StationsScreen from './src/screens/StationsScreen';
import StreamScreen from './src/screens/StreamScreen';
import StreamV2Screen from './src/screens/StreamV2Screen';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';

const InnerApp: React.FC = () => {
  const { activeScreen } = useNavigation();
  const { colors, isDark } = useTheme();

  const renderScreen = () => {
    const isStreamActive = activeScreen === 'stream';
    return (
      <View style={[styles.root, !isStreamActive && { display: 'none' }]}>
        <StreamScreen />
      </View>
    );
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'root':
        return <RootRadioScreen />;
      case 'stream':
        return <StreamScreen />;
      case 'streamV2':
        return <StreamV2Screen />;
      case 'live':
        return <LiveScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'listeners':
        return <ListenersScreen />;
      case 'logout':
        return <LogoutScreen />;
      case 'recordings':
        return <RecordingsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'stations':
        return <StationsScreen />;
      default:
        return <RootRadioScreen />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.toggleContainer}>
        <ThemeToggle />
      </View>
      {renderScreen()}
      {activeScreen !== 'stream' && renderActiveScreen()}
    </View>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <ThemeProvider>
        <InnerApp />
      </ThemeProvider>
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toggleContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 60,
    right: 16,
    zIndex: 9999,
  },
});
