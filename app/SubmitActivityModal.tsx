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
  TouchableWithoutFeedback,
} from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { useAppSetting } from '@/context/AppSettingContext';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();

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
      setIndexNull(); // 인덱스 초기화
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

      if (activityName.trim() !== '') {
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
    }

    setIndexNull(); // 인덱스 초기화
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
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                { backgroundColor: colors.cardBackground },
                { transform: [{ translateY }] },
              ]}
            >
              <Text style={[styles.modalText, { color: colors.black }]}>
                {mode === 'edit' ? '활동 수정' : '활동 추가'}
              </Text>
              {activityHistory.length > 0 && (
                <View style={styles.activityHistoryContainer}>
                  {activityHistory.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.historyButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setActivityName(item)}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          styles.historyButtonText,
                          { color: colors.white },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                placeholder="활동명 입력"
                style={[
                  styles.input,
                  { backgroundColor: colors.grayLight },
                  { color: colors.grayDark },
                ]}
                placeholderTextColor={colors.grayDark}
                value={activityName}
                onChangeText={setActivityName}
              />
              <TextInput
                placeholder="획득 골드"
                style={[
                  styles.input,
                  { backgroundColor: colors.grayLight },
                  { color: colors.grayDark },
                ]}
                keyboardType={
                  Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'
                }
                placeholderTextColor={colors.grayDark}
                value={activityGold}
                onChangeText={setActivityGold}
              />

              <View style={styles.buttonGroup}>
                {mode === 'edit' ? (
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={[
                      styles.deleteButton,
                      { backgroundColor: colors.grayLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.deleteButtonText,
                        { color: colors.danger },
                      ]}
                    >
                      삭제
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={[
                      styles.deleteButton,
                      { backgroundColor: colors.grayLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.deleteButtonText,
                        { color: colors.grayDark },
                      ]}
                    >
                      취소
                    </Text>
                  </TouchableOpacity>
                )}
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
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  activityHistoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 12,
    marginTop: 8,
  },

  historyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 4,
    marginBottom: 4,
    maxWidth: 140, // 혹은 원하는 길이
  },

  historyButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ActivityModal;
