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

type SortActivityType = 'mission' | 'accountMission' | 'otherActivity';

type ActivityCustomSortModalProps = {
  isVisible: boolean;
  sortType: SortActivityType | null;
  missionItems: { name: string; resetPeriod?: string; checked?: boolean }[];
  accountMissionItems: { name: string; resetPeriod?: string; checked?: boolean }[];
  otherActivityItems: { name: string; gold: number }[];
  onClose: () => void;
  onConfirm: (type: SortActivityType, orderedIndices: number[]) => void;
};

type SortItem = { id: string; originalIndex: number; title: string; subtitle?: string };

const ROW_HEIGHT = 56;
const moveItem = <T,>(list: T[], fromIndex: number, toIndex: number) => {
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

const ActivityCustomSortModal: React.FC<ActivityCustomSortModalProps> = ({
  isVisible,
  sortType,
  missionItems,
  accountMissionItems,
  otherActivityItems,
  onClose,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<SortItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragStartIndex = useRef(0);

  useEffect(() => {
    if (!isVisible || !sortType) return;
    const initial =
      sortType === 'mission'
        ? missionItems.map((item, i) => ({ id: `mission-${i}`, originalIndex: i, title: item.name, subtitle: item.resetPeriod === 'daily' ? '일일' : item.resetPeriod === 'weekly' ? '주간' : '' }))
        : sortType === 'accountMission'
          ? accountMissionItems.map((item, i) => ({ id: `account-${i}`, originalIndex: i, title: item.name, subtitle: item.resetPeriod === 'daily' ? '일일' : item.resetPeriod === 'weekly' ? '주간' : '' }))
          : otherActivityItems.map((item, i) => ({ id: `other-${i}`, originalIndex: i, title: item.name }));

    setItems(initial);
    setDraggingId(null);
    setDragOffsetY(0);
    dragY.setValue(0);
  }, [isVisible, sortType, missionItems, accountMissionItems, otherActivityItems, dragY]);

  const draggingIndex = useMemo(() => items.findIndex((item) => item.id === draggingId), [items, draggingId]);
  const targetIndex = useMemo(() => {
    if (draggingIndex < 0) return -1;
    return Math.min(Math.max(dragStartIndex.current + Math.round(dragOffsetY / ROW_HEIGHT), 0), items.length - 1);
  }, [dragOffsetY, draggingIndex, items.length]);

  const getDragTargetIndex = (dy: number) =>
    Math.min(Math.max(dragStartIndex.current + Math.round(dy / ROW_HEIGHT), 0), items.length - 1);

  const finishDrag = (_: unknown, gestureState: PanResponderGestureState) => {
    if (draggingIndex < 0) return;

    const nextIndex = getDragTargetIndex(gestureState.dy);

    if (draggingIndex !== nextIndex) {
      setItems((prev) => moveItem(prev, draggingIndex, nextIndex));
    }

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
        onPanResponderMove: (_, gestureState) => {
          setDragOffsetY(gestureState.dy);
          dragY.setValue(gestureState.dy);
        },
        onPanResponderRelease: finishDrag,
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: finishDrag,
        onShouldBlockNativeResponder: () => true,
      }),
    [draggingId, dragY, draggingIndex, items.length]
  );

  if (!sortType) return null;

  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.grayDark + '55' }]}>
          <CustomText style={[styles.title, { color: colors.black }]}>순서 변경</CustomText>
          <CustomText style={[styles.helpText, { color: colors.grayDark }]}>항목을 길게 눌러 드래그해 순서를 변경하세요.</CustomText>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} scrollEnabled={!draggingId} disableScrollViewPanResponder={Boolean(draggingId)}>
            <View>
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
                      { backgroundColor: colors.grayLight, transform: [{ translateY: isDragging ? dragY : displaced }] },
                      isDragging ? styles.dragging : null,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.rowContent}
                      activeOpacity={0.9}
                      onLongPress={() => {
                        dragStartIndex.current = index;
                        setDraggingId(item.id);
                        setDragOffsetY(0);
                        dragY.setValue(0);
                      }}
                      delayLongPress={250}
                    >
                      {item.subtitle ? (
                        <CustomText style={[styles.subtitle, { color: colors.secondary }]}>{item.subtitle}</CustomText>
                      ) : null}
                      <CustomText numberOfLines={1} style={[styles.itemText, { color: colors.black }]}>
                        {item.title}
                      </CustomText>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.grayLight }]} onPress={onClose}>
              <CustomText style={{ color: colors.black }}>취소</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => {
                onConfirm(sortType, items.map((item) => item.originalIndex));
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
  list: { maxHeight: 420 },
  listContent: { paddingBottom: 4 },
  row: { height: ROW_HEIGHT, borderRadius: 12, marginBottom: 8, justifyContent: 'center', paddingHorizontal: 12 },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dragging: { elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  subtitle: { fontSize: 13, fontWeight: '700' },
  itemText: { flex: 1, fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 6 },
  button: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
});

export default ActivityCustomSortModal;
