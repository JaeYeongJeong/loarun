import { useCharacter } from '@/context/CharacterContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { normalize } from '@/utils/nomalize';
import { Feather } from '@expo/vector-icons';
import CustomText from '../../components/customTextComponents/CustomText';
import { useAppSetting } from '@/context/AppSettingContext';
import { getPortraitImage } from '@/utils/PortraitImage';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_BAR_BORDER_RADIUS = 20; // 바의 모서리 반경
type CharacterBarProps = {
  id: string;
  disabled?: boolean;
};

const CharacterBar: React.FC<CharacterBarProps> = ({ id, disabled = false }) => {
  const router = useRouter();
  const { characters } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const [portraitUri, setPortraitUri] = useState<string | null>(null);
  const { colors } = useTheme(); // 테마 색상 가져오기
  const { isInfoVisible } = useAppSetting();

  // 📌 캐릭터 이미지 로드
  useEffect(() => {
    if (!character) return;

    const loadImage = async () => {
      const portraitUri = await getPortraitImage(character.id);
      if (portraitUri) {
        setPortraitUri(portraitUri);
      } else {
        setPortraitUri(null);
      }
    };
    loadImage();
  }, [character?.id, character?.LastUpdated, character?.CharacterPortraitImage]);

  if (!character) return null; // 캐릭터가 없으면 아무것도 하지 않음

  const handlerCharacterActivity = () => {
    router.push({
      pathname: '/CharacterActivityScreen',
      params: { id: character.id },
    });
  };

  // 📌 클리어한 레이드 총 골드 계산
  const updatedRaids = [...(character.SelectedRaids || [])];
  let updatedClearedRaidTotalGold = 0;

  for (const raid of updatedRaids) {
    let stageSum = 0;

    for (const stage of raid.stages) {
      if (stage.cleared) {
        stageSum +=
          (raid.goldChecked ? stage.gold : 0) -
          (stage.selectedChestCost ? stage.chestCost || 0 : 0);
      }
    }

    const additionalGold = Number(raid.additionalGold?.replace(/,/g, '') || 0);

    updatedClearedRaidTotalGold +=
      stageSum + (raid.cleared ? additionalGold : 0);
  }

  const clearedRaidTotalGold = updatedClearedRaidTotalGold || 0;

  const clearedCount =
    character.SelectedRaids?.filter((raid) => raid.cleared).length || 0;

  const totalCount =
    character.SelectedRaids?.filter((raid) => raid.stages.length > 0).length ||
    0;

  const OtherActivityTotalGold = character.OtherActivity?.reduce(
    (total, activity) => total + (activity.gold || 0),
    0
  );

  const totalGold = (clearedRaidTotalGold || 0) + (OtherActivityTotalGold || 0);

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={handlerCharacterActivity}
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      accessibilityRole="button"
      accessibilityLabel={`${isInfoVisible ?? true ? character.CharacterName : '익명'} 캐릭터 활동 화면으로 이동`}
      accessibilityState={{ disabled }}
    >
      {/* 왼쪽: 이미지 + 텍스트 */}
      <View style={styles.innerContainer}>
        <View
          style={{
            width: CHARACTER_BAR_HEIGHT,
            height: CHARACTER_BAR_HEIGHT,
            borderTopLeftRadius: CHARACTER_BAR_BORDER_RADIUS,
            borderBottomLeftRadius: CHARACTER_BAR_BORDER_RADIUS,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{
              uri: portraitUri
                ? `${portraitUri}?d=${character.LastUpdated}`
                : character.CharacterImage,
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <View
            style={{
              flexDirection: 'row',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <CustomText
              style={[styles.nameText, { color: colors.black }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isInfoVisible ?? true ? character.CharacterName : '익명'}
            </CustomText>
            {character.IsBookmarked && (
              <Feather
                name="bookmark"
                size={SCREEN_HEIGHT / 64}
                color={colors.black}
              />
            )}
          </View>
          <CustomText
            style={[styles.infoText, { color: colors.grayDark }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isInfoVisible ?? true ? character.CharacterClassName : '직업'} @{' '}
            {isInfoVisible ?? true ? character.ServerName : '서버'}
          </CustomText>
          <CustomText style={[styles.levelText, { color: colors.grayDark }]}>
            Lv.
            {isInfoVisible ?? true ? character.ItemAvgLevel : '-'}
          </CustomText>
        </View>
      </View>

      {/* 오른쪽: 총 골드 + 클리어 정보 */}
      <View style={styles.rightContainer}>
        <CustomText
          style={[
            styles.goldText,
            totalGold >= 0
              ? { color: colors.primary }
              : { color: colors.warning },
          ]}
        >
          {totalGold.toLocaleString()}
        </CustomText>
        <CustomText style={[styles.countText, { color: colors.grayDark }]}>
          레이드 {totalCount > 0 ? clearedCount : '-'} /{' '}
          {totalCount > 0 ? totalCount : '-'}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CHARACTER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: CHARACTER_BAR_BORDER_RADIUS,
    marginBottom: normalize(6),
    marginHorizontal: normalize(12),
    paddingRight: normalize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textContainer: {
    justifyContent: 'center',
    paddingLeft: normalize(12),
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    paddingBottom: normalize(2),
  },
  infoText: {
    fontSize: 13,
  },
  levelText: {
    fontSize: 13,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: normalize(12),
    minWidth: normalize(84),
  },
  goldText: {
    fontSize: 14,
    fontWeight: '600',
    paddingBottom: normalize(2),
  },
  countText: {
    fontSize: 14,
  },
});

export default CharacterBar;
