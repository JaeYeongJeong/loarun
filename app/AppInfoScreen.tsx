import React from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import CustomText from './components/CustomText';

const version =
  Constants.expoConfig?.version ?? Constants.manifest?.version ?? 'unknown';

const AddCharacterScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
        <View style={{ paddingHorizontal: 12, paddingTop: 32, gap: 12 }}>
          <View
            style={[
              {
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: colors.grayLight,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
              },
            ]}
          >
            <CustomText
              style={{ fontSize: 14, fontWeight: 500, color: colors.black }}
            >
              앱 버전
            </CustomText>
            <CustomText
              style={{ fontSize: 14, fontWeight: 400, color: colors.black }}
            >
              {version}
            </CustomText>
          </View>
          <View
            style={[
              {
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: colors.grayLight,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
              },
            ]}
          >
            <CustomText
              style={{ fontSize: 14, fontWeight: 500, color: colors.black }}
            >
              라이선스
            </CustomText>
            <View />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },
  // ✅ 상단 액션바
  actionBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
});

export default AddCharacterScreen;
