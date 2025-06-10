import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Modal,
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
import { useTheme } from '@/context/ThemeContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { validateNumberInput } from '@/utils/validateInput';
import CustomText from './components/CustomText';

type resetPeriodType = 'daily' | 'weekly' | '';

type ActivityModalProps = {
  isVisible: boolean;
  setIndexNull: () => void;
  setIsVisibleFalse: () => void;
  id: string;
  mode?: 'add' | 'edit';
  initialActivity?: {
    name: string;
    checked?: boolean;
    gold?: number;
    goldChecked?: boolean;
    resetPeriod?: resetPeriodType;
  };
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
  const [goldChecked, setGoldChecked] = useState(false);
  const [resetPeriod, setResetPeriod] = useState<resetPeriodType>('');
  const { characters, updateCharacter } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const { colors } = useTheme();

  if (!character) return null; // ✅ 없는 캐릭터 방지

  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (mode === 'edit' && initialActivity) {
      setActivityName(initialActivity.name);
      setActivityGold(initialActivity.gold?.toLocaleString() || '');
      setGoldChecked(initialActivity.goldChecked || false);
      setResetPeriod(initialActivity.resetPeriod || '');
    } else {
      setActivityName('');
      setActivityGold('');
      setResetPeriod('');
      setGoldChecked(false);
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
    if (isNaN(Number(activityGold.replace(/,/g, '')))) {
      Alert.alert('입력 오류', '골드를 정확히 입력해주세요.');
      return;
    }

    if (activityName.length > 30) {
      Alert.alert('입력 초과', '활동명을 30글자 이하로 입력해주세요. ');
    }

    if (!activityName.trim() && !activityGold.trim()) {
      handleCloseModal();
      return;
    }

    if (mode === 'edit' && index !== undefined) {
      const updated = [...(character.checkList ?? [])];
      updated[index] = {
        name: activityName || '',
        resetPeriod: resetPeriod,
        checked: initialActivity?.checked || false,
        goldChecked: goldChecked,
        gold: Number(activityGold.replace(/,/g, '')) || 0,
      };
      const updatedTotalGold = updated.reduce(
        (total, item) => total + (item.gold || 0),
        0
      );

      updateCharacter(character.id, {
        checkList: updated,
        checkListTotalGold: updatedTotalGold,
      });
    } else {
      const newCheckList = [
        ...(character.checkList ?? []),
        {
          name: activityName || '',
          resetPeriod: resetPeriod,
          checked: false,
          goldChecked: goldChecked,
          gold: Number(activityGold.replace(/,/g, '')) || 0,
        },
      ];

      const updatedTotalGold = newCheckList.reduce(
        (total, item) => total + (item.gold || 0),
        0
      );

      updateCharacter(character.id, {
        checkList: newCheckList,
        checkListTotalGold: updatedTotalGold,
      });
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
            const updated = [...(character.checkList ?? [])];
            updated.splice(index, 1);
            const updatedTotalGold = updated.reduce(
              (total, item) => total + (item.gold || 0),
              0
            );
            updateCharacter(character.id, {
              checkList: updated,
              checkListTotalGold: updatedTotalGold,
            });
          }
          setIndexNull();
          handleCloseModal();
        },
      },
    ]);
  };

  const handleChangeNameInput = (inputText: string) => {
    if (inputText.length <= 30) {
      setActivityName(inputText);
    } else {
      Alert.alert('범위 초과', '30글자 이하로 입력해주세요.');
    }
  };

  // 인풋 핸들러
  const handleChangeGoldInput = (inputText: string) => {
    const result = validateNumberInput(inputText);

    switch (result.status) {
      case 'valid':
        setActivityGold(result.value.toLocaleString()); // 쉼표 없이 숫자만 저장
        break;
      case 'not-a-number':
        Alert.alert('입력 오류', '숫자만 입력할 수 있습니다.');
        break;
      case 'exceeds-limit':
        Alert.alert('범위 초과', '±100억 이하로 입력해주세요.');
        break;
      case 'empty':
        setActivityGold(inputText); // 사용자가 '-'만 입력 중일 수 있으므로 그대로 유지
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
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
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
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  {/* 왼쪽 더미 박스 */}
                  <View style={{ width: 24 /* 아이콘 크기와 같게 */ }} />
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    {mode === 'edit' ? '리스트 수정' : '리스트 추가'}
                  </CustomText>

                  {mode === 'edit' ? (
                    <TouchableOpacity onPress={handleDelete}>
                      <Feather
                        name="trash-2"
                        size={24}
                        color={colors.grayDark}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 24 }} />
                  )}
                </View>
                <TouchableOpacity onPress={() => setGoldChecked(!goldChecked)}>
                  <View style={styles.checkBlock}>
                    <CustomText
                      style={[
                        styles.checkBlockText,
                        {
                          color: colors.black,
                        },
                      ]}
                    >
                      리셋 주기
                    </CustomText>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.historyButton,
                          {
                            backgroundColor:
                              resetPeriod === 'daily'
                                ? colors.secondary
                                : colors.grayLight,
                          },
                        ]}
                        onPress={() => {
                          setResetPeriod((prev) => {
                            if (prev === 'daily') {
                              return '';
                            }
                            return 'daily';
                          });
                        }}
                      >
                        <CustomText
                          style={[
                            styles.historyButtonText,
                            {
                              color:
                                resetPeriod === 'daily'
                                  ? colors.white
                                  : colors.grayDark,
                            },
                          ]}
                        >
                          일간
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.historyButton,
                          {
                            backgroundColor:
                              resetPeriod === 'weekly'
                                ? colors.secondary
                                : colors.grayLight,
                          },
                        ]}
                        onPress={() => {
                          setResetPeriod((prev) => {
                            if (prev === 'weekly') {
                              return '';
                            }
                            return 'weekly';
                          });
                        }}
                      >
                        <CustomText
                          style={[
                            styles.historyButtonText,
                            {
                              color:
                                resetPeriod === 'weekly'
                                  ? colors.white
                                  : colors.grayDark,
                            },
                          ]}
                        >
                          주간
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>

                <TextInput
                  placeholder="활동명 입력"
                  style={[
                    styles.input,
                    { backgroundColor: colors.grayLight },
                    { color: colors.grayDark },
                  ]}
                  placeholderTextColor={colors.grayDark}
                  value={activityName}
                  onChangeText={handleChangeNameInput}
                />
                <TouchableOpacity onPress={() => setGoldChecked(!goldChecked)}>
                  <View style={styles.checkBlock}>
                    <CustomText
                      style={[
                        styles.checkBlockText,
                        {
                          color: colors.black,
                        },
                      ]}
                    >
                      골드 추가
                    </CustomText>
                    <MaterialIcons
                      name={
                        goldChecked ? 'check-box' : 'check-box-outline-blank'
                      }
                      size={24}
                      color={
                        goldChecked ? colors.secondary : colors.grayDark + 80
                      }
                    />
                  </View>
                </TouchableOpacity>
                {goldChecked && (
                  <TextInput
                    placeholder="획득 골드"
                    style={[
                      styles.input,
                      { backgroundColor: colors.grayLight },
                      { color: colors.grayDark },
                    ]}
                    keyboardType={
                      Platform.OS === 'ios'
                        ? 'numbers-and-punctuation'
                        : 'default'
                    }
                    placeholderTextColor={colors.grayDark}
                    value={activityGold}
                    onChangeText={handleChangeGoldInput}
                  />
                )}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.grayLight },
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.actionButtonText,
                        { color: colors.grayDark },
                      ]}
                    >
                      취소
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={[
                      styles.confirmButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.confirmButtonText,
                        { color: colors.white },
                      ]}
                    >
                      확인
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
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
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
  },
  actionButtonText: {
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
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 4,
    marginBottom: 4,
    maxWidth: 140, // 혹은 원하는 길이
  },

  historyButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  checkBlock: {
    width: '100%',
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  checkBlockText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ActivityModal;
