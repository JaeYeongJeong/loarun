export type Difficulty = '싱글' | '노말' | '하드';

export type RaidStage = {
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
  chestCost: number;
  boundGold?: number; //귀속 골드
};

export type RaidDifficulty = {
  difficulty: Difficulty;
  stages: RaidStage[]; // 관문별 정보
  requiredItemLevel: number;
};

export type RaidData = {
  name: string;
  difficulties: RaidDifficulty[]; // 난이도별 구성
};

export const RAID_LIST: RaidData[] = [
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
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1700,
        stages: [
          { stage: 1, gold: 7000, chestCost: 2700 },
          { stage: 2, gold: 11000, chestCost: 4100 },
          { stage: 3, gold: 20000, chestCost: 5800 },
        ],
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
          { stage: 1, gold: 7250, chestCost: 3240 },
          { stage: 2, gold: 14250, chestCost: 4830 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1690,
        stages: [
          { stage: 1, gold: 10000, chestCost: 4500 },
          { stage: 2, gold: 20500, chestCost: 7200 },
        ],
      },
    ],
  },
  {
    name: '1막 에기르',
    difficulties: [
      {
        difficulty: '싱글',
        requiredItemLevel: 1660,
        stages: [
          { stage: 1, gold: 4750, boundGold: 2375, chestCost: 1030 },
          { stage: 2, gold: 10750, boundGold: 5375, chestCost: 2400 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1660,
        stages: [
          { stage: 1, gold: 4750, chestCost: 1030 },
          { stage: 2, gold: 10750, chestCost: 2400 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1680,
        stages: [
          { stage: 1, gold: 8000, chestCost: 3640 },
          { stage: 2, gold: 16500, chestCost: 5880 },
        ],
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
          { stage: 1, gold: 2800, chestCost: 920 },
          { stage: 2, gold: 6000, chestCost: 1960 },
        ],
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
          { stage: 1, gold: 2300, boundGold: 1150, chestCost: 380 },
          { stage: 2, gold: 5000, boundGold: 2500, chestCost: 840 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 2300, boundGold: 1150, chestCost: 380 },
          { stage: 2, gold: 5000, boundGold: 2500, chestCost: 840 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1640,
        stages: [
          { stage: 1, gold: 2800, chestCost: 920 },
          { stage: 2, gold: 6000, chestCost: 1960 },
        ],
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
          { stage: 1, gold: 1600, boundGold: 800, chestCost: 360 },
          { stage: 2, gold: 2000, boundGold: 1000, chestCost: 440 },
          { stage: 3, gold: 2800, boundGold: 1400, chestCost: 640 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1610,
        stages: [
          { stage: 1, gold: 1600, boundGold: 800, chestCost: 360 },
          { stage: 2, gold: 2000, boundGold: 1000, chestCost: 440 },
          { stage: 3, gold: 2800, boundGold: 1400, chestCost: 640 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1630,
        stages: [
          { stage: 1, gold: 2000, boundGold: 1000, chestCost: 580 },
          { stage: 2, gold: 2400, boundGold: 1200, chestCost: 600 },
          { stage: 3, gold: 3600, boundGold: 1800, chestCost: 900 },
          { stage: 4, gold: 5000, boundGold: 2500, chestCost: 1250 },
        ],
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
          { stage: 1, gold: 1200, boundGold: 600, chestCost: 180 },
          { stage: 2, gold: 1600, boundGold: 800, chestCost: 220 },
          { stage: 3, gold: 2400, boundGold: 1200, chestCost: 300 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1200, boundGold: 600, chestCost: 180 },
          { stage: 2, gold: 1600, boundGold: 800, chestCost: 220 },
          { stage: 3, gold: 2400, boundGold: 1200, chestCost: 300 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1620,
        stages: [
          { stage: 1, gold: 1400, boundGold: 700, chestCost: 350 },
          { stage: 2, gold: 2000, boundGold: 1000, chestCost: 500 },
          { stage: 3, gold: 3800, boundGold: 1900, chestCost: 950 },
        ],
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
          { stage: 1, gold: 850, boundGold: 425, chestCost: 190 },
          { stage: 2, gold: 1550, boundGold: 775, chestCost: 230 },
          { stage: 3, gold: 2300, boundGold: 1150, chestCost: 330 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 850, boundGold: 425, chestCost: 190 },
          { stage: 2, gold: 1550, boundGold: 775, chestCost: 230 },
          { stage: 3, gold: 2300, boundGold: 1150, chestCost: 330 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1600,
        stages: [
          { stage: 1, gold: 1200, boundGold: 600, chestCost: 300 },
          { stage: 2, gold: 2000, boundGold: 1000, chestCost: 500 },
          { stage: 3, gold: 2800, boundGold: 1400, chestCost: 700 },
        ],
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
          { stage: 1, gold: 750, boundGold: 375, chestCost: 180 },
          { stage: 2, gold: 1100, boundGold: 550, chestCost: 200 },
          { stage: 3, gold: 1450, boundGold: 725, chestCost: 270 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 750, boundGold: 375, chestCost: 180 },
          { stage: 2, gold: 1100, boundGold: 550, chestCost: 200 },
          { stage: 3, gold: 1450, boundGold: 725, chestCost: 270 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1580,
        stages: [
          { stage: 1, gold: 1400, boundGold: 450, chestCost: 250 },
          { stage: 2, gold: 1400, boundGold: 700, chestCost: 350 },
          { stage: 3, gold: 2000, boundGold: 1000, chestCost: 500 },
        ],
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
          { stage: 1, gold: 1000, boundGold: 500, chestCost: 100 },
          { stage: 2, gold: 1000, boundGold: 500, chestCost: 150 },
          { stage: 3, gold: 1000, boundGold: 500, chestCost: 200 },
          { stage: 4, gold: 1600, boundGold: 800, chestCost: 375 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1490,
        stages: [
          { stage: 1, gold: 1000, boundGold: 500, chestCost: 100 },
          { stage: 2, gold: 1000, boundGold: 500, chestCost: 150 },
          { stage: 3, gold: 1000, boundGold: 500, chestCost: 200 },
          { stage: 4, gold: 1600, boundGold: 800, chestCost: 375 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1540,
        stages: [
          { stage: 1, gold: 1200, boundGold: 600, chestCost: 300 },
          { stage: 2, gold: 1200, boundGold: 600, chestCost: 300 },
          { stage: 3, gold: 1200, boundGold: 600, chestCost: 300 },
          { stage: 4, gold: 2000, boundGold: 1000, chestCost: 500 },
        ],
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
          { stage: 1, gold: 600, boundGold: 300, chestCost: 100 },
          { stage: 2, gold: 900, boundGold: 450, chestCost: 150 },
          { stage: 3, gold: 1500, boundGold: 750, chestCost: 200 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1475,
        stages: [
          { stage: 1, gold: 600, boundGold: 300, chestCost: 100 },
          { stage: 2, gold: 900, boundGold: 450, chestCost: 150 },
          { stage: 3, gold: 1500, boundGold: 750, chestCost: 200 },
        ],
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
          { stage: 1, gold: 600, boundGold: 300, chestCost: 100 },
          { stage: 2, gold: 1000, boundGold: 500, chestCost: 150 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1430,
        stages: [
          { stage: 1, gold: 600, boundGold: 300, chestCost: 100 },
          { stage: 2, gold: 1000, boundGold: 500, chestCost: 150 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1460,
        stages: [
          { stage: 1, gold: 900, boundGold: 450, chestCost: 225 },
          { stage: 2, gold: 1500, boundGold: 750, chestCost: 375 },
        ],
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
          { stage: 1, gold: 500, boundGold: 250, chestCost: 75 },
          { stage: 2, gold: 700, boundGold: 350, chestCost: 100 },
        ],
      },
      {
        difficulty: '노말',
        requiredItemLevel: 1415,
        stages: [
          { stage: 1, gold: 500, boundGold: 250, chestCost: 75 },
          { stage: 2, gold: 700, boundGold: 350, chestCost: 100 },
        ],
      },
      {
        difficulty: '하드',
        requiredItemLevel: 1445,
        stages: [
          { stage: 1, gold: 700, boundGold: 350, chestCost: 175 },
          { stage: 2, gold: 1100, boundGold: 550, chestCost: 275 },
        ],
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
          { stage: 1, gold: 300, boundGold: 150, chestCost: 100 },
          { stage: 2, gold: 300, boundGold: 150, chestCost: 150 },
          { stage: 3, gold: 400, boundGold: 200, chestCost: 150 },
        ],
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
