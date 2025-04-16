import SettingModal from '@/app/SettingModal';
import React from 'react';
import { Button, StyleSheet, Text, View, Image } from 'react-native';

function OverviewBar() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const totalGold = 460000;

  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>이번주 로아런</Text>
      <Text style={styles.text}>{totalGold}G</Text>
      <Button title="btn" onPress={() => setModalVisible(true)} />
      {/* ✅ modalVisible을 props로 넘겨서 SettingModal에서 관리 가능하도록 개선 */}
      <SettingModal isVisible={modalVisible} toggleModal={toggleModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default OverviewBar;
