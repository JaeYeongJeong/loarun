import { CharacterProvider } from '@/context/CharacterContext';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { Stack } from 'expo-router';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { ErrorBoundary } from 'react-error-boundary';
import { RaidProvider } from '@/context/RaidContext';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'red', fontSize: 16 }}>
        ❌ 앱 에러 발생: {error.message}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ErrorFallback error={error} />}
    >
      <ThemeProvider>
        <RootLayoutWrapper />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RootLayoutWrapper() {
  const { colors, theme } = useTheme();

  useEffect(() => {
    console.log('[RootLayout] theme:', theme);
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [theme]);

  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <RaidProvider>
        <CharacterProvider>
          <AppSettingProvider>
            <View style={{ flex: 1 }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
            </View>
          </AppSettingProvider>
          </CharacterProvider>
          </RaidProvider>
      </SafeAreaView>
    </>
  );
}
