import { File, Paths } from 'expo-file-system';
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
  ['가디언나이트', { originX: 0.38, originY: 0.1 }],
  ['차원술사', { originX: 0.38, originY: 0.2 }],
]);

const getDocumentFile = (fileName: string) => {
  return new File(Paths.document, fileName);
};

const safeDeleteFile = (file: File) => {
  try {
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('이미지 파일 삭제 실패:', error);
  }
};

const createImageFileSuffix = () => {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const cropAndSavePortraitImage = async (
  characterImage: string,
  id: string,
  className: string,
) => {
  const suffix = createImageFileSuffix();
  const originalFile = getDocumentFile(`${id}_original_${suffix}.png`);

  try {
    await File.downloadFileAsync(characterImage, originalFile, {
      idempotent: true,
    });

    const imageInfo = await ImageManipulator.manipulateAsync(
      originalFile.uri,
      [],
      {},
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
      originalFile.uri,
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
      },
    );

    const previousFileName = await AsyncStorage.getItem(
      `portrait_filename_${id}`,
    );
    const fileName = `${id}_portrait_${suffix}.png`;
    const portraitFile = getDocumentFile(fileName);

    // File.move는 대상 파일이 이미 있으면 실패하므로 매번 새 파일명을 사용하고,
    // 만약 같은 이름의 잔여 파일이 있다면 이동 전 제거한다.
    safeDeleteFile(portraitFile);

    const tempFile = new File(manipulated.uri);
    tempFile.move(portraitFile);

    await AsyncStorage.setItem(`portrait_filename_${id}`, fileName);

    if (previousFileName && previousFileName !== fileName) {
      safeDeleteFile(getDocumentFile(previousFileName));
    }

    return portraitFile.uri;
  } catch (error) {
    console.error('이미지 처리 실패:', error);
    return null;
  } finally {
    safeDeleteFile(originalFile);
  }
};

const getPortraitImage = async (id: string) => {
  try {
    const fileName = await AsyncStorage.getItem(`portrait_filename_${id}`);
    if (!fileName) return null;

    const portraitFile = getDocumentFile(fileName);

    return portraitFile.exists ? portraitFile.uri : null;
  } catch (error) {
    console.error('이미지 불러오기 실패:', error);
    return null;
  }
};

const deletePortraitImage = async (id: string) => {
  try {
    const fileName = await AsyncStorage.getItem(`portrait_filename_${id}`);
    if (!fileName) return;

    const portraitFile = getDocumentFile(fileName);

    safeDeleteFile(portraitFile);

    await AsyncStorage.removeItem(`portrait_filename_${id}`);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
  }
};

export { cropAndSavePortraitImage, getPortraitImage, deletePortraitImage };
