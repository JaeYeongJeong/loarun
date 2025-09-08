import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

type TranslateYEffectProps = ViewProps & {
  /** 마운트 시 이동 애니메이션 실행 여부 */
  runMount?: boolean; // default: true
  /** 이 값이 바뀔 때마다(첫 변경은 스킵) 애니메이션 실행 */
  triggerKey?: string | number | boolean;
  /** 시작 오프셋 Y (음수=위에서, 양수=아래에서). null이면 이동 애니메이션 없음 */
  dropFromY?: number | null; // default: null
  /** 마운트/변경 공통 지연(ms) */
  dropDelay?: number; // default: 0
  /** 마운트/변경 공통 지속시간(ms) */
  dropDuration?: number; // default: 300
};

export function TranslateYEffect({
  children,
  style,
  runMount = true,
  triggerKey,
  dropFromY = null,
  dropDelay: delay = 0,
  dropDuration: duration = 300,
  ...rest
}: TranslateYEffectProps) {
  // runMount=false면 초기 위치는 0으로 고정
  const initialY = runMount && typeof dropFromY === 'number' ? dropFromY : 0;

  const translateY = useRef(new Animated.Value(initialY)).current;
  const running = useRef<Animated.CompositeAnimation | null>(null);
  const firstChangeSeen = useRef(false);

  const stop = () => {
    running.current?.stop();
    running.current = null;
  };

  // 마운트 애니메이션
  useEffect(() => {
    if (runMount && typeof dropFromY === 'number' && dropFromY !== 0) {
      const anim = Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      });
      running.current = anim;
      anim.start(() => (running.current = null));
    }
    return stop; // 언마운트 시 정리
  }, [runMount, dropFromY, delay, duration, translateY]);

  // triggerKey 변경 애니메이션
  useEffect(() => {
    if (triggerKey === undefined) return;

    // skipInitialTrigger = true
    if (!firstChangeSeen.current) {
      firstChangeSeen.current = true;
      return;
    }

    if (typeof dropFromY !== 'number') return;

    // resetBeforeChange = true
    translateY.setValue(dropFromY);

    stop();
    const anim = Animated.timing(translateY, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    });
    running.current = anim;
    anim.start(() => (running.current = null));
  }, [triggerKey, dropFromY, delay, duration, translateY]);

  return (
    <Animated.View {...rest} style={[style, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
