import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { getFont, FontWeight, FontName } from '@/utils/getFont';

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
  const fontStyle = getFont(fontWeight, font);

  return <Text {...props} style={[fontStyle, style]} />;
}
