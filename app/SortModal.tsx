import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import CustomText from '../components/customTextComponents/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';

type SortModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  positionX: number;
  positionY: number;
  openCustomSortModal: () => void;
};

const SortModal: React.FC<SortModalProps> = ({
  isVisible,
  toggleModal,
  positionX,
  positionY,
  openCustomSortModal,
}) => {
  const { colors } = useTheme();
  const { characterSortOrder, updateCharacterSortOrder } = useAppSetting();

  const handleCloseModal = () => {
    toggleModal();
  };

  const sortByDateAdded = () => {
    updateCharacterSortOrder('addedAt');
    toggleModal();
  };

  const sortByLevel = () => {
    updateCharacterSortOrder('level');
    toggleModal();
  };

  const sortByServer = () => {
    updateCharacterSortOrder('server');
    toggleModal();
  };

  const sortByCustom = () => {
    toggleModal();
    openCustomSortModal();
  };

  return (
    <Modal animationType="none" transparent={true} visible={isVisible}>
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={[styles.modalOverlay]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.modalBackground,
                  borderColor: colors.grayDark + '55',
                  marginTop: positionY,
                  marginLeft: 12,
                },
              ]}
            >
              {/* ✅ 모달 닫고 페이지 이동 */}
              <TouchableOpacity onPress={sortByDateAdded}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    추가 순
                  </CustomText>
                  {characterSortOrder === 'addedAt' && (
                    <Feather name="check" size={20} color={colors.iconColor} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={sortByServer}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    서버 순
                  </CustomText>
                  {characterSortOrder === 'server' && (
                    <Feather name="check" size={20} color={colors.iconColor} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={sortByLevel}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    레벨 높은 순
                  </CustomText>
                  {characterSortOrder === 'level' && (
                    <Feather name="check" size={20} color={colors.iconColor} />
                  )}
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.grayDark + '33' },
                ]}
              />
              <TouchableOpacity onPress={sortByCustom}>
                <View style={styles.optionContainer}>
                  <View style={styles.customOptionTextWrapper}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      커스텀 정렬
                    </CustomText>
                    <CustomText
                      style={[
                        styles.customOptionDescription,
                        { color: colors.grayDark },
                      ]}
                    >
                      직접 순서 변경
                    </CustomText>
                  </View>
                  {characterSortOrder === 'custom' && (
                    <Feather name="check" size={20} color={colors.iconColor} />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  modalContainer: {
    padding: 16,
    gap: 10,
    minWidth: 200,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 32,
    minHeight: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 2,
  },
  customOptionTextWrapper: {
    gap: 2,
  },
  customOptionDescription: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default SortModal;
