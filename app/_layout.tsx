import { CharacterProvider } from '@/context/CharacterContext';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

export default function RootLayout() {
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
        <AppSettingProvider>
          <CharacterProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
          </CharacterProvider>
        </AppSettingProvider>
      </SafeAreaView>
    </>
  );
}
