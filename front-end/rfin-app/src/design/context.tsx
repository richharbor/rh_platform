import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { themes, type Scheme, type Theme } from "./build";

export type ThemePref = "system" | "light" | "dark";

type Ctx = Theme & {
  /** what the user chose; "system" follows the OS */
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  /** convenience for toggles */
  isDark: boolean;
};

const KEY = "rfin.theme";

const ThemeContext = createContext<Ctx>({
  ...themes.light,
  pref: "system",
  setPref: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>("system");

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (!alive) return;
        if (saved === "system" || saved === "light" || saved === "dark") setPrefState(saved);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem(KEY, p).catch(() => {});
  }, []);

  const scheme: Scheme = pref === "system" ? (system === "dark" ? "dark" : "light") : pref;

  const value = useMemo<Ctx>(
    () => ({ ...themes[scheme], pref, setPref, isDark: scheme === "dark" }),
    [scheme, pref, setPref],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/**
 * Memoised themed StyleSheet.
 *
 * `StyleSheet.create` at module scope would freeze one scheme's colours into the
 * sheet, so every screen declares `const makeStyles = (th: Theme) => StyleSheet.create(...)`
 * and calls this instead. Results are cached per factory per scheme, so a sheet is
 * built at most twice for the whole session and flipping themes costs nothing.
 */
const cache = new WeakMap<object, Partial<Record<Scheme, unknown>>>();

export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  const ref = useRef(factory);
  ref.current = factory;

  return useMemo(() => {
    let per = cache.get(factory);
    if (!per) {
      per = {};
      cache.set(factory, per);
    }
    if (!per[theme.scheme]) per[theme.scheme] = factory(theme);
    return per[theme.scheme] as T;
  }, [factory, theme]);
}
