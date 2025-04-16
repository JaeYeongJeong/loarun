import { useCharacter } from '@/utils/CharacterContext';
import { useRouter } from 'expo-router'; // ✅ `useRouter`로 변경!
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CHARACTER_BAR_HEIGHT = SCREEN_HEIGHT * 0.1;

type CharacterBarProps = {
  id: string;
};

const CharacterBar: React.FC<CharacterBarProps> = ({ id }) => {
  const router = useRouter(); // ✅ `useRouter()` 사용
  const { characters } = useCharacter();
  const character = characters.find((c) => c.id === id);

  if (!character) return null; // ✅ 캐릭터 정보가 없을 경우 렌더링하지 않음
  console.log('CharacterBar rendered:', character.CharacterName);

  const handlerCharacterActivity = () => {
    router.push({
      pathname: '/CharacterActivityScreen',
      params: {
        id: character.id,
      },
    });
  };

  return (
    <Pressable onPress={handlerCharacterActivity} style={styles.container}>
      <View style={styles.innerContainer}>
        <Image
          source={{
            uri:
              character.CharacterImage ||
              '../../assets/images/characters/sample.jpg',
          }} // ✅ 이미지가 없을 경우 기본 이미지
          style={styles.image}
        />

        <View style={styles.textContainer}>
          <Text style={styles.text}>Lv. {character.ItemAvgLevel}</Text>
          <Text style={styles.text}>{character.CharacterName}</Text>
          <Text style={styles.text}>
            {character.CharacterClassName} @ {character.ServerName}
          </Text>
        </View>
      </View>
      <Text>
        {character.SelectedRaids?.filter((raid) => raid.cleared).length || 0} /{' '}
        {character.SelectedRaids?.filter((raid) => raid.stages.length > 0)
          .length || 0}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CHARACTER_BAR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    backgroundColor: 'yellow',
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  image: {
    width: CHARACTER_BAR_HEIGHT * 0.6,
    height: CHARACTER_BAR_HEIGHT * 0.6,
    borderRadius: (CHARACTER_BAR_HEIGHT * 0.6) / 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'left',
  },
});

export default CharacterBar;
