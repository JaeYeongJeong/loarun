// for local development
import { LOSTARK_API_TOKEN } from '@/config';

// //for Expo preview
// import Constants from 'expo-constants';
// const LOSTARK_API_TOKEN = Constants.expoConfig?.extra?.EXPO_LOSTARK_API_TOKEN;

const LOSTARK_API_URL = 'https://developer-lostark.game.onstove.com';

const fetchCharacterInfo = async (characterName: string) => {
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
    const error = new Error(
      `HTTP Error! Status: ${response.status}`
    ) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  console.log('남은 요청 수:', response.headers.get('x-ratelimit-remaining'));

  const data = await response.json();
  return { ...data };
};

export { fetchCharacterInfo };
