import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cropMap = new Map<string, { originX: number; originY: number }>([
  ['디스트로이어', { originX: 0.38, originY: 0.05 }],
  ['워로드', { originX: 0.38, originY: 0.05 }],
  ['버서커', { originX: 0.38, originY: 0.05 }],
  ['홀리나이트', { originX: 0.38, originY: 0.05 }],
  ['슬레이어', { originX: 0.38, originY: 0.1 }],
  ['스트라이커', { originX: 0.38, originY: 0.1 }],
  ['브레이커', { originX: 0.38, originY: 0.1 }],
  ['배틀마스터', { originX: 0.38, originY: 0.1 }],
  ['인파이터', { originX: 0.38, originY: 0.1 }],
  ['기공사', { originX: 0.38, originY: 0.1 }],
  ['창술사', { originX: 0.38, originY: 0.1 }],
  ['데빌헌터', { originX: 0.38, originY: 0.1 }],
  ['블래스터', { originX: 0.38, originY: 0.1 }],
  ['호크아이', { originX: 0.38, originY: 0.1 }],
  ['스카우터', { originX: 0.38, originY: 0.1 }],
  ['건슬링어', { originX: 0.38, originY: 0.1 }],
  ['바드', { originX: 0.38, originY: 0.1 }],
  ['서머너', { originX: 0.38, originY: 0.1 }],
  ['아르카나', { originX: 0.38, originY: 0.1 }],
  ['소서리스', { originX: 0.38, originY: 0.1 }],
  ['블레이드', { originX: 0.38, originY: 0.1 }],
  ['데모닉', { originX: 0.38, originY: 0.1 }],
  ['리퍼', { originX: 0.38, originY: 0.1 }],
  ['소울이터', { originX: 0.38, originY: 0.1 }],
  ['도화가', { originX: 0.38, originY: 0.25 }],
  ['기상술사', { originX: 0.38, originY: 0.25 }],
  ['환수사', { originX: 0.38, originY: 0.25 }],
]);

const cropAndSavePortraitImage = async (
  characterImage: string,
  id: string,
  className: string
) => {
  try {
    const downloadRes = await FileSystem.downloadAsync(
      characterImage,
      FileSystem.documentDirectory + `${id}_original.png`
    );

    const imageInfo = await ImageManipulator.manipulateAsync(
      downloadRes.uri,
      [],
      {}
    );
    const { width, height } = imageInfo;

    if (!width || !height) throw new Error('이미지 크기 확인 실패');

    const cropWidth = 150;
    const cropHeight = 150;
    const defaultCrop = { originX: 0.38, originY: 0.1 };
    const crop = cropMap.get(className) ?? defaultCrop;
    const originX = width * crop.originX;
    const originY = height * crop.originY;

    const manipulated = await ImageManipulator.manipulateAsync(
      downloadRes.uri,
      [
        {
          crop: {
            originX: Math.round(originX),
            originY: Math.round(originY),
            width: Math.round(cropWidth),
            height: Math.round(cropHeight),
          },
        },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
      }
    );

    const fileName = `${id}_portrait.png`;
    const newUri = FileSystem.documentDirectory + fileName;
    await FileSystem.moveAsync({ from: manipulated.uri, to: newUri });

    // 파일명만 저장 (경로 X)
    await AsyncStorage.setItem(`portrait_filename_${id}`, fileName);

    return newUri;
  } catch (error) {
    console.error('이미지 처리 실패:', error);
    return null;
  }
};

const getPortraitImage = async (id: string) => {
  try {
    const fileName = await AsyncStorage.getItem(`portrait_filename_${id}`);
    if (!fileName) return null;

    const uri = FileSystem.documentDirectory + fileName;
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? uri : null;
  } catch (error) {
    console.error('이미지 불러오기 실패:', error);
    return null;
  }
};

const deletePortraitImage = async (id: string) => {
  try {
    const fileName = await AsyncStorage.getItem(`portrait_filename_${id}`);
    if (!fileName) return;

    const uri = FileSystem.documentDirectory + fileName;
    await FileSystem.deleteAsync(uri, { idempotent: true });
    await AsyncStorage.removeItem(`portrait_filename_${id}`);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
  }
};

export { cropAndSavePortraitImage, getPortraitImage, deletePortraitImage };
