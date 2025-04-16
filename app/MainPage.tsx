import React from 'react';
import { FlatList, StyleSheet, View, Dimensions } from 'react-native';
import CharacterBar from './components/CharacterBar';
import OverviewBar from '@/app/components/OverviewBar';
import { useTheme } from '@/utils/ThemeContext';
import { LOSTARK_API_TOKEN } from '@/config';
import { useCharacter } from '@/utils/CharacterContext';

// ✅ 화면 높이를 가져와서 2/8 비율 설정
const SCREEN_HEIGHT = Dimensions.get('window').height;
const OVERVIEW_HEIGHT = SCREEN_HEIGHT * (2 / 8);

const MainPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { characters } = useCharacter();
  
  console.log(LOSTARK_API_TOKEN);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? 'grey' : 'lightblue' },
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ 화면 전체 차지
  },
  overviewContainer: {
    height: OVERVIEW_HEIGHT, // ✅ 2/8 크기로 고정 (전체 화면 높이의 25%)
  },
});

export default MainPage;
