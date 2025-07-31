import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cropAndSavePortraitImage,
  deletePortraitImage,
} from '../utils/PortraitImage';
import uuid from 'react-native-uuid';
import { checkListItem } from '@/utils/missionCheckListData';
import { RAID_LIST } from '@/utils/raidData';
import { Difficulty as RaidDifficulty } from '@/utils/raidData';
import { SortOrder } from '@/context/AppSettingContext';

export { RaidDifficulty };

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
  cleared?: boolean; // ✅ 클리어 여부 (true/false)
  goldChecked?: boolean;
  additionalGoldCheked?: boolean; //추가 골드 선택 여부
  additionalGold?: string;
  chestCostChecked?: boolean;
};

type Activity = {
  name: string;
  gold: number;
};

// ✅ `Character` 타입 정의 (CharacterImage 추가됨)
export type Character = {
  id: string;
  CharacterImage?: string; // ✅ API에서 이미지가 제공되지 않을 수도 있으므로 `?` 추가
  CharacterPortraitImage?: string; // ✅ API에서 이미지가 제공되지 않을 수도 있으므로 `?` 추가
  CharacterName: string;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ServerName: string;
  SelectedRaids?: Raid[]; // ✅ 선택한 레이드 목록
  OtherActivity?: Activity[];
  OtherActivityFolded?: boolean;
  LastUpdated?: string; // ✅ 마지막 업데이트 날짜
  AddedAt?: string; //추가된 날짜
  WeeklyRaidFolded?: boolean;
  IsBookmarked?: boolean;
  MissionCheckList?: checkListItem[];
  MissionCheckListFolded?: boolean; // 체크리스트 접기 상태
};

// ✅ Context에서 제공할 기능 정의
type CharacterContextType = {
  characters: Character[];
  addCharacter: (
    newCharacter: Character,
    sortOrder: SortOrder
  ) => Promise<void>;
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

  // ✅ 초기화 및 캐릭터 로드
  useEffect(() => {
    // 캐릭터 로드 함수
    const loadCharacters = async () => {
      try {
        const storedCharacters = await AsyncStorage.getItem('characters');
        if (storedCharacters) {
          setCharacters(JSON.parse(storedCharacters));
        } else {
          setCharacters([]); // 초기값 설정
        }
      } catch (err) {
        console.error('캐릭터 로드 실패:', err);
      }
    };
    // ✅ 일일/주간 초기화 함수
    const maybeReset = async () => {
      const storedCharacters = await AsyncStorage.getItem('characters');
      const parsedCharacters = storedCharacters
        ? JSON.parse(storedCharacters)
        : [];

      const now = new Date();
      const lastDailyReset = await AsyncStorage.getItem('lastDailyReset');
      const lastWeeklyReset = await AsyncStorage.getItem('lastWeeklyReset');

      const isAfterWednesday6AM = () => {
        const day = now.getDay();
        const hour = now.getHours();
        return day > 3 || (day === 3 && hour >= 6);
      };

      const getLast6AM = () => {
        const date = new Date(now);
        if (now.getHours() < 6) {
          date.setDate(date.getDate() - 1); // 전날로 보냄
        }
        date.setHours(6, 0, 0, 0);
        return date;
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

      if (parsedCharacters.length > 0) {
        const last6AM = getLast6AM();
        const dailyResetDate = lastDailyReset ? new Date(lastDailyReset) : null;
        const weeklyResetDate = lastWeeklyReset
          ? new Date(lastWeeklyReset)
          : null;
        const wednesdayDate = getThisWednesday6AM();

        if (
          isAfterWednesday6AM() &&
          (!weeklyResetDate || weeklyResetDate < wednesdayDate)
        ) {
          await resetCharacterTask(parsedCharacters, 'weekly');
          await AsyncStorage.setItem('lastWeeklyReset', now.toISOString());
          console.log('✅ 주간 초기화 완료:', now.toLocaleString());
        } else if (!dailyResetDate || dailyResetDate < last6AM) {
          await resetCharacterTask(parsedCharacters, 'daily');
          await AsyncStorage.setItem('lastDailyReset', now.toISOString());
          console.log('✅ 일일 초기화 완료:', now.toLocaleString());
        }
      }
      //일일/주간 초기화 테스트
      // await resetCharacterTask(parsedCharacters, 'daily');
      // await resetCharacterTask(parsedCharacters, 'weekly');
    };

    // ✅ 선택한 레이드 데이터 업데이트 함수
    const updateSelectedRaidData = async () => {
      const storedCharacters = await AsyncStorage.getItem('characters');
      const parsedCharacters = storedCharacters
        ? JSON.parse(storedCharacters)
        : [];

      parsedCharacters.forEach((char: Character) => {
        char.SelectedRaids?.forEach((raid) => {
          const raidData = RAID_LIST.find((r) => r.name === raid.name);
          if (!raidData) return;

          raid.stages.forEach((stage) => {
            const stageData = raidData.difficulties.find(
              (d) => d.difficulty === stage.difficulty
            );

            const matchedStage = stageData?.stages.find(
              (s) => s.stage === stage.stage
            );

            if (matchedStage) {
              stage.gold = matchedStage.gold;
              stage.chestCost = matchedStage.chestCost;
            }
          });
        });
      });
      saveCharacters(parsedCharacters);
    };

    // ✅ 초기화 함수 실행
    const initialize = async () => {
      await loadCharacters();
      await maybeReset();
      await updateSelectedRaidData();
      setIsLoaded(true);
    };

    initialize();
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
  const addCharacter = async (
    newCharacter: Character,
    sortOrder: SortOrder
  ) => {
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
        LastUpdated: new Date().toISOString(),
        AddedAt: new Date().toISOString(),
      },
    ];
    await sortCharacter(sortOrder, updated);
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

  const sortCharacter = async (
    order: SortOrder,
    inputCharacters?: Character[] // 두 번째 인자가 있으면 그것을 사용
  ) => {
    const target = inputCharacters ?? characters; // 인자가 없으면 현재 상태 사용
    let sortedList: Character[] = [];

    if (order === 'addedAt') {
      // 추가된 순 (오름차순)
      sortedList = [...target].sort(
        (a, b) =>
          new Date(a.AddedAt || 0).getTime() -
          new Date(b.AddedAt || 0).getTime()
      );
    } else if (order === 'level') {
      // 레벨 높은 순
      sortedList = [...target].sort(
        (a, b) =>
          parseFloat(b.ItemAvgLevel.replace(/,/g, '')) -
          parseFloat(a.ItemAvgLevel.replace(/,/g, ''))
      );
    } else if (order === 'server') {
      // 서버별 최고 레벨 기준 정렬
      const serverMap: Record<string, Character[]> = {};

      for (const char of target) {
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

  const resetCharacterTask = async (
    targetCharacters: Character[],
    type: 'daily' | 'weekly'
  ) => {
    if (targetCharacters.length === 0) return;

    const updated = targetCharacters.map((c) => {
      const updatedRaids =
        type === 'weekly'
          ? c.SelectedRaids?.map((r) => ({
              ...r,
              cleared: false,
              stages: r.stages.map((s) => ({
                ...s,
                cleared: false,
              })),
            }))
          : c.SelectedRaids;

      const updatedMission = c.MissionCheckList?.map((m) => {
        const shouldReset =
          type === 'weekly'
            ? m.resetPeriod === 'daily' || m.resetPeriod === 'weekly'
            : m.resetPeriod === 'daily';

        return {
          ...m,
          checked: shouldReset ? false : m.checked,
        };
      });

      return {
        ...c,
        SelectedRaids: updatedRaids,
        MissionCheckList: updatedMission,
        ...(type === 'weekly' && {
          OtherActivity: [],
          OtherActivityTotalGold: 0,
          ClearedRaidTotalGold: 0,
        }),
      };
    });

    await saveCharacters(updated);
    return updated;
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
