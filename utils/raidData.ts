export type RaidDifficulty = '싱글' | '노말' | '하드';

export type RaidStage = {
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
};

export type RaidLevel = {
  difficulty: RaidDifficulty;
  stage: RaidStage[]; // 관문별 정보
  totalGold: number;
  requiredItemLevel: number;
};

export type Raid = {
  name: string;
  levels: RaidLevel[]; // 난이도별 구성
};

export const RAID_LIST: Raid[] = [
  {
    name: '카멘',
    levels: [
      {
        difficulty: '노말',
        requiredItemLevel: 1610,
        stage: [
          { stage: 1, gold: 3000 },
          { stage: 2, gold: 3000 },
          { stage: 3, gold: 3000 },
          { stage: 4, gold: 3000 },
        ],
        totalGold: 12000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1630,
        stage: [
          { stage: 1, gold: 3500 },
          { stage: 2, gold: 3500 },
          { stage: 3, gold: 3500 },
          { stage: 4, gold: 3500 },
        ],
        totalGold: 14000,
      },
    ],
  },
  {
    name: '카양겔',
    levels: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1475,
        stage: [
          { stage: 1, gold: 1300 },
          { stage: 2, gold: 1300 },
        ],
        totalGold: 2600,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1475,
        stage: [
          { stage: 1, gold: 1500 },
          { stage: 2, gold: 1500 },
        ],
        totalGold: 3000,
      },
    ],
  },
];
