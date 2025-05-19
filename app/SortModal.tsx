import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Modal,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';

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
                  marginTop: positionY,
                  marginLeft: 12,
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
    alignItems: 'flex-start',
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
