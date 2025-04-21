import { LOSTARK_API_TOKEN } from '@/config';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const LOSTARK_API_URL = 'https://developer-lostark.game.onstove.com';

const fetchCharacterInfo = async (characterName: string) => {
  try {
    const response = await fetch(
      `${LOSTARK_API_URL}/armories/characters/${characterName}/profiles`,
      {
        method: 'GET',
        headers: {
          Authorization: `bearer ${LOSTARK_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    const cropImage = await cropAndSaveImage(
      data.CharacterImage,
      data.CharacterName // <- 대소문자 수정
    );

    const newData = {
      ...data,
      CharacterFaceImage: cropImage,
    };

    return newData;
  } catch (error) {
    console.error('API 요청 실패:', error);
    return null;
  }
};

const cropAndSaveImage = async (
  characterImage: string,
  characterName: string
) => {
  try {
    const downloadRes = await FileSystem.downloadAsync(
      characterImage,
      FileSystem.documentDirectory + `${characterName}_original.png`
    );

    // 여기서 원본 이미지로부터 중간 40% 영역을 중심으로 잘라냄
    const manipulated = await ImageManipulator.manipulateAsync(
      downloadRes.uri,
      [
        {
          crop: {
            originX: 0.3, // 비율 기반으로 설정 (중앙 기준)
            originY: 0.15,
            width: 0.4,
            height: 0.4,
          } as any, // `as any`로 우회 처리 (비율 지원은 공식 문서 미지원이지만 일부 기기에서 동작)
        },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
      }
    );

    const newUri = FileSystem.documentDirectory + `${characterName}_face.png`;
    await FileSystem.moveAsync({ from: manipulated.uri, to: newUri });

    return newUri;
  } catch (error) {
    console.error('이미지 처리 실패:', error);
    return null;
  }
};

export { fetchCharacterInfo };
