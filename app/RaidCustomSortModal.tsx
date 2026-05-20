import { useTheme } from '@/context/ThemeContext';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type PanResponderGestureState,
} from 'react-native';
import CustomText from '../components/customTextComponents/CustomText';

type RaidCustomSortModalProps = {
  isVisible: boolean;
  raidItems: {
    name: string;
    stages: { stage: number; difficulty: string; cleared?: boolean; lastClearedStage?: number }[];
  }[];
  onClose: () => void;
  onConfirm: (orderedIndices: number[]) => void;
};

type SortRaidItem = {
  id: string;
  originalIndex: number;
  name: string;
  stages: RaidCustomSortModalProps['raidItems'][number]['stages'];
};

const ROW_HEIGHT = 96;
const AUTO_SCROLL_EDGE_SIZE = 72;
const AUTO_SCROLL_MAX_STEP = 18;

const moveItem = <T,>(list: T[], fromIndex: number, toIndex: number) => {
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

const RaidCustomSortModal: React.FC<RaidCustomSortModalProps> = ({ isVisible, raidItems, onClose, onConfirm }) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<SortRaidItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragStartIndex = useRef(0);
  const dragStartScrollY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const listTopY = useRef(0);
  const listHeight = useRef(0);
  const contentHeight = useRef(0);
  const lastGesture = useRef<{ dy: number; moveY: number } | null>(null);
  const autoScrollFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    setItems(
      raidItems.map((raid, i) => ({
        id: `raid-${i}`,
        originalIndex: i,
        name: raid.name || `레이드 ${i + 1}`,
        stages: raid.stages || [],
      }))
    );
    setDraggingId(null);
    setDragOffsetY(0);
    dragY.setValue(0);
  }, [isVisible, raidItems, dragY]);

  const draggingIndex = useMemo(() => items.findIndex((item) => item.id === draggingId), [items, draggingId]);
  const targetIndex = useMemo(() => {
    if (draggingIndex < 0) return -1;
    return Math.min(
      Math.max(dragStartIndex.current + Math.round((dragOffsetY + scrollY.current - dragStartScrollY.current) / ROW_HEIGHT), 0),
      items.length - 1
    );
  }, [dragOffsetY, draggingIndex, items.length]);

  const getDragTargetIndex = (dy: number) =>
    Math.min(
      Math.max(dragStartIndex.current + Math.round((dy + scrollY.current - dragStartScrollY.current) / ROW_HEIGHT), 0),
      items.length - 1
    );

  const stopAutoScroll = () => {
    if (autoScrollFrame.current !== null) {
      cancelAnimationFrame(autoScrollFrame.current);
      autoScrollFrame.current = null;
    }
  };

  const runAutoScroll = () => {
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
      const speedRatio = Math.min(Math.max(distanceFromEdge / AUTO_SCROLL_EDGE_SIZE, 0), 1);
      const nextScrollY = Math.min(
        Math.max(scrollY.current + direction * AUTO_SCROLL_MAX_STEP * speedRatio, 0),
        maxScrollY
      );

      if (nextScrollY !== scrollY.current) {
        scrollY.current = nextScrollY;
        scrollViewRef.current?.scrollTo({ y: nextScrollY, animated: false });
      }

      setDragOffsetY(gesture.dy);
      dragY.setValue(gesture.dy + scrollY.current - dragStartScrollY.current);
      autoScrollFrame.current = requestAnimationFrame(runAutoScroll);
    } else {
      autoScrollFrame.current = null;
    }
  };

  const scheduleAutoScroll = (gestureState: PanResponderGestureState) => {
    lastGesture.current = { dy: gestureState.dy, moveY: gestureState.moveY };
    if (autoScrollFrame.current === null) {
      autoScrollFrame.current = requestAnimationFrame(runAutoScroll);
    }
  };

  const finishDrag = (_: unknown, gestureState: PanResponderGestureState) => {
    if (draggingIndex < 0) return;
    const nextIndex = getDragTargetIndex(gestureState.dy);

    if (draggingIndex !== nextIndex) {
      setItems((prev) => moveItem(prev, draggingIndex, nextIndex));
    }

    stopAutoScroll();
    lastGesture.current = null;
    setDraggingId(null);
    setDragOffsetY(0);
    dragY.setValue(0);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => draggingId !== null,
        onStartShouldSetPanResponderCapture: () => draggingId !== null,
        onMoveShouldSetPanResponder: () => draggingId !== null,
        onMoveShouldSetPanResponderCapture: () => draggingId !== null,
        onPanResponderMove: (_, g) => {
          setDragOffsetY(g.dy);
          dragY.setValue(g.dy + scrollY.current - dragStartScrollY.current);
          scheduleAutoScroll(g);
        },
        onPanResponderRelease: finishDrag,
        onPanResponderTerminate: finishDrag,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [draggingId, draggingIndex, items.length, dragY]
  );

  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.modalBackground, borderColor: colors.grayDark + '44' }]}>
          <CustomText style={[styles.title, { color: colors.black }]}>레이드 순서 변경</CustomText>
          <CustomText style={[styles.helpText, { color: colors.grayDark }]}>항목을 길게 눌러 드래그해 순서를 변경하세요.</CustomText>

          <ScrollView
            ref={scrollViewRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            scrollEnabled={!draggingId}
            disableScrollViewPanResponder={Boolean(draggingId)}
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
            {items.map((item, index) => {
              const isDragging = item.id === draggingId;
              const displaced =
                draggingId && draggingIndex !== -1 && targetIndex !== -1 && index !== draggingIndex
                  ? draggingIndex < targetIndex && index > draggingIndex && index <= targetIndex
                    ? -ROW_HEIGHT
                    : draggingIndex > targetIndex && index >= targetIndex && index < draggingIndex
                      ? ROW_HEIGHT
                      : 0
                  : 0;

              return (
                <Animated.View
                  key={item.id}
                  {...panResponder.panHandlers}
                  style={[
                    styles.row,
                    {
                      backgroundColor: colors.cardBackground,
                      borderRadius: 14,
                      transform: [{ translateY: isDragging ? dragY : displaced }],
                    },
                    isDragging ? styles.dragging : null,
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    delayLongPress={250}
                    onLongPress={() => {
                      scrollViewRef.current?.measureInWindow((_, y, __, height) => {
                        listTopY.current = y;
                        listHeight.current = height;
                      });
                      dragStartIndex.current = index;
                      dragStartScrollY.current = scrollY.current;
                      setDraggingId(item.id);
                      setDragOffsetY(0);
                      dragY.setValue(0);
                    }}
                  >
                    <CustomText style={[styles.raidName, { color: colors.black }]}>{item.name}</CustomText>
                    <View style={[styles.stageRow, { backgroundColor: colors.grayLight }]}>
                      {item.stages.map((stage, stageIndex) => (
                        <View
                          key={`${item.id}-${stageIndex}`}
                          style={[
                            styles.stageItem,
                            stage.cleared ? { backgroundColor: colors.primary } : {},
                            stageIndex === 0 ? styles.firstStage : null,
                            stage.lastClearedStage === stageIndex ? styles.lastStage : null,
                          ]}
                        >
                          <CustomText
                            style={[
                              styles.difficultyText,
                              stage.cleared ? { color: colors.white } : { color: colors.black },
                              !stage.cleared && stage.difficulty === '노말' ? { color: colors.info } : null,
                              !stage.cleared && stage.difficulty === '하드' ? { color: colors.danger } : null,
                              !stage.cleared &&
                              (stage.difficulty === '익스트림 노말' ||
                                stage.difficulty === '익스트림 하드' ||
                                stage.difficulty === '나이트메어')
                                ? { color: colors.extreme }
                                : null,
                            ]}
                          >
                            {stage.difficulty}
                          </CustomText>
                          <CustomText style={[styles.stageText, stage.cleared ? { color: colors.white } : { color: colors.black }]}>
                            {stage.stage} 관문
                          </CustomText>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.grayLight }]} onPress={onClose}>
              <CustomText style={{ color: colors.black }}>취소</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                onConfirm(items.map((item) => item.originalIndex));
                onClose();
              }}
            >
              <CustomText style={{ color: colors.white }}>적용</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'center', padding: 16 },
  container: { borderRadius: 16, borderWidth: 1, padding: 14 },
  title: { fontSize: 18, fontWeight: '700' },
  helpText: { marginTop: 4, marginBottom: 10, fontSize: 13 },
  list: { maxHeight: 460 },
  listContent: { paddingBottom: 4 },
  row: { borderRadius: 12, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 10 },
  raidName: { fontSize: 14, fontWeight: '600', marginBottom: 8, paddingHorizontal: 2 },
  stageRow: { flexDirection: 'row', borderRadius: 12 },
  stageItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  firstStage: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  lastStage: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  difficultyText: { fontSize: 11, fontWeight: '600' },
  stageText: { fontSize: 11, fontWeight: '600' },
  dragging: { opacity: 0.86, zIndex: 999 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  button: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
});

export default RaidCustomSortModal;
