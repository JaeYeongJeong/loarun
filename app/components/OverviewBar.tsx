import SettingModal from '@/app/SettingModal';
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';

function OverviewBar() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const { characters } = useCharacter();
  const { colors } = useTheme();

  const totalGold = characters.reduce(
    (acc, c) =>
      acc + (c.ClearedRaidTotalGold || 0) + (c.WeeklyActivityTotalGold || 0),
    0
  );

  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.blockContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.leftBlock}>
          <Text style={[styles.label, { color: colors.black }]}>이번 주</Text>
          <Text style={[styles.label, { color: colors.black }]}>
            나의 로아런
          </Text>
          <Text
            style={[
              styles.goldText,
              totalGold >= 0
                ? { color: colors.primary }
                : { color: colors.warning },
            ]}
          >
            {totalGold.toLocaleString()}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.blockContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.rightBlock}>
          <Pressable onPress={toggleModal} style={styles.iconButton}>
            <Feather name="settings" size={24} color={colors.black} />
          </Pressable>
        </View>
      </View>

      <SettingModal isVisible={modalVisible} toggleModal={toggleModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  blockContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'grey',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    aspectRatio: 1, // 정사각형 비율
  },
  leftBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  rightBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    paddingBottom: 8,
    paddingLeft: 8,
  },
  goldText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 12,
    paddingRight: 8,
    textAlign: 'right',
  },
  iconButton: {
    padding: 6,
  },
});

export default OverviewBar;
