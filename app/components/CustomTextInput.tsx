import React from 'react';
import { TextInput, TextInputProps, TextStyle, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { getFont, FontWeight, FontName } from '@/utils/getFont';

type CustomTextInputProps = Omit<TextInputProps, 'style' | 'fontWeight'> & {
  fontWeight?: FontWeight;
  font?: FontName;
  style?: TextStyle | TextStyle[];
};

export default function CustomTextInput({
  fontWeight = '400',
  font = 'Suit',
  style,
  ...props
}: CustomTextInputProps) {
  const fontStyle = getFont(fontWeight, font);
  const styleArray = Array.isArray(style) ? style : [style];

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

  return (
    <TextInput
      {...props}
      style={[fontStyle, ...responsiveStyle]}
      placeholderTextColor={props.placeholderTextColor ?? '#999'} // default color fallback
    />
  );
}
