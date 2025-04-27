import { CharacterProvider } from '@/context/CharacterContext';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { Stack } from 'expo-router';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="default" translucent backgroundColor="transparent" />
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // ✅ SafeAreaView가 화면 전체를 차지하도록 설정
  },
});
