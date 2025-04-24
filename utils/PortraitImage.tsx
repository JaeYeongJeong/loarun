import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const cropMap = new Map<string, { originX: number; originY: number }>([
  // 전사(남)
  ['디스트로이어', { originX: 0.38, originY: 0.05 }],
  ['워로드', { originX: 0.38, originY: 0.05 }],
  ['버서커', { originX: 0.38, originY: 0.05 }],
  ['홀리나이트', { originX: 0.38, originY: 0.05 }],
  // 전사(여)
  ['슬레이어', { originX: 0.38, originY: 0.1 }],
  // 무도가(남)
  ['스트라이커', { originX: 0.38, originY: 0.1 }],
  ['브레이커', { originX: 0.38, originY: 0.1 }],
  // 무도가(여)
  ['배틀마스터', { originX: 0.38, originY: 0.1 }],
  ['인파이터', { originX: 0.38, originY: 0.1 }],
  ['기공사', { originX: 0.38, originY: 0.1 }],
  ['창술사', { originX: 0.38, originY: 0.1 }],
  // 헌터(남)
  ['데빌헌터', { originX: 0.38, originY: 0.1 }],
  ['블래스터', { originX: 0.38, originY: 0.1 }],
  ['호크아이', { originX: 0.38, originY: 0.1 }],
  ['스카우터', { originX: 0.38, originY: 0.1 }],
  // 헌터(여)
  ['건슬링어', { originX: 0.38, originY: 0.1 }],
  //마법사
  ['바드', { originX: 0.38, originY: 0.1 }],
  ['서머너', { originX: 0.38, originY: 0.1 }],
  ['아르카나', { originX: 0.38, originY: 0.1 }],
  ['소서리스', { originX: 0.38, originY: 0.1 }],
  //암살자
  ['블레이드', { originX: 0.38, originY: 0.1 }],
  ['데모닉', { originX: 0.38, originY: 0.1 }],
  ['리퍼', { originX: 0.38, originY: 0.1 }],
  ['소울이터', { originX: 0.38, originY: 0.1 }],
  //도화가
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

    // 이미지 크기 정보 불러오기
    const imageInfo = await ImageManipulator.manipulateAsync(
      downloadRes.uri,
      [],
      {}
    );
    const { width, height } = imageInfo;

    if (!width || !height) throw new Error('이미지 크기 확인 실패');

    // 중앙 기준 crop 영역 계산 (중간 40% 영역)
    const cropWidth = 150;
    const cropHeight = 150;
    const defaultCrop = { originX: 0.4, originY: 0.1 };
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
