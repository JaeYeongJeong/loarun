import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 테마 컨텍스트 타입 정의
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

// ✅ 테마 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ✅ 테마 컨텍스트를 제공하는 `ThemeProvider` 컴포넌트
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // ✅ 저장된 테마 불러오기
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // 기본값을 시스템 설정에 맞춤
        setIsDarkMode(Appearance.getColorScheme() === 'dark');
      }
    };
    loadTheme();
  }, []);

  // ✅ 테마 변경 함수
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ 컨텍스트를 쉽게 사용하기 위한 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
