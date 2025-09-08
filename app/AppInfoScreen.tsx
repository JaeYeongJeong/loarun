import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import CustomText from '../components/customTextComponents/CustomText';

const version = Constants.expoConfig?.version ?? 'unknown';

const AddCharacterScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [licensesFolded, setLicensesFolded] = useState<boolean>(true);

  const toggleLicenses = () => setLicensesFolded((prev) => !prev);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* 상단: 액션바 */}
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={router.back}>
            <Feather name="chevron-left" size={24} color={colors.grayDark} />
          </TouchableOpacity>
        </View>
        <ScrollView
          nestedScrollEnabled
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* 앱 버전 */}
            <View
              style={[styles.infoBox, { backgroundColor: colors.grayLight }]}
            >
              <CustomText style={[styles.label, { color: colors.black }]}>
                앱 버전
              </CustomText>
              <CustomText style={[styles.value, { color: colors.black }]}>
                {version}
              </CustomText>
            </View>

            {/* 오픈소스 라이선스 */}
            <View style={styles.licenseWrapper}>
              <TouchableOpacity
                onPress={toggleLicenses}
                style={[styles.infoBox, { backgroundColor: colors.grayLight }]}
              >
                <CustomText style={[styles.label, { color: colors.black }]}>
                  오픈소스 라이선스
                </CustomText>
                <Feather
                  name={licensesFolded ? 'chevron-down' : 'chevron-up'}
                  size={20}
                  color={colors.black}
                />
              </TouchableOpacity>

              {!licensesFolded && (
                <View
                  style={[
                    styles.licenseTextBox,
                    { backgroundColor: colors.grayLight },
                  ]}
                >
                  <CustomText
                    style={[styles.licenseText, { color: colors.grayDark }]}
                  >
                    이 앱은 다음 오픈소스 리소스를 사용하고 있습니다:
                  </CustomText>
                  <CustomText
                    style={[styles.licenseText, { color: colors.black }]}
                  >
                    {'\n'}■ SUIT Font
                    {'\n'}- License: SIL Open Font License 1.1
                    {'\n'}- Source: https://github.com/suitfonts/SUIT
                    {'\n\n'}■ Feather Icons
                    {'\n'}- License: MIT
                    {'\n'}- Source: https://feathericons.com
                    {'\n\n'}■ Font Awesome Free
                    {'\n'}- License: CC BY 4.0 (저작자 표시 필수)
                    {'\n'}- Author: Fonticons, Inc.
                    {'\n'}- Source: https://fontawesome.com
                    {'\n\n'}■ Entypo
                    {'\n'}- License: CC BY 4.0 (저작자 표시 필수)
                    {'\n'}- Author: Daniel Bruce
                    {'\n'}- Source: https://www.entypo.com
                    {'\n\n'}■ Material Icons
                    {'\n'}- License: Apache License 2.0
                    {'\n'}- Author: Google
                    {'\n'}- Source: https://fonts.google.com/icons
                  </CustomText>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
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
  },
  contentWrapper: {
    paddingHorizontal: 12,
    paddingTop: 32,
    gap: 12,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
  },
  licenseWrapper: {
    flexDirection: 'column',
  },
  licenseTextBox: {
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  licenseText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default AddCharacterScreen;
