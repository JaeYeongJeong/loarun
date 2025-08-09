export type mission = {
  name: string;
  checked: boolean;
  gold?: number; // 골드가 있는 경우에만
  goldChecked?: boolean; // 골드 체크 여부
  resetPeriod?: 'daily' | 'weekly' | ''; // 리셋 주기 (일간, 주간)
};

// ✅ 미션 체크리스트 데이터
export const defaultMissions: mission[] = [
  {
    name: '카오스 던전',
    checked: false,
    resetPeriod: 'daily',
  },
  {
    name: '가디언 토벌',
    checked: false,
    resetPeriod: 'daily',
  },
  {
    name: '주간 의뢰',
    checked: false,
    resetPeriod: 'weekly',
  },
];

// ✅ 계정 미션 체크리스트 데이터
export const defaultAccountMissions: mission[] = [
  {
    name: '카오스 게이트 & 필드 보스',
    checked: false,
    resetPeriod: 'daily',
  },
];
