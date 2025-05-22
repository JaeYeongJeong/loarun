import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const isTablet = Math.min(width, height) >= 600;

let guidelineBaseWidth = 375;

if (width < 360) {
  guidelineBaseWidth = 320;
} else if (width < 400) {
  guidelineBaseWidth = 360;
} else if (width < 500) {
  guidelineBaseWidth = 414;
} else if (width < 700) {
  guidelineBaseWidth = 600;
} else if (width < 850) {
  guidelineBaseWidth = 768;
} else {
  guidelineBaseWidth = 834;
}

// ✅ 태블릿일 경우 가중치 추가
const baseScale = width / guidelineBaseWidth;
const scale = isTablet ? baseScale * 1.2 : baseScale; // 가중치 1.1배

export const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateNormalize = (size: number, factor: number = 0.5) => {
  const scaled = normalize(size);
  return size + (scaled - size) * factor;
};

export const isTabletDevice = isTablet;
