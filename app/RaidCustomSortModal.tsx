import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
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
    stages: { stage: number; difficulty: string; cleared?: boolean }[];
  }[];
  onClose: () => void;
  onConfirm: (orderedIndices: number[]) => void;
};

type SortRaidItem = { id: string; originalIndex: number; name: string; stages: RaidCustomSortModalProps['raidItems'][number]['stages'] };
const ROW_HEIGHT = 90;
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
  useEffect(() => {
    if (!isVisible) return;
    setItems(raidItems.map((raid, i) => ({ id: `raid-${i}`, originalIndex: i, name: raid.name || `레이드 ${i + 1}`, stages: raid.stages || [] })));
    setDraggingId(null);
    setDragOffsetY(0);
    dragY.setValue(0);
  }, [isVisible, raidItems, dragY]);
  const draggingIndex = useMemo(() => items.findIndex((item) => item.id === draggingId), [items, draggingId]);
  const targetIndex = useMemo(() => draggingIndex < 0 ? -1 : Math.min(Math.max(dragStartIndex.current + Math.round(dragOffsetY / ROW_HEIGHT), 0), items.length - 1), [dragOffsetY, draggingIndex, items.length]);
  const finishDrag = (_: unknown, gestureState: PanResponderGestureState) => {
    if (draggingIndex < 0) return;
    const nextIndex = Math.min(Math.max(dragStartIndex.current + Math.round(gestureState.dy / ROW_HEIGHT), 0), items.length - 1);
    if (draggingIndex !== nextIndex) setItems((prev) => moveItem(prev, draggingIndex, nextIndex));
    setDraggingId(null); setDragOffsetY(0); dragY.setValue(0);
  };
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => draggingId !== null,
    onStartShouldSetPanResponderCapture: () => draggingId !== null,
    onMoveShouldSetPanResponder: () => draggingId !== null,
    onMoveShouldSetPanResponderCapture: () => draggingId !== null,
    onPanResponderMove: (_, g) => { setDragOffsetY(g.dy); dragY.setValue(g.dy); },
    onPanResponderRelease: finishDrag,
    onPanResponderTerminate: finishDrag,
    onPanResponderTerminationRequest: () => false,
  }), [draggingId, draggingIndex, items.length]);
  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.grayDark + '55' }]}>
          <CustomText style={[styles.title, { color: colors.black }]}>레이드 순서 변경</CustomText>
          <ScrollView style={{ maxHeight: 460 }} scrollEnabled={!draggingId} disableScrollViewPanResponder={Boolean(draggingId)}>
            {items.map((item, index) => {
              const isDragging = item.id === draggingId;
              const displaced = draggingId && draggingIndex !== -1 && targetIndex !== -1 && index !== draggingIndex
                ? draggingIndex < targetIndex && index > draggingIndex && index <= targetIndex ? -ROW_HEIGHT : draggingIndex > targetIndex && index >= targetIndex && index < draggingIndex ? ROW_HEIGHT : 0 : 0;
              return (
                <Animated.View key={item.id} {...panResponder.panHandlers} style={[styles.row, { transform: [{ translateY: isDragging ? dragY : displaced }] }, isDragging && styles.dragging]}>
                  <TouchableOpacity style={[styles.dragHeader, { backgroundColor: colors.grayLight }]} onLongPress={() => { dragStartIndex.current = index; setDraggingId(item.id); }} delayLongPress={250}>
                    <Feather name="move" size={16} color={colors.grayDark} />
                    <CustomText style={[styles.raidName, { color: colors.black }]}>{item.name}</CustomText>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.grayLight }]} onPress={onClose}><CustomText style={{ color: colors.black }}>취소</CustomText></TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => { onConfirm(items.map((item) => item.originalIndex)); onClose(); }}><CustomText style={{ color: colors.white }}>적용</CustomText></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.24)', justifyContent: 'center', padding: 16 },
  container: { borderRadius: 14, borderWidth: 1, padding: 14 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  row: { marginBottom: 8 },
  dragHeader: { height: ROW_HEIGHT - 8, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  raidName: { fontSize: 16, fontWeight: '700' },
  dragging: { elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 6 },
  button: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
});

export default RaidCustomSortModal;
