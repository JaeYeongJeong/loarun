import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useCharacter } from '@/context/CharacterContext';
import { fetchCharacterInfo } from '@/utils/FetchLostArkAPI';
import { useTheme } from '@/context/ThemeContext';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CustomText from '../components/customTextComponents/CustomText';
import { validateNicknameInput } from '@/utils/validateInput';
import CustomAlert from './CustomAlert';
import { useAppSetting } from '@/context/AppSettingContext';
import CustomTextInput from '../components/CustomTextInput';

const AddCharacterScreen: React.FC = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterInfo, setCharacterInfo] = useState<Record<
    string,
    any
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('알림');
  const { characters, addCharacter } = useCharacter();
  const { characterSortOrder } = useAppSetting();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // ✅ 캐릭터 추가 핸들러
  const handlerAddCharacter = async () => {
    if (!characterInfo || !characterInfo.CharacterName) {
      setAlertTitle('오류');
      setAlertMessage('캐릭터 정보가 없습니다.');
      setAlertVisible(true);
      return;
    }

    if (
      characters.some(
        (character) => character.CharacterName === characterInfo.CharacterName
      )
    ) {
      setAlertTitle('오류');
      setAlertMessage('이미 추가된 캐릭터입니다.');
      setAlertVisible(true);
      return;
    }

    try {
      await addCharacter(
        {
          id: characterInfo.id,
          CharacterImage: characterInfo.CharacterImage || '',
          CharacterPortraitImage: characterInfo.CharacterFaceImage || '',
          CharacterName: characterInfo.CharacterName,
          CharacterClassName: characterInfo.CharacterClassName,
          ItemAvgLevel: characterInfo.ItemAvgLevel,
          ServerName: characterInfo.ServerName,
        },
        characterSortOrder
      );

      setAlertTitle('성공');
      setAlertMessage(`${characterInfo.CharacterName}이(가) 추가되었습니다.`);
      setCharacterInfo(null); // ✅ 추가 후 초기화
    } catch (err) {
      console.error('캐릭터 추가 실패:', err);
      setAlertTitle('오류');
      setAlertMessage('캐릭터 추가에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setAlertVisible(true);
    }
  };

  // ✅ 캐릭터 검색 핸들러
  const handlerSearchCharacter = async () => {
    const validateInput = validateNicknameInput(characterName.trim());

    switch (validateInput.status) {
      case 'empty':
        setAlertTitle('오류');
        setAlertMessage('닉네임을 입력해주세요.');
        setAlertVisible(true);
        return;
      case 'exceeds-limit':
        setAlertTitle('오류');
        setAlertMessage('닉네임은 12자 이하로 입력해주세요.');
        setAlertVisible(true);
        return;
      case 'invalid-nickname':
        setAlertTitle('오류');
        setAlertMessage('닉네임은 한글, 영문, 숫자만 입력할 수 있습니다.');
        setAlertVisible(true);
        return;
      case 'valid-nickname':
        break;
    }

    if (
      characters.some(
        (character) => character.CharacterName === characterName.trim()
      )
    ) {
      setAlertTitle('오류');
      setAlertMessage('이미 추가된 캐릭터입니다.');
      setAlertVisible(true);
      return;
    }

    setCharacterInfo(null);
    setIsLoading(true); // 로딩 시작

    try {
      const data = await fetchCharacterInfo(characterName.trim());

      if (data && data.CharacterName) {
        setCharacterInfo(data);
      } else {
        setAlertTitle('오류');
        setAlertMessage('캐릭터 정보를 찾을 수 없습니다.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      if (err.status === 429) {
        setAlertTitle('오류');
        setAlertMessage('API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요');
        setAlertVisible(true);
      } else {
        setAlertTitle('오류');
        setAlertMessage('검색 중 문제가 발생했습니다.');
        setAlertVisible(true);
      }
    } finally {
      setIsLoading(false); // 로딩 종료
      setCharacterName('');
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // ios는 padding, android는 height
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[
              styles.container,
              {
                backgroundColor: colors.background,
                paddingTop: insets.top,
              },
            ]}
          >
            {/* 상단: 액션바 */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                onPress={router.back}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="이전 화면으로 이동"
              >
                <Feather
                  name="chevron-left"
                  size={24}
                  color={colors.grayDark}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.contentWrapper}>
              <View
                style={[
                  styles.formCard,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <View style={styles.heroWrapper}>
                  <Image
                    source={require('../assets/images/loarunIcon-favicon-192.png')}
                    style={styles.heroImage}
                    resizeMode="contain"
                  />
                  <View style={styles.heroTextWrapper}>
                    <CustomText style={[styles.title, { color: colors.black }]}>
                      캐릭터 추가
                    </CustomText>
                    <CustomText
                      style={[styles.subtitle, { color: colors.grayDark }]}
                    >
                      대표 캐릭터 이름을 입력하면 정보를 불러와요.
                    </CustomText>
                  </View>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.grayLight },
                  ]}
                >
                  <Feather name="search" size={18} color={colors.grayDark} />
                  <CustomTextInput
                    style={[styles.input, { color: colors.black }]}
                    placeholder="캐릭터 이름"
                    placeholderTextColor={colors.grayDark}
                    value={characterName}
                    maxLength={30}
                    editable={!isLoading}
                    returnKeyType="search"
                    onSubmitEditing={handlerSearchCharacter}
                    onChangeText={(text) => setCharacterName(text)}
                  />
                </View>

                <Pressable
                  style={[
                    styles.button,
                    {
                      backgroundColor: isLoading
                        ? colors.grayDark
                        : colors.primary,
                    },
                  ]}
                  onPress={() => {
                    handlerSearchCharacter();
                  }}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={isLoading ? '캐릭터 검색 중' : '캐릭터 검색'}
                  accessibilityState={{ disabled: isLoading, busy: isLoading }}
                >
                  {isLoading ? (
                    <View style={styles.loadingButtonContent}>
                      <ActivityIndicator size="small" color={colors.white} />
                      <CustomText
                        style={[styles.buttonText, { color: colors.white }]}
                      >
                        검색 중...
                      </CustomText>
                    </View>
                  ) : (
                    <CustomText
                      style={[styles.buttonText, { color: colors.white }]}
                    >
                      검색하기
                    </CustomText>
                  )}
                </Pressable>

                {characterInfo && (
                  <View
                    style={[
                      styles.infoContainer,
                      {
                        backgroundColor: colors.grayLight,
                        borderColor: colors.primary + '55',
                      },
                    ]}
                  >
                    <View style={styles.infoRow}>
                      <View style={styles.infoTexts}>
                        <CustomText
                          style={[styles.resultLabel, { color: colors.primary }]}
                        >
                          검색 결과
                        </CustomText>
                        <CustomText
                          style={[styles.nameText, { color: colors.black }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {characterInfo.CharacterName}
                        </CustomText>
                        <CustomText
                          style={[styles.infoText, { color: colors.grayDark }]}
                        >
                          Lv.{characterInfo.ItemAvgLevel}
                        </CustomText>
                        <CustomText
                          style={[styles.infoText, { color: colors.grayDark }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {characterInfo.CharacterClassName} @{' '}
                          {characterInfo.ServerName}
                        </CustomText>
                      </View>

                      <Pressable
                        style={[
                          styles.iconButton,
                          { backgroundColor: colors.primary },
                        ]}
                        onPress={handlerAddCharacter}
                        accessibilityRole="button"
                        accessibilityLabel={`${characterInfo.CharacterName} 캐릭터 추가`}
                      >
                        <FontAwesome name="check" size={18} color="white" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <CustomAlert
          isVisible={alertVisible}
          setIsVisibleFalse={() => setAlertVisible(false)}
          titleText={alertTitle}
          messageText={alertMessage}
          buttonType="oneButton"
          align="center"
        />
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  actionBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
    zIndex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  heroWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  heroImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
  },
  heroTextWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  infoContainer: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    width: '100%',
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoTexts: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    paddingBottom: 2,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddCharacterScreen;
