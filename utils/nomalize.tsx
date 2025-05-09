// utils/normalize.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width } = Dimensions.get('window');

// 화면 너비에 따라 기준 너비 자동 설정
let guidelineBaseWidth = 375;

if (width < 360) {
  guidelineBaseWidth = 320; // 아주 작은 기기
} else if (width < 400) {
  guidelineBaseWidth = 360; // 일반 스마트폰
} else if (width < 500) {
  guidelineBaseWidth = 414; // 대형 스마트폰 (iPhone Plus, Max 등)
} else if (width < 700) {
  guidelineBaseWidth = 600; // 소형 태블릿 or 대형 폰
} else if (width < 850) {
  guidelineBaseWidth = 768; // 일반 태블릿 (iPad 등)
} else {
  guidelineBaseWidth = 834; // 대형 태블릿 (iPad Pro 11" 이상)
}

export const normalize = (size: number) => {
  const scale = width / guidelineBaseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// 튀는 차이 완화 버전
export const moderateNormalize = (size: number, factor: number = 0.5) => {
  const scaled = normalize(size);
  return size + (scaled - size) * factor;
};
