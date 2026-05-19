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
  ActivityIndicator,
} from 'react-native';
import MissionModal from './SubmitMissionModal';
import { SelectedRaid, useCharacter } from '@/context/CharacterContext';
import RaidModal from './SubmitRaidModal';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import ActivityCustomSortModal from './ActivityCustomSortModal';
import { fetchCharacterInfo } from '@/utils/FetchLostArkAPI';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookmarkFilled from '@/assets/icons/BookmarkFilled';
import CustomText from '../components/customTextComponents/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';
import OtherActivityModal from './OtherActivityModal';
import CharacterActivityOptionsModal from './CharacterActivityOptionsModal';
import {
  defaultMissions,
  defaultAccountMissions,
} from '@/utils/defaultMissions';
import CustomPrompt from './CustomPrompt';
import CustomAlert from './CustomAlert';
import { validateNicknameInput } from '@/utils/validateInput';
import { getPortraitImage } from '@/utils/PortraitImage';

const CharacterActivity: React.FC = () => {
  // 📌 기본 훅 및 네비게이션
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets(); // ✅ 상단 여백

  // 📌 캐릭터 관련 컨텍스트
  const {
    characters,
    updateCharacter,
    updateAllCharacters,
    removeCharacter,
    refreshCharacter,
    defaultSelectedRaids,
  } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const { isInfoVisible } = useAppSetting();
  const [portraitUri, setPortraitUri] = useState<string | null>(null);

  // 📌 모달 상태 및 관련 인덱스
  const [missionScope, setMissionScope] = useState<'character' | 'account'>(
    'character'
  );
  const [missionModalVisible, setMissionModalVisible] =
    useState<boolean>(false);
  const [missionIndex, setMissionIndex] = useState<number | null>(null);
  const toggleActivityModal = () => setMissionModalVisible((prev) => !prev);

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

  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertTitle, setAlertTitle] = useState<string>('알림');
  const [alertButtonType, setAlertButtonType] = useState<
    'default' | 'oneButton'
  >('default');


  const [sortTarget, setSortTarget] = useState<
    'raid' | 'mission' | 'accountMission' | 'otherActivity' | null
  >(null);

  const reorderByIndices = <T,>(list: T[] | undefined, indices: number[]) =>
    indices
      .map((index) => list?.[index])
      .filter((item): item is T => item !== undefined);

  const handleCustomSort = (
    type: 'raid' | 'mission' | 'accountMission' | 'otherActivity',
    indices: number[]
  ) => {
    if (type === 'raid') {
      updateCharacter(character.id, {
        SelectedRaids: reorderByIndices(character.SelectedRaids, indices),
      });
      return;
    }

    if (type === 'mission') {
      updateCharacter(character.id, {
        MissionCheckList: reorderByIndices(character.MissionCheckList, indices),
      });
      return;
    }

    if (type === 'accountMission') {
      updateAllCharacters({
        AccountMissionCheckList: reorderByIndices(
          character.AccountMissionCheckList,
          indices
        ),
      });
      return;
    }

    updateCharacter(character.id, {
      OtherActivity: reorderByIndices(character.OtherActivity, indices),
    });
  };

  // 📌 갱신 상태
  const [refreshable, setRefreshable] = useState<boolean>(true);
  const [refreshText, setRefreshText] = useState('갱신하기');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 📌 접힘 상태
  const [weeklyRaidFolded, setWeeklyRaidFolded] = useState<boolean>(false);
  const [missionCheckedListFolded, setMissionCheckedListFolded] =
    useState<boolean>(false);
  const [accountMissionCheckedListFolded, setAccountMissionCheckedListFolded] =
    useState<boolean>(false);
  const [otherActivityFolded, setOtherActivityFolded] =
    useState<boolean>(false);

  useEffect(() => {
    if (!character) return;

    setWeeklyRaidFolded(character.WeeklyRaidFolded ?? false);
    setOtherActivityFolded(character.OtherActivityFolded ?? false);
    setMissionCheckedListFolded(character.MissionCheckListFolded ?? false);
    setAccountMissionCheckedListFolded(
      character.AccountMissionCheckListFolded ?? false
    );
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
  }, [character]);

  // 📌 캐릭터 이미지 로드
  useEffect(() => {
    if (!character) {
      setPortraitUri(null);
      return;
    }

    const loadImage = async () => {
      const portraitUri = await getPortraitImage(character.id);
      if (portraitUri) {
        setPortraitUri(portraitUri);
      } else {
        setPortraitUri(null);
      }
    };
    loadImage();
  }, [character?.id, character?.LastUpdated, character?.CharacterPortraitImage]);

  if (!character) return null; // ✅ 없는 캐릭터 방지

  // 📌 클리어한 레이드와 선택한 레이드 총 골드 계산
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

    const additionalGold = Number(raid.additionalGold?.replace(/,/g, '') || 0);

    updatedClearedRaidTotalGold +=
      stageSum + (raid.cleared ? additionalGold : 0);

    updatedSelectedRaidTotalGold +=
      selectedGold - selectedChestCost + additionalGold;
  }

  const clearedRaidTotalGold = updatedClearedRaidTotalGold;
  const selectedRaidTotalGold = updatedSelectedRaidTotalGold;
  const OtherActivityTotalGold = character.OtherActivity?.reduce(
    (total, activity) => total + (activity.gold || 0),
    0
  );

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

  const handleRefreshCharacter = async () => {
    if (!refreshable) return;

    setRefreshable(false);
    setIsRefreshing(true);

    const resetRefreshUI = (delay = 500) => {
      timeoutRef.current = setTimeout(() => {
        setRefreshText('갱신하기');
        setRefreshable(true);
        timeoutRef.current = null;
      }, delay);
    };

    try {
      const data = await fetchCharacterInfo(character.CharacterName);

      if (data) {
        await refreshCharacter(character.id, {
          CharacterImage: data.CharacterImage,
          CharacterClassName: data.CharacterClassName,
          ItemAvgLevel: data.ItemAvgLevel,
          ServerName: data.ServerName,
        });
        setRefreshText('갱신완료');
        setAlertTitle('성공');
        setAlertMessage('캐릭터 정보를 갱신했습니다.');
        setAlertButtonType('oneButton');
        setAlertVisible(true);
        resetRefreshUI(60000); // 60초 후 갱신 가능
      } else {
        setAlertTitle('오류');
        setAlertMessage('캐릭터 정보를 찾을 수 없습니다.');
        setAlertButtonType('oneButton');
        setAlertVisible(true);
        resetRefreshUI();
      }
    } catch (err) {
      console.error('캐릭터 갱신 실패:', err);
      setAlertTitle('오류');
      setAlertMessage('데이터를 불러오는 데 실패했습니다.');
      setAlertButtonType('oneButton');
      setAlertVisible(true);
      resetRefreshUI();
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

  const handleAccountChecklistToggle = (index: number) => {
    const updatedCheckList = character.AccountMissionCheckList?.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );

    updateAllCharacters({
      AccountMissionCheckList: updatedCheckList,
    });
  };

  const handleDeleteCharacter = () => {
    Alert.alert('정말 삭제하시겠어요?', undefined, [
      { text: '취소', style: 'cancel' },
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
        <TouchableOpacity
          onPress={router.back}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="이전 화면으로 이동"
        >
          <Feather name="chevron-left" size={24} color={colors.iconColor} />
        </TouchableOpacity>
        <View style={styles.actionWrapper}>
          <TouchableOpacity
            onPress={() => {
              const next = !bookmarked;
              setBookmarked(next);
              updateCharacter(character.id, { IsBookmarked: next });
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? '북마크 해제' : '북마크 추가'}
            accessibilityState={{ selected: bookmarked }}
          >
            {bookmarked ? (
              <BookmarkFilled width={24} height={24} color={colors.iconColor} />
            ) : (
              <Feather name="bookmark" size={24} color={colors.iconColor} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteCharacter}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={`${isInfoVisible ?? true ? character.CharacterName : '익명'} 캐릭터 삭제`}
          >
            <Feather name="trash-2" size={24} color={colors.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleOptionsModal}
            ref={optionsButtonRef}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="캐릭터 활동 옵션 열기"
          >
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
                uri: portraitUri
                  ? `${portraitUri}?d=${character.LastUpdated}`
                  : character.CharacterImage,
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
            style={[styles.characterInfo, { color: colors.grayDark }]}
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
              {isRefreshing ? (
                <View style={styles.refreshButtonContent}>
                  <ActivityIndicator size="small" color={colors.black} />
                  <CustomText
                    style={[styles.refreshButtonText, { color: colors.black }]}
                  >
                    갱신 중...
                  </CustomText>
                </View>
              ) : (
                <CustomText
                  style={[styles.refreshButtonText, { color: colors.black }]}
                >
                  {refreshText}
                </CustomText>
              )}
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
                {clearedRaidTotalGold.toLocaleString() || 0} /{' '}
                {selectedRaidTotalGold?.toLocaleString() || 0}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!weeklyRaidFolded && (
            <View>
              <Spacer height={12} />
              {(!Array.isArray(character.SelectedRaids) ||
                character.SelectedRaids.length === 0) && (
                <CustomText
                  style={[styles.emptyActivityText, { color: colors.grayDark }]}
                >
                  추가된 레이드가 없어요.
                </CustomText>
              )}
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
                              stage.difficulty === '익스트림 노말' ||
                              stage.difficulty === '익스트림 하드'
                                ? { color: colors.extreme }
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
              <View style={styles.raidSectionButtonRow}>
                <View style={styles.raidAddButtonCenter}>
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
                <TouchableOpacity
                  style={[styles.iconSortButton, { backgroundColor: colors.grayLight }]}
                  onPress={() => setSortTarget('raid')}
                  accessibilityRole="button"
                  accessibilityLabel="레이드 순서 변경"
                >
                  <MaterialIcons name="swap-vert" size={18} color={colors.black} />
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
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${item.name} ${item.checked ? '완료됨' : '미완료'}`}
                      accessibilityState={{ checked: item.checked }}
                    >
                      <View style={styles.activityItemRow}>
                        <View
                          style={[
                            styles.missionTitleBlock,
                            { gap: item.resetPeriod ? 12 : 0 },
                          ]}
                        >
                          <CustomText
                            style={[
                              styles.activityNameText,
                              { color: colors.secondary },
                            ]}
                          >
                            {item.resetPeriod === 'daily'
                              ? '일일'
                              : item.resetPeriod === 'weekly'
                              ? '주간'
                              : ''}
                          </CustomText>
                          <CustomText
                            style={[
                              styles.activityNameText,
                              {
                                color: colors.black,
                                flexShrink: 1,
                              },
                              item.checked ? styles.completedActivityText : {},
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.name}
                          </CustomText>
                        </View>
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
                        setMissionIndex(index);
                        setMissionScope('character');
                        toggleActivityModal();
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.name} 미션 수정`}
                    >
                      <Feather
                        name="edit"
                        size={20}
                        color={colors.iconColor + 80}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              <View style={styles.raidSectionButtonRow}>
                <View style={styles.raidAddButtonCenter}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={() => {
                    setMissionIndex(null);
                    setMissionScope('character');
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
                <TouchableOpacity
                  style={[styles.iconSortButton, { backgroundColor: colors.grayLight }]}
                  onPress={() => setSortTarget('mission')}
                  accessibilityRole="button"
                  accessibilityLabel="일일/주간 미션 정렬"
                >
                  <MaterialIcons name="swap-vert" size={18} color={colors.black} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        {/* 계정 일일 주간 미션 체크리스트*/}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => {
              const next = !accountMissionCheckedListFolded;
              setAccountMissionCheckedListFolded(next);
              updateCharacter(character.id, {
                AccountMissionCheckListFolded: next,
              });
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather
                  name={
                    accountMissionCheckedListFolded
                      ? 'chevron-down'
                      : 'chevron-up'
                  }
                  size={24}
                  color={colors.black}
                />
                <CustomText
                  style={[styles.sectionTitle, { color: colors.black }]}
                >
                  원정대 미션
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
          {!accountMissionCheckedListFolded && (
            <View>
              {(!Array.isArray(character.AccountMissionCheckList) ||
                character.AccountMissionCheckList.length === 0) && (
                <CustomText
                  style={[styles.emptyActivityText, { color: colors.grayDark }]}
                >
                  추가된 원정대 미션이 없어요.
                </CustomText>
              )}
              {Array.isArray(character.AccountMissionCheckList) &&
                character.AccountMissionCheckList.map((item, index) => (
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
                        handleAccountChecklistToggle(index);
                      }}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${item.name} ${item.checked ? '완료됨' : '미완료'}`}
                      accessibilityState={{ checked: item.checked }}
                    >
                      <View style={styles.activityItemRow}>
                        <View
                          style={[
                            styles.missionTitleBlock,
                            { gap: item.resetPeriod ? 12 : 0 },
                          ]}
                        >
                          <CustomText
                            style={[
                              styles.activityNameText,
                              { color: colors.secondary },
                            ]}
                          >
                            {item.resetPeriod === 'daily'
                              ? '일일'
                              : item.resetPeriod === 'weekly'
                              ? '주간'
                              : ''}
                          </CustomText>
                          <CustomText
                            style={[
                              styles.activityNameText,
                              {
                                color: colors.black,
                                flexShrink: 1,
                              },
                              item.checked ? styles.completedActivityText : {},
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.name}
                          </CustomText>
                        </View>
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
                        setMissionIndex(index);
                        setMissionScope('account');
                        toggleActivityModal();
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.name} 원정대 미션 수정`}
                    >
                      <Feather
                        name="edit"
                        size={20}
                        color={colors.iconColor + 80}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              <View style={styles.raidSectionButtonRow}>
                <View style={styles.raidAddButtonCenter}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={() => {
                    setMissionIndex(null);
                    setMissionScope('account');
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
                <TouchableOpacity
                  style={[styles.iconSortButton, { backgroundColor: colors.grayLight }]}
                  onPress={() => setSortTarget('accountMission')}
                  accessibilityRole="button"
                  accessibilityLabel="원정대 미션 정렬"
                >
                  <MaterialIcons name="swap-vert" size={18} color={colors.black} />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
                  (OtherActivityTotalGold || 0) >= 0
                    ? { color: colors.black }
                    : { color: colors.warning },
                ]}
              >
                {OtherActivityTotalGold?.toLocaleString() || 0}
              </CustomText>
            </View>
          </TouchableOpacity>
          {!otherActivityFolded && (
            <View>
              {Array.isArray(character.OtherActivity) &&
              character.OtherActivity.length > 0 ? (
                character.OtherActivity.map((activity, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      marginBottom: 10,
                      marginTop: index === 0 ? 16 : 0,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.activityItem,
                        { backgroundColor: colors.grayLight },
                      ]}
                      onPress={() => {
                        setOtherActivityIndex(index);
                        toggleOtherActivityModal();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${activity.name} 활동 수정`}
                    >
                      <View style={styles.activityItemRow}>
                        <CustomText
                          style={[
                            styles.activityNameText,
                            { color: colors.black, flexShrink: 1 },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
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
                    <TouchableOpacity
                      style={{
                        paddingLeft: 8,
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        setOtherActivityIndex(index);
                        toggleOtherActivityModal();
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={`${activity.name} 활동 수정`}
                    >
                      <Feather
                        name="edit"
                        size={20}
                        color={colors.iconColor + 80}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <CustomText
                  style={[styles.emptyActivityText, { color: colors.grayDark }]}
                >
                  추가된 기타 활동이 없어요.
                </CustomText>
              )}
              <View style={styles.raidSectionButtonRow}>
                <View style={styles.raidAddButtonCenter}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.grayLight },
                  ]}
                  onPress={toggleOtherActivityModal}
                  accessibilityRole="button"
                  accessibilityLabel="기타 활동 추가"
                >
                  <CustomText
                    style={[styles.editButtonText, { color: colors.black }]}
                  >
                    활동 추가
                  </CustomText>
                </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.iconSortButton, { backgroundColor: colors.grayLight }]}
                  onPress={() => setSortTarget('otherActivity')}
                  accessibilityRole="button"
                  accessibilityLabel="기타 활동 정렬"
                >
                  <MaterialIcons name="swap-vert" size={18} color={colors.black} />
                </TouchableOpacity>
              </View>
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
        resetRaid={() => {
          const updatedSelectedRaid = defaultSelectedRaids(character);
          updateCharacter(character.id, {
            SelectedRaids: updatedSelectedRaid,
          });
        }}
        syncMission={() => {
          const updatedMissionCheckList = character.MissionCheckList;
          updateAllCharacters({
            MissionCheckList: updatedMissionCheckList,
          });
        }}
        resetMissions={() => {
          updateCharacter(character.id, {
            MissionCheckList: defaultMissions,
          });
          setMissionIndex(null);
          setMissionCheckedListFolded(false);
        }}
        resetAccountMissions={() => {
          updateAllCharacters({
            AccountMissionCheckList: defaultAccountMissions,
          });
          setMissionIndex(null);
          setAccountMissionCheckedListFolded(false);
        }}
        changeName={() => {
          setOptionsModalVisible(false);
          setChangeNamePromptVisible(true);
        }}
      />

      <MissionModal
        isVisible={missionModalVisible}
        setIndexNull={() => setMissionIndex(null)}
        setIsVisibleFalse={() => setMissionModalVisible(false)}
        id={character.id}
        mode={missionIndex != null ? 'edit' : 'add'}
        index={missionIndex != null ? missionIndex : undefined}
        scope={missionScope}
        initialActivity={(() => {
          const list =
            missionScope === 'character'
              ? character.MissionCheckList
              : character.AccountMissionCheckList;

          if (
            missionIndex == null ||
            !list ||
            missionIndex < 0 ||
            missionIndex >= list.length
          ) {
            return undefined;
          }
          return list[missionIndex];
        })()}
      />

      <ActivityCustomSortModal
        isVisible={sortTarget !== null}
        sortType={sortTarget}
        raidItems={(character.SelectedRaids || []).map((raid) => ({
          name: raid.name || '레이드',
        }))}
        missionItems={character.MissionCheckList || []}
        accountMissionItems={character.AccountMissionCheckList || []}
        otherActivityItems={character.OtherActivity || []}
        onClose={() => setSortTarget(null)}
        onConfirm={handleCustomSort}
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
          const validateInput = validateNicknameInput(input);

          switch (validateInput.status) {
            case 'empty':
              Alert.alert('오류', '닉네임을 입력해주세요.');
              return;
            case 'exceeds-limit':
              Alert.alert('오류', '닉네임은 12자 이하로 입력해주세요.');
              return;
            case 'invalid-nickname':
              Alert.alert(
                '오류',
                '닉네임은 한글, 영문, 숫자만 입력할 수 있습니다.'
              );
              return;
            case 'valid-nickname':
              updateCharacter(character.id, {
                CharacterName: validateInput.value,
              });
              Alert.alert('성공', '닉네임이 변경되었습니다.');
              break;
          }
        }}
      />

      <CustomAlert
        isVisible={alertVisible}
        setIsVisibleFalse={() => setAlertVisible(false)}
        titleText={alertTitle}
        messageText={alertMessage}
        buttonType={alertButtonType}
        align="center"
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
    aspectRatio: 1,
    height: 'auto',
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
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 16,
    minWidth: 82,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    minHeight: 30,
    justifyContent: 'center',
  },

  editButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  raidSectionButtonRow: {
    position: 'relative',
    minHeight: 32,
    justifyContent: 'center',
    marginTop: 2,
  },
  raidAddButtonCenter: {
    alignItems: 'center',
  },
  iconSortButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  raidButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },

  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  raidButtonText: {
    fontSize: 11,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },

  missionTitleBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },

  activityItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  emptyActivityText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 10,
  },

  activityNameText: {
    fontSize: 14,
    fontWeight: '600',
  },

  activityGoldText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedActivityText: {
    textDecorationLine: 'line-through',
    opacity: 0.65,
  },
});

export default CharacterActivity;
