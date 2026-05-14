import SettingModal from '@/app/SettingModal';
import React, { useRef, useState } from 'react';
import { StyleSheet, View, Pressable, TouchableOpacity } from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { normalize } from '@/utils/nomalize';
import CustomText from '../../components/customTextComponents/CustomText';

function OverviewBar() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const { characters } = useCharacter();
  const { colors } = useTheme();
  const settingButtonRef = useRef<View>(null);
  const [settingButtonX, setSettingButtonX] = useState(0);
  const [settingButtonY, setSettingButtonY] = useState(0);
  const [toggleLeftBlock, setToggleLeftBlock] = useState(true);
  const [toggleRightBlock, setToggleRightBlock] = useState(true);

  const {
    totalGold,
    totalRaidsGold,
    totalClearedRaidsGold,
    totalWeeklyActivityGold,
    dailyMissionCount,
    clearedDailyMissionCount,
    weeklyMissionCount,
    clearedWeeklyMissionCount,
    accountMissionCount,
    clearedAccountMissionCount,
    lastweekClearedRaidTotalGold,
    lastweekOtherActivityTotalCold,
  } = characters.reduce(
    (acc, character) => {
      // 📌 클리어한 레이드와 선택한 레이드 총 골드 계산
      const updatedRaids = [...(character.SelectedRaids || [])];
      let updatedClearedRaidTotalGold = 0;
      let updatedSelectedRaidTotalGold = 0;

      for (const raid of updatedRaids) {
        let stageSum = 0;
        let selectedGold = 0;
        let selectedChestCost = 0;

        for (const stage of raid.stages) {
          if (raid.goldChecked) selectedGold += stage.gold;
          if (raid.chestCostChecked && stage.selectedChestCost) {
            selectedChestCost += stage.chestCost || 0;
          }

          if (stage.cleared) {
            stageSum +=
              (raid.goldChecked ? stage.gold : 0) -
              (stage.selectedChestCost ? stage.chestCost || 0 : 0);
          }
        }

        const additionalGold = Number(
          raid.additionalGold?.replace(/,/g, '') || 0
        );

        updatedClearedRaidTotalGold +=
          stageSum + (raid.cleared ? additionalGold : 0);

        updatedSelectedRaidTotalGold +=
          selectedGold - selectedChestCost + additionalGold;
      }

      const clearedRaidTotalGold = updatedClearedRaidTotalGold;
      const selectedRaidTotalGold = updatedSelectedRaidTotalGold;
      const otherActivityTotalGold = character.OtherActivity?.reduce(
        (total, activity) => total + (activity.gold || 0),
        0
      );

      const clearedGold = clearedRaidTotalGold || 0;
      const raidsGold = selectedRaidTotalGold || 0;
      const weeklyGold = otherActivityTotalGold || 0;

      // 📌 일일, 주간, 원정대 미션 카운트
      const updatedMissions = character.MissionCheckList || [];
      const dailyMissions = updatedMissions.filter(
        (mission) => mission.resetPeriod === 'daily'
      );
      const dailyMissionCount = dailyMissions.length;
      const clearedDailyMissionCount = dailyMissions.filter(
        (mission) => mission.checked
      ).length;

      const weeklyMissions = updatedMissions.filter(
        (mission) => mission.resetPeriod === 'weekly'
      );
      const weeklyMissionCount = weeklyMissions.length;
      const clearedWeeklyMissionCount = weeklyMissions.filter(
        (mission) => mission.checked
      ).length;

      const accountMissions = character.AccountMissionCheckList || [];
      const accountMissionCount = accountMissions.length;
      const clearedAccountMissionCount = accountMissions.filter(
        (mission) => mission.checked
      ).length;

      // 📌 지난 주 획득 골드 계산
      const updatedLastweekSelectedRaid = character.LastweekSelectedRaid || [];
      const updatedLastweekOtherActivity =
        character.LastweekOtherActivity || [];

      const lastweekClearedRaidTotalGold = updatedLastweekSelectedRaid.reduce(
        (total, raid) => {
          let stageSum = 0;
          for (const stage of raid.stages) {
            if (stage.cleared) {
              stageSum +=
                (raid.goldChecked ? stage.gold : 0) -
                (stage.selectedChestCost ? stage.chestCost || 0 : 0);
            }
          }

          const additionalGold = Number(
            raid.additionalGold?.replace(/,/g, '') || 0
          );

          return total + stageSum + (raid.cleared ? additionalGold : 0);
        },
        0
      );

      const lastweekOtherActivityTotalGold =
        updatedLastweekOtherActivity.reduce(
          (total, activity) => total + (activity.gold || 0),
          0
        ) || 0;

      acc.totalGold += clearedGold + weeklyGold;
      acc.totalRaidsGold += raidsGold;
      acc.totalClearedRaidsGold += clearedGold;
      acc.totalWeeklyActivityGold += weeklyGold;
      acc.dailyMissionCount += dailyMissionCount;
      acc.clearedDailyMissionCount += clearedDailyMissionCount;
      acc.weeklyMissionCount += weeklyMissionCount;
      acc.clearedWeeklyMissionCount += clearedWeeklyMissionCount;
      // 원정대 미션 카운트는 합산하지 않음
      acc.accountMissionCount = accountMissionCount;
      acc.clearedAccountMissionCount = clearedAccountMissionCount;
      acc.lastweekClearedRaidTotalGold += lastweekClearedRaidTotalGold;
      acc.lastweekOtherActivityTotalCold += lastweekOtherActivityTotalGold;

      return acc;
    },
    {
      totalGold: 0,
      totalRaidsGold: 0,
      totalClearedRaidsGold: 0,
      totalWeeklyActivityGold: 0,
      dailyMissionCount: 0,
      clearedDailyMissionCount: 0,
      weeklyMissionCount: 0,
      clearedWeeklyMissionCount: 0,
      accountMissionCount: 0,
      clearedAccountMissionCount: 0,
      lastweekClearedRaidTotalGold: 0,
      lastweekOtherActivityTotalCold: 0,
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

  const LoarunBlock = () => {
    return (
      <View style={styles.leftLoarunBlock}>
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
    );
  };

  const LastWeekLoarunBlock = () => {
    return (
      <View style={styles.leftLoarunBlock}>
        <CustomText style={[styles.label, { color: colors.black }]}>
          지난주
        </CustomText>
        <CustomText style={[styles.label, { color: colors.black }]}>
          나의 로아런
        </CustomText>
        <CustomText
          style={[
            styles.goldText,
            {
              color: totalGold >= 0 ? colors.secondary : colors.warning,
            },
          ]}
        >
          {(
            lastweekClearedRaidTotalGold + lastweekOtherActivityTotalCold
          ).toLocaleString()}
        </CustomText>
      </View>
    );
  };

  const OverviewFirstBlock = () => {
    return (
      <View style={styles.leftOverviewBlock}>
        <View style={styles.overviewItem}>
          <CustomText
            style={[
              styles.overviewTitleText,
              {
                color: colors.black,
              },
            ]}
          >
            주간 레이드
          </CustomText>
          <CustomText
            style={[
              styles.overviewValueText,
              {
                color: colors.primary,
              },
            ]}
          >
            {totalClearedRaidsGold.toLocaleString() || '0'}{' '}
            <CustomText
              style={{
                color: colors.black,
              }}
            >
              /{totalRaidsGold.toLocaleString() || '0'}
            </CustomText>
          </CustomText>
        </View>

        {/*  중앙 가로 구분선 */}
        <View
          style={[styles.separator, { backgroundColor: colors.black + '2A' }]}
        />
        <View style={styles.overviewItem}>
          <CustomText
            style={[styles.overviewTitleText, { color: colors.black }]}
          >
            기타 활동
          </CustomText>
          <CustomText
            style={[styles.overviewValueText, { color: colors.primary }]}
          >
            {totalWeeklyActivityGold.toLocaleString() || '0'}
          </CustomText>
        </View>
      </View>
    );
  };

  const OverviewSecondBlock = () => {
    return (
      <View style={styles.leftOverviewBlock}>
        <View style={styles.overviewSecondBlockItem}>
          <CustomText
            style={[
              styles.overviewTitleText,
              {
                color: colors.black,
              },
            ]}
          >
            일일 미션
          </CustomText>
          <CustomText
            style={[
              styles.overviewValueText,
              {
                color: colors.secondary,
              },
            ]}
          >
            {clearedDailyMissionCount}{' '}
            <CustomText
              style={{
                color: colors.black,
              }}
            >
              / {dailyMissionCount}
            </CustomText>
          </CustomText>
        </View>
        {/*  중앙 가로 구분선 */}
        <View
          style={[styles.separator, { backgroundColor: colors.black + '2A' }]}
        />
        <View style={styles.overviewSecondBlockItem}>
          <CustomText
            style={[styles.overviewTitleText, { color: colors.black }]}
          >
            주간 미션
          </CustomText>
          <CustomText
            style={[
              styles.overviewValueText,
              {
                color: colors.secondary,
              },
            ]}
          >
            {clearedWeeklyMissionCount}{' '}
            <CustomText
              style={{
                color: colors.black,
              }}
            >
              / {weeklyMissionCount}
            </CustomText>
          </CustomText>
        </View>
        <View
          style={[styles.separator, { backgroundColor: colors.black + '2A' }]}
        />
        <View style={styles.overviewSecondBlockItem}>
          <CustomText
            style={[styles.overviewTitleText, { color: colors.black }]}
          >
            원정대 미션
          </CustomText>
          <CustomText
            style={[
              styles.overviewValueText,
              {
                color: colors.secondary,
              },
            ]}
          >
            {clearedAccountMissionCount}{' '}
            <CustomText
              style={{
                color: colors.black,
              }}
            >
              / {accountMissionCount}
            </CustomText>
          </CustomText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 왼쪽 블럭 */}
      <TouchableOpacity
        style={[
          styles.blockContainer,
          { backgroundColor: colors.cardBackground },
        ]}
        onPress={() => setToggleLeftBlock((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={
          toggleLeftBlock ? '요약 카드, 주간 골드 현황' : '요약 카드, 미션 현황'
        }
        accessibilityHint="탭하면 다른 요약 정보로 전환됩니다."
        accessibilityState={{ selected: !toggleLeftBlock }}
      >
        {toggleLeftBlock ? <OverviewFirstBlock /> : <OverviewSecondBlock />}
        <View style={styles.cardHintWrapper} pointerEvents="none">
          <View style={styles.indicatorRow}>
            {[true, false].map((activeState) => (
              <View
                key={String(activeState)}
                style={[
                  styles.indicatorDot,
                  {
                    backgroundColor:
                      toggleLeftBlock === activeState
                        ? colors.secondary
                        : colors.grayDark + '55',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
      {/* 오른쪽 블럭 */}
      <TouchableOpacity
        style={[
          styles.blockContainer,
          { backgroundColor: colors.cardBackground },
        ]}
        onPress={() => setToggleRightBlock((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={
          toggleRightBlock ? '로아런 카드, 이번 주 골드' : '로아런 카드, 지난주 골드'
        }
        accessibilityHint="탭하면 이번 주와 지난주 로아런 금액이 전환됩니다."
        accessibilityState={{ selected: !toggleRightBlock }}
      >
        {/* 상단 고정 설정 아이콘 */}
        <View style={styles.settingWrapper}>
          <Pressable
            ref={settingButtonRef}
            onPress={toggleModal}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="설정 열기"
          >
            <Feather name="settings" size={24} color={colors.iconColor} />
          </Pressable>
        </View>
        {toggleRightBlock ? <LoarunBlock /> : <LastWeekLoarunBlock />}
        <View style={styles.cardHintWrapper} pointerEvents="none">
          <View style={styles.indicatorRow}>
            {[true, false].map((activeState) => (
              <View
                key={String(activeState)}
                style={[
                  styles.indicatorDot,
                  {
                    backgroundColor:
                      toggleRightBlock === activeState
                        ? colors.secondary
                        : colors.grayDark + '55',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>

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
  cardHintWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: normalize(8),
    alignItems: 'center',
    gap: normalize(4),
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: normalize(4),
  },
  indicatorDot: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(3),
  },
  leftLoarunBlock: {
    flex: 1,
    justifyContent: 'center',
    padding: '7%',
  },
  leftOverviewBlock: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: '7%',
  },
  settingWrapper: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    zIndex: 1,
  },
  iconButton: { padding: normalize(3) },
  infoWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  overviewItem: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-evenly',
  },
  overviewSecondBlockItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overviewTitleText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  overviewValueText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: '3%',
  },
  goldText: {
    fontSize: 18,
    fontWeight: '600',
    paddingTop: '10%',
    textAlign: 'right',
  },
  separator: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
});

export default OverviewBar;
