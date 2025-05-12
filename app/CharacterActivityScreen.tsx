import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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

const CharacterActivity: React.FC = () => {
  const params = useLocalSearchParams();
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const toggleActivityModal = () => setActivityModalVisible((prev) => !prev);
  const [activityIndex, setActivityIndex] = useState<number | null>(null);
  const [raidModalVisible, setRaidModalVisible] = useState(false);
  const [raidIndex, setRaidIndex] = useState<number>(0);
  const toggleRaidModal = () => setRaidModalVisible((prev) => !prev);
  const { id } = params;
  const { characters, updateCharacter, removeCharacter, refreshCharacter } =
    useCharacter();
  const character = characters.find((c) => c.id === id);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshText, setRefreshText] = useState('갱신하기');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets(); // ✅ 상단 여백 추가

  if (!character) return null; // ✅ 없는 캐릭터 방지

  useEffect(() => {
    const updatedRaids = [...(character.SelectedRaids || [])];
    const updatedClearedRaidTotalGold =
      updatedRaids.reduce((total, raid) => {
        return (
          total +
          raid.stages.reduce((stageSum, stage) => {
            return stage.cleared ? stageSum + stage.gold : stageSum;
          }, 0)
        );
      }, 0) || 0;

    const updatedSelectedRaidTotalGold =
      updatedRaids.reduce((sum, raid) => sum + raid.totalGold, 0) || 0;

    updateCharacter(character.id, {
      SelectedRaidTotalGold: updatedSelectedRaidTotalGold,
      ClearedRaidTotalGold: updatedClearedRaidTotalGold,
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
    Alert.alert('캐릭터 삭제', '정말 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          removeCharacter(character.id);
          router.back();
        },
      },
    ]);
  };

  const handleRefreshCharacter = async () => {
    if (isRefreshing) return; // 이미 갱신 중이면 무시

    setIsRefreshing(true);
    setRefreshText('갱신완료');

    const data = await fetchCharacterInfo(character.CharacterName);
    if (data) {
      refreshCharacter(character.id, {
        CharacterImage: data.CharacterImage,
        CharacterClassName: data.CharacterClassName,
        ItemAvgLevel: data.ItemAvgLevel,
        ServerName: data.ServerName,
      });
    } else {
      Alert.alert('오류', '캐릭터 정보를 찾을 수 없습니다.');
    }

    // 10초 후 다시 활성화
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshText('갱신하기');
    }, 10000);
  };

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
          <TouchableOpacity>
            <Feather name="bookmark" size={24} color={colors.iconColor} />
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
            <Text style={[styles.characterName, { color: colors.black }]}>
              {character.CharacterName}
            </Text>
          </View>

          <Text style={[styles.characterInfo, { color: colors.grayDark }]}>
            {character.CharacterClassName} @ {character.ServerName}
          </Text>
          <Text style={(styles.characterInfo, { color: colors.grayDark })}>
            Lv. {character.ItemAvgLevel}
          </Text>

          <View style={styles.refreshButtonWrapper}>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                { backgroundColor: colors.grayLight },
                isRefreshing ? { backgroundColor: colors.grayLight } : {},
              ]}
              onPress={handleRefreshCharacter}
              disabled={isRefreshing}
            >
              <Text
                style={[
                  styles.refreshButtonText,
                  { color: colors.black },
                  isRefreshing ? { color: colors.black } : {},
                ]}
              >
                {refreshText}
              </Text>
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.black }]}>
              주간 레이드
            </Text>
            <Text style={[styles.totalGoldText, { color: colors.black }]}>
              {character.ClearedRaidTotalGold?.toLocaleString() || 0} /{' '}
              {character.SelectedRaidTotalGold?.toLocaleString() || 0}
            </Text>
          </View>
          {[0, 1, 2].map((index) => (
            <View key={index} style={{ marginBottom: 4 }}>
              {/* 🟢 레이드 제목 + 수정 버튼 한 줄 정렬 */}
              <View style={styles.raidTitleRow}>
                <Text style={[styles.raidTitleText, { color: colors.black }]}>
                  {character.SelectedRaids?.[index]?.name ||
                    `레이드 ${index + 1}`}
                </Text>
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
                  <Text
                    style={[styles.editButtonText, { color: colors.black }]}
                  >
                    수정
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={[styles.raidRow, { backgroundColor: colors.grayLight }]}
              >
                {character.SelectedRaids?.[index]?.name ? (
                  character.SelectedRaids?.[index]?.stages.map(
                    (stage, stageIndex) => (
                      <Pressable
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
                        key={stageIndex}
                        onPress={() => handleSelectStage(index, stageIndex)}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            stage.cleared
                              ? { color: colors.white }
                              : { color: colors.black },
                            stage.difficulty === '노말'
                              ? {
                                  color: colors.info,
                                }
                              : {},
                            stage.difficulty === '하드'
                              ? { color: colors.danger }
                              : {},
                          ]}
                        >
                          {stage.difficulty}
                        </Text>
                        <Text
                          style={[
                            styles.raidButtonText,
                            { color: colors.black },
                            stage.cleared ? { color: colors.white } : {},
                          ]}
                        >
                          {stage.stage} 관문
                        </Text>
                      </Pressable>
                    )
                  )
                ) : (
                  <Pressable style={styles.raidButton}>
                    <Text
                      style={[styles.raidButtonText, { color: colors.black }]}
                    >{`레이드`}</Text>
                    <Text
                      style={[styles.raidButtonText, { color: colors.black }]}
                    >{`(${index + 1})`}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          <View style={[styles.raidTitleRow, { justifyContent: 'center' }]}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.grayLight }]}
              onPress={() => {
                toggleRaidModal();
              }}
            >
              <Text style={[styles.editButtonText, { color: colors.black }]}>
                레이드 추가
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 주간 활동 */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.black }]}>
              추가 수입
            </Text>
            <Text
              style={[
                styles.totalGoldText,
                (character.WeeklyActivityTotalGold || 0) >= 0
                  ? { color: colors.black }
                  : { color: colors.warning },
              ]}
            >
              {character.WeeklyActivityTotalGold?.toLocaleString() || 0}
            </Text>
          </View>
          {/* 추가 버튼 */}
          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.secondary }]}
              onPress={toggleActivityModal}
            >
              <Text style={[styles.addButtonText, { color: 'white' }]}>
                ＋ 추가
              </Text>
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
                  setActivityIndex(index);
                  toggleActivityModal();
                }}
              >
                <View style={styles.activityItemRow}>
                  <Text
                    style={[styles.activityNameText, { color: colors.black }]}
                  >
                    {activity.name}
                  </Text>
                  <Text
                    style={[
                      styles.activityGoldText,
                      activity.gold >= 0
                        ? { color: colors.black }
                        : { color: colors.warning },
                    ]}
                  >
                    {activity.gold}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  // ✅ 상단 액션바
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
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
    elevation: 3,
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
    elevation: 3,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
