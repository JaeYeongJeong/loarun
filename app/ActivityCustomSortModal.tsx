import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import CustomText from '../components/customTextComponents/CustomText';

type ActivityCustomSortModalProps = {
  isVisible: boolean;
  title: string;
  items: string[];
  onClose: () => void;
  onConfirm: (orderedIndices: number[]) => void;
};

type IndexedItem = { label: string; originalIndex: number };

const moveItem = (list: IndexedItem[], from: number, to: number) => {
  const next = [...list];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
};

const ActivityCustomSortModal: React.FC<ActivityCustomSortModalProps> = ({
  isVisible,
  title,
  items,
  onClose,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const [orderedItems, setOrderedItems] = useState<IndexedItem[]>([]);

  useEffect(() => {
    if (!isVisible) return;
    setOrderedItems(items.map((label, originalIndex) => ({ label, originalIndex })));
  }, [isVisible, items]);

  return (
    <Modal animationType="fade" transparent visible={isVisible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.grayDark + '55' }]}>
          <CustomText style={[styles.title, { color: colors.black }]}>{title}</CustomText>
          {orderedItems.map((item, index) => (
            <View key={`${item.label}-${item.originalIndex}`} style={[styles.row, { backgroundColor: colors.grayLight }]}>
              <CustomText style={[styles.label, { color: colors.black }]} numberOfLines={1}>{item.label}</CustomText>
              <View style={styles.buttons}>
                <TouchableOpacity disabled={index === 0} onPress={() => setOrderedItems((prev) => moveItem(prev, index, index - 1))}>
                  <Feather name="chevron-up" size={20} color={index === 0 ? colors.grayDark : colors.black} />
                </TouchableOpacity>
                <TouchableOpacity disabled={index === orderedItems.length - 1} onPress={() => setOrderedItems((prev) => moveItem(prev, index, index + 1))}>
                  <Feather name="chevron-down" size={20} color={index === orderedItems.length - 1 ? colors.grayDark : colors.black} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.grayLight }]} onPress={onClose}>
              <CustomText style={{ color: colors.black }}>취소</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                onConfirm(orderedItems.map((item) => item.originalIndex));
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  container: { borderRadius: 14, borderWidth: 1, padding: 16, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1, fontSize: 15 },
  buttons: { flexDirection: 'row', gap: 10 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  actionButton: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
});

export default ActivityCustomSortModal;
