import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Linking, Platform } from 'react-native';

export type ScreenKey =
  | 'live'
  | 'analytics'
  | 'library'
  | 'listeners'
  | 'logout'
  | 'recordings'
  | 'settings'
  | 'stations'
  | 'root';

// Map screen keys to URL paths
const SCREEN_TO_PATH: Record<ScreenKey, string> = {
  live: 'live',
  analytics: 'analytics',
  library: 'library',
  listeners: 'listeners',
  logout: 'logout',
  recordings: 'recordings',
  settings: 'settings',
  stations: 'stations',
  root: '',
};

// Map URL paths to screen keys
const PATH_TO_SCREEN: Record<string, ScreenKey> = {
  live: 'live',
  analytics: 'analytics',
  library: 'library',
  listeners: 'listeners',
  logout: 'logout',
  recordings: 'recordings',
  settings: 'settings',
  stations: 'stations',
  '': 'root',
};

// Check if running in browser environment
const isWeb = typeof window !== 'undefined';

// Update URL based on platform
const updateURL = (path: string) => {
  if (isWeb) {
    // Use History API for clean URL paths (e.g., /library, /stations)
    const newUrl = path ? `/${path}` : '/';
    window.history.pushState({ path: newUrl }, '', newUrl);
  } else if (Platform.OS !== 'web') {
    // Use deep linking for native mobile
    Linking.openURL(`radioapp://${path}`).catch(err => 
      console.log('Error opening URL:', err)
    );
  }
};

// Get current path from URL based on platform
const getCurrentPath = (): string => {
  if (isWeb) {
    // Get path from URL (e.g., /library, /stations)
    const path = window.location.pathname.slice(1) || '';
    return path;
  }
  return '';
};

// Parse URL to get screen key
const parseURLToScreen = (url: string): ScreenKey | null => {
  if (isWeb) {
    // Parse from pathname (e.g., /library)
    const path = url.split('/').filter(Boolean).pop() || '';
    return PATH_TO_SCREEN[path] || null;
  } else {
    const path = url.split('://')[1]?.split('/')[1] || '';
    return PATH_TO_SCREEN[path] || null;
  }
};

interface NavigationContextProps {
  activeScreen: ScreenKey;
  setActiveScreen: (screen: ScreenKey) => void;
  currentPath: string;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>(() => {
    // Get initial path from URL
    if (isWeb) {
      const initialPath = getCurrentPath();
      return PATH_TO_SCREEN[initialPath] || 'root';
    }
    return 'root';
  });

// Handle URL changes for web
  useEffect(() => {
    if (isWeb) {
      const handlePopState = () => {
        const path = window.location.pathname.slice(1) || '';
        if (path && PATH_TO_SCREEN[path]) {
          setActiveScreen(PATH_TO_SCREEN[path]);
        } else if (path === '') {
          setActiveScreen('root');
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Handle URL changes for native mobile
  useEffect(() => {
    if (!isWeb) {
      const handleURL = (event: { url: string }) => {
        const screen = parseURLToScreen(event.url);
        if (screen) {
          setActiveScreen(screen);
        }
      };

      const subscription = Linking.addEventListener('url', handleURL);
      return () => subscription.remove();
    }
  }, []);

  // Get initial URL for native mobile
  useEffect(() => {
    if (!isWeb) {
      const getInitialURL = async () => {
        try {
          const url = await Linking.getInitialURL();
          if (url) {
            const screen = parseURLToScreen(url);
            if (screen) {
              setActiveScreen(screen);
            }
          }
        } catch (e) {
          console.log('Error getting initial URL:', e);
        }
      };
      getInitialURL();
    }
  }, []);

  const handleSetActiveScreen = (screen: ScreenKey) => {
    setActiveScreen(screen);
    // Update the URL path
    const path = SCREEN_TO_PATH[screen];
    updateURL(path);
  };

  return (
    <NavigationContext.Provider value={{ 
      activeScreen, 
      setActiveScreen: handleSetActiveScreen,
      currentPath: SCREEN_TO_PATH[activeScreen]
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Export URL helper functions
export { SCREEN_TO_PATH, PATH_TO_SCREEN };