import { LOSTARK_API_TOKEN } from '@/config';

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

    const newData = {
      ...data,
    };

    return newData;
  } catch (error) {
    console.error('API 요청 실패:', error);
    return null;
  }
};

export { fetchCharacterInfo };
