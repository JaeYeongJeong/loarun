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
  type PanResponderGestureState,
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
const AUTO_SCROLL_EDGE_SIZE = normalize(72);
const AUTO_SCROLL_MAX_STEP = normalize(18);

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
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const dragStartIndex = useRef(0);
  const dragStartScrollY = useRef(0);
  const scrollY = useRef(0);
  const listTopY = useRef(0);
  const listHeight = useRef(0);
  const contentHeight = useRef(0);
  const lastGesture = useRef<{ dy: number; moveY: number } | null>(null);
  const autoScrollFrame = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      setOrderedIds(characters.map((character) => character.id));
      setDraggingId(null);
      setDragOffsetY(0);
      dragY.setValue(0);
      lastGesture.current = null;
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

  const getDragDistance = useCallback(
    (dy: number) => dy + scrollY.current - dragStartScrollY.current,
    []
  );

  const getDragTargetIndex = useCallback(
    (dy: number) =>
      clamp(
        dragStartIndex.current +
          Math.round(getDragDistance(dy) / CHARACTER_ROW_HEIGHT),
        0,
        orderedIds.length - 1
      ),
    [getDragDistance, orderedIds.length]
  );

  const getDisplacedTranslateY = (index: number) => {
    if (!draggingId) return 0;

    const fromIndex = dragStartIndex.current;
    const targetIndex = getDragTargetIndex(dragOffsetY);

    if (index === fromIndex || fromIndex === targetIndex) return 0;
    if (fromIndex < targetIndex && index > fromIndex && index <= targetIndex) {
      return -CHARACTER_ROW_HEIGHT;
    }
    if (fromIndex > targetIndex && index >= targetIndex && index < fromIndex) {
      return CHARACTER_ROW_HEIGHT;
    }

    return 0;
  };

  const stopAutoScroll = useCallback(() => {
    if (autoScrollFrame.current !== null) {
      cancelAnimationFrame(autoScrollFrame.current);
      autoScrollFrame.current = null;
    }
  }, []);

  const updateDragPosition = useCallback(
    (dy: number) => {
      setDragOffsetY(dy);
      dragY.setValue(getDragDistance(dy));
    },
    [dragY, getDragDistance]
  );

  const runAutoScroll = useCallback(() => {
    const gesture = lastGesture.current;
    if (!gesture || listHeight.current <= 0) {
      autoScrollFrame.current = null;
      return;
    }

    const relativeY = gesture.moveY - listTopY.current;
    let direction = 0;
    let distanceFromEdge = 0;

    if (relativeY < AUTO_SCROLL_EDGE_SIZE) {
      direction = -1;
      distanceFromEdge = AUTO_SCROLL_EDGE_SIZE - relativeY;
    } else if (relativeY > listHeight.current - AUTO_SCROLL_EDGE_SIZE) {
      direction = 1;
      distanceFromEdge = relativeY - (listHeight.current - AUTO_SCROLL_EDGE_SIZE);
    }

    const maxScrollY = Math.max(0, contentHeight.current - listHeight.current);
    const canScrollUp = direction < 0 && scrollY.current > 0;
    const canScrollDown = direction > 0 && scrollY.current < maxScrollY;

    if (direction !== 0 && (canScrollUp || canScrollDown)) {
      const speedRatio = clamp(distanceFromEdge / AUTO_SCROLL_EDGE_SIZE, 0, 1);
      const nextScrollY = clamp(
        scrollY.current + direction * AUTO_SCROLL_MAX_STEP * speedRatio,
        0,
        maxScrollY
      );

      if (nextScrollY !== scrollY.current) {
        scrollY.current = nextScrollY;
        scrollViewRef.current?.scrollTo({ y: nextScrollY, animated: false });
        updateDragPosition(gesture.dy);
      }

      autoScrollFrame.current = requestAnimationFrame(runAutoScroll);
    } else {
      autoScrollFrame.current = null;
    }
  }, [updateDragPosition]);

  const scheduleAutoScroll = useCallback(
    (gestureState: PanResponderGestureState) => {
      lastGesture.current = {
        dy: gestureState.dy,
        moveY: gestureState.moveY,
      };

      if (autoScrollFrame.current === null) {
        autoScrollFrame.current = requestAnimationFrame(runAutoScroll);
      }
    },
    [runAutoScroll]
  );

  const finishDrag = useCallback((_: unknown, gestureState: { dy: number }) => {
    if (!draggingId) return;

    stopAutoScroll();
    lastGesture.current = null;

    const fromIndex = dragStartIndex.current;
    const targetIndex = getDragTargetIndex(gestureState.dy);

    if (fromIndex !== targetIndex) {
      setOrderedIds((prev) => moveItem(prev, fromIndex, targetIndex));
    }

    setDraggingId(null);
    setDragOffsetY(0);
    dragY.setValue(0);
  }, [dragY, draggingId, getDragTargetIndex, stopAutoScroll]);

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => draggingId !== null,
        onStartShouldSetPanResponderCapture: () => draggingId !== null,
        onMoveShouldSetPanResponder: () => draggingId !== null,
        onMoveShouldSetPanResponderCapture: () => draggingId !== null,
        onPanResponderMove: (_, gestureState) => {
          updateDragPosition(gestureState.dy);
          scheduleAutoScroll(gestureState);
        },
        onPanResponderRelease: finishDrag,
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: finishDrag,
        onShouldBlockNativeResponder: () => true,
      }),
    [draggingId, finishDrag, scheduleAutoScroll, updateDragPosition]
  );

  const startDrag = (id: string, index: number) => {
    scrollViewRef.current?.measureInWindow((_, y, __, height) => {
      listTopY.current = y;
      listHeight.current = height;
    });
    dragStartIndex.current = index;
    dragStartScrollY.current = scrollY.current;
    setDraggingId(id);
    setDragOffsetY(0);
    dragY.setValue(0);
  };

  const handleConfirm = async () => {
    await sortCharacter('custom', orderedCharacters);
    await updateCharacterSortOrder('custom', false);
    toggleModal();
  };

  const handleCancel = () => {
    stopAutoScroll();
    lastGesture.current = null;
    setDraggingId(null);
    setDragOffsetY(0);
    dragY.setValue(0);
    toggleModal();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.modalBackground,
              borderColor: colors.grayDark + '55',
            },
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
            ref={scrollViewRef}
            style={styles.listContainer}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={!draggingId}
            disableScrollViewPanResponder={Boolean(draggingId)}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(_, height) => {
              contentHeight.current = height;
            }}
            onLayout={(event) => {
              listHeight.current = event.nativeEvent.layout.height;
            }}
            onScroll={(event) => {
              scrollY.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            {orderedIds.map((id, index) => {
              const isDragging = draggingId === id;
              return (
                <Animated.View
                  key={id}
                  {...panResponder.panHandlers}
                  style={[
                    isDragging && styles.draggingContainer,
                    !isDragging && {
                      transform: [{ translateY: getDisplacedTranslateY(index) }],
                    },
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: normalize(12),
  },
  modalContainer: {
    maxHeight: '86%',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: normalize(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 14,
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
