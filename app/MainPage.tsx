import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import CharacterBar from './components/CharacterBar';
import OverviewBar from '@/app/components/OverviewBar';
import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ✅ 화면 높이를 가져와서 2/8 비율 설정
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_BAR_BORDER_RADIUS = 20; // 바의 모서리 반경

const MainPage: React.FC = () => {
  const { colors } = useTheme();
  const { characters } = useCharacter();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top }, // ✅ 상단 여백 추가
        { backgroundColor: colors.background }, // ✅ 배경색 설정
      ]}
    >
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CharacterBar id={item.id} />}
        // ✅ `OverviewBar`를 FlatList 최상단에 추가 (높이 고정)
        ListHeaderComponent={
          <View style={styles.overviewContainer}>
            <OverviewBar />
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity onPress={() => router.push('/AddCharacterScreen')}>
            <View
              style={[
                styles.addContainer,
                { borderColor: colors.grayLight }, // ✅ 테두리 색상 설정
              ]}
            >
              <Entypo name="plus" size={24} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ 화면 전체 차지
  },
  overviewContainer: {
    flex: 1,
  },
  addContainer: {
    height: CHARACTER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CHARACTER_BAR_BORDER_RADIUS,
    marginBottom: 6,
    marginHorizontal: 12,
    borderWidth: 3,
  },
});

export default MainPage;
