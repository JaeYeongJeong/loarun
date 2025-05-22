import { useFonts } from 'expo-font';

export function useLoadFonts() {
  const [loaded] = useFonts({
    // Pretendard
    Pretendard: require('@/assets/fonts/Pretendard/Pretendard-400-Regular.ttf'),
    Pretendard100: require('@/assets/fonts/Pretendard/Pretendard-100-Thin.ttf'),
    Pretendard200: require('@/assets/fonts/Pretendard/Pretendard-200-ExtraLight.ttf'),
    Pretendard300: require('@/assets/fonts/Pretendard/Pretendard-300-Light.ttf'),
    Pretendard400: require('@/assets/fonts/Pretendard/Pretendard-400-Regular.ttf'),
    Pretendard500: require('@/assets/fonts/Pretendard/Pretendard-500-Medium.ttf'),
    Pretendard600: require('@/assets/fonts/Pretendard/Pretendard-600-SemiBold.ttf'),
    Pretendard700: require('@/assets/fonts/Pretendard/Pretendard-700-Bold.ttf'),
    Pretendard800: require('@/assets/fonts/Pretendard/Pretendard-800-ExtraBold.ttf'),
    Pretendard900: require('@/assets/fonts/Pretendard/Pretendard-900-Black.ttf'),

    // SUIT
    Suit: require('@/assets/fonts/Suit/SUIT-Regular.ttf'),
    Suit100: require('@/assets/fonts/Suit/SUIT-Thin.ttf'),
    Suit200: require('@/assets/fonts/Suit/SUIT-ExtraLight.ttf'),
    Suit300: require('@/assets/fonts/Suit/SUIT-Light.ttf'),
    Suit400: require('@/assets/fonts/Suit/SUIT-Regular.ttf'),
    Suit500: require('@/assets/fonts/Suit/SUIT-Medium.ttf'),
    Suit600: require('@/assets/fonts/Suit/SUIT-SemiBold.ttf'),
    Suit700: require('@/assets/fonts/Suit/SUIT-Bold.ttf'),
    Suit800: require('@/assets/fonts/Suit/SUIT-ExtraBold.ttf'),
    Suit900: require('@/assets/fonts/Suit/SUIT-Heavy.ttf'),
  });

  return loaded;
}
