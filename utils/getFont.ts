import { Platform } from 'react-native';

export type FontWeight =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type FontName = 'Suit';

export function getFont(weight: FontWeight = '400', font: FontName = 'Suit') {
  if (Platform.OS === 'ios') {
    return {
      fontFamily: font,
      fontWeight: weight,
    };
  } else {
    return {
      fontFamily: `${font}${weight}`,
    };
  }
}
