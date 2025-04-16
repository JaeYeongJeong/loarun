import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCharacter } from '@/utils/CharacterContext';
import { RAID_LIST } from '@/utils/raidData';

export type RaidDifficulty = '싱글' | '노말' | '하드';

type RaidStage = {
  stage: number; // 관문 번호 (1, 2, 3...)
  gold: number; // 해당 관문에서 획득하는 골드
  selected?: boolean; // ✅ 선택 여부 (true/false)
};

type RaidLevel = {
  difficulty: RaidDifficulty;
  stages: RaidStage[]; // 관문별 정보
  totalGold: number;
  requiredItemLevel: number;
};

type Raid = {
  name: string;
  levels: RaidLevel[]; // 난이도별 구성
};

type RaidModalProps = {
  isVisible: boolean;
  setIsVisibleFalse: () => void;
  id: string;
  index: number;
};

type SelectedStage = {
  raidName: string;
  difficulty: RaidDifficulty;
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

  if (!character) return null; // 캐릭터가 없으면 모달을 렌더링하지 않음

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
    difficulty: RaidDifficulty,
    stage: number,
    gold: number
  ) =>
    selectedStages.some(
      (s) =>
        s.raidName === raidName &&
        s.difficulty === difficulty &&
        s.stage === stage &&
        s.gold === gold
    );

  const handleSelectStages = (
    raidName: string,
    difficulty: RaidDifficulty,
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
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, width: '100%' }}
        >
          <Animated.View
            style={[styles.container, { transform: [{ translateY }] }]}
          >
            <ScrollView>
              {RAID_LIST.map((raid, raidIdx) => (
                <View key={raidIdx} style={styles.raidBlock}>
                  <Text style={styles.raidName}>{raid.name}</Text>
                  {raid.levels.map((level, levelIdx) => (
                    <View key={levelIdx} style={styles.levelBlock}>
                      <TouchableOpacity style={styles.levelBox}>
                        <Text style={styles.stageTitle}>
                          {level.difficulty}
                        </Text>
                        <Text style={styles.stageGold}>{level.totalGold}G</Text>
                      </TouchableOpacity>
                      <View style={styles.stageContainer}>
                        {level.stage.map((stage) => (
                          <TouchableOpacity
                            key={stage.stage}
                            style={[
                              styles.stageBox,
                              isSelected(
                                raid.name,
                                level.difficulty,
                                stage.stage,
                                stage.gold
                              )
                                ? { backgroundColor: '#ff7675' }
                                : {},
                            ]}
                            onPress={() => {
                              handleSelectStages(
                                raid.name,
                                level.difficulty,
                                stage.stage,
                                stage.gold
                              );
                            }}
                          >
                            <Text style={styles.stageTitle}>
                              {stage.stage}관문
                            </Text>
                            <Text style={styles.stageGold}>{stage.gold}G</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleSubmit();
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>확인</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  raidBlock: {
    marginBottom: 24,
    backgroundColor: '#2b2b2b',
    borderRadius: 10,
    padding: 12,
  },
  raidName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  levelBlock: {
    backgroundColor: '#3b3b3b',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  totalText: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stageText: {
    color: '#ddd',
    marginBottom: 2,
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#ff7675',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  levelBox: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap', // 줄바꿈 허용
  },
  stageBox: {
    width: 'auto',
  },
  stageTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  stageGold: {
    color: '#f1c40f',
    fontWeight: 'bold',
    fontSize: 10,
  },
});

export default RaidModal;
