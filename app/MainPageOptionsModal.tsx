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
import CustomText from './components/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';

type OptionsModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  positionX: number;
  positionY: number;
  isBookmarkedFilterOn: boolean;
  toggleBookmarkFilter: () => void;
  toggleInfoVisibility: () => void;
};

const OptionsModal: React.FC<OptionsModalProps> = ({
  isVisible,
  toggleModal,
  positionX,
  positionY,
  isBookmarkedFilterOn,
  toggleBookmarkFilter,
  toggleInfoVisibility,
}) => {
  const { colors } = useTheme();
  const { isInfoVisible } = useAppSetting();
  const handleCloseModal = () => {
    toggleModal();
  };

  const handleToggleInfoVisiblility = () => {
    toggleInfoVisibility();
    toggleModal();
  };

  const handleToggleBookmarkFilter = () => {
    toggleBookmarkFilter();
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
                  marginRight: 12,
                },
              ]}
            >
              <TouchableOpacity onPress={handleToggleInfoVisiblility}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    캐릭터 정보 비공개
                  </CustomText>
                  {!isInfoVisible && (
                    <Feather name="check" size={20} color={colors.iconColor} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleBookmarkFilter}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    즐겨찾기 목록
                  </CustomText>
                  {isBookmarkedFilterOn && (
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
    alignItems: 'flex-end',
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

export default OptionsModal;
