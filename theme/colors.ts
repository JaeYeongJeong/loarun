type ColorTheme = {
  background: string; // 배경색
  cardBackground: string; // 카드 배경색
  grayLight: string; // 회색 밝은 색상
  grayDark: string; // 회색 어두운 색상
  black: string; // 검정색
  white: string; // 흰색
  primary: string; // 메인 버튼색 (초록)
  secondary: string; // 추가버튼 색상 (파랑)
  danger: string; // 삭제 버튼 색상 (빨강)
  info: string; // 난이도 노말 색상 (파랑)
  warning: string; // 난이도 하드 색상 (빨강)
  gold: string; // 골드 색상 (노랑)
};

const lightColors: ColorTheme = {
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  grayLight: '#f1f3f5',
  grayDark: '#666666',
  black: '#333333',
  white: '#ffffff',
  primary: '#4CAF50', // 메인 버튼색 (초록)
  secondary: '#007BFF', // 추가버튼 색상 (파랑)
  danger: '#f44336', // 삭제 버튼 색상 (빨강)
  info: '#1E88E5', // 난이도 노말 색상 (파랑)
  warning: '#e74c3c', // 난이도 하드 색상 (빨강)
  gold: '#E67E22',
};

const darkColors: ColorTheme = {
  background: '#121212', // 다크 배경
  cardBackground: '#1e1e1e', // 카드용 약간 밝은 회색
  grayLight: '#2c2c2c', // 버튼 배경 같은 곳에
  grayDark: '#aaaaaa', // 텍스트용 밝은 회색
  black: '#ffffff', // 다크에서는 흰색이 메인 텍스트가 됨
  white: '#000000', // 반대 (필요한 경우)
  primary: '#2ecc71', // 메인 버튼 초록은 유지 (잘 보임)
  secondary: '#339CFF', // 추가버튼 색상 (파랑 약간 밝게)
  danger: '#FF6B6B', // 삭제 버튼 빨강을 다크에 맞게 톤 업
  info: '#5DADE2', // 난이도 노말 색 (밝은 블루)
  warning: '#EC7063', // 난이도 하드 색 (살짝 더 밝은 레드)
  gold: '#E67E22',
};

export { lightColors, darkColors };
