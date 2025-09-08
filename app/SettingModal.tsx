import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import CustomText from './CustomTextComponents/CustomText';

type SettingModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  positionX: number;
  positionY: number;
};

const SettingModal: React.FC<SettingModalProps> = ({
  isVisible,
  toggleModal,
  positionX,
  positionY,
}) => {
  const router = useRouter();
  const { colors, theme, changeTheme } = useTheme();

  const handleAddCharacter = () => {
    toggleModal();
    router.push('/AddCharacterScreen');
  };

  const handleCloseModal = () => {
    toggleModal();
  };

  const handleAppInfo = () => {
    toggleModal();
    router.push('/AppInfoScreen');
  };

  const handleChangeTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
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
              {/* ✅ 모달 닫고 페이지 이동 */}
              <TouchableOpacity onPress={handleAddCharacter}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    다른 캐릭터 추가
                  </CustomText>
                  <Feather
                    name="user-plus"
                    size={18}
                    color={colors.iconColor}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangeTheme}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    테마 변경
                  </CustomText>
                  <Feather
                    name={theme === 'light' ? 'moon' : 'sun'}
                    size={20}
                    color={colors.iconColor}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAppInfo}>
                <View style={styles.optionContainer}>
                  <CustomText
                    style={[styles.modalText, { color: colors.black }]}
                  >
                    앱 정보
                  </CustomText>
                  <Feather name="info" size={20} color={colors.iconColor} />
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

export default SettingModal;
