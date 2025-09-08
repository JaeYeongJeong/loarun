import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useCharacter } from '@/context/CharacterContext';
import { useRaid, RaidDifficulty, Raid } from '@/context/RaidContext';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { validateNumberInput } from '@/utils/validateInput';
import CustomText from './CustomTextComponents/CustomText';
import CustomTextInput from './components/CustomTextInput';

type SelectedStage = {
  raidName: string;
  difficulty: RaidDifficulty;
  stage: number;
  gold: number;
  chestCost?: number;
  selectedChestCost?: boolean;
  borderLeftRadius?: number;
  borderRightRadius?: number;
};

type RaidModalProps = {
  isVisible: boolean;
  setIsVisibleFalse: () => void;
  id: string;
  index: number;
};

const STAGE_RADIUS = 12;

const RaidModal: React.FC<RaidModalProps> = ({
  isVisible,
  setIsVisibleFalse,
  id,
  index,
}) => {
  const { characters, updateCharacter } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const { getAvailableRaidsByItemLevel } = useRaid();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(500)).current;

  const [selectedStages, setSelectedStages] = useState<SelectedStage[]>([]);
  const [isGoldChecked, setIsGoldChecked] = useState(true);
  const [isAdditionalGoldChecked, setIsAdditionalGoldChecked] = useState(false);
  const [additionalGold, setAdditionalGold] = useState('');
  const [isChestCostChecked, setIsChestCostChecked] = useState(false);

  if (!character) return null;

  // 안전하게 의존성 기반으로 레이드 리스트 메모
  const raidList = useMemo(
    () => getAvailableRaidsByItemLevel(character.ItemAvgLevel),
    [getAvailableRaidsByItemLevel, character.ItemAvgLevel]
  );

  // 숫자 인풋 포맷터
  const formatNumberInput = useCallback((inputText: string) => {
    const result = validateNumberInput(inputText);
    switch (result.status) {
      case 'valid':
        setAdditionalGold(result.value.toLocaleString());
        break;
      case 'not-a-number':
        Alert.alert('입력 오류', '숫자만 입력할 수 있습니다.');
        break;
      case 'exceeds-limit':
        Alert.alert('범위 초과', '±100억 이하로 입력해주세요.');
        break;
      case 'empty':
        setAdditionalGold(inputText);
        break;
    }
  }, []);

  // 선택 라운딩 규칙(난이도 & 연속 관문 기준)
  const applySelectionRadii = useCallback((stages: SelectedStage[]) => {
    if (!stages?.length) return stages;

    const s = [...stages].sort((a, b) => a.stage - b.stage);
    for (const item of s) {
      item.borderLeftRadius = 0;
      item.borderRightRadius = 0;
    }

    let start = 0;
    while (start < s.length) {
      let end = start;
      while (
        end + 1 < s.length &&
        s[end + 1].difficulty === s[end].difficulty &&
        s[end + 1].stage === s[end].stage + 1
      ) {
        end++;
      }

      if (start === end) {
        s[start].borderLeftRadius = STAGE_RADIUS;
        s[start].borderRightRadius = STAGE_RADIUS;
      } else {
        s[start].borderLeftRadius = STAGE_RADIUS;
        s[end].borderRightRadius = STAGE_RADIUS;
      }

      start = end + 1;
    }

    return s;
  }, []);

  // 초기 로드 & 모달 애니메이션
  useEffect(() => {
    const initial = character.SelectedRaids?.[index];
    const raidName = initial?.name || '';
    const initialStages: SelectedStage[] =
      initial?.stages.map((st) => ({
        raidName,
        difficulty: st.difficulty,
        stage: st.stage,
        gold: st.gold,
        chestCost: st.chestCost,
        selectedChestCost: st.selectedChestCost,
      })) ?? [];

    setSelectedStages(applySelectionRadii(initialStages));
    setIsGoldChecked(initial?.goldChecked ?? true);
    setIsAdditionalGoldChecked(initial?.additionalGoldCheked ?? false); // 호환 유지
    setAdditionalGold(initial?.additionalGold ?? '');
    setIsChestCostChecked(initial?.chestCostChecked ?? false);

    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]); // 모달 열릴 때마다 초기화

  // 도우미
  const findSelectedStage = useCallback(
    (raidName: string, difficulty: RaidDifficulty, stage: number) =>
      selectedStages.find(
        (s) =>
          s.raidName === raidName &&
          s.difficulty === difficulty &&
          s.stage === stage
      ),
    [selectedStages]
  );

  const getStageData = useCallback(
    (raid: Raid, difficulty: RaidDifficulty, stage: number) => {
      return raid.difficulties
        .find((d) => d.difficulty === difficulty)
        ?.stages.find((s) => s.stage === stage);
    },
    []
  );

  // 관문 선택/해제
  const handleSelectStages = useCallback(
    (raid: Raid, difficulty: RaidDifficulty, stage: number) => {
      setSelectedStages((prev) => {
        const alreadySelected = prev.some(
          (s) =>
            s.raidName === raid.name &&
            s.stage === stage &&
            s.difficulty === difficulty
        );

        // 선택된 관문 다시 누르면 해당 관문 이상 제거
        if (alreadySelected) {
          const next = prev.filter(
            (s) => !(s.raidName === raid.name && s.stage >= stage)
          );
          return applySelectionRadii(next);
        }

        const isSingle = difficulty === '싱글';
        const hasSingle = prev.length > 0 && prev[0].difficulty === '싱글';
        const hasOtherRaid = prev.length > 0 && prev[0].raidName !== raid.name;

        // 초기화 조건
        if (isSingle || hasSingle || hasOtherRaid) {
          const next: SelectedStage[] = Array.from(
            { length: stage },
            (_, i) => {
              const info = getStageData(raid, difficulty, i + 1);
              return {
                raidName: raid.name,
                difficulty,
                stage: i + 1,
                gold: info?.gold ?? 0,
                chestCost: info?.chestCost ?? 0,
                selectedChestCost: isChestCostChecked,
              };
            }
          );
          return applySelectionRadii(next);
        }

        // 같은 단계가 이미 다른 난이도로 선택된 경우 제거 후 이전+현재 단계 채우기
        const filtered = prev.filter(
          (s) => !(s.raidName === raid.name && s.stage === stage)
        );
        for (let i = 1; i <= stage; i++) {
          if (
            !filtered.some((s) => s.stage === i && s.raidName === raid.name)
          ) {
            const info = getStageData(raid, difficulty, i);
            filtered.push({
              raidName: raid.name,
              difficulty,
              stage: i,
              gold: info?.gold ?? 0,
              chestCost: info?.chestCost ?? 0,
              selectedChestCost: isChestCostChecked,
            });
          }
        }

        filtered.sort((a, b) => a.stage - b.stage);
        return applySelectionRadii(filtered);
      });
    },
    [applySelectionRadii, getStageData, isChestCostChecked]
  );

  // 더보기 규칙용(체크된 박스들의 연속성 기준 라운딩)
  const checkedStageSet = useMemo(
    () =>
      new Set(
        selectedStages.filter((s) => s.selectedChestCost).map((s) => s.stage)
      ),
    [selectedStages]
  );

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setSelectedStages([]);
    Animated.timing(translateY, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleFalse();
    });
  }, [setIsVisibleFalse, translateY]);

  // 저장
  const handleSubmit = useCallback(() => {
    if (typeof index !== 'number') {
      console.warn('Raid index가 없습니다.');
      return;
    }
    if (isNaN(Number(additionalGold.replace(/,/g, '')))) {
      Alert.alert('입력 오류', '골드를 정확히 입력해주세요.');
      return;
    }

    const nextSelected = [...(character.SelectedRaids || [])];

    const toRaidPayload = () => ({
      name: selectedStages[0].raidName,
      stages: selectedStages.map((s) => ({
        difficulty: s.difficulty,
        stage: s.stage,
        gold: s.gold,
        chestCost: s.chestCost || 0,
        selectedChestCost: s.selectedChestCost,
        cleared: false,
      })),
      goldChecked: isGoldChecked,
      additionalGoldCheked: isAdditionalGoldChecked,
      additionalGold: isAdditionalGoldChecked ? additionalGold : '',
      chestCostChecked: isChestCostChecked,
    });

    if (selectedStages.length <= 0) {
      nextSelected[index] = { name: '', stages: [] };
    } else if (index >= 0) {
      nextSelected[index] = toRaidPayload();
    } else {
      nextSelected.push(toRaidPayload());
    }

    updateCharacter(character.id, { SelectedRaids: nextSelected });

    setSelectedStages([]);
    Animated.timing(translateY, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleFalse();
    });
  }, [
    index,
    additionalGold,
    character.id,
    isAdditionalGoldChecked,
    isChestCostChecked,
    isGoldChecked,
    selectedStages,
    setIsVisibleFalse,
    translateY,
    updateCharacter,
  ]);

  // 삭제
  const handleDelete = useCallback(() => {
    Alert.alert('정말 삭제하시겠어요?', undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          if (index !== undefined && index >= 0) {
            const updated = [...(character.SelectedRaids ?? [])];
            updated.splice(index, 1);
            updateCharacter(character.id, { SelectedRaids: updated });
          }
          handleCloseModal();
        },
      },
    ]);
  }, [
    character.SelectedRaids,
    character.id,
    handleCloseModal,
    index,
    updateCharacter,
  ]);

  return isVisible ? (
    <Modal
      animationType="none"
      transparent
      visible={isVisible}
      onRequestClose={handleCloseModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          <Animated.View
            style={[
              styles.container,
              { backgroundColor: colors.background },
              { transform: [{ translateY }] },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ overflow: 'visible' }}
            >
              {raidList.map((raid, raidIdx) => (
                <View
                  key={raidIdx}
                  style={[
                    styles.raidBlock,
                    { backgroundColor: colors.cardBackground },
                  ]}
                >
                  <CustomText
                    style={[styles.raidName, { color: colors.black }]}
                  >
                    {raid.name}
                  </CustomText>

                  {raid.difficulties.map((difficultyObj, diffIdx) => {
                    const totalGold = difficultyObj.stages.reduce(
                      (t, st) => t + st.gold,
                      0
                    );
                    const totalBoundGold = difficultyObj.stages.reduce(
                      (t, st) => t + (st.boundGold ?? 0),
                      0
                    );

                    return (
                      <View key={diffIdx} style={styles.difficultyBlock}>
                        <View style={styles.difficultyHeader}>
                          <CustomText
                            style={[
                              styles.difficultyText,
                              { color: colors.black },
                              difficultyObj.difficulty === '노말'
                                ? { color: colors.info }
                                : {},
                              difficultyObj.difficulty === '하드'
                                ? { color: colors.danger }
                                : {},
                              difficultyObj.difficulty === '익스트림 노말' ||
                              difficultyObj.difficulty === '익스트림 하드'
                                ? { color: colors.extreme }
                                : {},
                            ]}
                          >
                            {difficultyObj.difficulty}
                          </CustomText>

                          <CustomText
                            style={[
                              styles.totalGoldText,
                              { color: colors.grayDark },
                            ]}
                          >
                            {totalBoundGold > 0
                              ? `${
                                  totalGold - totalBoundGold
                                } / ${totalBoundGold}(귀속)`
                              : totalGold}
                          </CustomText>
                        </View>

                        <View
                          style={[
                            styles.stageContainer,
                            { backgroundColor: colors.grayLight },
                          ]}
                        >
                          {difficultyObj.stages.map((st) => {
                            const matched = findSelectedStage(
                              raid.name,
                              difficultyObj.difficulty,
                              st.stage
                            );
                            const isSelected = !!matched;

                            return (
                              <Pressable
                                key={st.stage}
                                style={[
                                  styles.stageBox,
                                  isSelected && {
                                    backgroundColor: colors.primary,
                                  },
                                  isSelected && {
                                    borderTopLeftRadius:
                                      matched?.borderLeftRadius ?? 0,
                                    borderBottomLeftRadius:
                                      matched?.borderLeftRadius ?? 0,
                                    borderTopRightRadius:
                                      matched?.borderRightRadius ?? 0,
                                    borderBottomRightRadius:
                                      matched?.borderRightRadius ?? 0,
                                  },
                                ]}
                                onPress={() =>
                                  handleSelectStages(
                                    raid,
                                    difficultyObj.difficulty,
                                    st.stage
                                  )
                                }
                              >
                                <CustomText
                                  style={[
                                    styles.stageLabelText,
                                    {
                                      color: isSelected
                                        ? colors.white
                                        : colors.grayDark,
                                    },
                                  ]}
                                >
                                  {st.stage}관문
                                </CustomText>
                                <CustomText
                                  style={[
                                    styles.stageGold,
                                    {
                                      color: isSelected
                                        ? colors.white
                                        : colors.grayDark,
                                    },
                                  ]}
                                >
                                  {st.gold}
                                </CustomText>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {/* 하단 입력 + 버튼 고정 */}
            <View
              style={{
                padding: 24,
                backgroundColor: colors.modalBackground,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
              }}
            >
              {/* 체크박스 라인 1 */}
              <TouchableOpacity onPress={() => setIsGoldChecked((v) => !v)}>
                <View style={styles.checkBlock}>
                  <CustomText
                    style={[styles.checkBlockText, { color: colors.black }]}
                  >
                    클리어 골드 획득
                  </CustomText>
                  <MaterialIcons
                    name={
                      isGoldChecked ? 'check-box' : 'check-box-outline-blank'
                    }
                    size={24}
                    color={
                      isGoldChecked
                        ? colors.secondary
                        : ((colors.grayDark + 80) as any)
                    }
                  />
                </View>
              </TouchableOpacity>

              {/* 체크박스 라인 2 */}
              <TouchableOpacity
                onPress={() => {
                  const next = !isChestCostChecked;
                  setIsChestCostChecked(next);
                  setSelectedStages((prev) =>
                    prev.map((s) => ({ ...s, selectedChestCost: next }))
                  );
                }}
              >
                <View style={styles.checkBlock}>
                  <CustomText
                    style={[styles.checkBlockText, { color: colors.black }]}
                  >
                    더보기 체크
                  </CustomText>
                  <MaterialIcons
                    name={
                      isChestCostChecked
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color={
                      isChestCostChecked
                        ? colors.secondary
                        : ((colors.grayDark + 80) as any)
                    }
                  />
                </View>
              </TouchableOpacity>

              {/* 더보기 뷰 - 난이도 무시, 체크된 관문 연속성 기준 라운딩 */}
              {isChestCostChecked && selectedStages.length > 0 && (
                <View
                  style={[
                    styles.stageContainer,
                    { backgroundColor: colors.grayLight, marginBottom: 12 },
                  ]}
                >
                  {selectedStages
                    .slice()
                    .sort((a, b) => a.stage - b.stage)
                    .map((st) => {
                      const active = !!st.selectedChestCost;
                      const leftR =
                        active && !checkedStageSet.has(st.stage - 1)
                          ? STAGE_RADIUS
                          : 0;
                      const rightR =
                        active && !checkedStageSet.has(st.stage + 1)
                          ? STAGE_RADIUS
                          : 0;

                      return (
                        <Pressable
                          key={st.stage}
                          style={[
                            styles.stageBox,
                            active && { backgroundColor: colors.secondary },
                            {
                              borderTopLeftRadius: leftR,
                              borderBottomLeftRadius: leftR,
                              borderTopRightRadius: rightR,
                              borderBottomRightRadius: rightR,
                            },
                          ]}
                          onPress={() =>
                            setSelectedStages((prev) =>
                              prev.map((s) =>
                                s.stage === st.stage
                                  ? {
                                      ...s,
                                      selectedChestCost: !s.selectedChestCost,
                                    }
                                  : s
                              )
                            )
                          }
                        >
                          <CustomText
                            style={[
                              styles.stageLabelText,
                              {
                                color: active ? colors.white : colors.grayDark,
                              },
                            ]}
                          >
                            {st.stage}관문
                          </CustomText>
                          <CustomText
                            style={[
                              styles.stageGold,
                              {
                                color: active ? colors.white : colors.grayDark,
                              },
                            ]}
                          >
                            {`-${st.chestCost || 0}`}
                          </CustomText>
                        </Pressable>
                      );
                    })}
                </View>
              )}

              {/* 체크박스 라인 3 */}
              <TouchableOpacity
                onPress={() => setIsAdditionalGoldChecked((v) => !v)}
              >
                <View style={styles.checkBlock}>
                  <CustomText
                    style={[styles.checkBlockText, { color: colors.black }]}
                  >
                    버스 및 추가 골드 획득
                  </CustomText>
                  <MaterialIcons
                    name={
                      isAdditionalGoldChecked
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color={
                      isAdditionalGoldChecked
                        ? colors.secondary
                        : ((colors.grayDark + 80) as any)
                    }
                  />
                </View>
              </TouchableOpacity>

              {/* 추가 골드 입력 */}
              {isAdditionalGoldChecked && (
                <CustomTextInput
                  placeholder="추가 골드"
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.grayLight,
                      color: colors.grayDark,
                    },
                  ]}
                  keyboardType={
                    Platform.OS === 'ios'
                      ? 'numbers-and-punctuation'
                      : 'default'
                  }
                  placeholderTextColor={colors.grayDark}
                  value={additionalGold}
                  onChangeText={formatNumberInput}
                />
              )}

              {/* 삭제 */}
              {!(index < 0) && (
                <View style={styles.checkBlock}>
                  <CustomText
                    style={[styles.checkBlockText, { color: colors.danger }]}
                  >
                    삭제
                  </CustomText>
                  <TouchableOpacity onPress={handleDelete}>
                    <Feather name="trash-2" size={24} color={colors.grayDark} />
                  </TouchableOpacity>
                </View>
              )}

              {/* 하단 버튼 */}
              <View style={styles.fixedButtonWrapper}>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.cancelButton}
                >
                  <CustomText
                    style={[
                      styles.cancelButtonText,
                      { color: colors.secondary },
                    ]}
                  >
                    닫기
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.confirmButton}
                >
                  <CustomText
                    style={[
                      styles.confirmButtonText,
                      { color: colors.secondary },
                    ]}
                  >
                    확인
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    paddingTop: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  raidBlock: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  raidName: {
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyBlock: {
    marginTop: 12,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalGoldText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 12,
  },
  stageBox: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
  },
  stageLabelText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  stageGold: {
    fontSize: 10,
    fontWeight: '600',
  },
  checkBlock: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  checkBlockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    fontSize: 14,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
    lineHeight: 20,
  },
  fixedButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RaidModal;
