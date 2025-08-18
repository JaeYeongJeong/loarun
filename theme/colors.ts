type ColorTheme = {
  background: string; // 배경색
  cardBackground: string; // 카드 배경색
  modalBackground: string; // 모달 배경색
  alertBackground: string;
  grayLight: string; // 회색 밝은 색상
  grayDark: string; // 회색 어두운 색상
  black: string; // 검정색
  white: string; // 흰색
  iconColor: string; // 아이콘 색상
  primary: string; // 메인 버튼색 (초록)
  secondary: string; // 추가버튼 색상 (파랑)
  danger: string; // 삭제 버튼 색상 (빨강)
  info: string; // 난이도 노말 색상 (파랑)
  warning: string; // 난이도 하드 색상 (빨강)
  gold: string; // 골드 색상 (노랑)
  extreme: string; // 난이도 익스트림 색상(보라)
};

const lightColors: ColorTheme = {
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  modalBackground: '#e9ecef',
  alertBackground: '#f8f9fa',
  grayLight: '#f1f3f5',
  grayDark: '#666666',
  black: '#212529',
  white: '#f8f9fa',
  iconColor: '#212529',
  primary: '#4CAF50',
  secondary: '#007BFF',
  danger: '#f44336',
  info: '#1E88E5',
  warning: '#e74c3c',
  gold: '#E67E22',
  extreme: '#6f42c1',
};

const darkColors: ColorTheme = {
  background: '#161616',
  cardBackground: '#1e1e1e',
  modalBackground: '#2a2a2a',
  alertBackground: '#1e1e1e',
  grayLight: '#2c2c2c',
  grayDark: '#aaaaaa',
  black: '#f8f9fa',
  white: '#212529',
  iconColor: '#dee2e6',
  primary: '#2ecc71',
  secondary: '#339CFF',
  danger: '#FF6B6B',
  info: '#5DADE2',
  warning: '#EC7063',
  gold: '#E67E22',
  extreme: '#9b59b6',
};

export { lightColors, darkColors };
