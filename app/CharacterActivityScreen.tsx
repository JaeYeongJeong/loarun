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
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { fetchCharacterInfo } from '@/utils/FetchLostArkAPI';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookmarkFilled from '@/assets/icons/BookmarkFilled';
import CustomText from './components/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';
import OtherActivityModal from './OtherActivityModal';
import CharacterActivityOptionsModal from './CharacterActivityOptionsModal';
import { missionCheckListData } from '@/utils/missionCheckListData';
import CustomPrompt from './CustomPrompt';
import CustomAlert from './CustomAlert';

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

  const [optionsModalVisible, setOptionsModalVisible] =
    useState<boolean>(false);
  const optionsButtonRef = useRef<View>(null);
  const [optionsButtonX, setOptionsButtonX] = useState(0);
  const [optionsButtonY, setOptionsButtonY] = useState(0);

  const toggleOptionsModal = () => {
    if (optionsButtonRef.current) {
      optionsButtonRef.current.measureInWindow((x, y, width, height) => {
        setOptionsButtonX(x);
        setOptionsButtonY(y + height); // 버튼 아래쪽 위치
        setOptionsModalVisible((prev) => !prev);
      });
    } else {
      setOptionsModalVisible((prev) => !prev);
    }
  };

  const [changeNamePromptVisible, setChangeNamePromptVisible] =
    useState<boolean>(false);

  const [deleteAlertVisible, setDeleteAlertVisible] = useState<boolean>(false);

  // 📌 갱신 상태
  const [refreshable, setRefreshable] = useState<boolean>(true);
  const [refreshText, setRefreshText] = useState('갱신하기');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 📌 접힘 상태
  const [weeklyRaidFolded, setWeeklyRaidFolded] = useState<boolean>(false);
  const [missionCheckedListFolded, setMissionCheckedListFolded] =
    useState<boolean>(false);
  const [otherActivityFolded, setOtherActivityFolded] =
    useState<boolean>(false);

  if (!character) return null; // ✅ 없는 캐릭터 방지

  useEffect(() => {
    setWeeklyRaidFolded(character.WeeklyRaidFolded ?? false);
    setOtherActivityFolded(character.OtherActivityFolded ?? false);
    setMissionCheckedListFolded(character.MissionCheckListFolded ?? false);
    setBookmarked(character.IsBookmarked ?? false);

    const now = Date.now();
    const lastUpdated = new Date(character.LastUpdated ?? 0).getTime();
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
    let updatedClearedRaidTotalGold = 0;
    let updatedSelectedRaidTotalGold = 0;

    for (const raid of updatedRaids) {
      let stageSum = 0;
      let selectedGold = 0;
      let selectedChestCost = 0;

      for (const stage of raid.stages) {
        if (raid.goldChecked) selectedGold += stage.gold;
        if (raid.chestCostChecked && stage.selectedChestCost) {
          selectedChestCost += stage.chestCost || 0;
        }

        if (stage.cleared) {
          stageSum +=
            (raid.goldChecked ? stage.gold : 0) -
            (stage.selectedChestCost ? stage.chestCost || 0 : 0);
        }
      }

      const additionalGold = Number(
        raid.additionalGold?.replace(/,/g, '') || 0
      );

      updatedClearedRaidTotalGold +=
        stageSum + (raid.cleared ? additionalGold : 0);

      updatedSelectedRaidTotalGold +=
        selectedGold - selectedChestCost + additionalGold;
    }

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

  const checkedListTotalGold =
    character.MissionCheckList?.reduce(
      (total, item) => total + (item.checked ? item.gold || 0 : 0),
      0
    ) || 0;

  const handleRemoveCharacter = () => {
    removeCharacter(character.id);
    router.back();
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

  const handleChecklistToggle = (index: number) => {
    const updatedCheckList = character.MissionCheckList?.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );

    updateCharacter(character.id, {
      MissionCheckList: updatedCheckList,
    });
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
              updateCharacter(character.id, { IsBookmarked: next });
            }}
          >
            {bookmarked ? (
              <BookmarkFilled width={24} height={24} color={colors.iconColor} />
            ) : (
              <Feather name="bookmark" size={24} color={colors.iconColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteAlertVisible(true)}>
            <Feather name="trash-2" size={24} color={colors.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleOptionsModal} ref={optionsButtonRef}>
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
                  `?d=${character.LastUpdated}`,
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
              updateCharacter(character.id, { WeeklyRaidFolded: next });
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
        {/* 일일 주간 미션 체크리스트*/}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => {
              const next = !missionCheckedListFolded;
              setMissionCheckedListFolded(next);
              updateCharacter(character.id, { MissionCheckListFolded: next });
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather
                  name={
                    missionCheckedListFolded ? 'chevron-down' : 'chevron-up'
                  }
                  size={24}
                  color={colors.black}
                />
                <CustomText
                  style={[styles.sectionTitle, { color: colors.black }]}
                >
                  일일/주간 미션
                </CustomText>
              </View>
              <CustomText
                style={[
                  styles.totalGoldText,
                  checkedListTotalGold >= 0
                    ? { color: colors.black }
                    : { color: colors.warning },
                ]}
              >
                {/* {checkedListTotalGold.toLocaleString() || 0} */}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!missionCheckedListFolded && (
            <View>
              {Array.isArray(character.MissionCheckList) &&
                character.MissionCheckList.map((item, index) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 10,
                      marginTop: index === 0 ? 16 : 0,
                    }}
                    key={index}
                  >
                    <TouchableOpacity
                      style={[
                        styles.activityItem,
                        { backgroundColor: colors.grayLight },
                      ]}
                      onPress={() => {
                        handleChecklistToggle(index);
                      }}
                    >
                      <View style={styles.activityItemRow}>
                        <CustomText
                          style={[
                            styles.activityNameText,
                            { color: colors.black },
                          ]}
                        >
                          {item.name}
                        </CustomText>
                        <MaterialIcons
                          name={
                            item.checked
                              ? 'check-box'
                              : 'check-box-outline-blank'
                          }
                          size={24}
                          color={
                            item.checked
                              ? colors.secondary
                              : colors.grayDark + 80
                          }
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        paddingLeft: 8,
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        setActivityIndex(index);
                        toggleActivityModal();
                      }}
                    >
                      <Feather
                        name="edit"
                        size={20}
                        color={colors.iconColor + 80}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              <View style={[styles.raidTitleRow, { justifyContent: 'center' }]}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={() => {
                    setActivityIndex(null);
                    toggleActivityModal();
                  }}
                >
                  <CustomText
                    style={[styles.editButtonText, { color: colors.black }]}
                  >
                    미션 추가
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* 추가 버튼 */}
        </View>
        {/* 기타 활동 */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => {
              const next = !otherActivityFolded;
              setOtherActivityFolded(next);
              updateCharacter(character.id, { OtherActivityFolded: next });
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather
                  name={otherActivityFolded ? 'chevron-down' : 'chevron-up'}
                  size={24}
                  color={colors.black}
                />
                <CustomText
                  style={[styles.sectionTitle, { color: colors.black }]}
                >
                  기타 활동
                </CustomText>
              </View>
              <CustomText
                style={[
                  styles.totalGoldText,
                  (character.OtherActivityTotalGold || 0) >= 0
                    ? { color: colors.black }
                    : { color: colors.warning },
                ]}
              >
                {character.OtherActivityTotalGold?.toLocaleString() || 0}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!otherActivityFolded && (
            <View>
              <View style={[styles.raidTitleRow, { justifyContent: 'center' }]}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={toggleOtherActivityModal}
                >
                  <CustomText
                    style={[styles.editButtonText, { color: colors.black }]}
                  >
                    활동 추가
                  </CustomText>
                </TouchableOpacity>
              </View>
              {Array.isArray(character.OtherActivity) &&
                character.OtherActivity.map((activity, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.otherActivityItem,
                      {
                        backgroundColor: colors.grayLight,
                        marginTop: index === 0 ? 16 : 0,
                        marginBottom: 10,
                      },
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

      <CharacterActivityOptionsModal
        isVisible={optionsModalVisible}
        toggleModal={toggleOptionsModal}
        positionX={optionsButtonX}
        positionY={optionsButtonY}
        resetMissions={() => {
          updateCharacter(character.id, {
            MissionCheckList: missionCheckListData,
          });
          setActivityIndex(null);
          setMissionCheckedListFolded(false);
        }}
        changeName={() => {
          setOptionsModalVisible(false);
          setChangeNamePromptVisible(true);
        }}
      />

      <ActivityModal
        isVisible={activityModalVisible}
        setIndexNull={() => setActivityIndex(null)}
        setIsVisibleFalse={() => setActivityModalVisible(false)}
        id={character.id}
        mode={activityIndex !== null ? 'edit' : 'add'}
        index={activityIndex ?? undefined}
        initialActivity={
          activityIndex !== null
            ? character.MissionCheckList?.[activityIndex]
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
            ? character.OtherActivity?.[otherActivityIndex]
            : undefined
        }
      />

      <RaidModal
        isVisible={raidModalVisible}
        setIsVisibleFalse={() => setRaidModalVisible(false)}
        id={character.id}
        index={raidIndex}
      />

      <CustomPrompt
        isVisible={changeNamePromptVisible}
        setIsVisibleFalse={() => setChangeNamePromptVisible(false)}
        titleText="닉네임 변경"
        messageText={
          '변경한 캐릭터 이름을 입력해주세요.\n변경 후 갱신하면 정보가 업데이트 됩니다.'
        }
        inputPlaceholder="닉네임 입력"
        onSubmit={(input) => {
          if (!input.trim()) {
            Alert.alert('오류', '닉네임을 입력해주세요.');
            return;
          }
          updateCharacter(character.id, { CharacterName: input });
          Alert.alert('성공', '닉네임이 변경되었습니다.');
        }}
      />

      <CustomAlert
        isVisible={deleteAlertVisible}
        setIsVisibleFalse={() => setDeleteAlertVisible(false)}
        titleText="캐릭터를 삭제하시겠습니까?"
        onSubmit={handleRemoveCharacter}
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
    marginTop: 4,
    marginBottom: 4,
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
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  otherActivityItem: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activityItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activityNameText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },

  activityGoldText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CharacterActivity;
