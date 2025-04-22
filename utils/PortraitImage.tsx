import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const cropAndSavePortraitImage = async (characterImage: string, id: string) => {
  try {
    const downloadRes = await FileSystem.downloadAsync(
      characterImage,
      FileSystem.documentDirectory + `${id}_original.png`
    );

    // 이미지 크기 정보 불러오기
    const imageInfo = await ImageManipulator.manipulateAsync(
      downloadRes.uri,
      [],
      {}
    );
    const { width, height } = imageInfo;

    if (!width || !height) throw new Error('이미지 크기 확인 실패');

    // 중앙 기준 crop 영역 계산 (중간 40% 영역)
    const cropWidth = width * 0.4;
    const cropHeight = height * 0.4;
    const originX = width * 0.3;
    const originY = height * 0.15;

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

    const newUri = FileSystem.documentDirectory + `${id}_portrait.png`;
    await FileSystem.moveAsync({ from: manipulated.uri, to: newUri });

    return newUri;
  } catch (error) {
    console.error('이미지 처리 실패:', error);
    return null;
  }
};

const deletePortraitImage = async (id: string) => {
  try {
    const uri = FileSystem.documentDirectory + `${id}_portrait.png`;
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    return error;
  }
};

export { cropAndSavePortraitImage, deletePortraitImage };
