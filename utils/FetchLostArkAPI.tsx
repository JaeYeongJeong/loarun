// for local development
// import { LOSTARK_API_TOKEN } from '@/config';

// //for Expo preview
import Constants from 'expo-constants';
const LOSTARK_API_TOKEN = Constants.expoConfig?.extra?.EXPO_LOSTARK_API_TOKEN;

const LOSTARK_API_URL = 'https://developer-lostark.game.onstove.com';

const fetchCharacterInfo = async (characterName: string) => {
  try {
    if (!LOSTARK_API_TOKEN) {
      throw new Error('LOSTARK_API_TOKEN is not defined');
    }
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
    console.log(response.headers);

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
