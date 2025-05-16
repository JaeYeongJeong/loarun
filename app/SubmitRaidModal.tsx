import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { RaidDifficulty, useCharacter } from '@/context/CharacterContext';
import { getAvailableRaidsByItemLevel, RaidData } from '@/utils/raidData';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { validateNumberInput } from '@/utils/validateInput';

type SelectedStage = {
  raidName: string;
  difficulty: RaidDifficulty;
  stage: number;
  gold: number;
  chestCost?: number;
  selectedChestCost?: boolean;
};

type RaidModalProps = {
  isVisible: boolean;
  setIsVisibleFalse: () => void;
  id: string;
  index: number;
};

const RaidModal: React.FC<RaidModalProps> = ({
  isVisible,
  setIsVisibleFalse,
  id,
  index,
}) => {
  const { characters, updateCharacter } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const [selectedStages, setSelectedStages] = useState<SelectedStage[]>([]);
  const [goldChecked, setGoldChecked] = useState(true);
  const [additionalGoldChecked, setAdditionalGoldChecked] = useState(false);
  const [additinalGold, setAdditionalGold] = useState('');
  const [chestCostChecked, setChestCostChecked] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!character) return null; // 캐릭터가 없으면 모달을 렌더링하지 않음

  const raidList = getAvailableRaidsByItemLevel(character.ItemAvgLevel);

  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    const initialRaidValue = character.SelectedRaids?.[index];
    const raidName = initialRaidValue?.name || '';
    const setValue =
      initialRaidValue?.stages.map((stage) => ({
        raidName,
        difficulty: stage.difficulty,
        stage: stage.stage,
        gold: stage.gold,
        chestCost: stage.chestCost,
        selectedChestCost: stage.selectedChestCost,
      })) ?? [];

    setSelectedStages(setValue);
    setGoldChecked(initialRaidValue?.goldChecked ?? true);
    setAdditionalGoldChecked(initialRaidValue?.additionalGoldCheked ?? false);
    setAdditionalGold(initialRaidValue?.additionalGold ?? '');
    setChestCostChecked(initialRaidValue?.chestCostChecked ?? false);

    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const isSelected = (
    raidName: string,
    difficulty: RaidDifficulty,
    stage: number
  ) =>
    selectedStages.some(
      (s) =>
        s.raidName === raidName &&
        s.difficulty === difficulty &&
        s.stage === stage
    );

  const handleSelectStages = (
    raidData: RaidData,
    difficulty: RaidDifficulty,
    stage: number
  ) => {
    setSelectedStages((prev) => {
      const getStageData = (difficulty: RaidDifficulty, stage: number) => {
        return raidData.difficulties
          .find((diff) => diff.difficulty === difficulty)
          ?.stages.find((s) => s.stage === stage);
      };
      const isSelected = prev.some(
        (s) =>
          s.raidName === raidData.name &&
          s.stage === stage &&
          s.difficulty === difficulty
      );

      // 이미 선택된 관문이라면 => 해당 관문 이후 단계 제거
      if (isSelected) {
        return prev.filter(
          (s) => !(s.raidName === raidData.name && s.stage >= stage)
        );
      }

      const isSingle = difficulty === '싱글';
      const hasSingle = prev.length > 0 && prev[0].difficulty === '싱글';
      const hasOtherRaid =
        prev.length > 0 && prev[0].raidName !== raidData.name;

      // 초기화 조건
      if (isSingle || hasSingle || hasOtherRaid) {
        return Array.from({ length: stage }, (_, i) => {
          const stageInfo = getStageData(difficulty, i + 1);
          return {
            raidName: raidData.name,
            difficulty,
            stage: i + 1,
            gold: stageInfo?.gold || 0,
            chestCost: stageInfo?.chestCost || 0,
            selectedChestCost: chestCostChecked,
          };
        });
      }

      // 같은 단계가 이미 다른 난이도로 선택된 경우 제거
      const filtered = prev.filter(
        (s) => !(s.raidName === raidData.name && s.stage === stage)
      );

      // 이전 + 현재 단계 추가
      for (let i = 1; i <= stage; i++) {
        if (
          !filtered.some((s) => s.stage === i && s.raidName === raidData.name)
        ) {
          const stageInfo = getStageData(difficulty, i);

          filtered.push({
            raidName: raidData.name,
            difficulty,
            stage: i,
            gold: stageInfo?.gold || 0,
            chestCost: stageInfo?.chestCost || 0,
            selectedChestCost: chestCostChecked,
          });
        }
      }
      return filtered.sort((a, b) => a.stage - b.stage); // stage 순서 유지
    });
  };

  const handleCloseModal = () => {
    setSelectedStages([]); // 선택된 단계 초기화

    Animated.timing(translateY, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleFalse();
    });
  };

  const handleSubmit = () => {
    if (typeof index !== 'number') {
      console.warn('Raid index가 없습니다.');
      return;
    }
    if (isNaN(Number(additinalGold.replace(/,/g, '')))) {
      Alert.alert('입력 오류', '골드를 정확히 입력해주세요.');
      return;
    }
    const newSelectedRaids = [...(character.SelectedRaids || [])];

    if (index >= 0 && selectedStages.length === 0) {
      // 선택이 없는 경우 빈 배열로 초기화
      newSelectedRaids[index] = {
        name: '', // 이름도 초기화할지 유지할지 선택 가능
        stages: [],
        totalGold: 0,
      };
    } else if (index >= 0 && selectedStages.length > 0) {
      // 선택이 있는 경우 해당 레이드 데이터로 설정
      newSelectedRaids[index] = {
        name: selectedStages[0].raidName,
        stages: selectedStages.map((s) => ({
          difficulty: s.difficulty,
          stage: s.stage,
          gold: s.gold,
          chestCost: s.chestCost || 0,
          selectedChestCost: s.selectedChestCost,
          cleared: false,
        })),
        totalGold: selectedStages.reduce(
          (total, s) =>
            total +
            (goldChecked ? s.gold : 0) -
            (s.selectedChestCost ? s.chestCost || 0 : 0),
          0
        ),
        goldChecked: goldChecked,
        additionalGoldCheked: additionalGoldChecked,
        additionalGold: additionalGoldChecked ? additinalGold : '',
        chestCostChecked: chestCostChecked,
      };
    } else {
      //index = -1인 경우
      newSelectedRaids.push({
        name: selectedStages[0].raidName,
        stages: selectedStages.map((s) => ({
          difficulty: s.difficulty,
          stage: s.stage,
          gold: s.gold,
          chestCost: s.chestCost,
          selectedChestCost: s.selectedChestCost,
          cleared: false,
        })),
        totalGold: selectedStages.reduce(
          (total, s) =>
            total +
            (goldChecked ? s.gold : 0) -
            (s.selectedChestCost ? s.chestCost || 0 : 0),
          0
        ),
        goldChecked: goldChecked,
        additionalGoldCheked: additionalGoldChecked,
        additionalGold: additionalGoldChecked ? additinalGold : '',
        chestCostChecked: chestCostChecked,
      });
    }

    updateCharacter(character.id, {
      SelectedRaids: newSelectedRaids,
    });

    setSelectedStages([]);

    Animated.timing(translateY, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleFalse();
    });
  };

  const handleDelete = () => {
    Alert.alert('정말 삭제하시겠어요?', undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          if (index !== undefined && index >= 0) {
            const updated = [...(character.SelectedRaids ?? [])];
            updated.splice(index, 1);
            updateCharacter(character.id, {
              SelectedRaids: updated,
            });
          }
          handleCloseModal();
        },
      },
    ]);
  };

  // 인풋 핸들러
  const handleChange = (inputText: string) => {
    const result = validateNumberInput(inputText);

    switch (result.status) {
      case 'valid':
        setAdditionalGold(result.value.toLocaleString()); // 쉼표 없이 숫자만 저장
        break;
      case 'not-a-number':
        Alert.alert('입력 오류', '숫자만 입력할 수 있습니다.');
        break;
      case 'exceeds-limit':
        Alert.alert('범위 초과', '±100억 이하로 입력해주세요.');
        break;
      case 'empty':
        setAdditionalGold(inputText); // 사용자가 '-'만 입력 중일 수 있으므로 그대로 유지
        break;
    }
  };

  return (
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
              contentContainerStyle={{ paddingBottom: 16 }}
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
                  <Text style={[styles.raidName, { color: colors.black }]}>
                    {raid.name}
                  </Text>
                  {raid.difficulties.map((difficultyObj, stageIdx) => (
                    <View key={stageIdx} style={styles.difficultyBlock}>
                      <View style={styles.difficultyHeader}>
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: colors.black },
                            difficultyObj.difficulty === '노말'
                              ? { color: colors.info }
                              : {},
                            difficultyObj.difficulty === '하드'
                              ? { color: colors.danger }
                              : {},
                          ]}
                        >
                          {difficultyObj.difficulty}
                        </Text>
                        <Text
                          style={[
                            styles.totalGoldText,
                            { color: colors.grayDark },
                          ]}
                        >
                          {difficultyObj.totalGold}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.stageContainer,
                          { backgroundColor: colors.grayLight },
                        ]}
                      >
                        {difficultyObj.stages.map((stage) => (
                          <TouchableOpacity
                            key={stage.stage}
                            style={[
                              styles.stageBox,
                              isSelected(
                                raid.name,
                                difficultyObj.difficulty,
                                stage.stage
                              ) && { backgroundColor: colors.primary },
                            ]}
                            onPress={() => {
                              handleSelectStages(
                                raid,
                                difficultyObj.difficulty,
                                stage.stage
                              );
                            }}
                          >
                            <Text
                              style={[
                                styles.stageLabelText,
                                { color: colors.grayDark },
                                isSelected(
                                  raid.name,
                                  difficultyObj.difficulty,
                                  stage.stage
                                ) && { color: colors.white },
                              ]}
                            >
                              {stage.stage}관문
                            </Text>
                            <Text
                              style={[
                                styles.stageGold,
                                { color: colors.grayDark },
                                isSelected(
                                  raid.name,
                                  difficultyObj.difficulty,
                                  stage.stage
                                ) && { color: colors.white },
                              ]}
                            >
                              {stage.gold}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* ✅ 하단 입력 + 버튼 고정 블럭 */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 24,
                paddingBottom: 12,
                backgroundColor: colors.modalBackground,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
              }}
            >
              {/* 체크박스 라인 1 */}
              <TouchableOpacity onPress={() => setGoldChecked(!goldChecked)}>
                <View style={styles.checkBlock}>
                  <Text
                    style={[
                      styles.checkBlockText,
                      {
                        color: colors.black,
                      },
                    ]}
                  >
                    클리어 골드 획득
                  </Text>
                  <MaterialIcons
                    name={goldChecked ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={
                      goldChecked ? colors.secondary : colors.grayDark + 80
                    }
                  />
                </View>
              </TouchableOpacity>
              {/* 체크박스 라인 2 */}
              <TouchableOpacity
                onPress={() => {
                  const nextChecked = !chestCostChecked;
                  setChestCostChecked(nextChecked);
                  setSelectedStages((prev) =>
                    prev.map((s) => ({
                      ...s,
                      selectedChestCost: nextChecked,
                    }))
                  );
                }}
              >
                <View style={styles.checkBlock}>
                  <Text
                    style={[
                      styles.checkBlockText,
                      {
                        color: colors.black,
                      },
                    ]}
                  >
                    더보기 체크
                  </Text>
                  <MaterialIcons
                    name={
                      chestCostChecked ? 'check-box' : 'check-box-outline-blank'
                    }
                    size={24}
                    color={
                      chestCostChecked ? colors.secondary : colors.grayDark + 80
                    }
                  />
                </View>
              </TouchableOpacity>
              {/*더보기 뷰*/}
              {chestCostChecked && selectedStages.length > 0 && (
                <View
                  style={[
                    styles.stageContainer,
                    {
                      backgroundColor: colors.grayLight,
                      marginBottom: 12,
                    },
                  ]}
                >
                  {selectedStages.map((stage, stageIndex) => (
                    <TouchableOpacity
                      key={stage.stage}
                      style={[
                        styles.stageBox,
                        stage.selectedChestCost && {
                          backgroundColor: colors.secondary,
                        },
                      ]}
                      onPress={() =>
                        setSelectedStages((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx === stageIndex
                              ? {
                                  ...s,
                                  selectedChestCost: !s.selectedChestCost,
                                }
                              : s
                          )
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.stageLabelText,
                          { color: colors.grayDark },
                          stage.selectedChestCost && { color: colors.white },
                        ]}
                      >
                        {stage.stage}관문
                      </Text>
                      <Text
                        style={[
                          styles.stageGold,
                          { color: colors.grayDark },
                          stage.selectedChestCost && { color: colors.white },
                        ]}
                      >
                        {`-${stage.chestCost}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* 체크박스 라인 3 */}
              <TouchableOpacity
                onPress={() => setAdditionalGoldChecked(!additionalGoldChecked)}
              >
                <View style={styles.checkBlock}>
                  <Text
                    style={[
                      styles.checkBlockText,
                      {
                        color: colors.black,
                      },
                    ]}
                  >
                    버스 및 추가 골드 획득
                  </Text>
                  <MaterialIcons
                    name={
                      additionalGoldChecked
                        ? 'check-box'
                        : 'check-box-outline-blank'
                    }
                    size={24}
                    color={
                      additionalGoldChecked
                        ? colors.secondary
                        : colors.grayDark + 80
                    }
                  />
                </View>
              </TouchableOpacity>
              {/* 추가 골드 입력 */}
              {additionalGoldChecked && (
                <TextInput
                  placeholder="추가 골드"
                  style={[
                    styles.input,
                    { backgroundColor: colors.grayLight },
                    { color: colors.grayDark },
                  ]}
                  keyboardType={
                    Platform.OS === 'ios'
                      ? 'numbers-and-punctuation'
                      : 'numeric'
                  }
                  placeholderTextColor={colors.grayDark}
                  value={additinalGold}
                  onChangeText={handleChange}
                />
              )}
              {index < 0 || (
                <View style={styles.checkBlock}>
                  <Text
                    style={[
                      styles.checkBlockText,
                      {
                        color: colors.danger,
                      },
                    ]}
                  >
                    삭제
                  </Text>
                  <TouchableOpacity onPress={handleDelete}>
                    <Feather name="trash-2" size={24} color={colors.grayDark} />
                  </TouchableOpacity>
                </View>
              )}
              {/* 하단 버튼 */}
              <View style={styles.fixedButtonWrapper}>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={[
                    styles.cancelButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: colors.grayDark },
                    ]}
                  >
                    닫기
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[styles.confirmButtonText, { color: colors.white }]}
                  >
                    확인
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
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
  },
  raidBlock: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 10,
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
    marginBottom: 8,
  },
  difficultyBlock: {
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: '500',
  },
  stageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 10,
  },
  stageBox: {
    flex: 1,
    padding: 4,
    alignItems: 'center',
    borderRadius: 10,
  },
  stageLabelText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  stageGold: {
    fontSize: 12,
    fontWeight: '500',
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
    paddingTop: 12,
    paddingBottom: 16,
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
