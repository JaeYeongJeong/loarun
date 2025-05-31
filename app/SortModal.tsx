import { SortOrder, useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import CustomText from './components/CustomText';

type SortModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  positionX: number;
  positionY: number;
};

const SortModal: React.FC<SortModalProps> = ({
  isVisible,
  toggleModal,
  positionX,
  positionY,
}) => {
  const { colors } = useTheme();
  const { sortCharacter } = useCharacter();
  const [selectedOption, setSelectedOption] = useState<SortOrder>('addedAt');

  const handleCloseModal = () => {
    toggleModal();
  };

  const sortByDateAdded = () => {
    setSelectedOption('addedAt');
    sortCharacter('addedAt');
    toggleModal();
  };

  const sortByLevel = () => {
    setSelectedOption('level');
    sortCharacter('level');
    toggleModal();
  };

  const sortByServer = () => {
    setSelectedOption('server');
    sortCharacter('server');
    toggleModal();
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
                  {selectedOption === 'addedAt' && (
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
                  {selectedOption === 'server' && (
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
                  {selectedOption === 'level' && (
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
    backgroundColor: 'transparent',
  },
  modalContainer: {
    padding: 16,
    gap: 12,
    minWidth: 200,
    borderRadius: 10,
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
  },
});

export default SortModal;
