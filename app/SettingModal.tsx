import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const handleAddCharacter = () => {
    toggleModal();
    router.push('/AddCharacterScreen');
  };

  const handleCloseModal = () => {
    toggleModal();
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
              <Pressable onPress={handleAddCharacter}>
                <Text style={[styles.modalText, { color: colors.black }]}>
                  다른 캐릭터 추가
                </Text>
              </Pressable>
              <Pressable onPress={handleChangeTheme}>
                <Text style={[styles.modalText, { color: colors.black }]}>
                  테마 변경
                </Text>
              </Pressable>
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
    gap: 8,
    minWidth: 180,
    alignItems: 'flex-end',
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SettingModal;
