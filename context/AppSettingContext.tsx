import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCharacter } from './CharacterContext';

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
  const { resetCharacterTask, isLoaded } = useCharacter();

  useEffect(() => {
    if (!isLoaded) return; // 캐릭터 로딩 전이면 아무것도 하지 않음

    shouldResetData();
    loadActivityHistory();
  }, [isLoaded]);

  const shouldResetData = async () => {
    const now = new Date();
    const lastReset = await AsyncStorage.getItem('lastReset');

    // 현재가 수요일 6시 이후인지 판단
    const isAfterWednesday6AM = () => {
      const day = now.getDay(); // 0: 일요일, 3: 수요일
      const hour = now.getHours();

      if (day > 3) return true; // 목~토
      if (day === 3 && hour >= 6) return true; // 수요일 6시 이후
      return false;
    };

    // 이번 주 수요일 오전 6시 날짜 구하기
    const getThisWednesday6AM = () => {
      const date = new Date(now);
      const currentDay = date.getDay();
      const daysSinceWednesday =
        currentDay >= 3 ? currentDay - 3 : 7 - (3 - currentDay);
      date.setDate(date.getDate() - daysSinceWednesday);
      date.setHours(6, 0, 0, 0);
      return date;
    };

    if (isAfterWednesday6AM()) {
      const wednesdayDate = getThisWednesday6AM();
      if (!lastReset || new Date(lastReset) < wednesdayDate) {
        resetCharacterTask();
        await AsyncStorage.setItem('lastReset', now.toISOString());
      }
    }
  };

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
