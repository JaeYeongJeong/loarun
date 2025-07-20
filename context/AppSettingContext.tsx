import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCharacter } from '@/context/CharacterContext';

type AppSettingContextType = {
  activityHistory: string[];
  updateActivityHistory: (history: string[]) => void;
  isInfoVisible: boolean;
  toggleInfoVisibility: () => void;
  characterSortOrder: SortOrder; // 정렬 기준
  updateCharacterSortOrder: (sortOrder: SortOrder) => void;
};

export type SortOrder = 'addedAt' | 'level' | 'server';

const AppSettingContext = createContext<AppSettingContextType | undefined>(
  undefined
);

export const AppSettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activityHistory, setActivityHistory] = useState<string[]>([]);
  const [isInfoVisible, setIsInfoVisible] = useState<boolean>(true);
  const [characterSortOrder, setCharacterSortOrder] =
    useState<SortOrder>('addedAt');
  const { sortCharacter } = useCharacter();

  useEffect(() => {
    loadIsInfoVisible();
    loadActivityHistory();
    loadCharacterSortOrder();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      'isInfoVisible',
      isInfoVisible ? 'true' : 'false'
    ).catch((err) => console.error('캐릭터 정보 표시 여부 저장 실패:', err));
  }, [isInfoVisible]);

  const loadActivityHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('activityHistory');
      if (savedHistory !== null) {
        setActivityHistory(JSON.parse(savedHistory));
      } else {
        setActivityHistory(['악세', '유각', '보석']);
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

  const toggleInfoVisibility = () => {
    setIsInfoVisible((prev) => !prev);
  };

  const loadIsInfoVisible = async () => {
    try {
      const savedVisible = await AsyncStorage.getItem('isInfoVisible');
      if (savedVisible !== null) {
        setIsInfoVisible(savedVisible === 'true');
      } else {
        setIsInfoVisible(true); // 기본값은 true
      }
    } catch (err) {
      console.error('캐릭터 정보 표시 여부 로드 실패:', err);
    }
  };

  const updateCharacterSortOrder = async (sortOrder: SortOrder) => {
    try {
      await AsyncStorage.setItem('characterSortOrder', sortOrder);
      setCharacterSortOrder(sortOrder); // ✅ 이 줄이 핵심!
      sortCharacter(sortOrder);
    } catch (err) {
      console.error('캐릭터 정렬 기준 저장 실패:', err);
    }
  };

  const loadCharacterSortOrder = async () => {
    try {
      const savedSortOrder = await AsyncStorage.getItem('characterSortOrder');
      if (savedSortOrder) {
        setCharacterSortOrder(savedSortOrder as SortOrder);
      } else {
        setCharacterSortOrder('addedAt'); // 기본값은 'addedAt'
      }
    } catch (err) {
      console.error('캐릭터 정렬 기준 로드 실패:', err);
    }
  };

  return (
    <AppSettingContext.Provider
      value={{
        activityHistory,
        updateActivityHistory,
        isInfoVisible,
        toggleInfoVisibility,
        characterSortOrder,
        updateCharacterSortOrder,
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
