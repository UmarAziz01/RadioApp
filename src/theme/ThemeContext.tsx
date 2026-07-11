import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { useColorScheme, Platform, ColorSchemeName } from 'react-native';
import { lightColors, darkColors } from './colors';

// 1. Definisikan tipe data untuk mode dan context
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof lightColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

// 2. Beri nilai awal undefined dengan tipe generic
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isWeb = Platform.OS === 'web';

const getInitialMode = (): ThemeMode => {
  if (isWeb) {
    try {
      const stored = localStorage.getItem('radio_theme_mode');
      if (stored === 'light' || stored === 'dark') return stored as ThemeMode;
    } catch {}
  }
  return 'light';
};

// 3. Definisikan tipe untuk State dan Action pada Reducer
interface ThemeState {
  mode: ThemeMode;
  systemScheme: NonNullable<ColorSchemeName>;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_SYSTEM_THEME'; payload: NonNullable<ColorSchemeName> };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, mode: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, mode: state.mode === 'light' ? 'dark' : 'light' };
    case 'SET_SYSTEM_THEME':
      return { ...state, systemScheme: action.payload };
    default:
      return state;
  }
};

// 4. Tambahkan tipe ReactNode untuk prop children
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [state, dispatch] = useReducer(themeReducer, {
    mode: getInitialMode(),
    systemScheme: systemScheme || 'light',
  });

  const initialized = useRef(false);

  useEffect(() => {
    dispatch({ type: 'SET_SYSTEM_THEME', payload: systemScheme || 'light' });
  }, [systemScheme]);

  useEffect(() => {
    if (isWeb && initialized.current) {
      try {
        localStorage.setItem('radio_theme_mode', state.mode);
      } catch {}
    }
    initialized.current = true;
  }, [state.mode]);

  const colors = state.mode === 'dark' ? darkColors : lightColors;

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  // 5. Tambahkan batasan tipe data pada parameter mode
  const setTheme = (mode: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: mode });
  };

  return (
    <ThemeContext.Provider
      value={{
        mode: state.mode,
        colors,
        toggleTheme,
        setTheme,
        isDark: state.mode === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;