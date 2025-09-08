import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

type SimpleFadeEffectProps = ViewProps & {
  /** 마운트 시 페이드 실행 여부 */
  runMount?: boolean; // default: true
  /** 값이 바뀔 때마다(첫 변경은 스킵) 재생 */
  triggerKey?: string | number | boolean;
  /** 시작 불투명도. null이면 애니메이션 비활성 */
  fromOpacity?: number | null; // default: null
  /** 목표 불투명도 */
  toOpacity?: number; // default: 1
  /** 공통 지연/지속 시간 */
  delay?: number; // default: 0
  duration?: number; // default: 300
};

export function FadeEffect({
  children,
  style,
  runMount = true,
  triggerKey,
  fromOpacity = null,
  toOpacity = 1,
  delay = 0,
  duration = 300,
  ...rest
}: SimpleFadeEffectProps) {
  // runMount=false 또는 fromOpacity=null이면 초기값을 toOpacity로 두어 "그냥 보이게"
  const initialOpacity =
    runMount && typeof fromOpacity === 'number' ? fromOpacity : toOpacity;

  const opacity = useRef(new Animated.Value(initialOpacity)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);
  const firstChangeSeen = useRef(false);

  const stop = () => {
    running.current?.stop();
    running.current = null;
  };

  // 마운트 시
  useEffect(() => {
    if (
      runMount &&
      typeof fromOpacity === 'number' &&
      fromOpacity !== toOpacity
    ) {
      const anim = Animated.timing(opacity, {
        toValue: toOpacity,
        duration,
        delay,
        useNativeDriver: true,
      });
      running.current = anim;
      anim.start(() => (running.current = null));
    }
    return stop;
  }, [runMount, fromOpacity, toOpacity, delay, duration, opacity]);

  // triggerKey 변경 시 (첫 변경은 스킵)
  useEffect(() => {
    if (triggerKey === undefined) return;

    if (!firstChangeSeen.current) {
      firstChangeSeen.current = true; // skipInitialTrigger = true
      return;
    }

    if (typeof fromOpacity !== 'number') return; // fromOpacity=null이면 변경 시도도 비활성

    // resetBeforeChange = true
    opacity.setValue(fromOpacity);

    stop();
    const anim = Animated.timing(opacity, {
      toValue: toOpacity,
      duration,
      delay,
      useNativeDriver: true,
    });
    running.current = anim;
    anim.start(() => (running.current = null));
  }, [triggerKey, fromOpacity, toOpacity, delay, duration, opacity]);

  return (
    <Animated.View {...rest} style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
}
