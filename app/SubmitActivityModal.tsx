import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useCharacter } from '@/utils/CharacterContext';
import { useAppSetting } from '@/utils/AppSettingContext';

type ActivityModalProps = {
  isVisible: boolean;
  setIndexNull: () => void;
  setIsVisibleFalse: () => void;
  id: string;
  mode?: 'add' | 'edit';
  initialActivity?: { name: string; gold: number };
  index?: number;
};

const ActivityModal: React.FC<ActivityModalProps> = ({
  isVisible,
  setIndexNull,
  setIsVisibleFalse,
  id,
  mode,
  initialActivity,
  index,
}) => {
  const [activityName, setActivityName] = useState('');
  const [activityGold, setActivityGold] = useState('');
  const { characters, updateCharacter } = useCharacter();
  const { activityHistory, updateActivityHistory } = useAppSetting();
  const character = characters.find((c) => c.id === id);

  if (!character) return null; // ✅ 없는 캐릭터 방지

  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (mode === 'edit' && initialActivity) {
      setActivityName(initialActivity.name);
      setActivityGold(initialActivity.gold.toString());
    } else {
      setActivityName('');
      setActivityGold('');
    }

    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleCloseModal = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisibleFalse(); // 닫기 완료 후 상태 변경
    });
  };

  const handleSubmit = () => {
    if (isNaN(Number(activityGold.trim()))) {
      Alert.alert('입력 오류', '골드를 정확히 입력해주세요.');
      return;
    }

    if (!activityName.trim() && !activityGold.trim()) {
      handleCloseModal();
      return;
    }

    if (mode === 'edit' && index !== undefined) {
      const updated = [...(character.WeeklyActivity ?? [])];
      updated[index] = {
        name: activityName || '',
        gold: Number(activityGold) || 0,
      };

      updateCharacter(character.id, {
        WeeklyActivity: updated,
        WeeklyActivityTotalGold: updated.reduce(
          (total, activity) => total + activity.gold,
          0
        ),
      });
    } else {
      const newActivity = [
        {
          name: activityName || '',
          gold: Number(activityGold) || 0,
        },
        ...(character.WeeklyActivity ?? []), // undefined일 경우 빈 배열로 대체
      ];

      const updatedTotalGold = newActivity.reduce(
        (total, activity) => total + activity.gold,
        0
      );

      updateCharacter(character.id, {
        WeeklyActivity: newActivity,
        WeeklyActivityTotalGold: updatedTotalGold,
      });

      const MAX_HISTORY_LENGTH = 8; // 최대 히스토리 길이
      let updatedHistory = [...activityHistory];
      const activityHistoryIndex = activityHistory.findIndex(
        (item) => item === activityName.trim()
      );
      if (activityHistoryIndex !== -1) {
        updatedHistory.splice(activityHistoryIndex, 1); // 기존 히스토리 삭제
      } else if (updatedHistory.length >= MAX_HISTORY_LENGTH) {
        updatedHistory.pop(); // 가장 오래된 히스토리 삭제
      }
      updateActivityHistory([activityName.trim(), ...updatedHistory]); // 맨 앞으로 삽입
    }

    setIndexNull(); // 인덱스 초기화
    setActivityName('');
    setActivityGold('');
    handleCloseModal();
  };

  const handleDelete = () => {
    Alert.alert('정말 삭제하시겠어요?', undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          if (index !== undefined) {
            const updated = [...(character.WeeklyActivity ?? [])];
            updated.splice(index, 1);
            const updatedTotalGold = updated.reduce(
              (total, activity) => total + activity.gold,
              0
            );
            updateCharacter(character.id, {
              WeeklyActivity: updated,
              WeeklyActivityTotalGold: updatedTotalGold,
            });
          }
          setIndexNull();
          handleCloseModal();
        },
      },
    ]);
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={isVisible}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <Animated.View
            style={[styles.modalContainer, { transform: [{ translateY }] }]}
          >
            <Text style={styles.modalText}>
              {mode === 'edit' ? '📝 활동 수정' : '📝 활동 추가'}
            </Text>
            {activityHistory.length > 0 && (
              <View style={styles.activityHistoryContainer}>
                {activityHistory.map((item, index) => (
                  <Pressable
                    key={index}
                    style={styles.historyButton}
                    onPress={() => setActivityName(item)}
                  >
                    <Text style={styles.historyButtonText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <TextInput
              placeholder="활동명 입력"
              style={styles.input}
              placeholderTextColor="#aaa"
              value={activityName}
              onChangeText={setActivityName}
            />
            <TextInput
              placeholder="획득 골드"
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              value={activityGold}
              onChangeText={setActivityGold}
            />

            <View style={styles.buttonGroup}>
              {mode === 'edit' && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityHistoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 12,
    gap: 8, // React Native 0.71 이상
  },

  historyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 4,
    marginBottom: 4,
  },

  historyButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ActivityModal;
