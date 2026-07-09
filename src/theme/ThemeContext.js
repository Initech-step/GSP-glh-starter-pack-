import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme } from './buildTheme';
import { getThemeMode, setThemeMode } from '../utils/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // NOTE: this only ever returns 'light' unless app.json sets
  // "userInterfaceStyle": "automatic".
  const systemScheme = useColorScheme();

  // `mode` is the user's stored choice; `scheme` is what actually renders.
  const [mode, setMode] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getThemeMode()
      .then((stored) => {
        if (!cancelled) setMode(stored);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scheme = mode === 'system' ? systemScheme ?? 'light' : mode;

  const theme = useMemo(() => buildTheme(scheme), [scheme]);

  const changeMode = useCallback(async (next) => {
    setMode(next); // optimistic: the UI must not wait on disk
    await setThemeMode(next);
  }, []);

  const value = useMemo(
    () => ({ ...theme, mode, scheme, isReady, setMode: changeMode }),
    [theme, mode, scheme, isReady, changeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a <ThemeProvider>');
  return ctx;
}

/**
 * Bridges module-level StyleSheet.create to the runtime theme.
 *
 *   const styles = useThemedStyles(makeStyles);
 *   const makeStyles = ({ colors }) => StyleSheet.create({ ... });
 *
 * `factory` must be defined at module scope so its identity is stable.
 */
export function useThemedStyles(factory) {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
