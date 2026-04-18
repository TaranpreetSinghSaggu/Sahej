import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  AppTheme,
  getStatusBarStyleForMode,
  getThemeForMode,
  ThemeMode
} from "./theme";

const THEME_MODE_STORAGE_KEY = "sahej-theme-mode";

interface ThemeContextValue {
  isHydrated: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  theme: AppTheme;
  getTheme: (options?: { dopamineDrain?: boolean }) => AppTheme;
  statusBarStyle: "light-content" | "dark-content";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);

        if (!isMounted) {
          return;
        }

        if (storedMode === "light" || storedMode === "dark") {
          setModeState(storedMode);
        }
      } catch {
        // Theme persistence is best-effort for the hackathon demo.
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode).catch(() => {
      // Theme persistence failures should not block app usage.
    });
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const getTheme = useCallback(
    (options?: { dopamineDrain?: boolean }) => getThemeForMode(mode, options),
    [mode]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      isHydrated,
      mode,
      setMode,
      toggleMode,
      theme: getTheme(),
      getTheme,
      statusBarStyle: getStatusBarStyleForMode(mode)
    }),
    [getTheme, isHydrated, mode, setMode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemePreference must be used within ThemeProvider.");
  }

  return context;
}
