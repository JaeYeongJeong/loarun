import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { LOSTARK_API_TOKEN } from '@/config';
import uuid from 'react-native-uuid';
import { useCharacter } from '@/utils/CharacterContext';

const LOSTARK_API_URL = 'https://developer-lostark.game.onstove.com';

const AddCharacterScreen: React.FC = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterInfo, setCharacterInfo] = useState<Record<
    string,
    any
  > | null>(null);
  const { addCharacter } = useCharacter();

  // ✅ 캐릭터 추가 핸들러
  const handlerAddCharacter = () => {
    if (!characterInfo) {
      Alert.alert('오류', '캐릭터 정보가 없습니다.');
      return;
    }

    addCharacter({
      id: uuid.v4().toString(),
      CharacterImage: characterInfo.CharacterImage || '',
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

    setCharacterInfo(null); // ✅ 새로운 검색 전 기존 정보 초기화

    // ✅ API 요청 후 결과 저장
    const data = await fetchCharacterInfo(characterName);

    if (data) {
      setCharacterInfo(data);
    } else {
      Alert.alert('오류', '캐릭터 정보를 찾을 수 없습니다.');
    }

    setCharacterName(''); // 입력값 초기화
  };

  // ✅ 캐릭터 정보 가져오기 (비동기 요청)
  const fetchCharacterInfo = async (characterName: string) => {
    try {
      const response = await fetch(
        `${LOSTARK_API_URL}/armories/characters/${characterName}/profiles`,
        {
          method: 'GET',
          headers: {
            Authorization: `bearer ${LOSTARK_API_TOKEN}`, // ✅ JWT 토큰 포함
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('캐릭터 정보:', data);
      return data;
    } catch (error) {
      console.error('API 요청 실패:', error);
      return null; // 오류 발생 시 null 반환
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>새 캐릭터 추가</Text>

      {/* ✅ 입력 필드 */}
      <TextInput
        style={styles.input}
        placeholder="캐릭터 이름"
        value={characterName}
        onChangeText={(text) => setCharacterName(text)}
      />

      {/* ✅ 검색 버튼 */}
      <Pressable style={styles.button} onPress={handlerSearchCharacter}>
        <Text style={styles.buttonText}>검색</Text>
      </Pressable>

      {/* ✅ 캐릭터 정보 표시 */}
      {characterInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{characterInfo.ItemAvgLevel}</Text>
          <Text style={styles.infoText}>{characterInfo.CharacterName}</Text>
          <Text style={styles.infoText}>
            {characterInfo.CharacterClassName} @ {characterInfo.ServerName}
          </Text>

          {/* ✅ 추가 버튼 */}
          <Pressable style={styles.button} onPress={handlerAddCharacter}>
            <Text style={styles.buttonText}>추가</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10, // ✅ 버튼 간격 추가
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default AddCharacterScreen;
