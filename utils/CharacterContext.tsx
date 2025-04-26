import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cropAndSavePortraitImage, deletePortraitImage } from './PortraitImage';
import uuid from 'react-native-uuid';

type RaidDifficulty = '싱글' | '노말' | '하드';

type RaidStage = {
  difficulty: RaidDifficulty; // 레이드 난이도 (싱글, 노말, 하드)
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
  cleared?: boolean; // ✅ 클리어 여부 (true/false)
  lastClearedStage?: number; // 마지막 클리어 관문 번호 (1, 2, 3...)
};

type Raid = {
  name: string;
  stages: RaidStage[]; // 레이드 단계별 정보
  totalGold: number;
  cleared?: boolean; // ✅ 클리어 여부 (true/false)
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
  ItemAvgLevel: number;
  ServerName: string;
  SelectedRaids?: Raid[]; // ✅ 선택한 레이드 목록
  SelectedRaidTotalGold?: number; // ✅ 선택한 레이드 총 금액
  ClearedRaidTotalGold?: number; // ✅ 클리어한 레이드 총 금액
  WeeklyActivity?: Activity[];
  WeeklyRaidTotalGold?: number; // ✅ 주간 레이드 총 금액
  WeeklyActivityTotalGold?: number; // ✅ 주간 활동 총 금액
  lastUpdated?: string; // ✅ 마지막 업데이트 날짜
};

// ✅ Context에서 제공할 기능 정의
type CharacterContextType = {
  characters: Character[];
  addCharacter: (newCharacter: Character) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, updatedData: Partial<Character>) => void;
  refreshCharacter: (id: string, updatedData: Partial<Character>) => void;
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

  // ✅ 저장된 캐릭터 불러오기
  useEffect(() => {
    const loadCharacters = async () => {
      const storedCharacters = await AsyncStorage.getItem('characters');
      if (storedCharacters) {
        setCharacters(JSON.parse(storedCharacters));
      }
    };
    loadCharacters();
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
            lastUpdated: new Date().toISOString(),
          }
        : char
    );

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
