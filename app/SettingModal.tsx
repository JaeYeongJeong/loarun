import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

type SettingModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
};

const SettingModal: React.FC<SettingModalProps> = ({
  isVisible,
  toggleModal,
}) => {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(0)).current;
  const { theme, changeTheme } = useTheme();
  // ✅ 모달이 열릴 때 애니메이션 실행
  useEffect(() => {
    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500, // ✅ 아래로 사라지는 애니메이션
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // ✅ 모달 닫고 페이지 이동 (약간의 딜레이 추가)
  const handleAddCharacter = () => {
    Animated.timing(translateY, {
      toValue: 500, // ✅ 아래로 사라지는 애니메이션
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      toggleModal();
      router.push('/AddCharacterScreen');
    });
  };

  const handleCloseModal = () => {
    Animated.timing(translateY, {
      toValue: 500, // ✅ 아래로 사라지는 애니메이션
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      toggleModal();
    });
  };

  const handleChangeTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };
  return (
    <Modal animationType="none" transparent={true} visible={isVisible}>
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ translateY }] }]}
          >
            <Text style={styles.modalText}>설정 페이지</Text>

            {/* ✅ 모달 닫고 페이지 이동 */}
            <Pressable onPress={handleAddCharacter}>
              <Text style={styles.modalText}>다른 캐릭터 추가</Text>
            </Pressable>
            <Pressable onPress={handleChangeTheme}>
              <Text style={styles.modalText}>테마 변경</Text>
            </Pressable>

            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingModal;
