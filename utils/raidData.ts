export type Difficulty = '싱글' | '노말' | '하드';

export type RaidStage = {
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
};

export type RaidDifficulty = {
  difficulty: Difficulty;
  stages: RaidStage[]; // 관문별 정보
  totalGold: number;
  requiredItemLevel: number;
};

export type Raid = {
  name: string;
  difficulty: RaidDifficulty[]; // 난이도별 구성
};

export const RAID_LIST: Raid[] = [
  {
    name: '강습 타르칼',
    difficulty: [
      {
        difficulty: '노말',
        requiredItemLevel: 1680,
        stages: [{ stage: 1, gold: 10000 }],
        totalGold: 10000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1720,
        stages: [{ stage: 1, gold: 18000 }],
        totalGold: 18000,
      },
    ],
  },
  {
    name: '3막 모르둠',
    difficulty: [
      {
        difficulty: '노말',
        requiredItemLevel: 1680,
        stages: [
          { stage: 1, gold: 6000 },
          { stage: 2, gold: 9500 },
          { stage: 3, gold: 12500 },
        ],
        totalGold: 28000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1700,
        stages: [
          { stage: 1, gold: 7000 },
          { stage: 2, gold: 11000 },
          { stage: 3, gold: 16000 },
        ],
        totalGold: 34000,
      },
    ],
  },
  {
    name: '2막 아브렐슈드',
    difficulty: [
      {
        difficulty: '노말',
        requiredItemLevel: 1670,
        stages: [
          { stage: 1, gold: 8500 },
          { stage: 2, gold: 16500 },
        ],
        totalGold: 25000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1690,
        stages: [
          { stage: 1, gold: 10000 },
          { stage: 2, gold: 20500 },
        ],
        totalGold: 30500,
      },
    ],
  },
  {
    name: '1막 에기르',
    difficulty: [
      {
        difficulty: '노말',
        requiredItemLevel: 1660,
        stages: [
          { stage: 1, gold: 5500 },
          { stage: 2, gold: 12500 },
        ],
        totalGold: 18000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1680,
        stages: [
          { stage: 1, gold: 9000 },
          { stage: 2, gold: 18500 },
        ],
        totalGold: 27500,
      },
    ],
  },
  {
    name: '베히모스',
    difficulty: [
      {
        difficulty: '노말',
        requiredItemLevel: 1640,
        stages: [
          { stage: 1, gold: 3500 },
          { stage: 2, gold: 7500 },
        ],
        totalGold: 11000,
      },
    ],
  },
  {
    name: '에키드나',
    difficulty: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 2400 },
          { stage: 2, gold: 5200 },
        ],
        totalGold: 7600,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 3000 },
          { stage: 2, gold: 6500 },
        ],
        totalGold: 9500,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1640,
        stages: [
          { stage: 1, gold: 3500 },
          { stage: 2, gold: 7500 },
        ],
        totalGold: 11000,
      },
    ],
  },
  {
    name: '카멘',
    difficulty: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1610,
        stages: [
          { stage: 1, gold: 1600 },
          { stage: 2, gold: 2000 },
          { stage: 3, gold: 2800 },
        ],
        totalGold: 6400,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1610,
        stages: [
          { stage: 1, gold: 2000 },
          { stage: 2, gold: 2500 },
          { stage: 3, gold: 3500 },
        ],
        totalGold: 8000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1630,
        stages: [
          { stage: 1, gold: 2500 },
          { stage: 2, gold: 3000 },
          { stage: 3, gold: 4500 },
          { stage: 4, gold: 5500 },
        ],
        totalGold: 15500,
      },
    ],
  },
  {
    name: '상아탑',
    difficulty: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1200 },
          { stage: 2, gold: 1600 },
          { stage: 3, gold: 2400 },
        ],
        totalGold: 5200,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1500 },
          { stage: 2, gold: 2000 },
          { stage: 3, gold: 3000 },
        ],
        totalGold: 6500,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 1750 },
          { stage: 2, gold: 2500 },
          { stage: 3, gold: 4750 },
        ],
        totalGold: 9000,
      },
    ],
  },
  {
    name: '일리아칸',
    difficulty: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 800 },
          { stage: 2, gold: 1440 },
          { stage: 3, gold: 2080 },
        ],
        totalGold: 4320,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 1000 },
          { stage: 2, gold: 1800 },
          { stage: 3, gold: 2600 },
        ],
        totalGold: 5400,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1500 },
          { stage: 2, gold: 2500 },
          { stage: 3, gold: 3500 },
        ],
        totalGold: 7500,
      },
    ],
  },
  {
    name: '카양겔',
    difficulty: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 640 },
          { stage: 2, gold: 960 },
          { stage: 3, gold: 1280 },
        ],
        totalGold: 2880,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 800 },
          { stage: 2, gold: 1200 },
          { stage: 3, gold: 1600 },
        ],
        totalGold: 3600,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 1000 },
          { stage: 2, gold: 1600 },
          { stage: 3, gold: 2200 },
        ],
        totalGold: 4800,
      },
    ],
  },
];

export function getAvailableRaidsByItemLevel(
  itemLevelInput: number | string
): Raid[] {
  const itemLevel =
    typeof itemLevelInput === 'string'
      ? parseFloat(itemLevelInput.replace(/,/g, ''))
      : itemLevelInput;

  return RAID_LIST.map((raid) => {
    const availableDifficulties = raid.difficulty.filter(
      (diff) => diff.requiredItemLevel <= itemLevel
    );

    if (availableDifficulties.length === 0) return null;

    return {
      ...raid,
      difficulty: availableDifficulties,
    };
  }).filter((raid): raid is Raid => raid !== null);
}
