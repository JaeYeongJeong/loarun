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
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      <View>
        <Pressable onPress={toggleModal} style={styles.iconButton}>
          <Feather name="settings" size={20} color={colors.black} />
        </Pressable>
      </View>
      <View>
        <View style={styles.leftBlock}>
          <Text style={[styles.label, { color: colors.black }]}>이번주</Text>
          <Text style={[styles.label, { color: colors.black }]}>
            나의 로아러닝
          </Text>
        </View>
        <View style={styles.rightBlock}>
          <Text style={[styles.goldText, { color: colors.primary }]}>
            {totalGold.toLocaleString()}
          </Text>
        </View>
      </View>

      <SettingModal isVisible={modalVisible} toggleModal={toggleModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    marginHorizontal: 8,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftBlock: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  iconButton: {
    padding: 6,
  },
});

export default OverviewBar;
