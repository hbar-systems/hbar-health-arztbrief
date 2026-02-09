/**
 * Light/Dark theme. Purple accent on "hbar.health" brand only.
 * Everything else neutral. Persisted in localStorage.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "hbar-health-theme";

export function getStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark") return "dark";
  } catch {
    // fallback
  }
  return "light";
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  brand: string;
  accent: string;
  accentMuted: string;
  btnBg: string;
  btnText: string;
  inputBg: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  blockedBg: string;
  blockedBorder: string;
  navBg: string;
  navBorder: string;
  link: string;
  linkHover: string;
  codeBg: string;
}

const light: ThemeColors = {
  bg: "#f8f9fa",
  card: "#ffffff",
  border: "#dee2e6",
  text: "#212529",
  muted: "#6c757d",
  brand: "#7c5cbf",
  accent: "#343a40",
  accentMuted: "#495057",
  btnBg: "#343a40",
  btnText: "#ffffff",
  inputBg: "#ffffff",
  errorBg: "#fff5f5",
  errorBorder: "#e03131",
  errorText: "#c92a2a",
  blockedBg: "#fff0f0",
  blockedBorder: "#c92a2a",
  navBg: "#ffffff",
  navBorder: "#dee2e6",
  link: "#343a40",
  linkHover: "#212529",
  codeBg: "#f1f3f5",
};

const dark: ThemeColors = {
  bg: "#1a1a2e",
  card: "#22223b",
  border: "#3a3a5c",
  text: "#e0e0e8",
  muted: "#9090a8",
  brand: "#a78bdb",
  accent: "#d0d0e0",
  accentMuted: "#9090a8",
  btnBg: "#d0d0e0",
  btnText: "#1a1a2e",
  inputBg: "#2a2a45",
  errorBg: "#3a1a1a",
  errorBorder: "#e03131",
  errorText: "#ff8080",
  blockedBg: "#3a1a1a",
  blockedBorder: "#c92a2a",
  navBg: "#22223b",
  navBorder: "#3a3a5c",
  link: "#d0d0e0",
  linkHover: "#e0e0e8",
  codeBg: "#2a2a45",
};

const themes: Record<Theme, ThemeColors> = { light, dark };

export function colors(theme: Theme): ThemeColors {
  return themes[theme];
}
