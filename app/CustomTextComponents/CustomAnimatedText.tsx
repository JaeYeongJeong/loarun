// CustomAnimatedText.tsx
import React from 'react';
import { TextProps, TextStyle, ViewStyle } from 'react-native';
import CustomText from './CustomText';
import { FadeEffect } from './FadeEffect'; // (단순화된) runMount / triggerKey / fromOpacity / toOpacity / delay / duration
import { TranslateYEffect } from './TranslateYEffect'; // (단순화된) runMount / triggerKey / dropFromY / delay / duration
import { FontWeight, FontName } from '@/utils/getFont';

type Props = Omit<TextProps, 'style' | 'fontWeight'> & {
  /** 텍스트 스타일(폰트/크기/줄간격 등) */
  style?: TextStyle | TextStyle[];
  /** 바깥 래퍼 스타일(레이아웃/마진 등) */
  containerStyle?: ViewStyle | ViewStyle[];

  /** 폰트 설정 (CustomText로 전달) */
  font?: FontName;
  fontWeight?: FontWeight;

  /** 공통: 마운트 실행 여부 + 트리거 키 */
  runMount?: boolean; // 기본 true
  triggerKey?: string | number | boolean; // 값이 바뀔 때마다(첫 변경 스킵) 재생

  /** Fade 설정(선택) */
  fadeFromOpacity?: number | null; // null이면 페이드 비활성. 기본 0(= 페이드인)
  fadeToOpacity?: number; // 기본 1
  fadeDelay?: number; // 기본 0
  fadeDuration?: number; // 기본 800

  /** TranslateY 설정(선택) */
  dropFromY?: number | null; // null이면 이동 비활성. 예: -12(위에서), 12(아래에서)
  dropDelay?: number; // 기본 0
  dropDuration?: number; // 기본 300
};

export default function CustomAnimatedText({
  // 텍스트
  style,
  containerStyle,
  font,
  fontWeight,

  // 공통
  runMount = true,
  triggerKey,

  // Fade
  fadeFromOpacity = 0, // 기본값을 0으로 -> 마운트 시 자연스러운 페이드인
  fadeToOpacity = 1,
  fadeDelay = 0,
  fadeDuration = 800,

  // TranslateY
  dropFromY = null, // 기본적으로 이동은 끔
  dropDelay = 0,
  dropDuration = 300,

  // 나머지 TextProps (children 포함)
  ...textProps
}: Props) {
  return (
    <TranslateYEffect
      style={containerStyle}
      runMount={runMount}
      triggerKey={triggerKey}
      dropFromY={dropFromY}
      dropDelay={dropDelay}
      dropDuration={dropDuration}
    >
      <FadeEffect
        runMount={runMount}
        triggerKey={triggerKey}
        fromOpacity={fadeFromOpacity}
        toOpacity={fadeToOpacity}
        delay={fadeDelay}
        duration={fadeDuration}
      >
        <CustomText
          font={font}
          fontWeight={fontWeight}
          style={style}
          {...textProps}
        />
      </FadeEffect>
    </TranslateYEffect>
  );
}
