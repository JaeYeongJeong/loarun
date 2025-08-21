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
  resetRaid: () => void;
  resetMissions: () => void;
  resetAccountMissions: () => void;
  changeName: () => void;
  syncMission: () => void;
};

const CharacterActivityOptionsModal: React.FC<
  CharacterActivityOptionsModalProps
> = ({
  isVisible,
  toggleModal,
  positionX,
  positionY,
  resetRaid,
  resetMissions,
  resetAccountMissions,
  changeName,
  syncMission,
}) => {
  const [resetRaidAlertVisible, setResetRaidAlertVisible] =
    React.useState(false);
  const [resetMissionAlertVisible, setResetMissionAlertVisible] =
    React.useState(false);
  const [resetAccountMissionAlertVisible, setResetAccountMissionAlertVisible] =
    React.useState(false);
  const [syncMissionAlertVisible, setSyncMissionAlertVisible] =
    React.useState(false);
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
                    setResetRaidAlertVisible(true);
                  }}
                >
                  <View style={styles.optionContainer}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      레이드 기본값
                    </CustomText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    toggleModal();
                    setResetMissionAlertVisible(true);
                  }}
                >
                  <View style={styles.optionContainer}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      일일/주간 미션 기본값
                    </CustomText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    toggleModal();
                    setResetAccountMissionAlertVisible(true);
                  }}
                >
                  <View style={styles.optionContainer}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      원정대 미션 기본값
                    </CustomText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    toggleModal();
                    setSyncMissionAlertVisible(true);
                  }}
                >
                  <View style={styles.optionContainer}>
                    <CustomText
                      style={[styles.modalText, { color: colors.black }]}
                    >
                      일일/주간 미션 동기화
                    </CustomText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <CustomAlert
        isVisible={resetMissionAlertVisible}
        setIsVisibleFalse={() => setResetMissionAlertVisible(false)}
        titleText="미션 기본값"
        messageText="일일/주간 미션을 기본값으로 되돌립니다."
        onSubmit={resetMissions}
      />
      <CustomAlert
        isVisible={resetAccountMissionAlertVisible}
        setIsVisibleFalse={() => setResetAccountMissionAlertVisible(false)}
        titleText="원정대 미션 기본값"
        messageText="원정대 미션을 기본값으로 되돌립니다."
        onSubmit={resetAccountMissions}
      />
      <CustomAlert
        isVisible={syncMissionAlertVisible}
        setIsVisibleFalse={() => setSyncMissionAlertVisible(false)}
        titleText="일일/주간 미션 동기화"
        messageText="현재 캐릭터에 설정된 일일/주간 미션을 모든 캐릭터에 적용합니다."
        onSubmit={syncMission}
      />
      <CustomAlert
        isVisible={resetRaidAlertVisible}
        setIsVisibleFalse={() => setResetRaidAlertVisible(false)}
        titleText="레이드 기본값"
        messageText="현재 레벨 기준으로 권장 레이드가 적용됩니다."
        onSubmit={resetRaid}
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
