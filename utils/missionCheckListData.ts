export type checkListItem = {
  name: string;
  checked: boolean;
  gold?: number; // 골드가 있는 경우에만
  goldChecked?: boolean; // 골드 체크 여부
  resetPeriod?: 'daily' | 'weekly' | ''; // 리셋 주기 (일간, 주간)
};

// ✅ 체크리스트 데이터
export const missionCheckListData: checkListItem[] = [
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
    name: '에포나 의뢰',
    checked: false,
    resetPeriod: 'daily',
  },
];
