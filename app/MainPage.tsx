import React, { useRef, useState } from 'react';
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
import { normalize } from '@/utils/nomalize';
import SortModal from './SortModal';
import CustomText from './components/CustomText';
import OptionsModal from './optionsModal';

// ✅ 화면 높이를 가져와서 2/8 비율 설정
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_BAR_BORDER_RADIUS = 20; // 바의 모서리 반경

const MainPage: React.FC = () => {
  const [sortModalVisible, setSortModalVisible] = React.useState(false);
  const [optionModalVisible, setOptionModalVisible] = React.useState(false);
  const { colors } = useTheme();
  const { characters } = useCharacter();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sortButtonRef = useRef<View>(null);
  const [sortButtonX, setSortButtonX] = useState(0);
  const [sortButtonY, setSortButtonY] = useState(0);
  const optionsButtonRef = useRef<View>(null);
  const [optionsButtonX, setOptionsButtonX] = useState(0);
  const [optionsButtonY, setOptionsButtonY] = useState(0);

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

  const toggleOptionsModal = () => {
    if (optionsButtonRef.current) {
      optionsButtonRef.current.measureInWindow((x, y, width, height) => {
        setOptionsButtonX(x);
        setOptionsButtonY(y + height); // 버튼 아래쪽 위치
        setOptionModalVisible((prev) => !prev);
      });
    } else {
      setOptionModalVisible((prev) => !prev);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* ✅ 고정된 상단 영역 */}
      <View style={styles.overviewContainer}>
        <OverviewBar />
        <View style={styles.sortButtonWrapper}>
          <TouchableOpacity ref={sortButtonRef} onPress={toggleSortModal}>
            <View style={styles.sortButton}>
              <CustomText
                style={[styles.sortButtonText, { color: colors.grayDark }]}
              >
                정렬하기
              </CustomText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity ref={optionsButtonRef} onPress={toggleOptionsModal}>
            <View style={styles.sortButton}>
              <CustomText
                style={[styles.sortButtonText, { color: colors.grayDark }]}
              >
                옵션
              </CustomText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ FlatList는 스크롤 영역 */}
      <FlatList
        style={{ flex: 1 }}
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CharacterBar id={item.id} />}
        ListFooterComponent={
          <TouchableOpacity onPress={() => router.push('/AddCharacterScreen')}>
            <View
              style={[styles.addContainer, { borderColor: colors.grayLight }]}
            >
              <Entypo name="plus" size={24} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        }
        contentContainerStyle={{
          paddingTop: normalize(8),
          paddingBottom: normalize(12),
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* ✅ 정렬 모달 */}
      <SortModal
        isVisible={sortModalVisible}
        toggleModal={toggleSortModal}
        positionX={sortButtonX}
        positionY={sortButtonY}
      />

      {/* ✅ 옵션 모달 */}
      <OptionsModal
        isVisible={optionModalVisible}
        toggleModal={toggleOptionsModal}
        positionX={optionsButtonX}
        positionY={optionsButtonY}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ 화면 전체 차지
  },
  overviewContainer: {
    zIndex: 1,
  },
  sortButtonWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  sortButton: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(4),
  },
  sortButtonText: {
    fontSize: normalize(12),
    fontWeight: '600',
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
