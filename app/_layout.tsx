import { CharacterProvider } from '@/context/CharacterContext';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { Stack } from 'expo-router';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <AppSettingProvider>
          <ThemeProvider>
            <CharacterProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_bottom', // ✅ 아래에서 위로 올라오는 애니메이션
                }}
              />
            </CharacterProvider>
          </ThemeProvider>
        </AppSettingProvider>
      </SafeAreaView>
    </>
  );
}
