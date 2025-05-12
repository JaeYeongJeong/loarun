import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SortModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
};

const SortModal: React.FC<SortModalProps> = ({ isVisible, toggleModal }) => {
  const { colors } = useTheme();
  const { sortCharacter } = useCharacter();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // ✅ 모달이 열릴 때 애니메이션 실행
  useEffect(() => {
    if (isVisible) {
      scale.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleCloseModal = () => {
    toggleModal();
  };

  const sortByDateAdded = () => {
    sortCharacter('addedAt');
  };

  const sortByLevel = () => {
    sortCharacter('level');
  };

  const sortByServer = () => {
    sortCharacter('server');
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
                  marginTop: insets.top + 60, // ✅ 상단 여백 추가
                  transform: [
                    { translateX: 90 }, // 180 / 2
                    { scale },
                    { translateX: -90 },
                  ],
                  opacity,
                },
              ]}
            >
              {/* ✅ 모달 닫고 페이지 이동 */}
              <TouchableOpacity onPress={sortByDateAdded}>
                <Text style={[styles.modalText, { color: colors.black }]}>
                  추가 순 (기본)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sortByServer}>
                <Text style={[styles.modalText, { color: colors.black }]}>
                  서버 순
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sortByLevel}>
                <Text style={[styles.modalText, { color: colors.black }]}>
                  레벨 높은 순
                </Text>
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
    gap: 8,
    minWidth: 180,
    marginRight: 16,
    alignItems: 'flex-end',
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SortModal;
