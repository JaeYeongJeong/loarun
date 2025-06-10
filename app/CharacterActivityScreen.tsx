import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import ActivityModal from './SubmitActivityModal';
import { useCharacter } from '@/context/CharacterContext';
import RaidModal from './SubmitRaidModal';
import { Feather } from '@expo/vector-icons';
import { fetchCharacterInfo } from '@/utils/FetchLostArkAPI';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookmarkFilled from '@/assets/icons/BookmarkFilled';
import CustomText from './components/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';
import OtherActivityModal from './OtherActivityModal';

const CharacterActivity: React.FC = () => {
  // 📌 기본 훅 및 네비게이션
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets(); // ✅ 상단 여백

  // 📌 캐릭터 관련 컨텍스트
  const { characters, updateCharacter, removeCharacter, refreshCharacter } =
    useCharacter();
  const character = characters.find((c) => c.id === id);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const { isInfoVisible } = useAppSetting();

  // 📌 모달 상태 및 관련 인덱스
  const [activityModalVisible, setActivityModalVisible] =
    useState<boolean>(false);
  const [activityIndex, setActivityIndex] = useState<number | null>(null);
  const toggleActivityModal = () => setActivityModalVisible((prev) => !prev);

  const [otherActivityModalVisible, setOtherActivityModalVisible] =
    useState<boolean>(false);
  const [otherActivityIndex, setOtherActivityIndex] = useState<number | null>(
    null
  );
  const toggleOtherActivityModal = () =>
    setOtherActivityModalVisible((prev) => !prev);

  const [raidModalVisible, setRaidModalVisible] = useState<boolean>(false);
  const [raidIndex, setRaidIndex] = useState<number>(0);
  const toggleRaidModal = () => setRaidModalVisible((prev) => !prev);

  // 📌 갱신 상태
  const [refreshable, setRefreshable] = useState<boolean>(true);
  const [refreshText, setRefreshText] = useState('갱신하기');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 📌 접힘 상태
  const [weeklyRaidFolded, setWeeklyRaidFolded] = useState<boolean>(false);
  const [weeklyActivityFolded, setWeeklyActivityFolded] =
    useState<boolean>(false);

  if (!character) return null; // ✅ 없는 캐릭터 방지

  useEffect(() => {
    setWeeklyRaidFolded(character.weeklyRaidFolded ?? false);
    setWeeklyActivityFolded(character.weeklyActivityFolded ?? false);
    setBookmarked(character.isBookmarked ?? false);

    const now = Date.now();
    const lastUpdated = new Date(character.lastUpdated ?? 0).getTime();
    const diff = now - lastUpdated;

    if (diff < 60000) {
      setRefreshText('갱신완료');
      setRefreshable(false);

      const remaining = 60000 - diff;
      timeoutRef.current = setTimeout(() => {
        setRefreshText('갱신하기');
        setRefreshable(true);
        timeoutRef.current = null;
      }, remaining);
    } else {
      setRefreshText('갱신하기');
      setRefreshable(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updatedRaids = [...(character.SelectedRaids || [])];
    const updatedClearedRaidTotalGold =
      updatedRaids.reduce((total, raid) => {
        const stageSum = raid.stages.reduce((sum, stage) => {
          return stage.cleared
            ? sum +
                (raid.goldChecked ? stage.gold : 0) -
                (stage.selectedChestCost ? stage.chestCost || 0 : 0)
            : sum;
        }, 0);

        const additionalGold = raid.cleared
          ? Number(raid.additionalGold?.replace(/,/g, ''))
          : 0;

        return total + stageSum + additionalGold;
      }, 0) || 0;

    const updatedSelectedRaidTotalGold =
      updatedRaids.reduce(
        (sum, raid) =>
          sum + raid.totalGold + Number(raid.additionalGold?.replace(/,/g, '')),
        0
      ) || 0;

    updateCharacter(character.id, {
      ClearedRaidTotalGold: updatedClearedRaidTotalGold,
      SelectedRaidTotalGold: updatedSelectedRaidTotalGold,
    });
  }, [character.SelectedRaids]);

  const handleSelectStage = (index: number, stageIndex: number) => {
    const selectedRaid = character.SelectedRaids?.[index];
    if (!selectedRaid) return;

    const isSameAsLastCleared =
      selectedRaid.stages.findLast((s) => s.cleared)?.stage === stageIndex + 1;

    const updatedStages = selectedRaid.stages.map((stage, i) => ({
      ...stage,
      cleared: isSameAsLastCleared ? false : i <= stageIndex,
      lastClearedStage: isSameAsLastCleared ? 0 : stageIndex,
    }));

    const updatedRaids = [...(character.SelectedRaids || [])];
    updatedRaids[index] = {
      ...selectedRaid,
      stages: updatedStages,
      cleared: updatedStages.every((s) => s.cleared),
    };

    updateCharacter(character.id, {
      SelectedRaids: updatedRaids,
    });
  };

  const handleRemoveCharacter = () => {
    Alert.alert('캐릭터 삭제', '정말 삭제하시겠어요?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removeCharacter(character.id);
          router.back();
        },
      },
    ]);
  };

  const handleRefreshCharacter = async () => {
    if (!refreshable) return;

    setIsRefreshing(true);
    try {
      const data = await fetchCharacterInfo(character.CharacterName);
      if (data) {
        refreshCharacter(character.id, {
          CharacterImage: data.CharacterImage,
          CharacterClassName: data.CharacterClassName,
          ItemAvgLevel: data.ItemAvgLevel,
          ServerName: data.ServerName,
        });
        setRefreshText('갱신완료');
        setRefreshable(false);

        timeoutRef.current = setTimeout(() => {
          setRefreshText('갱신하기');
          setRefreshable(true);
          timeoutRef.current = null;
        }, 60000);
      } else {
        Alert.alert('오류', '캐릭터 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const Spacer = ({ height = 12 }: { height?: number }) => (
    <View style={{ height }} />
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* 상단: 액션바 */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={router.back}>
          <Feather name="chevron-left" size={24} color={colors.iconColor} />
        </TouchableOpacity>
        <View style={styles.actionWrapper}>
          <TouchableOpacity
            onPress={() => {
              const next = !bookmarked;
              setBookmarked(next);
              updateCharacter(character.id, { isBookmarked: next });
            }}
          >
            {bookmarked ? (
              <BookmarkFilled width={24} height={24} color={colors.iconColor} />
            ) : (
              <Feather name="bookmark" size={24} color={colors.iconColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRemoveCharacter}>
            <Feather name="trash-2" size={24} color={colors.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather
              name="more-horizontal"
              size={24}
              color={colors.iconColor}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* 캐릭터 카드 */}
      <View
        style={[
          styles.characterCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        {/* 왼쪽: 캐릭터 이미지 */}
        <View style={styles.portraitContainer}>
          {
            <Image
              source={{
                uri:
                  character.CharacterPortraitImage +
                  `?d=${character.lastUpdated}`,
              }}
              style={styles.portraitImage}
              resizeMode="cover"
            />
          }
        </View>

        {/* 오른쪽: 캐릭터 정보 */}
        <View style={styles.characterInfoContainer}>
          <View style={styles.nameRow}>
            <CustomText style={[styles.characterName, { color: colors.black }]}>
              {isInfoVisible ?? true ? character.CharacterName : '익명'}
            </CustomText>
          </View>

          <CustomText
            style={[styles.characterInfo, { color: colors.grayDark }]}
          >
            {isInfoVisible ?? true ? character.CharacterClassName : '직업'} @{' '}
            {isInfoVisible ?? true ? character.ServerName : '서버'}
          </CustomText>
          <CustomText
            style={(styles.characterInfo, { color: colors.grayDark })}
          >
            Lv.
            {isInfoVisible ?? true ? character.ItemAvgLevel : '-'}
          </CustomText>

          <View style={styles.refreshButtonWrapper}>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                { backgroundColor: colors.grayLight },
              ]}
              onPress={handleRefreshCharacter}
              disabled={!refreshable}
            >
              <CustomText
                style={[styles.refreshButtonText, { color: colors.black }]}
              >
                {refreshText}
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 주간 레이드 */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => {
              const next = !weeklyRaidFolded;
              setWeeklyRaidFolded(next);
              updateCharacter(character.id, { weeklyRaidFolded: next });
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather
                  name={weeklyRaidFolded ? 'chevron-down' : 'chevron-up'}
                  size={24}
                  color={colors.black}
                />
                <CustomText
                  style={[styles.sectionTitle, { color: colors.black }]}
                >
                  주간 레이드
                </CustomText>
              </View>
              <CustomText
                style={[styles.totalGoldText, { color: colors.black }]}
              >
                {character.ClearedRaidTotalGold?.toLocaleString() || 0} /{' '}
                {character.SelectedRaidTotalGold?.toLocaleString() || 0}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!weeklyRaidFolded && (
            <View>
              <Spacer height={12} />
              {character.SelectedRaids?.map((raid, index) => (
                <View key={index} style={{ marginBottom: 4 }}>
                  <View style={styles.raidTitleRow}>
                    <CustomText
                      style={[styles.raidTitleText, { color: colors.black }]}
                    >
                      {raid.name || `레이드 ${index + 1}`}
                    </CustomText>
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { backgroundColor: colors.grayLight },
                      ]}
                      onPress={() => {
                        toggleRaidModal();
                        setRaidIndex(index);
                      }}
                    >
                      <CustomText
                        style={[styles.editButtonText, { color: colors.black }]}
                      >
                        수정
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.raidRow,
                      { backgroundColor: colors.grayLight },
                    ]}
                  >
                    {raid.name ? (
                      raid.stages.map((stage, stageIndex) => (
                        <Pressable
                          key={stageIndex}
                          style={[
                            styles.raidButton,
                            stage.cleared
                              ? { backgroundColor: colors.primary }
                              : {},
                            stageIndex === 0
                              ? {
                                  borderTopLeftRadius: 12,
                                  borderBottomLeftRadius: 12,
                                }
                              : {},
                            stage.lastClearedStage === stageIndex
                              ? {
                                  borderTopRightRadius: 12,
                                  borderBottomRightRadius: 12,
                                }
                              : {},
                          ]}
                          onPress={() => handleSelectStage(index, stageIndex)}
                        >
                          <CustomText
                            style={[
                              styles.difficultyText,
                              stage.cleared
                                ? { color: colors.white }
                                : { color: colors.black },
                              stage.difficulty === '노말'
                                ? { color: colors.info }
                                : {},
                              stage.difficulty === '하드'
                                ? { color: colors.danger }
                                : {},
                            ]}
                          >
                            {stage.difficulty}
                          </CustomText>
                          <CustomText
                            style={[
                              styles.raidButtonText,
                              { color: colors.black },
                              stage.cleared ? { color: colors.white } : {},
                            ]}
                          >
                            {stage.stage} 관문
                          </CustomText>
                        </Pressable>
                      ))
                    ) : (
                      <Pressable style={styles.raidButton}>
                        <CustomText
                          style={[
                            styles.raidButtonText,
                            { color: colors.black },
                          ]}
                        >
                          레이드
                        </CustomText>
                        <CustomText
                          style={[
                            styles.raidButtonText,
                            { color: colors.black },
                          ]}
                        >
                          ({index + 1})
                        </CustomText>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
              <View style={[styles.raidTitleRow, { justifyContent: 'center' }]}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={() => {
                    toggleRaidModal();
                    setRaidIndex(-1);
                  }}
                >
                  <CustomText
                    style={[styles.editButtonText, { color: colors.black }]}
                  >
                    레이드 추가
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        {/* 체크리스트*/}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => {
              const next = !weeklyActivityFolded;
              setWeeklyActivityFolded(next);
              updateCharacter(character.id, { weeklyActivityFolded: next });
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather
                  name={weeklyActivityFolded ? 'chevron-down' : 'chevron-up'}
                  size={24}
                  color={colors.black}
                />
                <CustomText
                  style={[styles.sectionTitle, { color: colors.black }]}
                >
                  체크리스트
                </CustomText>
              </View>
              <CustomText
                style={[
                  styles.totalGoldText,
                  (character.WeeklyActivityTotalGold || 0) >= 0
                    ? { color: colors.black }
                    : { color: colors.warning },
                ]}
              >
                {character.WeeklyActivityTotalGold?.toLocaleString() || 0}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!weeklyActivityFolded && (
            <View>
              {Array.isArray(character.WeeklyActivity) &&
                character.WeeklyActivity.map((activity, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.activityItem,
                      { backgroundColor: colors.grayLight },
                    ]}
                    onPress={() => {
                      setActivityIndex(index);
                      toggleActivityModal();
                    }}
                  >
                    <View style={styles.activityItemRow}>
                      <CustomText
                        style={[
                          styles.activityNameText,
                          { color: colors.black },
                        ]}
                      >
                        {activity.name}
                      </CustomText>
                      <CustomText
                        style={[
                          styles.activityGoldText,
                          activity.gold >= 0
                            ? { color: colors.black }
                            : { color: colors.warning },
                        ]}
                      >
                        {activity.gold.toLocaleString()}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                ))}
              <View style={[styles.raidTitleRow, { justifyContent: 'center' }]}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={toggleActivityModal}
                >
                  <CustomText
                    style={[styles.editButtonText, { color: colors.black }]}
                  >
                    활동 추가
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* 추가 버튼 */}
        </View>
        {/* 기타 수입 */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => {
              const next = !weeklyActivityFolded;
              setWeeklyActivityFolded(next);
              updateCharacter(character.id, { weeklyActivityFolded: next });
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather
                  name={weeklyActivityFolded ? 'chevron-down' : 'chevron-up'}
                  size={24}
                  color={colors.black}
                />
                <CustomText
                  style={[styles.sectionTitle, { color: colors.black }]}
                >
                  기타 수입
                </CustomText>
              </View>
              <CustomText
                style={[
                  styles.totalGoldText,
                  (character.WeeklyActivityTotalGold || 0) >= 0
                    ? { color: colors.black }
                    : { color: colors.warning },
                ]}
              >
                {character.WeeklyActivityTotalGold?.toLocaleString() || 0}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!weeklyActivityFolded && (
            <View>
              <View style={styles.addButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.secondary },
                  ]}
                  onPress={toggleOtherActivityModal}
                >
                  <CustomText
                    style={[styles.addButtonText, { color: 'white' }]}
                  >
                    ＋ 추가
                  </CustomText>
                </TouchableOpacity>
              </View>
              {Array.isArray(character.WeeklyActivity) &&
                character.WeeklyActivity.map((activity, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.activityItem,
                      { backgroundColor: colors.grayLight },
                    ]}
                    onPress={() => {
                      setOtherActivityIndex(index);
                      toggleOtherActivityModal();
                    }}
                  >
                    <View style={styles.activityItemRow}>
                      <CustomText
                        style={[
                          styles.activityNameText,
                          { color: colors.black },
                        ]}
                      >
                        {activity.name}
                      </CustomText>
                      <CustomText
                        style={[
                          styles.activityGoldText,
                          activity.gold >= 0
                            ? { color: colors.black }
                            : { color: colors.warning },
                        ]}
                      >
                        {activity.gold.toLocaleString()}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}
          {/* 추가 버튼 */}
        </View>
      </ScrollView>

      <ActivityModal
        isVisible={activityModalVisible}
        setIndexNull={() => setActivityIndex(null)}
        setIsVisibleFalse={() => setActivityModalVisible(false)}
        id={character.id}
        mode={activityIndex !== null ? 'edit' : 'add'}
        index={activityIndex ?? undefined}
        initialActivity={
          activityIndex !== null
            ? character.WeeklyActivity?.[activityIndex]
            : undefined
        }
      />

      <OtherActivityModal
        isVisible={otherActivityModalVisible}
        setIndexNull={() => setOtherActivityIndex(null)}
        setIsVisibleFalse={() => setOtherActivityModalVisible(false)}
        id={character.id}
        mode={otherActivityIndex !== null ? 'edit' : 'add'}
        index={otherActivityIndex ?? undefined}
        initialActivity={
          otherActivityIndex !== null
            ? character.WeeklyActivity?.[otherActivityIndex]
            : undefined
        }
      />

      <RaidModal
        isVisible={raidModalVisible}
        setIsVisibleFalse={() => setRaidModalVisible(false)}
        id={character.id}
        index={raidIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  // ✅ 상단 액션바
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  actionWrapper: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 6,
  },
  // ✅ 캐릭터 카드
  characterCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  portraitContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  portraitImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  characterInfoContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'space-between',
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  characterName: {
    fontSize: 18,
    fontWeight: '600',
    paddingTop: 4,
  },

  characterInfo: {
    fontSize: 14,
    marginTop: 4,
  },

  refreshButtonWrapper: {
    marginTop: 10,
    alignItems: 'flex-end',
  },

  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },

  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ✅ 공통 섹션
  section: {
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  totalGoldText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // ✅ 주간 레이드
  raidTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
    marginTop: 6,
  },

  raidTitleText: {
    fontSize: 14,
    fontWeight: '600',
  },

  raidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
  },

  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },

  editButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },

  raidButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },

  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  raidButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ✅ 주간 활동
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 50,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  activityItem: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  activityItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activityNameText: {
    fontSize: 14,
    fontWeight: '600',
  },

  activityGoldText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CharacterActivity;
