import { Raid } from '@/context/RaidContext';

export const defaultRaids: Raid[] = [
  {
    "name": "지평의 성당",
    "difficulties": [
      {
        "difficulty": "1단계",
        "requiredItemLevel": 1700,
        "stages": [
          {
            "stage": 1,
            "gold": 13500,
            "boundGold": 13500,
            "chestCost": 4320
          },
          {
            "stage": 2,
            "gold": 16500,
            "boundGold": 16500,
            "chestCost": 5280
          }
        ]
      },
      {
        "difficulty": "2단계",
        "requiredItemLevel": 1720,
        "stages": [
          {
            "stage": 1,
            "gold": 16000,
            "boundGold": 16000,
            "chestCost": 5120
          },
          {
            "stage": 2,
            "gold": 24000,
            "boundGold": 24000,
            "chestCost": 7680
          }
        ]
      },
      {
        "difficulty": "3단계",
        "requiredItemLevel": 1750,
        "stages": [
          {
            "stage": 1,
            "gold": 20000,
            "boundGold": 20000,
            "chestCost": 6400
          },
          {
            "stage": 2,
            "gold": 30000,
            "boundGold": 30000,
            "chestCost": 9600
          }
        ]
      }
    ]
  },
  {
    "name": "고통의 마녀, 세르카",
    "difficulties": [
      {
        "difficulty": "노말",
        "requiredItemLevel": 1710,
        "stages": [
          {
            "stage": 1,
            "gold": 14000,
            "boundGold": 7000,
            "chestCost": 4480
          },
          {
            "stage": 2,
            "gold": 21000,
            "boundGold": 10500,
            "chestCost": 6720
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1730,
        "stages": [
          {
            "stage": 1,
            "gold": 17500,
            "chestCost": 5600
          },
          {
            "stage": 2,
            "gold": 26500,
            "chestCost": 8480
          }
        ]
      },
      {
        "difficulty": "나이트메어",
        "requiredItemLevel": 1740,
        "stages": [
          {
            "stage": 1,
            "gold": 21000,
            "chestCost": 6720
          },
          {
            "stage": 2,
            "gold": 33000,
            "chestCost": 10560
          }
        ]
      }
    ]
  },
  {
    "name": "종막 카제로스",
    "difficulties": [
      {
        "difficulty": "노말",
        "requiredItemLevel": 1710,
        "stages": [
          {
            "stage": 1,
            "gold": 14000,
            "boundGold": 7000,
            "chestCost": 4480
          },
          {
            "stage": 2,
            "gold": 26000,
            "boundGold": 13000,
            "chestCost": 8320
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1730,
        "stages": [
          {
            "stage": 1,
            "gold": 17000,
            "chestCost": 5440
          },
          {
            "stage": 2,
            "gold": 35000,
            "chestCost": 11200
          }
        ]
      }
    ]
  },
  {
    "name": "4막 아르모체",
    "difficulties": [
      {
        "difficulty": "노말",
        "requiredItemLevel": 1700,
        "stages": [
          {
            "stage": 1,
            "gold": 12500,
            "boundGold": 6250,
            "chestCost": 4000
          },
          {
            "stage": 2,
            "gold": 20500,
            "boundGold": 10250,
            "chestCost": 6560
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1720,
        "stages": [
          {
            "stage": 1,
            "gold": 15000,
            "chestCost": 4800
          },
          {
            "stage": 2,
            "gold": 27000,
            "chestCost": 8640
          }
        ]
      }
    ]
  },
  {
    "name": "3막 모르둠",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1680,
        "stages": [
          {
            "stage": 1,
            "gold": 4000,
            "boundGold": 2000,
            "chestCost": 1300
          },
          {
            "stage": 2,
            "gold": 7000,
            "boundGold": 3500,
            "chestCost": 2350
          },
          {
            "stage": 3,
            "gold": 10000,
            "boundGold": 5000,
            "chestCost": 3360
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1680,
        "stages": [
          {
            "stage": 1,
            "gold": 4000,
            "boundGold": 2000,
            "chestCost": 1300
          },
          {
            "stage": 2,
            "gold": 7000,
            "boundGold": 3500,
            "chestCost": 2350
          },
          {
            "stage": 3,
            "gold": 10000,
            "boundGold": 5000,
            "chestCost": 3360
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1700,
        "stages": [
          {
            "stage": 1,
            "gold": 5000,
            "boundGold": 2500,
            "chestCost": 1650
          },
          {
            "stage": 2,
            "gold": 8000,
            "boundGold": 4000,
            "chestCost": 2640
          },
          {
            "stage": 3,
            "gold": 14000,
            "boundGold": 7000,
            "chestCost": 4060
          }
        ]
      }
    ]
  },
  {
    "name": "2막 아브렐슈드",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1670,
        "stages": [
          {
            "stage": 1,
            "gold": 5500,
            "boundGold": 2750,
            "chestCost": 1820
          },
          {
            "stage": 2,
            "gold": 11000,
            "boundGold": 5500,
            "chestCost": 3720
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1670,
        "stages": [
          {
            "stage": 1,
            "gold": 5500,
            "boundGold": 2750,
            "chestCost": 1820
          },
          {
            "stage": 2,
            "gold": 11000,
            "boundGold": 5500,
            "chestCost": 3720
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1690,
        "stages": [
          {
            "stage": 1,
            "gold": 7500,
            "boundGold": 3750,
            "chestCost": 2400
          },
          {
            "stage": 2,
            "gold": 15500,
            "boundGold": 7750,
            "chestCost": 5100
          }
        ]
      }
    ]
  },
  {
    "name": "1막 에기르",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1660,
        "stages": [
          {
            "stage": 1,
            "gold": 3500,
            "boundGold": 1750,
            "chestCost": 750
          },
          {
            "stage": 2,
            "gold": 8000,
            "boundGold": 4000,
            "chestCost": 1780
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1660,
        "stages": [
          {
            "stage": 1,
            "gold": 3500,
            "boundGold": 1750,
            "chestCost": 750
          },
          {
            "stage": 2,
            "gold": 8000,
            "boundGold": 4000,           
            "chestCost": 1780
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1680,
        "stages": [
          {
            "stage": 1,
            "gold": 5500,
            "boundGold": 2750,
            "chestCost": 1820
          },
          {
            "stage": 2,
            "gold": 12500,
            "boundGold": 6250,
            "chestCost": 4150
          }
        ]
      }
    ]
  },
  {
    "name": "베히모스",
    "difficulties": [
      {
        "difficulty": "노말",
        "requiredItemLevel": 1640,
        "stages": [
          {
            "stage": 1,
            "gold": 2200,
            "chestCost": 720
          },
          {
            "stage": 2,
            "gold": 5000,
            "chestCost": 1630
          }
        ]
      }
    ]
  },
  {
    "name": "에키드나",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1620,
        "stages": [
          {
            "stage": 1,
            "gold": 1900,
            "boundGold": 1900,
            "chestCost": 310
          },
          {
            "stage": 2,
            "gold": 4200,
            "boundGold": 4200,
            "chestCost": 700
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1620,
        "stages": [
          {
            "stage": 1,
            "gold": 1900,
            "boundGold": 1900,
            "chestCost": 310
          },
          {
            "stage": 2,
            "gold": 4200,
            "boundGold": 4200,
            "chestCost": 700
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1640,
        "stages": [
          {
            "stage": 1,
            "gold": 2200,
            "boundGold": 1100,
            "chestCost": 720
          },
          {
            "stage": 2,
            "gold": 5000,
            "boundGold": 2500,
            "chestCost": 1630
          }
        ]
      }
    ]
  },
  {
    "name": "카멘",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1610,
        "stages": [
          {
            "stage": 1,
            "gold": 1600,
            "boundGold": 1600,
            "chestCost": 360
          },
          {
            "stage": 2,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 440
          },
          {
            "stage": 3,
            "gold": 2800,
            "boundGold": 2800,
            "chestCost": 640
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1610,
        "stages": [
          {
            "stage": 1,
            "gold": 1600,
            "boundGold": 1600,
            "chestCost": 360
          },
          {
            "stage": 2,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 440
          },
          {
            "stage": 3,
            "gold": 2800,
            "boundGold": 2800,
            "chestCost": 640
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1630,
        "stages": [
          {
            "stage": 1,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 500
          },
          {
            "stage": 2,
            "gold": 2400,
            "boundGold": 2400,
            "chestCost": 600
          },
          {
            "stage": 3,
            "gold": 3600,
            "boundGold": 3600,
            "chestCost": 900
          },
          {
            "stage": 4,
            "gold": 5000,
            "boundGold": 5000,
            "chestCost": 1250
          }
        ]
      }
    ]
  },
  {
    "name": "상아탑",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1600,
        "stages": [
          {
            "stage": 1,
            "gold": 1200,
            "boundGold": 1200,
            "chestCost": 250
          },
          {
            "stage": 2,
            "gold": 1600,
            "boundGold": 1600,
            "chestCost": 350
          },
          {
            "stage": 3,
            "gold": 2400,
            "boundGold": 2400,
            "chestCost": 550
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1600,
        "stages": [
          {
            "stage": 1,
            "gold": 1200,
            "boundGold": 1200,
            "chestCost": 180
          },
          {
            "stage": 2,
            "gold": 1600,
            "boundGold": 1600,
            "chestCost": 220
          },
          {
            "stage": 3,
            "gold": 2400,
            "boundGold": 2400,
            "chestCost": 300
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1620,
        "stages": [
          {
            "stage": 1,
            "gold": 1400,
            "boundGold": 1400,
            "chestCost": 350
          },
          {
            "stage": 2,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 500
          },
          {
            "stage": 3,
            "gold": 3800,
            "boundGold": 3800,
            "chestCost": 950
          }
        ]
      }
    ]
  },
  {
    "name": "일리아칸",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1580,
        "stages": [
          {
            "stage": 1,
            "gold": 850,
            "boundGold": 850,
            "chestCost": 190
          },
          {
            "stage": 2,
            "gold": 1550,
            "boundGold": 1550,
            "chestCost": 230
          },
          {
            "stage": 3,
            "gold": 2300,
            "boundGold": 2300,
            "chestCost": 330
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1580,
        "stages": [
          {
            "stage": 1,
            "gold": 850,
            "boundGold": 850,
            "chestCost": 190
          },
          {
            "stage": 2,
            "gold": 1550,
            "boundGold": 1550,
            "chestCost": 230
          },
          {
            "stage": 3,
            "gold": 2300,
            "boundGold": 2300,
            "chestCost": 330
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1600,
        "stages": [
          {
            "stage": 1,
            "gold": 1200,
            "boundGold": 1200,
            "chestCost": 300
          },
          {
            "stage": 2,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 500
          },
          {
            "stage": 3,
            "gold": 2800,
            "boundGold": 2800,
            "chestCost": 700
          }
        ]
      }
    ]
  },
  {
    "name": "카양겔",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1540,
        "stages": [
          {
            "stage": 1,
            "gold": 750,
            "boundGold": 750,
            "chestCost": 180
          },
          {
            "stage": 2,
            "gold": 1100,
            "boundGold": 1100,
            "chestCost": 200
          },
          {
            "stage": 3,
            "gold": 1450,
            "boundGold": 1450,
            "chestCost": 270
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1540,
        "stages": [
          {
            "stage": 1,
            "gold": 750,
            "boundGold": 750,
            "chestCost": 180
          },
          {
            "stage": 2,
            "gold": 1100,
            "boundGold": 1100,
            "chestCost": 200
          },
          {
            "stage": 3,
            "gold": 1450,
            "boundGold": 1450,
            "chestCost": 270
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1580,
        "stages": [
          {
            "stage": 1,
            "gold": 900,
            "boundGold": 900,
            "chestCost": 250
          },
          {
            "stage": 2,
            "gold": 1400,
            "boundGold": 1400,
            "chestCost": 350
          },
          {
            "stage": 3,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 500
          }
        ]
      }
    ]
  },
  {
    "name": "아브렐슈드",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1490,
        "stages": [
          {
            "stage": 1,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 100
          },
          {
            "stage": 2,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 150
          },
          {
            "stage": 3,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 200
          },
          {
            "stage": 4,
            "gold": 1600,
            "boundGold": 1600,
            "chestCost": 375
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1490,
        "stages": [
          {
            "stage": 1,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 250
          },
          {
            "stage": 2,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 1300
          },
          {
            "stage": 3,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 400
          },
          {
            "stage": 4,
            "gold": 1600,
            "boundGold": 1600,
            "chestCost": 600
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1540,
        "stages": [
          {
            "stage": 1,
            "gold": 1200,
            "boundGold": 1200,
            "chestCost": 400
          },
          {
            "stage": 2,
            "gold": 1200,
            "boundGold": 1200,
            "chestCost": 400
          },
          {
            "stage": 3,
            "gold": 1200,
            "boundGold": 1200,
            "chestCost": 500
          },
          {
            "stage": 4,
            "gold": 2000,
            "boundGold": 2000,
            "chestCost": 800
          }
        ]
      }
    ]
  },
  {
    "name": "쿠크세이튼",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1475,
        "stages": [
          {
            "stage": 1,
            "gold": 600,
            "boundGold": 600,
            "chestCost": 100
          },
          {
            "stage": 2,
            "gold": 900,
            "boundGold": 900,
            "chestCost": 150
          },
          {
            "stage": 3,
            "gold": 1500,
            "boundGold": 1500,
            "chestCost": 200
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1475,
        "stages": [
          {
            "stage": 1,
            "gold": 600,
            "boundGold": 600,
            "chestCost": 300
          },
          {
            "stage": 2,
            "gold": 900,
            "boundGold": 900,
            "chestCost": 500
          },
          {
            "stage": 3,
            "gold": 1500,
            "boundGold": 1500,
            "chestCost": 700
          }
        ]
      }
    ]
  },
  {
    "name": "비아키스",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1430,
        "stages": [
          {
            "stage": 1,
            "gold": 600,
            "boundGold": 600,
            "chestCost": 100
          },
          {
            "stage": 2,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 150
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1430,
        "stages": [
          {
            "stage": 1,
            "gold": 600,
            "boundGold": 600,
            "chestCost": 300
          },
          {
            "stage": 2,
            "gold": 1000,
            "boundGold": 1000,
            "chestCost": 450
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1460,
        "stages": [
          {
            "stage": 1,
            "gold": 900,
            "boundGold": 900,
            "chestCost": 500
          },
          {
            "stage": 2,
            "gold": 1500,
            "boundGold": 1500,
            "chestCost": 650
          }
        ]
      }
    ]
  },
  {
    "name": "발탄",
    "difficulties": [
      {
        "difficulty": "싱글",
        "requiredItemLevel": 1415,
        "stages": [
          {
            "stage": 1,
            "gold": 500,
            "boundGold": 500,
            "chestCost": 75
          },
          {
            "stage": 2,
            "gold": 700,
            "boundGold": 700,
            "chestCost": 100
          }
        ]
      },
      {
        "difficulty": "노말",
        "requiredItemLevel": 1415,
        "stages": [
          {
            "stage": 1,
            "gold": 500,
            "boundGold": 500,
            "chestCost": 300
          },
          {
            "stage": 2,
            "gold": 700,
            "boundGold": 700,
            "chestCost": 400
          }
        ]
      },
      {
        "difficulty": "하드",
        "requiredItemLevel": 1445,
        "stages": [
          {
            "stage": 1,
            "gold": 700,
            "boundGold": 700,
            "chestCost": 450
          },
          {
            "stage": 2,
            "gold": 1100,
            "boundGold": 1100,
            "chestCost": 600
          }
        ]
      }
    ]
  }
];
