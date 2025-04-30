import React from 'react';
import MainPage from './MainPage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  const insets = useSafeAreaInsets();
  return <MainPage />;
}
