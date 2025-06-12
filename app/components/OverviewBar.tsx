import SettingModal from '@/app/SettingModal';
import React, { useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { normalize } from '@/utils/nomalize';
import CustomText from './CustomText';

const SCREEN_WIDTH = Dimensions.get('window').width;

function OverviewBar() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const { characters } = useCharacter();
  const { colors } = useTheme();
  const settingButtonRef = useRef<View>(null);
  const [settingButtonX, setSettingButtonX] = useState(0);
  const [settingButtonY, setSettingButtonY] = useState(0);

  const {
    totalGold,
    totalRaidsGold,
    totalClearedRaidsGold,
    totalWeeklyActivityGold,
  } = characters.reduce(
    (acc, c) => {
      const clearedGold = c.ClearedRaidTotalGold || 0;
      const raidsGold = c.SelectedRaidTotalGold || 0;
      const weeklyGold = c.OtherActivityTotalGold || 0;

      acc.totalGold += clearedGold + weeklyGold;
      acc.totalRaidsGold += raidsGold;
      acc.totalClearedRaidsGold += clearedGold;
      acc.totalWeeklyActivityGold += weeklyGold;

      return acc;
    },
    {
      totalGold: 0,
      totalRaidsGold: 0,
      totalClearedRaidsGold: 0,
      totalWeeklyActivityGold: 0,
    }
  );

  const toggleModal = () => {
    if (settingButtonRef.current) {
      settingButtonRef.current.measureInWindow((x, y, width, height) => {
        setSettingButtonX(x);
        setSettingButtonY(y + height); // 버튼 아래쪽 위치
        setModalVisible((prev) => !prev);
      });
    } else {
      setModalVisible((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      {/* 왼쪽 블럭 */}
      <View
        style={[
          styles.blockContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.leftBlock}>
          <CustomText style={[styles.label, { color: colors.black }]}>
            이번 주
          </CustomText>
          <CustomText style={[styles.label, { color: colors.black }]}>
            나의 로아런
          </CustomText>
          <CustomText
            style={[
              styles.goldText,
              {
                color: totalGold >= 0 ? colors.primary : colors.warning,
              },
            ]}
          >
            {totalGold.toLocaleString()}
          </CustomText>
        </View>
      </View>

      {/* 오른쪽 블럭 */}
      <View
        style={[
          styles.blockContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.rightBlock}>
          {/* 상단 고정 설정 아이콘 */}
          <View style={styles.settingWrapper}>
            <Pressable
              ref={settingButtonRef}
              onPress={toggleModal}
              style={styles.iconButton}
            >
              <Feather name="settings" size={24} color={colors.iconColor} />
            </Pressable>
          </View>

          {/* 중앙 정렬 정보 텍스트 */}
          <View style={styles.infoWrapper}>
            <View style={styles.infoItem}>
              <CustomText
                style={[
                  styles.titleText,
                  {
                    color: colors.black,
                  },
                ]}
              >
                주간 레이드
              </CustomText>
              <CustomText
                style={[
                  styles.valueText,
                  {
                    color:
                      totalClearedRaidsGold === totalRaidsGold
                        ? colors.primary
                        : colors.black,
                  },
                ]}
              >
                {totalClearedRaidsGold.toLocaleString() || '0'}{' '}
                <CustomText
                  style={{
                    color: colors.black + '80',
                    fontWeight: '400',
                  }}
                >
                  /{totalRaidsGold.toLocaleString() || '0'}
                </CustomText>
              </CustomText>
            </View>

            <View style={styles.infoItem}>
              <CustomText style={[styles.titleText, { color: colors.black }]}>
                추가 활동
              </CustomText>
              <CustomText style={[styles.valueText, { color: colors.black }]}>
                {totalWeeklyActivityGold.toLocaleString() || '0'}
              </CustomText>
            </View>
          </View>
        </View>
      </View>

      <SettingModal
        isVisible={modalVisible}
        toggleModal={toggleModal}
        positionX={settingButtonX}
        positionY={settingButtonY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    gap: normalize(12),
  },
  blockContainer: {
    flex: 1,
    borderRadius: normalize(20),
    padding: normalize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    aspectRatio: 1,
  },
  leftBlock: {
    flex: 1,
    justifyContent: 'center',
    padding: '7%',
  },
  rightBlock: {
    flex: 1,
    position: 'relative',
  },
  settingWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  iconButton: { padding: normalize(3) },
  infoWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between', // 세로축 간격 균등하게 분배
    alignItems: 'center',
    paddingHorizontal: '7%',
    paddingVertical: '10%', // 텍스트 위아래 여백도 부여
  },
  infoItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: SCREEN_WIDTH / 26,
    fontWeight: '600',
    textAlign: 'center',
  },
  valueText: {
    marginTop: normalize(2),
    fontSize: SCREEN_WIDTH / 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: SCREEN_WIDTH / 20,
    fontWeight: '600',
    paddingBottom: '3%',
  },
  goldText: {
    fontSize: SCREEN_WIDTH / 20,
    fontWeight: '600',
    paddingTop: '10%',
    textAlign: 'right',
  },
});

export default OverviewBar;
