import { CharacterProvider } from '@/context/CharacterContext';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useEffect, useCallback, useRef } from 'react';
import * as SystemUI from 'expo-system-ui';
import { useLoadFonts } from '@/hooks/useLoadFonts';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutWrapper />
    </ThemeProvider>
  );
}

function RootLayoutWrapper() {
  const { colors, theme } = useTheme();
  const fontsLoaded = useLoadFonts();
  const hasHiddenSplash = useRef(false); // ✅ 중복 방지용

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [theme]);

  const handleLayout = useCallback(() => {
    if (fontsLoaded && !hasHiddenSplash.current) {
      SplashScreen.hideAsync();
      hasHiddenSplash.current = true;
    }
  }, [fontsLoaded]);

  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <CharacterProvider>
          <AppSettingProvider>
            <View style={{ flex: 1 }} onLayout={handleLayout}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
            </View>
          </AppSettingProvider>
        </CharacterProvider>
      </SafeAreaView>
    </>
  );
}
