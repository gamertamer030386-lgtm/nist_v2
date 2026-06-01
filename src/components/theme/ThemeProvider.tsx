"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { updateThemePreference } from "@/actions/theme";

type Theme = "day" | "night";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Apply data-theme attribute to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === "day" ? "night" : "day";
    setTheme(newTheme);
    // Persist to database
    updateThemePreference(newTheme === "day" ? "DAY" : "NIGHT").catch(() => {
      // Revert on failure
      setTheme(theme);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
