import { fetchRaidData } from '@/utils/FetchLostArkAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaultRaids } from '@/utils/defaultRaids';

export type RaidDifficulty =
  | '싱글'
  | '노말'
  | '하드'
  | '익스트림 노말'
  | '익스트림 하드'
  | '헬'
  | '더퍼스트'
  | '나이트메어'
  | (string & {}); // 지정된 값 외에도 string 허용;

export type RaidStage = {
  stage: number;
  gold: number;
  chestCost?: number;
  boundGold?: number;
};

export type Difficulty = {
  difficulty: RaidDifficulty;
  stages: RaidStage[];
  requiredItemLevel: number;
};

export type Raid = {
  name: string;
  difficulties: Difficulty[];
};

type RaidContextType = {
  raids: Raid[];
  getAvailableRaidsByItemLevel: (itemLevel: number | string) => Raid[];
  getTopRaidsByItemLevel: (
    itemLevel: number | string,
    limit?: number
  ) => Raid[];
};

const RaidContext = createContext<RaidContextType | undefined>(undefined);

export const RaidProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [raids, setRaids] = useState<Raid[]>([]);

  useEffect(() => {
    const loadRaids = async () => {
      try {
        const fetchedData = await fetchRaidData();

        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          await AsyncStorage.setItem('raidData', JSON.stringify(fetchedData));
          setRaids(fetchedData);
          return;
        }

        const cachedData = await AsyncStorage.getItem('raidData');
        if (cachedData) {
          setRaids(JSON.parse(cachedData));
        } else {
          setRaids(defaultRaids);
        }
      } catch (error) {
        console.error('레이드 데이터 로드 실패:', error);
        setRaids(defaultRaids);
      }
    };

    loadRaids();
  }, []);

  const getAvailableRaidsByItemLevel = (
    itemLevelInput: number | string
  ): Raid[] => {
    const itemLevel =
      typeof itemLevelInput === 'string'
        ? parseFloat(itemLevelInput.replace(/,/g, ''))
        : itemLevelInput;

    return raids
      .map((raid) => {
        const availableDifficulties = raid.difficulties.filter(
          (diff) => diff.requiredItemLevel <= itemLevel
        );

        if (availableDifficulties.length === 0) return null;

        return {
          ...raid,
          difficulties: availableDifficulties,
        };
      })
      .filter((raid): raid is Raid => raid !== null);
  };

  const eligible = (d: RaidDifficulty) => d === '노말' || d === '하드';

  const getTopRaidsByItemLevel = (
    itemLevelInput: number | string,
    limit = 3
  ): Raid[] => {
    const itemLevel =
      typeof itemLevelInput === 'string'
        ? parseFloat(itemLevelInput.replace(/,/g, ''))
        : itemLevelInput;

    const perRaidBest = raids
      .map((raid) => {
        const bestDifficulty = raid.difficulties
          // 캐릭터 레벨을 초과하는 단계 제외
          .filter((diff) => diff.requiredItemLevel <= itemLevel)
          // 각 레이드에서 가장 높은 단계 1개 선택
          .sort((a, b) => b.requiredItemLevel - a.requiredItemLevel)[0];

        if (!bestDifficulty) return null;

        return {
          name: raid.name,
          difficulties: [bestDifficulty],
        };
      })
      .filter((raid): raid is Raid => raid !== null)
      // 전체 레이드 중 상위 레이드 정렬
      .sort(
        (a, b) =>
          b.difficulties[0].requiredItemLevel -
          a.difficulties[0].requiredItemLevel
      );

    return perRaidBest.slice(0, limit);
  };

  return (
    <RaidContext.Provider
      value={{ raids, getAvailableRaidsByItemLevel, getTopRaidsByItemLevel }}
    >
      {children}
    </RaidContext.Provider>
  );
};

export const useRaid = () => {
  const context = useContext(RaidContext);
  if (!context) {
    throw new Error('useRaid must be used within a RaidProvider');
  }
  return context;
};
