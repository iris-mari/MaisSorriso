"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type ThemeMode = "light" | "dark" | "system";

export type AccentColorId = "blue" | "mint" | "ocean" | "violet" | "emerald" | "slate";

export interface AccentColorConfig {
  id: AccentColorId;
  name: string;
  tagline: string;
  description: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  primaryRing: string;
  primaryText: string;
  darkLight: string;
  darkBorder: string;
  darkText: string;
}

export const DENTAL_ACCENT_COLORS: AccentColorConfig[] = [
  {
    id: "blue",
    name: "Azul Clínico",
    tagline: "Padrão & Confiança",
    description: "Tonalidade odontológica clássica que transmite serenidade, credibilidade e precisão clínica.",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryLight: "#eff6ff",
    primaryBorder: "#bfdbfe",
    primaryRing: "rgba(37, 99, 235, 0.25)",
    primaryText: "#1d4ed8",
    darkLight: "rgba(37, 99, 235, 0.2)",
    darkBorder: "rgba(59, 130, 246, 0.35)",
    darkText: "#93c5fd",
  },
  {
    id: "mint",
    name: "Verde Água / Menta",
    tagline: "Frescor & Higiene",
    description: "Inspirado na sensação de limpeza e frescor bucal, proporcionando tranquilidade aos pacientes.",
    primary: "#0d9488",
    primaryHover: "#0f766e",
    primaryLight: "#f0fdfa",
    primaryBorder: "#99f6e4",
    primaryRing: "rgba(13, 148, 136, 0.25)",
    primaryText: "#0f766e",
    darkLight: "rgba(13, 148, 136, 0.2)",
    darkBorder: "rgba(20, 184, 166, 0.35)",
    darkText: "#5eead4",
  },
  {
    id: "ocean",
    name: "Azul Petróleo",
    tagline: "Modernidade & Foco",
    description: "Tom marinho profissional e sofisticado, excelente para clínicas de estética e reabilitação oral.",
    primary: "#0284c7",
    primaryHover: "#0369a1",
    primaryLight: "#f0f9ff",
    primaryBorder: "#bae6fd",
    primaryRing: "rgba(2, 132, 199, 0.25)",
    primaryText: "#0369a1",
    darkLight: "rgba(2, 132, 199, 0.2)",
    darkBorder: "rgba(56, 189, 248, 0.35)",
    darkText: "#7dd3fc",
  },
  {
    id: "violet",
    name: "Roxo Suave / Lavanda",
    tagline: "Acolhimento & Bem-estar",
    description: "Cor contemporânea que reduz a ansiedade de consultório e confere um visual amigável e elegante.",
    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    primaryLight: "#f5f3ff",
    primaryBorder: "#ddd6fe",
    primaryRing: "rgba(124, 58, 237, 0.25)",
    primaryText: "#6d28d9",
    darkLight: "rgba(124, 58, 237, 0.2)",
    darkBorder: "rgba(167, 139, 250, 0.35)",
    darkText: "#c4b5fd",
  },
  {
    id: "emerald",
    name: "Verde Esmeralda",
    tagline: "Saúde & Vitalidade",
    description: "Evoca restauração biológica, sustentabilidade, harmonia e sensação de rejuvenescimento.",
    primary: "#059669",
    primaryHover: "#047857",
    primaryLight: "#ecfdf5",
    primaryBorder: "#a7f3d0",
    primaryRing: "rgba(5, 150, 105, 0.25)",
    primaryText: "#047857",
    darkLight: "rgba(5, 150, 105, 0.2)",
    darkBorder: "rgba(16, 185, 129, 0.35)",
    darkText: "#6ee7b7",
  },
  {
    id: "slate",
    name: "Cinza Ardósia",
    tagline: "Minimalismo & Equilíbrio",
    description: "Paleta neutra contemporânea que prioriza o conteúdo e reduz a fadiga visual em longos expedientes.",
    primary: "#475569",
    primaryHover: "#334155",
    primaryLight: "#f8fafc",
    primaryBorder: "#cbd5e1",
    primaryRing: "rgba(71, 85, 105, 0.25)",
    primaryText: "#334155",
    darkLight: "rgba(71, 85, 105, 0.25)",
    darkBorder: "rgba(148, 163, 184, 0.35)",
    darkText: "#cbd5e1",
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  accent: AccentColorId;
  accentConfig: AccentColorConfig;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColorId) => void;
  toggleTheme: () => void;
  palette: AccentColorConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "mais-sorriso-theme";
const ACCENT_STORAGE_KEY = "mais-sorriso-accent";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [accent, setAccentState] = useState<AccentColorId>("blue");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or system preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColorId | null;
      if (savedAccent && DENTAL_ACCENT_COLORS.some((c) => c.id === savedAccent)) {
        setAccentState(savedAccent);
      }
    } catch (e) {
      console.warn("Could not read theme settings from localStorage:", e);
    }
    setMounted(true);
  }, []);

  const accentConfig = useMemo(() => {
    return DENTAL_ACCENT_COLORS.find((c) => c.id === accent) || DENTAL_ACCENT_COLORS[0];
  }, [accent]);

  // Handle theme mode changes and system color scheme listener
  useEffect(() => {
    const updateTheme = () => {
      let isDark = false;
      if (theme === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = theme === "dark";
      }

      setResolvedTheme(isDark ? "dark" : "light");

      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    };

    updateTheme();

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateTheme();
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme]);

  // Apply accent color CSS variables to :root
  useEffect(() => {
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";

    root.style.setProperty("--primary", accentConfig.primary);
    root.style.setProperty("--primary-hover", accentConfig.primaryHover);
    root.style.setProperty(
      "--primary-light",
      isDark ? accentConfig.darkLight : accentConfig.primaryLight
    );
    root.style.setProperty(
      "--primary-border",
      isDark ? accentConfig.darkBorder : accentConfig.primaryBorder
    );
    root.style.setProperty("--primary-ring", accentConfig.primaryRing);
    root.style.setProperty(
      "--primary-text",
      isDark ? accentConfig.darkText : accentConfig.primaryText
    );
  }, [accentConfig, resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage:", e);
    }
  };

  const setAccent = (newAccent: AccentColorId) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
    } catch (e) {
      console.warn("Could not save accent to localStorage:", e);
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        accent,
        accentConfig,
        setTheme,
        setAccent,
        toggleTheme,
        palette: DENTAL_ACCENT_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
