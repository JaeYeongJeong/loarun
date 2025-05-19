import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import CharacterBar from './components/CharacterBar';
import OverviewBar from '@/app/components/OverviewBar';
import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { normalize } from '@/utils/nomalize';
import SortModal from './SortModal';

// ✅ 화면 높이를 가져와서 2/8 비율 설정
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_BAR_BORDER_RADIUS = 20; // 바의 모서리 반경

const MainPage: React.FC = () => {
  const [SortModalVisible, setSortModalVisible] = React.useState(false);
  const { colors } = useTheme();
  const { characters } = useCharacter();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sortButtonRef = useRef<View>(null);
  const [sortButtonX, setSortButtonX] = useState(0);
  const [sortButtonY, setSortButtonY] = useState(0);

const toggleSortModal = () => {
  if (sortButtonRef.current) {
    sortButtonRef.current.measureInWindow((x, y, width, height) => {
      setSortButtonX(x);
      setSortButtonY(y + height); // 버튼 아래쪽 위치
      setSortModalVisible((prev) => !prev);
    });
  } else {
    setSortModalVisible((prev) => !prev);
  }
};

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
            <TouchableOpacity ref={sortButtonRef} onPress={toggleSortModal}>
              <View
                style={{
                  marginBottom: normalize(6),
                  paddingHorizontal: normalize(12),
                  alignItems: 'flex-start',
                }}
              >
                <View
                  style={{
                    paddingHorizontal: normalize(10),
                    paddingVertical: normalize(4),
                  }}
                >
                  <Text
                    style={{
                      fontSize: normalize(12),
                      fontWeight: 600,
                      color: colors.grayDark,
                    }}
                  >
                    정렬하기
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
      <SortModal isVisible={SortModalVisible} toggleModal={toggleSortModal} positionX={sortButtonX} positionY = {sortButtonY} />
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
    marginBottom: normalize(6),
    marginHorizontal: normalize(12),
    borderWidth: normalize(3),
  },
});

export default MainPage;
