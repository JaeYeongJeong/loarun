import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Animated, View, ViewProps } from 'react-native';

type FadeEffectProps = ViewProps & {
  enabled?: boolean; // 최우선 on/off (mount/trigger 모두 차단). default: true
  triggerKey?: string | number | boolean;

  fromOpacity?: number | null; // null이면 페이드 비활성 (기본 0)
  toOpacity?: number; // 기본 1
  delay?: number; // 기본 0
  duration?: number; // 기본 300

  // 자식별 스태거 (없으면 컨테이너 단일)
  staggerStep?: number;
  staggerReverse?: boolean;
};

export function FadeEffect({
  children,
  style,
  enabled = true,
  triggerKey,
  fromOpacity = 0,
  toOpacity = 1,
  delay = 0,
  duration = 300,
  staggerStep,
  staggerReverse = false,
  ...rest
}: FadeEffectProps) {
  // 🚫 enabled=false면 완전 no-op
  if (!enabled) {
    return (
      <View {...rest} style={style}>
        {children}
      </View>
    );
  }

  const useContainerOnly = !staggerStep || typeof fromOpacity !== 'number';

  // ── A) 컨테이너 단일 ─────────────────────
  if (useContainerOnly) {
    const initialOpacity =
      typeof fromOpacity === 'number' ? fromOpacity : toOpacity;

    const opacity = useRef(new Animated.Value(initialOpacity)).current;
    const prevKeyRef = useRef(triggerKey);

    // mount
    useEffect(() => {
      if (typeof fromOpacity === 'number' && fromOpacity !== toOpacity) {
        Animated.timing(opacity, {
          toValue: toOpacity,
          duration,
          delay,
          useNativeDriver: true,
        }).start();
      }
    }, [fromOpacity, toOpacity, delay, duration, opacity]);

    // trigger: pre-paint reset
    useLayoutEffect(() => {
      if (triggerKey === undefined) return;
      const changed = prevKeyRef.current !== triggerKey;
      if (!changed) return;
      if (typeof fromOpacity === 'number') opacity.setValue(fromOpacity);
      prevKeyRef.current = triggerKey;
    }, [triggerKey, fromOpacity, opacity]);

    // trigger: animate
    useEffect(() => {
      if (triggerKey === undefined) return;
      Animated.timing(opacity, {
        toValue: toOpacity,
        duration,
        delay,
        useNativeDriver: true,
      }).start();
    }, [triggerKey, toOpacity, delay, duration, opacity]);

    return (
      <Animated.View {...rest} style={[style, { opacity }]}>
        {children}
      </Animated.View>
    );
  }

  // ── B) 자식별 스태거 ─────────────────────
  const childArray = React.Children.toArray(children);
  const n = childArray.length;

  const valuesRef = useRef<Animated.Value[]>([]);
  if (valuesRef.current.length !== n) {
    const prev = valuesRef.current;
    valuesRef.current = new Array(n).fill(null).map((_, i) => {
      const init = typeof fromOpacity === 'number' ? fromOpacity : toOpacity;
      return prev[i] ?? new Animated.Value(init as number);
    });
  }

  const play = (baseDelay: number) => {
    const order = [...Array(n).keys()];
    if (staggerReverse) order.reverse();
    order.forEach((idx, i) => {
      const v = valuesRef.current[idx];
      const d = baseDelay + i * (staggerStep ?? 0);
      Animated.timing(v, {
        toValue: toOpacity,
        duration,
        delay: d,
        useNativeDriver: true,
      }).start();
    });
  };

  // mount
  useEffect(() => {
    if (typeof fromOpacity !== 'number') return;
    valuesRef.current.forEach((v) => v.setValue(fromOpacity));
    play(delay);
  }, [fromOpacity, toOpacity, delay, duration, staggerStep, staggerReverse]);

  // trigger: pre-paint reset
  useLayoutEffect(() => {
    if (triggerKey === undefined) return;
    if (typeof fromOpacity !== 'number') return;
    valuesRef.current.forEach((v) => v.setValue(fromOpacity));
  }, [triggerKey, fromOpacity]);

  // trigger: animate
  useEffect(() => {
    if (triggerKey === undefined) return;
    play(delay);
  }, [triggerKey, delay, duration, staggerStep, staggerReverse, toOpacity]);

  return (
    <Animated.View {...rest} style={style}>
      {childArray.map((child, i) => (
        <Animated.View
          key={(child as any)?.key ?? i}
          style={{ opacity: valuesRef.current[i] }}
        >
          {child}
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export default FadeEffect;
