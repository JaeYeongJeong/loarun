import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cropAndSavePortraitImage,
  deletePortraitImage,
} from '../utils/PortraitImage';
import uuid from 'react-native-uuid';
import { checkListItem } from '@/utils/missionCheckListData';

export type RaidDifficulty = '싱글' | '노말' | '하드';

export type RaidStage = {
  difficulty: RaidDifficulty; // 레이드 난이도 (싱글, 노말, 하드)
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
  chestCost?: number; // 더보기 골드
  selectedChestCost?: boolean; // 더보기 선택 여부
  cleared?: boolean; // ✅ 클리어 여부 (true/false)
  lastClearedStage?: number; // 마지막 클리어 관문 번호 (1, 2, 3...)
};

export type Raid = {
  name: string;
  stages: RaidStage[]; // 레이드 단계별 정보
  totalGold: number;
  cleared?: boolean; // ✅ 클리어 여부 (true/false)
  goldChecked?: boolean;
  additionalGoldCheked?: boolean;
  additionalGold?: string;
  chestCostChecked?: boolean;
};

type Activity = {
  name: string;
  gold: number;
};

// ✅ `Character` 타입 정의 (CharacterImage 추가됨)
type Character = {
  id: string;
  CharacterImage?: string; // ✅ API에서 이미지가 제공되지 않을 수도 있으므로 `?` 추가
  CharacterPortraitImage?: string; // ✅ API에서 이미지가 제공되지 않을 수도 있으므로 `?` 추가
  CharacterName: string;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ServerName: string;
  SelectedRaids?: Raid[]; // ✅ 선택한 레이드 목록
  SelectedRaidTotalGold?: number; // ✅ 선택한 레이드 총 금액
  ClearedRaidTotalGold?: number; // ✅ 클리어한 레이드 총 금액
  WeeklyRaidTotalGold?: number; // ✅ 주간 레이드 총 금액
  OtherActivity?: Activity[];
  OtherActivityTotalGold?: number; // ✅ 주간 활동 총 금액
  OtherActivityFolded?: boolean;
  LastUpdated?: string; // ✅ 마지막 업데이트 날짜
  AddedAt?: string; //추가된 날짜
  WeeklyRaidFolded?: boolean;
  IsBookmarked?: boolean;
  MissionCheckList?: checkListItem[];
  MissionCheckListTotalGold?: number; // 체크리스트에서 획득한 총 골드
  MissionCheckListFolded?: boolean; // 체크리스트 접기 상태
};

export type SortOrder = 'addedAt' | 'level' | 'server';

// ✅ Context에서 제공할 기능 정의
type CharacterContextType = {
  characters: Character[];
  addCharacter: (newCharacter: Character) => Promise<void>;
  removeCharacter: (id: string) => Promise<void>;
  updateCharacter: (
    id: string,
    updatedData: Partial<Character>
  ) => Promise<void>;
  refreshCharacter: (
    id: string,
    updatedData: Partial<Character>
  ) => Promise<void>;
  sortCharacter: (order: SortOrder) => Promise<void>;
  isLoaded: boolean;
};

// ✅ Context 생성
const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

// ✅ Provider 컴포넌트
export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAndMaybeReset = async () => {
      const storedCharacters = await AsyncStorage.getItem('characters');
      const parsedCharacters = storedCharacters
        ? JSON.parse(storedCharacters)
        : [];

      const now = new Date();
      const lastReset = await AsyncStorage.getItem('lastReset');

      const isAfterWednesday6AM = () => {
        const day = now.getDay();
        const hour = now.getHours();
        return day > 3 || (day === 3 && hour >= 6);
      };

      const getThisWednesday6AM = () => {
        const date = new Date(now);
        const currentDay = date.getDay();
        const daysSinceWednesday =
          currentDay >= 3 ? currentDay - 3 : 7 - (3 - currentDay);
        date.setDate(date.getDate() - daysSinceWednesday);
        date.setHours(6, 0, 0, 0);
        return date;
      };

      if (parsedCharacters.length > 0 && isAfterWednesday6AM()) {
        const wednesdayDate = getThisWednesday6AM();
        if (!lastReset || new Date(lastReset) < wednesdayDate) {
          await resetWeeklyCharacterTask(parsedCharacters);
          await AsyncStorage.setItem('lastReset', now.toISOString());
        } else {
          setCharacters(parsedCharacters);
        }
      } else {
        if (parsedCharacters.length > 0) {
          setCharacters(parsedCharacters);
        }
      }

      setIsLoaded(true); // ✅ 로딩과 초기화가 끝난 뒤에 호출
    };

    loadAndMaybeReset();
  }, []);

  const saveCharacters = async (data: Character[]) => {
    try {
      setCharacters(data);
      await AsyncStorage.setItem('characters', JSON.stringify(data));
    } catch (err) {
      console.error('캐릭터 저장 실패:', err);
      throw err;
    }
  };

  // ✅ 캐릭터 추가
  const addCharacter = async (newCharacter: Character) => {
    const id = uuid.v4().toString(); // UUID 생성
    const portraitImage = (await cropAndSavePortraitImage(
      newCharacter.CharacterImage || '', // 캐릭터 이미지
      id,
      newCharacter.CharacterClassName || '' // 캐릭터 클래스 이름
    )) as string;

    const updated = [
      ...characters,
      {
        ...newCharacter,
        id,
        CharacterPortraitImage: portraitImage,
        lastUpdated: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      },
    ];

    await saveCharacters(updated);
  };

  // ✅ 캐릭터 삭제
  const removeCharacter = async (id: string) => {
    const updated = characters.filter((c) => c.id !== id);
    await deletePortraitImage(id);
    await saveCharacters(updated);
  };

  // ✅ 캐릭터 정보 업데이트
  const updateCharacter = async (
    id: string,
    updatedData: Partial<Character>
  ) => {
    const updated = characters.map((char) =>
      char.id === id ? { ...char, ...updatedData } : char
    );
    await saveCharacters(updated);
  };

  // ✅ 캐릭터 갱신 이미지 포함
  const refreshCharacter = async (
    id: string,
    updatedData: Partial<Character>
  ) => {
    const portraitImage = (await cropAndSavePortraitImage(
      updatedData.CharacterImage || '', // 캐릭터 이미지
      id,
      updatedData.CharacterClassName || '' // 캐릭터 클래스 이름
    )) as string;

    const updated = characters.map((char) =>
      char.id === id
        ? {
            ...char,
            CharacterPortraitImage: portraitImage,
            CharacterClassName: updatedData.CharacterClassName || '',
            ItemAvgLevel: updatedData.ItemAvgLevel || '',
            ServerName: updatedData.ServerName || '',
            LastUpdated: new Date().toISOString(),
          }
        : char
    );

    await saveCharacters(updated);
  };

  const sortCharacter = async (order: SortOrder) => {
    let sortedList: Character[] = [];

    if (order === 'addedAt') {
      // 추가된 순 (오름차순)
      sortedList = [...characters].sort(
        (a, b) =>
          new Date(a.AddedAt || 0).getTime() -
          new Date(b.AddedAt || 0).getTime()
      );
    } else if (order === 'level') {
      // 레벨 높은 순 (문자열 → 숫자 변환)
      sortedList = [...characters].sort(
        (a, b) =>
          parseFloat(b.ItemAvgLevel.replace(/,/g, '')) -
          parseFloat(a.ItemAvgLevel.replace(/,/g, ''))
      );
    } else if (order === 'server') {
      // 서버별 최고 레벨 기준 정렬

      const serverMap: Record<string, Character[]> = {};
      for (const char of characters) {
        const server = char.ServerName || 'unknown';
        if (!serverMap[server]) serverMap[server] = [];
        serverMap[server].push(char);
      }

      const serverSorted = Object.entries(serverMap).sort(
        ([, listA], [, listB]) => {
          const maxLevelA = Math.max(
            ...listA.map((c) => parseFloat(c.ItemAvgLevel.replace(/,/g, '')))
          );
          const maxLevelB = Math.max(
            ...listB.map((c) => parseFloat(c.ItemAvgLevel.replace(/,/g, '')))
          );
          return maxLevelB - maxLevelA;
        }
      );

      sortedList = serverSorted.flatMap(([, list]) =>
        list.sort(
          (a, b) =>
            parseFloat(b.ItemAvgLevel.replace(/,/g, '')) -
            parseFloat(a.ItemAvgLevel.replace(/,/g, ''))
        )
      );
    }

    await saveCharacters(sortedList);
  };

  const resetWeeklyCharacterTask = async (targetCharacters: Character[]) => {
    if (targetCharacters.length === 0) {
      console.log('No characters to reset');
      return;
    } else {
      console.log('캐릭터 주간 숙제 삭제');
    }

    const updated = targetCharacters.map((c) => {
      const updatedRaids = c.SelectedRaids?.map((r) => ({
        ...r,
        cleared: false,
        stages: r.stages.map((s) => ({
          ...s,
          cleared: false,
        })),
      }));

      const updatedMission = c.MissionCheckList?.map((m) => {
        return {
          ...m,
          checked: m.resetPeriod === 'weekly' ? false : m.checked,
        };
      });

      return {
        ...c,
        SelectedRaids: updatedRaids,
        WeeklyActivity: [],
        WeeklyActivityTotalGold: 0,
        ClearedRaidTotalGold: 0,
        missionCheckList: updatedMission,
      };
    });

    await saveCharacters(updated);
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        addCharacter,
        removeCharacter,
        updateCharacter,
        refreshCharacter,
        sortCharacter,
        isLoaded,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

// ✅ 쉽게 접근할 수 있는 커스텀 훅
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
