import { useFonts } from 'expo-font';

export function useLoadFonts() {
  const [loaded] = useFonts({
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
