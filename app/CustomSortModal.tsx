import { useTheme } from '@/context/ThemeContext';
import { Character, useCharacter } from '@/context/CharacterContext';
import { useAppSetting } from '@/context/AppSettingContext';
import { normalize } from '@/utils/nomalize';
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomText from '../components/customTextComponents/CustomText';
import CharacterBar from './components/CharacterBar';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_ROW_HEIGHT = CHARACTER_BAR_HEIGHT + normalize(6);

type CustomSortModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
};

const moveItem = <T,>(list: T[], fromIndex: number, toIndex: number) => {
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const CustomSortModal: React.FC<CustomSortModalProps> = ({
  isVisible,
  toggleModal,
}) => {
  const { colors } = useTheme();
  const { characters, sortCharacter } = useCharacter();
  const { updateCharacterSortOrder } = useAppSetting();
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragStartIndex = useRef(0);

  useEffect(() => {
    if (isVisible) {
      setOrderedIds(characters.map((character) => character.id));
      setDraggingId(null);
      dragY.setValue(0);
    }
  }, [characters, dragY, isVisible]);

  const characterMap = useMemo(() => {
    return characters.reduce<Record<string, Character>>((acc, character) => {
      acc[character.id] = character;
      return acc;
    }, {});
  }, [characters]);

  const orderedCharacters = orderedIds
    .map((id) => characterMap[id])
    .filter((character): character is Character => Boolean(character));

  const finishDrag = useCallback((_: unknown, gestureState: { dy: number }) => {
    if (!draggingId) return;

    const fromIndex = dragStartIndex.current;
    const targetIndex = clamp(
      fromIndex + Math.round(gestureState.dy / CHARACTER_ROW_HEIGHT),
      0,
      orderedIds.length - 1
    );

    if (fromIndex !== targetIndex) {
      setOrderedIds((prev) => moveItem(prev, fromIndex, targetIndex));
    }

    setDraggingId(null);
    dragY.setValue(0);
  }, [dragY, draggingId, orderedIds.length]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: () => draggingId !== null,
        onPanResponderMove: Animated.event([null, { dy: dragY }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: finishDrag,
        onPanResponderTerminate: finishDrag,
      }),
    [dragY, draggingId, finishDrag]
  );

  const startDrag = (id: string, index: number) => {
    dragStartIndex.current = index;
    setDraggingId(id);
    dragY.setValue(0);
  };

  const handleConfirm = async () => {
    await sortCharacter('custom', orderedCharacters);
    await updateCharacterSortOrder('custom', false);
    toggleModal();
  };

  const handleCancel = () => {
    setDraggingId(null);
    dragY.setValue(0);
    toggleModal();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          <View style={styles.headerContainer}>
            <View>
              <CustomText style={[styles.titleText, { color: colors.black }]}>
                커스텀 정렬
              </CustomText>
              <CustomText
                style={[styles.descriptionText, { color: colors.grayDark }]}
              >
                캐릭터를 꾹 누른 뒤 위아래로 이동하세요.
              </CustomText>
            </View>
            <TouchableOpacity onPress={handleCancel}>
              <Feather name="x" size={24} color={colors.iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={!draggingId}
            showsVerticalScrollIndicator={false}
          >
            {orderedIds.map((id, index) => {
              const isDragging = draggingId === id;
              return (
                <Animated.View
                  key={id}
                  {...panResponder.panHandlers}
                  style={[
                    isDragging && styles.draggingContainer,
                    isDragging && {
                      transform: [{ translateY: dragY }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    delayLongPress={250}
                    onLongPress={() => startDrag(id, index)}
                  >
                    <CharacterBar id={id} disabled />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleCancel}>
              <View
                style={[
                  styles.secondaryButton,
                  { borderColor: colors.grayLight },
                ]}
              >
                <CustomText
                  style={[styles.secondaryButtonText, { color: colors.grayDark }]}
                >
                  취소
                </CustomText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <View
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <CustomText style={styles.primaryButtonText}>확인</CustomText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: normalize(12),
  },
  modalContainer: {
    maxHeight: '86%',
    borderRadius: 20,
    paddingVertical: normalize(18),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(12),
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 13,
    marginTop: normalize(4),
  },
  listContainer: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  listContentContainer: {
    paddingTop: normalize(4),
    paddingBottom: normalize(8),
  },
  draggingContainer: {
    opacity: 0.92,
    zIndex: 10,
    elevation: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: normalize(8),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(12),
  },
  secondaryButton: {
    minWidth: normalize(76),
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: normalize(10),
  },
  primaryButton: {
    minWidth: normalize(76),
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: normalize(10),
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CustomSortModal;
