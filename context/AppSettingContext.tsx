import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

type AppSettingContextType = {
  activityHistory: string[];
  updateActivityHistory: (history: string[]) => void;
};

const AppSettingContext = createContext<AppSettingContextType | undefined>(
  undefined
);

export const AppSettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activityHistory, setActivityHistory] = useState<string[]>([]);

  useEffect(() => {
    const loadActivityHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('activityHistory');
        if (savedHistory !== null) {
          setActivityHistory(JSON.parse(savedHistory));
        } else {
          setActivityHistory(['카던', '가토', '버스']);
        }
      } catch (err) {
        console.error('검색 기록 로드 실패:', err);
      }
    };
    loadActivityHistory();
  }, []);

  const updateActivityHistory = async (history: string[]) => {
    setActivityHistory(history);
    try {
      await AsyncStorage.setItem('activityHistory', JSON.stringify(history));
    } catch (err) {
      console.error('검색 기록 저장 실패:', err);
    }
  };

  return (
    <AppSettingContext.Provider
      value={{
        activityHistory,
        updateActivityHistory,
      }}
    >
      {children}
    </AppSettingContext.Provider>
  );
};

export const useAppSetting = () => {
  const context = useContext(AppSettingContext);
  if (!context) {
    throw new Error('useAppSetting must be used within a AppSettingProvider');
  }
  return context;
};
