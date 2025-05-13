import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { fetchCharacterInfo } from '@/utils/FetchLostArkAPI';
import { useTheme } from '@/context/ThemeContext';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const AddCharacterScreen: React.FC = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterInfo, setCharacterInfo] = useState<Record<
    string,
    any
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { characters, addCharacter } = useCharacter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // ✅ 캐릭터 추가 핸들러
  const handlerAddCharacter = () => {
    if (!characterInfo || !characterInfo.CharacterName) {
      Alert.alert('오류', '캐릭터 정보가 없습니다.');
      return;
    }

    if (
      characters.some(
        (character) => character.CharacterName === characterInfo.CharacterName
      )
    ) {
      Alert.alert('오류', '이미 추가된 캐릭터입니다.');
      return;
    }

    addCharacter({
      id: characterInfo.id,
      CharacterImage: characterInfo.CharacterImage || '',
      CharacterPortraitImage: characterInfo.CharacterFaceImage || '',
      CharacterName: characterInfo.CharacterName,
      CharacterClassName: characterInfo.CharacterClassName,
      ItemAvgLevel: characterInfo.ItemAvgLevel,
      ServerName: characterInfo.ServerName,
    });

    Alert.alert('성공', `${characterInfo.CharacterName}이(가) 추가되었습니다.`);
    setCharacterInfo(null); // ✅ 추가 후 초기화
  };

  // ✅ 캐릭터 검색 핸들러
  const handlerSearchCharacter = async () => {
    if (!characterName.trim()) {
      Alert.alert('오류', '캐릭터 이름을 입력해주세요.');
      return;
    }

    setCharacterInfo(null);
    setIsLoading(true); // 로딩 시작

    try {
      const data = await fetchCharacterInfo(characterName);
      console.log('API 응답:', data);
      if (data && data.CharacterName) {
        setCharacterInfo(data);
      } else {
        Alert.alert('오류', '캐릭터 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      Alert.alert('오류', '검색 중 문제가 발생했습니다.');
    }

    setIsLoading(false); // 로딩 종료
    setCharacterName('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* 상단: 액션바 */}
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={router.back}>
            <Feather name="chevron-left" size={24} color={colors.grayDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          {/* 왼쪽 정렬된 타이틀 */}
          <Text style={[styles.title, { color: colors.black }]}>
            캐릭터 추가
          </Text>

          {/* 입력 필드 */}
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.grayLight, color: colors.black },
            ]}
            placeholder=" 캐릭터 이름"
            placeholderTextColor={colors.grayDark}
            value={characterName}
            maxLength={30}
            onChangeText={(text) => setCharacterName(text)}
          />

          {/* 검색 버튼 */}
          <Pressable
            style={[
              styles.button,
              { backgroundColor: isLoading ? colors.grayDark : colors.primary },
            ]}
            onPress={handlerSearchCharacter}
            disabled={isLoading} // 로딩 중 비활성화
          >
            {isLoading ? (
              <Feather name="more-horizontal" size={16} color={colors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.white }]}>
                검색
              </Text>
            )}
          </Pressable>

          {/* 캐릭터 정보 표시 */}
          {characterInfo && (
            <View
              style={[
                styles.infoContainer,
                { backgroundColor: colors.grayLight },
              ]}
            >
              <View style={styles.infoRow}>
                {/* 왼쪽: 캐릭터 정보 */}
                <View style={styles.infoTexts}>
                  <Text style={[styles.nameText, { color: colors.black }]}>
                    {characterInfo.CharacterName}
                  </Text>
                  <Text style={[styles.infoText, { color: colors.grayDark }]}>
                    {characterInfo.ItemAvgLevel}
                  </Text>
                  <Text style={[styles.infoText, { color: colors.grayDark }]}>
                    {characterInfo.CharacterClassName} @{' '}
                    {characterInfo.ServerName}
                  </Text>
                </View>

                {/* 오른쪽: 체크 아이콘 버튼 */}
                <Pressable
                  style={[
                    styles.iconButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handlerAddCharacter}
                >
                  <FontAwesome name="check" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // ✅ 상단 액션바
  actionBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'flex-start', // 왼쪽 정렬
    paddingLeft: '13%',
  },
  input: {
    width: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    paddingLeft: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    marginVertical: 10,
    padding: 16,
    borderRadius: 20,
    width: '80%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 2,
  },

  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    borderRadius: 50,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddCharacterScreen;
