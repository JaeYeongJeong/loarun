import React from 'react';
import { Dimensions, Text, TextProps, TextStyle } from 'react-native';
import { getFont, FontWeight, FontName } from '@/utils/getFont';
import { moderateScale } from 'react-native-size-matters';
import { Platform } from 'react-native';

type CustomTextProps = Omit<TextProps, 'style' | 'fontWeight'> & {
  fontWeight?: FontWeight;
  font?: FontName;
  style?: TextStyle | TextStyle[];
};

export default function CustomText({
  fontWeight = '400',
  font = 'Suit',
  style,
  ...props
}: CustomTextProps) {
  const { width, height } = Dimensions.get('window');

  const fontStyle = getFont(fontWeight, font);

  // style 배열로 변환
  const styleArray = Array.isArray(style) ? style : [style];

  // fontSize를 RFValue로 변환
  const responsiveStyle = styleArray.map((s) => {
    if (s && typeof s.fontSize === 'number') {
      const scale = Platform.OS === 'ios' ? 1 : 0.9;
      return {
        ...s,
        fontSize: moderateScale(s.fontSize * scale),
        lineHeight: moderateScale((s.lineHeight || s.fontSize * 1.2) * scale),
      };
    }
    return s;
  });

  return <Text {...props} style={[fontStyle, ...responsiveStyle]} />;
}
