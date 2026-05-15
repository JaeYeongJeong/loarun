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
import { Entypo, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { normalize } from '@/utils/nomalize';
import SortModal from './SortModal';
import CustomText from '../components/customTextComponents/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';
import BookmarkFilled from '@/assets/icons/BookmarkFilled';
import MainPageOptionsModal from './MainPageOptionsModal';
import CustomSortModal from './CustomSortModal';

// ✅ 화면 높이를 가져와서 2/8 비율 설정
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_BAR_BORDER_RADIUS = 20; // 바의 모서리 반경
const BUTTON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const MainPage: React.FC = () => {
  const [sortModalVisible, setSortModalVisible] = React.useState(false);
  const [optionModalVisible, setOptionModalVisible] = React.useState(false);
  const [customSortModalVisible, setCustomSortModalVisible] =
    React.useState(false);
  const { colors } = useTheme();
  const { characters } = useCharacter();
  const { isInfoVisible, toggleInfoVisibility } = useAppSetting();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sortButtonRef = useRef<View>(null);
  const [sortButtonX, setSortButtonX] = useState(0);
  const [sortButtonY, setSortButtonY] = useState(0);
  const optionsButtonRef = useRef<View>(null);
  const [optionsButtonX, setOptionsButtonX] = useState(0);
  const [optionsButtonY, setOptionsButtonY] = useState(0);
  const [isBookmarkedFilterOn, setIsBookmarkedFilterOn] = useState(false);

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

  const toggleCustomSortModal = () => {
    setCustomSortModalVisible((prev) => !prev);
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

  const toggleBookmarkFilter = () => {
    setIsBookmarkedFilterOn((prev) => !prev);
  };

  const filteredCharacters = isBookmarkedFilterOn
    ? characters.filter((character) => character.IsBookmarked)
    : characters;

  const emptyTitle = isBookmarkedFilterOn
    ? '북마크한 캐릭터가 없어요'
    : '아직 등록된 캐릭터가 없어요';
  const emptyDescription = isBookmarkedFilterOn
    ? '필터를 해제하거나 자주 보는 캐릭터에 북마크를 추가해보세요.'
    : '아래 + 버튼으로 첫 캐릭터를 추가해보세요.';

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
        <View style={styles.headerWrapper}>
          <TouchableOpacity
            ref={sortButtonRef}
            onPress={toggleSortModal}
            hitSlop={BUTTON_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="캐릭터 정렬 옵션 열기"
          >
            <View style={styles.sortButton}>
              <CustomText
                style={[styles.sortButtonText, { color: colors.grayDark }]}
              >
                정렬하기
              </CustomText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            ref={optionsButtonRef}
            onPress={toggleOptionsModal}
            hitSlop={BUTTON_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="메인 화면 옵션 열기"
            accessibilityHint="정보 숨김과 북마크 필터 옵션을 변경합니다."
          >
            <View
              style={{
                flexDirection: 'row',
                gap: normalize(8),
                alignItems: 'center',
              }}
            >
              {!isInfoVisible && (
                <Feather name="eye-off" size={16} color={colors.grayDark} />
              )}
              {isBookmarkedFilterOn && (
                <BookmarkFilled
                  width={normalize(16)}
                  height={normalize(16)}
                  color={colors.grayDark}
                />
              )}
              <View style={styles.optionButton}>
                <CustomText
                  style={[styles.sortButtonText, { color: colors.grayDark }]}
                >
                  옵션
                </CustomText>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ FlatList는 스크롤 영역 */}
      <FlatList
        style={{ flex: 1 }}
        data={filteredCharacters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CharacterBar id={item.id} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomText style={[styles.emptyTitle, { color: colors.black }]}>
              {emptyTitle}
            </CustomText>
            <CustomText
              style={[styles.emptyDescription, { color: colors.grayDark }]}
            >
              {emptyDescription}
            </CustomText>
            {isBookmarkedFilterOn && (
              <TouchableOpacity
                style={[styles.emptyAction, { backgroundColor: colors.grayLight }]}
                onPress={toggleBookmarkFilter}
                accessibilityRole="button"
                accessibilityLabel="북마크 필터 해제"
              >
                <CustomText
                  style={[styles.emptyActionText, { color: colors.black }]}
                >
                  필터 해제
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => router.push('/AddCharacterScreen')}
            accessibilityRole="button"
            accessibilityLabel="캐릭터 추가 화면으로 이동"
          >
            <View
              style={[styles.addContainer, { borderColor: colors.grayLight }]}
            >
              <Entypo name="plus" size={24} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        }
        contentContainerStyle={{
          paddingTop: normalize(4),
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
        openCustomSortModal={toggleCustomSortModal}
      />

      {/* ✅ 커스텀 정렬 모달 */}
      <CustomSortModal
        isVisible={customSortModalVisible}
        toggleModal={toggleCustomSortModal}
      />

      {/* ✅ 옵션 모달 */}
      <MainPageOptionsModal
        isVisible={optionModalVisible}
        toggleModal={toggleOptionsModal}
        positionX={optionsButtonX}
        positionY={optionsButtonY}
        isBookmarkedFilterOn={isBookmarkedFilterOn}
        toggleBookmarkFilter={toggleBookmarkFilter}
        toggleInfoVisibility={toggleInfoVisibility}
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
  headerWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  sortButton: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(4),
  },
  optionButton: {
    paddingRight: normalize(20),
    paddingVertical: normalize(4),
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(36),
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: normalize(8),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: normalize(16),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(8),
    borderRadius: normalize(18),
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MainPage;
