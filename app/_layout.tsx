import { CharacterProvider } from '@/context/CharacterContext';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { useLoadFonts } from '@/hooks/useLoadFonts';

export default function RootLayout() {
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <RootLayoutWrapper />
    </ThemeProvider>
  );
}

function RootLayoutWrapper() {
  const { colors, theme } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [theme]);

  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <CharacterProvider>
          <AppSettingProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          </AppSettingProvider>
        </CharacterProvider>
      </SafeAreaView>
    </>
  );
}
