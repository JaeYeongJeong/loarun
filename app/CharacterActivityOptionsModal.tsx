import { useTheme } from '@/context/ThemeContext';
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
import CustomAlert from './CustomAlert';

type CharacterActivityOptionsModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  positionX: number;
  positionY: number;
  resetMissions: () => void;
  changeName: () => void;
};

const CharacterActivityOptionsModal: React.FC<
  CharacterActivityOptionsModalProps
> = ({
  isVisible,
  toggleModal,
  positionX,
  positionY,
  resetMissions,
  changeName,
}) => {
  const [resetAlertVisible, setResetAlertVisible] = React.useState(false);

  const { colors } = useTheme();

  const handleCloseModal = () => {
    toggleModal();
  };

  return (
    <>
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
                <TouchableOpacity onPress={changeName}>
                  <View style={styles.optionContainer}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      닉네임 변경
                    </CustomText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    toggleModal();
                    setResetAlertVisible(true);
                  }}
                >
                  <View style={styles.optionContainer}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      일일/주간 미션 초기화
                    </CustomText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <CustomAlert
        isVisible={resetAlertVisible}
        setIsVisibleFalse={() => setResetAlertVisible(false)}
        titleText="미션 초기화"
        messageText="일일/주간 미션을 초기화하시겠습니까?"
        onSubmit={resetMissions}
      />
    </>
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

export default CharacterActivityOptionsModal;
