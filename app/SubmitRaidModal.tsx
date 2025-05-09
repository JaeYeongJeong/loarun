import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { getAvailableRaidsByItemLevel } from '@/utils/raidData';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Difficulty = '싱글' | '노말' | '하드';

type RaidStage = {
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
  selected?: boolean; // ✅ 선택 여부 (true/false)
};

type Raiddifficulty = {
  difficulty: Difficulty;
  stages: RaidStage[]; // 관문별 정보
  totalGold: number;
  requiredItemLevel: number;
};

type Raid = {
  name: string;
  difficulty: Raiddifficulty[]; // 난이도별 구성
};

type RaidModalProps = {
  isVisible: boolean;
  setIsVisibleFalse: () => void;
  id: string;
  index: number;
};

type SelectedStage = {
  raidName: string;
  difficulty: Difficulty;
  stage: number;
  gold: number;
};

const RaidModal: React.FC<RaidModalProps> = ({
  isVisible,
  setIsVisibleFalse,
  id,
  index,
}) => {
  const { characters, updateCharacter } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const [selectedStages, setSelectedStages] = React.useState<SelectedStage[]>(
    []
  );
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!character) return null; // 캐릭터가 없으면 모달을 렌더링하지 않음

  const raidList = getAvailableRaidsByItemLevel(character.ItemAvgLevel);

  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
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
    difficulty: Difficulty,
    stage: number
  ) =>
    selectedStages.some(
      (s) =>
        s.raidName === raidName &&
        s.difficulty === difficulty &&
        s.stage === stage
    );

  const handleSelectStages = (
    raidName: string,
    difficulty: Difficulty,
    stage: number,
    gold: number
  ) => {
    setSelectedStages((prev) => {
      const isSelected = prev.some(
        (s) =>
          s.raidName === raidName &&
          s.stage === stage &&
          s.difficulty === difficulty
      );

      // 이미 선택된 관문이라면 => 해당 관문 이후 단계 제거
      if (isSelected) {
        return prev.filter(
          (s) => !(s.raidName === raidName && s.stage >= stage)
        );
      }

      const isSingle = difficulty === '싱글';
      const hasSingle = prev.length > 0 && prev[0].difficulty === '싱글';
      const hasOtherRaid = prev.length > 0 && prev[0].raidName !== raidName;

      // 초기화 조건
      if (isSingle || hasSingle || hasOtherRaid) {
        return Array.from({ length: stage }, (_, i) => ({
          raidName,
          difficulty,
          stage: i + 1,
          gold,
        }));
      }

      // 같은 단계가 이미 다른 난이도로 선택된 경우 제거
      const filtered = prev.filter(
        (s) => !(s.raidName === raidName && s.stage === stage)
      );

      // 이전 + 현재 단계 추가
      for (let i = 1; i <= stage; i++) {
        if (!filtered.some((s) => s.stage === i && s.raidName === raidName)) {
          filtered.push({ raidName, difficulty, stage: i, gold });
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

    const newSelectedRaids = [...(character.SelectedRaids || [])];

    if (selectedStages.length === 0) {
      // 선택이 없는 경우 빈 배열로 초기화
      newSelectedRaids[index] = {
        name: '', // 이름도 초기화할지 유지할지 선택 가능
        stages: [],
        totalGold: 0,
      };
    } else {
      // 선택이 있는 경우 해당 레이드 데이터로 설정
      newSelectedRaids[index] = {
        name: selectedStages[0].raidName,
        stages: selectedStages.map((s) => ({
          difficulty: s.difficulty,
          stage: s.stage,
          gold: s.gold,
          cleared: false,
        })),
        totalGold: selectedStages.reduce((total, s) => total + s.gold, 0),
      };
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

  return (
    <Modal
      animationType="none"
      transparent
      visible={isVisible}
      onRequestClose={handleCloseModal}
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
                {raid.difficulty.map((difficultyObj, stageIdx) => (
                  <View key={stageIdx} style={styles.difficultyBlock}>
                    {/* 🔽 헤더 한 줄 정렬 */}
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
                              raid.name,
                              difficultyObj.difficulty,
                              stage.stage,
                              stage.gold
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
          <View
            style={[
              styles.fixedButtonWrapper,
              { backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity
              onPress={handleCloseModal}
              style={[
                styles.cancelButton,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text
                style={[styles.cancelButtonText, { color: colors.grayDark }]}
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
              <Text style={[styles.confirmButtonText, { color: colors.white }]}>
                확인
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
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
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  raidBlock: {
    marginBottom: 24,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  raidName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stageContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },
  stageBox: {
    flex: 1,
    padding: 4,
    alignItems: 'center',
    borderRadius: 10,
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
  stageLabelText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  stageGold: {
    fontSize: 12,
    fontWeight: '500',
  },
  fixedButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
