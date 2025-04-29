import { useCharacter } from '@/context/CharacterContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import * as FileSystem from 'expo-file-system';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.1;

type CharacterBarProps = {
  id: string;
};

const CharacterBar: React.FC<CharacterBarProps> = ({ id }) => {
  const router = useRouter();
  const { characters } = useCharacter();
  const character = characters.find((c) => c.id === id);
  const [portraitUri, setPortraitUri] = useState<string | null>(null);

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
    (character.WeeklyRaidTotalGold || 0);

  return (
    <Pressable onPress={handlerCharacterActivity} style={styles.container}>
      {/* 왼쪽: 이미지 + 텍스트 */}
      <View style={styles.innerContainer}>
        <View
          style={{
            width: CHARACTER_BAR_HEIGHT * 0.6,
            height: CHARACTER_BAR_HEIGHT * 0.6,
            overflow: 'hidden',
            borderRadius: CHARACTER_BAR_HEIGHT * 0.1, // 원형 마스크
            backgroundColor: '#ccc',
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
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.nameText}>{character.CharacterName}</Text>
          <Text style={styles.infoText}>
            {character.CharacterClassName} @ {character.ServerName}
          </Text>
          <Text style={styles.levelText}>Lv. {character.ItemAvgLevel}</Text>
        </View>
      </View>

      {/* 오른쪽: 총 골드 + 클리어 정보 */}
      <View style={styles.rightContainer}>
        <Text style={styles.goldText}>{totalGold.toLocaleString()} G</Text>
        <Text style={styles.countText}>
          {clearedCount} / {totalCount}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CHARACTER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 16,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textContainer: {
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  levelText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  goldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
  },
  countText: {
    fontSize: 14,
    color: '#555',
  },
});

export default CharacterBar;
