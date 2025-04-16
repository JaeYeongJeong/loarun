import { CharacterProvider } from '@/utils/CharacterContext';
import { ThemeProvider } from '@/utils/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="default" translucent backgroundColor="transparent" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // ✅ SafeAreaView가 화면 전체를 차지하도록 설정
  },
});
