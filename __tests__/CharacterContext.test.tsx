jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/utils/PortraitImage', () => ({
  cropAndSavePortraitImage: jest
    .fn()
    .mockResolvedValue('file://mocked-portrait.png'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

import { renderHook, act } from '@testing-library/react-native';
import { useCharacter, CharacterProvider } from '@/context/CharacterContext';

it('should add character and save to AsyncStorage', async () => {
  const { result } = renderHook(() => useCharacter(), {
    wrapper: CharacterProvider,
  });

  const testChar = {
    id: '123',
    CharacterName: 'Test',
    CharacterClassName: '블레이드',
    ItemAvgLevel: '1500',
    ServerName: '루페온',
  };

  await act(async () => {
    await result.current.addCharacter(testChar, 'addedAt');
  });

  expect(result.current.characters).toHaveLength(1);
  expect(result.current.characters[0].CharacterName).toBe('Test');
  expect(result.current.characters[0].CharacterPortraitImage).toBe(
    'file://mocked-portrait.png'
  );
});
