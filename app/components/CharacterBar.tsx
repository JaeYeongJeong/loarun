import { useCharacter } from '@/context/CharacterContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/context/ThemeContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.09;
const CHARACTER_BAR_BORDER_RADIUS = 20; // 바의 모서리 반경
type CharacterBarProps = {
  id: string;
};

const CharacterBar: React.FC<CharacterBarProps> = ({ id }) => {
  const router = useRouter();
  const { characters } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const [portraitUri, setPortraitUri] = useState<string | null>(null);
  const { colors } = useTheme(); // 테마 색상 가져오기

  if (!character) return; // 캐릭터가 없으면 아무것도 하지 않음

  useEffect(() => {
    const loadImage = async () => {
      const uri = FileSystem.documentDirectory + `${id}_portrait.png`;
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        setPortraitUri(uri);
      } else {
        setPortraitUri(null);
      }
    };
    loadImage();
  }, []);

  const handlerCharacterActivity = () => {
    router.push({
      pathname: '/CharacterActivityScreen',
      params: { id: character.id },
    });
  };

  const clearedCount =
    character.SelectedRaids?.filter((raid) =>
      raid.stages.some((stage) => stage.cleared)
    ).length || 0;

  const totalCount =
    character.SelectedRaids?.filter((raid) => raid.stages.length > 0).length ||
    0;

  const totalGold =
    (character.ClearedRaidTotalGold || 0) +
    (character.WeeklyActivityTotalGold || 0);

  return (
    <TouchableOpacity
      onPress={handlerCharacterActivity}
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
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
                ? `${portraitUri}?d=${character.lastUpdated}`
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
          <Text style={[styles.nameText, { color: colors.black }]}>
            {character.CharacterName}
          </Text>
          <Text style={[styles.infoText, { color: colors.grayDark }]}>
            {character.CharacterClassName} @ {character.ServerName}
          </Text>
          <Text style={[styles.levelText, { color: colors.grayDark }]}>
            Lv. {character.ItemAvgLevel}
          </Text>
        </View>
      </View>

      {/* 오른쪽: 총 골드 + 클리어 정보 */}
      <View style={styles.rightContainer}>
        <Text style={[styles.goldText, { color: colors.primary }]}>
          {totalGold.toLocaleString()}
        </Text>
        <Text style={[styles.countText, { color: colors.grayDark }]}>
          주간 {clearedCount} / {totalCount}
        </Text>
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
    marginBottom: 6,
    marginHorizontal: 12,
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingBottom: 4,
  },
  infoText: {
    fontSize: 14,
  },
  levelText: {
    fontSize: 14,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  goldText: {
    fontSize: 14,
    fontWeight: '500',
    paddingBottom: 2,
  },
  countText: {
    fontSize: 14,
  },
});

export default CharacterBar;
