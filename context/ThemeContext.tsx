import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '@/theme/colors';

type Theme = 'light' | 'dark';

type ColorTheme = typeof lightColors;

type ThemeContextType = {
  theme: Theme;
  colors: ColorTheme;
  changeTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setTheme(savedTheme as Theme);
        } else {
          const systemTheme = Appearance.getColorScheme();
          setTheme(systemTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (err) {
        console.error('테마 로드 실패:', err);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = async (theme: Theme) => {
    setTheme(theme);
    try {
      await AsyncStorage.setItem('theme', theme);
    } catch (err) {
      console.error('테마 저장 실패:', err);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme === 'light' ? lightColors : darkColors,
        changeTheme: updateTheme,
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
