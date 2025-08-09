import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cropAndSavePortraitImage,
  deletePortraitImage,
} from '@/utils/PortraitImage';
import uuid from 'react-native-uuid';
import { checkListItem } from '@/utils/missionCheckListData';
import { SortOrder } from '@/context/AppSettingContext';
import { useRaid, RaidDifficulty } from '@/context/RaidContext';

type SelectedRaidStage = {
  difficulty: RaidDifficulty;
  stage: number;
  gold: number;
  chestCost?: number;
  boundGold?: number;
  selectedChestCost?: boolean;
  cleared?: boolean;
  lastClearedStage?: number;
};

type SelectedRaid = {
  name: string;
  stages: SelectedRaidStage[];
  cleared?: boolean;
  goldChecked?: boolean;
  additionalGoldCheked?: boolean;
  additionalGold?: string;
  chestCostChecked?: boolean;
};

type Activity = {
  name: string;
  gold: number;
};

export type Character = {
  id: string;
  CharacterImage?: string;
  CharacterPortraitImage?: string;
  CharacterName: string;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ServerName: string;
  SelectedRaids?: SelectedRaid[];
  OtherActivity?: Activity[];
  OtherActivityFolded?: boolean;
  LastUpdated?: string;
  AddedAt?: string;
  WeeklyRaidFolded?: boolean;
  IsBookmarked?: boolean;
  MissionCheckList?: checkListItem[];
  MissionCheckListFolded?: boolean;
  OtherActivityTotalGold?: number;
  ClearedRaidTotalGold?: number;
};

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
  // ⚠️ addCharacter에서 정렬 대상 배열을 넘겨 쓰므로 선택 인자 허용
  sortCharacter: (
    order: SortOrder,
    inputCharacters?: Character[]
  ) => Promise<void>;
  isLoaded: boolean;
};

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { raids, getTopRaidsByItemLevel } = useRaid();

  // stable saver
  const saveCharacters = useCallback(async (data: Character[]) => {
    setCharacters(data);
    await AsyncStorage.setItem('characters', JSON.stringify(data));
  }, []);

  // 1) 캐릭터 로드 (마운트 1회)
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('characters');
        setCharacters(stored ? JSON.parse(stored) : []);
      } catch (err) {
        console.error('캐릭터 로드 실패:', err);
        setCharacters([]);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // 2) 일일/주간 초기화 (로드 끝난 뒤 1회)
  useEffect(() => {
    if (!isLoaded) return;

    const maybeReset = async () => {
      const storedCharacters = await AsyncStorage.getItem('characters');
      const parsedCharacters: Character[] = storedCharacters
        ? JSON.parse(storedCharacters)
        : [];

      if (parsedCharacters.length === 0) return;

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
        if (now.getHours() < 6) date.setDate(date.getDate() - 1);
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
        const updated = await resetCharacterTask(parsedCharacters, 'weekly');
        if (updated)
          await AsyncStorage.setItem('lastWeeklyReset', now.toISOString());
        console.log('✅ 주간 초기화 완료:', now.toLocaleString());
      } else if (!dailyResetDate || dailyResetDate < last6AM) {
        const updated = await resetCharacterTask(parsedCharacters, 'daily');
        if (updated)
          await AsyncStorage.setItem('lastDailyReset', now.toISOString());
        console.log('✅ 일일 초기화 완료:', now.toLocaleString());
      }
      // await resetCharacterTask(parsedCharacters, 'daily');
      // await resetCharacterTask(parsedCharacters, 'weekly');
    };

    maybeReset().catch((e) => console.error('초기화 체크 실패:', e));
  }, [isLoaded]); // 의존성: isLoaded 만

  // 3) 선택 레이드 금액 동기화 (변경 있을 때만 저장 + 한 번만)
  const equalStage = (a: SelectedRaidStage, b: SelectedRaidStage) =>
    a.gold === b.gold && a.chestCost === b.chestCost;

  const syncedRef = useRef(false);

  const syncSelectedRaidData = useCallback(async () => {
    if (!isLoaded || raids.length === 0 || syncedRef.current) return;

    let changed = false;

    const updated = characters.map((char) => {
      if (!char.SelectedRaids) return char;

      const nextSelected = char.SelectedRaids.map((selectedRaid) => {
        const raidData = raids.find((r) => r.name === selectedRaid.name);
        if (!raidData) return selectedRaid;

        const nextStages = selectedRaid.stages.map((stage) => {
          const stageData = raidData.difficulties.find(
            (d) => d.difficulty === stage.difficulty
          );
          const matchedStage = stageData?.stages.find(
            (s) => s.stage === stage.stage
          );
          if (!matchedStage) return stage;

          const next = {
            ...stage,
            gold: matchedStage.gold,
            chestCost: matchedStage.chestCost,
          };
          if (!equalStage(stage, next)) changed = true;
          return next;
        });

        return { ...selectedRaid, stages: nextStages };
      });

      return { ...char, SelectedRaids: nextSelected };
    });

    if (changed) {
      await saveCharacters(updated);
    }
    syncedRef.current = true; // 재실행 방지
  }, [isLoaded, raids, characters, saveCharacters]);

  useEffect(() => {
    syncSelectedRaidData();
  }, [syncSelectedRaidData]);

  // CRUD & helpers
  const addCharacter = async (
    newCharacter: Character,
    sortOrder: SortOrder
  ) => {
    const id = uuid.v4().toString();

    const portraitImage = (await cropAndSavePortraitImage(
      newCharacter.CharacterImage || '',
      id,
      newCharacter.CharacterClassName || ''
    )) as string;

    // raids가 아직 안 로드된 경우 대비
    let defaultSelectedRaids: SelectedRaid[] = [];

    if (typeof getTopRaidsByItemLevel === 'function' && raids.length > 0) {
      const top3 = getTopRaidsByItemLevel(
        parseFloat(newCharacter.ItemAvgLevel.replace(/,/g, '')),
        3
      );

      defaultSelectedRaids = top3.map((raid) => {
        const diff = raid.difficulties[0];
        return {
          name: raid.name,
          stages: diff.stages.map((s) => ({
            difficulty: diff.difficulty,
            stage: s.stage,
            gold: s.gold,
            chestCost: s.chestCost,
            boundGold: s.boundGold,
            selectedChestCost: false,
            cleared: false,
            lastClearedStage: 0,
          })),
          cleared: false,
          goldChecked: true,
          additionalGoldCheked: false,
          additionalGold: '',
          chestCostChecked: false,
        };
      });
    }

    const next = [
      ...characters,
      {
        ...newCharacter,
        id,
        CharacterPortraitImage: portraitImage,
        LastUpdated: new Date().toISOString(),
        AddedAt: new Date().toISOString(),
        SelectedRaids: defaultSelectedRaids, // ✅ 복수형으로 저장
      },
    ];

    await sortCharacter(sortOrder, next);
  };

  const removeCharacter = async (id: string) => {
    const updated = characters.filter((c) => c.id !== id);
    await deletePortraitImage(id);
    await saveCharacters(updated);
  };

  const updateCharacter = async (
    id: string,
    updatedData: Partial<Character>
  ) => {
    const updated = characters.map((char) =>
      char.id === id ? { ...char, ...updatedData } : char
    );
    await saveCharacters(updated);
  };

  const refreshCharacter = async (
    id: string,
    updatedData: Partial<Character>
  ) => {
    const portraitImage = (await cropAndSavePortraitImage(
      updatedData.CharacterImage || '',
      id,
      updatedData.CharacterClassName || ''
    )) as string;

    const updated = characters.map((char) =>
      char.id === id
        ? {
            ...char,
            CharacterPortraitImage: portraitImage,
            CharacterClassName:
              updatedData.CharacterClassName || char.CharacterClassName,
            ItemAvgLevel: updatedData.ItemAvgLevel || char.ItemAvgLevel,
            ServerName: updatedData.ServerName || char.ServerName,
            LastUpdated: new Date().toISOString(),
          }
        : char
    );

    await saveCharacters(updated);
  };

  const sortCharacter = async (
    order: SortOrder,
    inputCharacters?: Character[]
  ) => {
    const target = inputCharacters ?? characters;
    let sortedList: Character[] = [];

    if (order === 'addedAt') {
      sortedList = [...target].sort(
        (a, b) =>
          new Date(a.AddedAt || 0).getTime() -
          new Date(b.AddedAt || 0).getTime()
      );
    } else if (order === 'level') {
      sortedList = [...target].sort(
        (a, b) =>
          parseFloat(b.ItemAvgLevel.replace(/,/g, '')) -
          parseFloat(a.ItemAvgLevel.replace(/,/g, ''))
      );
    } else if (order === 'server') {
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
              stages: r.stages.map((s) => ({ ...s, cleared: false })),
            }))
          : c.SelectedRaids;

      const updatedMission = c.MissionCheckList?.map((m) => {
        const shouldReset =
          type === 'weekly'
            ? m.resetPeriod === 'daily' || m.resetPeriod === 'weekly'
            : m.resetPeriod === 'daily';
        return { ...m, checked: shouldReset ? false : m.checked };
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

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
