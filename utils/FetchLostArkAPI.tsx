// // // for local development
// import { LOARUN_API_PROXY_URL } from '@/config';

//for Expo preview
import Constants from 'expo-constants';
const LOARUN_API_PROXY_URL =
  Constants.expoConfig?.extra?.EXPO_LOARUN_API_PROXY_URL;

const fetchCharacterInfo = async (characterName: string) => {
  const url = `${LOARUN_API_PROXY_URL}/api/character?name=${encodeURIComponent(
    characterName
  )}`;

  console.log('📦 LOARUN_API_PROXY_URL:', LOARUN_API_PROXY_URL);
  console.log(
    '📦 최종 fetch 주소:',
    `${LOARUN_API_PROXY_URL}/api/character?...`
  );

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(
      `HTTP Error! Status: ${response.status}`
    ) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return data;
};

export { fetchCharacterInfo };
