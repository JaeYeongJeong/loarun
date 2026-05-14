import React from 'react';
import { TextInput, TextInputProps, TextStyle, Platform } from 'react-native';
import { getFont, FontWeight, FontName } from '@/utils/getFont';
import { PixelRatio } from 'react-native';

type CustomTextInputProps = Omit<TextInputProps, 'style' | 'fontWeight'> & {
  fontWeight?: FontWeight;
  font?: FontName;
  style?: TextStyle | TextStyle[];
};

const scaleFont = (size: number) => {
  return Math.round(PixelRatio.roundToNearestPixel(size));
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
        fontSize: scaleFont(s.fontSize * scale),
        lineHeight: scaleFont((s.lineHeight || s.fontSize * 1.2) * scale),
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
