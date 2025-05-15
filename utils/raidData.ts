export type Difficulty = '싱글' | '노말' | '하드';

export type RaidStage = {
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
  chestCost: number;
};

export type RaidDifficulty = {
  difficulty: Difficulty;
  stages: RaidStage[]; // 관문별 정보
  totalGold: number;
  requiredItemLevel: number;
};

export type RaidData = {
  name: string;
  difficulties: RaidDifficulty[]; // 난이도별 구성
};

export const RAID_LIST: RaidData[] = [
  {
    name: '강습 타르칼',
    difficulties: [
      {
        difficulty: '노말',
        requiredItemLevel: 1680,
        stages: [{ stage: 1, gold: 10000, chestCost: 4000 }],
        totalGold: 10000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1720,
        stages: [{ stage: 1, gold: 18000, chestCost: 6000 }],
        totalGold: 18000,
      },
    ],
  },
  {
    name: '3막 모르둠',
    difficulties: [
      {
        difficulty: '노말',
        requiredItemLevel: 1680,
        stages: [
          { stage: 1, gold: 6000, chestCost: 2400 },
          { stage: 2, gold: 9500, chestCost: 3200 },
          { stage: 3, gold: 12500, chestCost: 4200 },
        ],
        totalGold: 28000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1700,
        stages: [
          { stage: 1, gold: 7000, chestCost: 2700 },
          { stage: 2, gold: 11000, chestCost: 4100 },
          { stage: 3, gold: 20000, chestCost: 5800 },
        ],
        totalGold: 38000,
      },
    ],
  },
  {
    name: '2막 아브렐슈드',
    difficulties: [
      {
        difficulty: '노말',
        requiredItemLevel: 1670,
        stages: [
          { stage: 1, gold: 8500, chestCost: 3800 },
          { stage: 2, gold: 16500, chestCost: 5600 },
        ],
        totalGold: 25000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1690,
        stages: [
          { stage: 1, gold: 10000, chestCost: 4500 },
          { stage: 2, gold: 20500, chestCost: 7200 },
        ],
        totalGold: 30500,
      },
    ],
  },
  {
    name: '1막 에기르',
    difficulties: [
      {
        difficulty: '노말',
        requiredItemLevel: 1660,
        stages: [
          { stage: 1, gold: 5500, chestCost: 1800 },
          { stage: 2, gold: 12500, chestCost: 4200 },
        ],
        totalGold: 18000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1680,
        stages: [
          { stage: 1, gold: 9000, chestCost: 4100 },
          { stage: 2, gold: 18500, chestCost: 6600 },
        ],
        totalGold: 27500,
      },
    ],
  },
  {
    name: '베히모스',
    difficulties: [
      {
        difficulty: '노말',
        requiredItemLevel: 1640,
        stages: [
          { stage: 1, gold: 3500, chestCost: 1150 },
          { stage: 2, gold: 7500, chestCost: 2460 },
        ],
        totalGold: 11000,
      },
    ],
  },
  {
    name: '에키드나',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 2400, chestCost: 500 },
          { stage: 2, gold: 5200, chestCost: 1100 },
        ],
        totalGold: 7600,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 3000, chestCost: 1000 },
          { stage: 2, gold: 6500, chestCost: 2200 },
        ],
        totalGold: 9500,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1640,
        stages: [
          { stage: 1, gold: 3500, chestCost: 1150 },
          { stage: 2, gold: 7500, chestCost: 2460 },
        ],
        totalGold: 11000,
      },
    ],
  },
  {
    name: '카멘',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1610,
        stages: [
          { stage: 1, gold: 1600, chestCost: 450 },
          { stage: 2, gold: 2000, chestCost: 550 },
          { stage: 3, gold: 2800, chestCost: 800 },
        ],
        totalGold: 6400,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1610,
        stages: [
          { stage: 1, gold: 2000, chestCost: 640 },
          { stage: 2, gold: 2500, chestCost: 830 },
          { stage: 3, gold: 3500, chestCost: 1160 },
        ],
        totalGold: 8000,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1630,
        stages: [
          { stage: 1, gold: 2500, chestCost: 780 },
          { stage: 2, gold: 3000, chestCost: 1000 },
          { stage: 3, gold: 4500, chestCost: 1440 },
          { stage: 4, gold: 5500, chestCost: 1650 },
        ],
        totalGold: 15500,
      },
    ],
  },
  {
    name: '상아탑',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1200, chestCost: 250 },
          { stage: 2, gold: 1600, chestCost: 350 },
          { stage: 3, gold: 2400, chestCost: 550 },
        ],
        totalGold: 5200,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1500, chestCost: 600 },
          { stage: 2, gold: 2000, chestCost: 650 },
          { stage: 3, gold: 3000, chestCost: 1000 },
        ],
        totalGold: 6500,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 1750, chestCost: 620 },
          { stage: 2, gold: 2500, chestCost: 830 },
          { stage: 3, gold: 4750, chestCost: 1550 },
        ],
        totalGold: 9000,
      },
    ],
  },
  {
    name: '일리아칸',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 800, chestCost: 225 },
          { stage: 2, gold: 1440, chestCost: 275 },
          { stage: 3, gold: 2080, chestCost: 375 },
        ],
        totalGold: 4320,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 1000, chestCost: 450 },
          { stage: 2, gold: 1800, chestCost: 550 },
          { stage: 3, gold: 2600, chestCost: 750 },
        ],
        totalGold: 5400,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1500, chestCost: 600 },
          { stage: 2, gold: 2500, chestCost: 700 },
          { stage: 3, gold: 3500, chestCost: 950 },
        ],
        totalGold: 7500,
      },
    ],
  },
  {
    name: '카양겔',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 640, chestCost: 200 },
          { stage: 2, gold: 960, chestCost: 225 },
          { stage: 3, gold: 1280, chestCost: 300 },
        ],
        totalGold: 2880,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 800, chestCost: 300 },
          { stage: 2, gold: 1200, chestCost: 400 },
          { stage: 3, gold: 1600, chestCost: 500 },
        ],
        totalGold: 3600,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 1000, chestCost: 350 },
          { stage: 2, gold: 1600, chestCost: 500 },
          { stage: 3, gold: 2200, chestCost: 700 },
        ],
        totalGold: 4800,
      },
    ],
  },
  {
    name: '아브렐슈드',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1490,
        stages: [
          { stage: 1, gold: 800, chestCost: 100 },
          { stage: 2, gold: 800, chestCost: 150 },
          { stage: 3, gold: 800, chestCost: 200 },
          { stage: 4, gold: 1280, chestCost: 375 },
        ],
        totalGold: 3680,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1490,
        stages: [
          { stage: 1, gold: 1000, chestCost: 250 },
          { stage: 2, gold: 1000, chestCost: 300 },
          { stage: 3, gold: 1000, chestCost: 400 },
          { stage: 4, gold: 1600, chestCost: 600 },
        ],
        totalGold: 4600,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 1200, chestCost: 400 },
          { stage: 2, gold: 1200, chestCost: 400 },
          { stage: 3, gold: 1200, chestCost: 500 },
          { stage: 4, gold: 2000, chestCost: 800 },
        ],
        totalGold: 5600,
      },
    ],
  },
  {
    name: '쿠크세이튼',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1475,
        stages: [
          { stage: 1, gold: 480, chestCost: 100 },
          { stage: 2, gold: 720, chestCost: 150 },
          { stage: 3, gold: 1200, chestCost: 200 },
        ],
        totalGold: 2400,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1475,
        stages: [
          { stage: 1, gold: 600, chestCost: 300 },
          { stage: 2, gold: 900, chestCost: 500 },
          { stage: 3, gold: 1500, chestCost: 700 },
        ],
        totalGold: 3000,
      },
    ],
  },
  {
    name: '비아키스',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1430,
        stages: [
          { stage: 1, gold: 480, chestCost: 100 },
          { stage: 2, gold: 800, chestCost: 150 },
        ],
        totalGold: 1280,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1430,
        stages: [
          { stage: 1, gold: 600, chestCost: 300 },
          { stage: 2, gold: 1000, chestCost: 450 },
        ],
        totalGold: 1600,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1460,
        stages: [
          { stage: 1, gold: 900, chestCost: 500 },
          { stage: 2, gold: 1500, chestCost: 650 },
        ],
        totalGold: 2400,
      },
    ],
  },
  {
    name: '발탄',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1415,
        stages: [
          { stage: 1, gold: 400, chestCost: 75 },
          { stage: 2, gold: 560, chestCost: 100 },
        ],
        totalGold: 960,
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1415,
        stages: [
          { stage: 1, gold: 500, chestCost: 300 },
          { stage: 2, gold: 700, chestCost: 400 },
        ],
        totalGold: 1200,
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1445,
        stages: [
          { stage: 1, gold: 700, chestCost: 450 },
          { stage: 2, gold: 1100, chestCost: 600 },
        ],
        totalGold: 1800,
      },
    ],
  },
  {
    name: '아르고스',
    difficulties: [
      {
        difficulty: '노말',
        requiredItemLevel: 1370,
        stages: [
          { stage: 1, gold: 300, chestCost: 100 },
          { stage: 2, gold: 300, chestCost: 150 },
          { stage: 3, gold: 400, chestCost: 150 },
        ],
        totalGold: 1000,
      },
    ],
  },
];
export function getAvailableRaidsByItemLevel(
  itemLevelInput: number | string
): RaidData[] {
  const itemLevel =
    typeof itemLevelInput === 'string'
      ? parseFloat(itemLevelInput.replace(/,/g, ''))
      : itemLevelInput;

  return RAID_LIST.map((raid) => {
    const availableDifficulties = raid.difficulties.filter(
      (diff) => diff.requiredItemLevel <= itemLevel
    );

    if (availableDifficulties.length === 0) return null;

    return {
      ...raid,
      difficulties: availableDifficulties,
    };
  }).filter((raid): raid is RaidData => raid !== null);
}
