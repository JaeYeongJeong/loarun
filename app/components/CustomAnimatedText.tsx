import React, { useEffect, useRef } from 'react';
import { Text, TextProps, TextStyle, Platform, Animated } from 'react-native';
import { getFont, FontWeight, FontName } from '@/utils/getFont';
import { moderateScale } from 'react-native-size-matters';

type FadeKind = 'none' | 'fadeIn' | 'fadeOut';
type MountEffect = 'none' | 'fadeIn' | 'fadeOut';

type CustomTextProps = Omit<TextProps, 'style' | 'fontWeight'> & {
  fontWeight?: FontWeight;
  font?: FontName;
  style?: TextStyle | TextStyle[];

  /** 마운트 시 효과 */
  mountEffect?: MountEffect; // default: 'fadeIn'
  mountDuration?: number; // default: 800
  mountDelay?: number; // default: 0
  mountFrom?: number; // override start opacity (optional)

  /** 특정 값이 바뀔 때만 애니메이션 실행 */
  triggerKey?: string | number | boolean;
  /** 바뀔 때 실행할 효과 */
  effectOnChange?: FadeKind; // default: 'fadeIn'
  fromOnChange?: number; // default: fadeIn→0, fadeOut→1
  durationOnChange?: number; // default: 800
  delayOnChange?: number; // default: 0
  resetBeforeChange?: boolean; // default: true
  skipInitialTrigger?: boolean; // default: true
};

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function CustomAnimatedText({
  fontWeight = '400',
  font = 'Suit',
  style,

  // mount
  mountEffect = 'fadeIn',
  mountDuration = 800,
  mountDelay = 0,
  mountFrom,

  // change
  triggerKey,
  effectOnChange = 'fadeIn',
  fromOnChange,
  durationOnChange = 800,
  delayOnChange = 0,
  resetBeforeChange = true,
  skipInitialTrigger = true,

  ...props
}: CustomTextProps) {
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

  // 초기 opacity: mountEffect에 맞춰 설정
  const initialOpacity =
    mountEffect === 'fadeIn'
      ? mountFrom ?? 0
      : mountEffect === 'fadeOut'
      ? mountFrom ?? 1
      : 1;

  const opacity = useRef(new Animated.Value(initialOpacity)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);
  const triggerSeen = useRef(false);

  const stopRunning = () => {
    running.current?.stop();
    running.current = null;
  };

  const runFadeTo = (toValue: number, duration: number, delay = 0) => {
    stopRunning();
    const anim = Animated.timing(opacity, {
      toValue,
      duration,
      delay,
      useNativeDriver: true,
    });
    running.current = anim;
    anim.start(() => (running.current = null));
  };

  // ▶ 마운트 애니메이션
  useEffect(() => {
    if (mountEffect === 'fadeIn') {
      runFadeTo(1, mountDuration, mountDelay);
    } else if (mountEffect === 'fadeOut') {
      runFadeTo(0, mountDuration, mountDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // ▶ triggerKey 변경 시 애니메이션
  useEffect(() => {
    if (triggerKey === undefined) return;

    // 첫 트리거는 기본 스킵
    if (!triggerSeen.current) {
      triggerSeen.current = true;
      if (skipInitialTrigger) return;
    }

    // ✅ none일 때는 아무 것도 하지 않음
    if (effectOnChange === 'none') return;

    const start = fromOnChange ?? (effectOnChange === 'fadeIn' ? 0 : 1);
    const end = effectOnChange === 'fadeIn' ? 1 : 0;

    if (resetBeforeChange) opacity.setValue(start);
    runFadeTo(end, durationOnChange, delayOnChange);
  }, [
    triggerKey,
    effectOnChange,
    fromOnChange,
    durationOnChange,
    delayOnChange,
    resetBeforeChange,
    skipInitialTrigger,
    opacity,
  ]);

  // 언마운트 시 애니메이션 정지
  useEffect(() => {
    return () => {
      running.current?.stop();
    };
  }, []);

  return (
    <AnimatedText
      {...props}
      // 중요: opacity를 맨 뒤에 둬서 외부 style의 opacity가 덮어쓰지 않도록
      style={[fontStyle, ...responsiveStyle, { opacity }]}
    />
  );
}
