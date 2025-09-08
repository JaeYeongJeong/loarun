import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Animated, View, ViewProps } from 'react-native';

type DropEffectProps = ViewProps & {
  enabled?: boolean; // 최우선 on/off (mount/trigger 모두 차단). default: true
  triggerKey?: string | number | boolean;

  dropFromY?: number | null; // null이면 이동 비활성 (기본 null)
  delay?: number; // 기본 0
  duration?: number; // 기본 300

  // 호환 alias
  dropDelay?: number;
  dropDuration?: number;

  // 스태거
  staggerStep?: number;
  staggerReverse?: boolean;
};

export function DropEffect({
  children,
  style,
  enabled = true,
  triggerKey,
  dropFromY = null,
  delay,
  duration,
  dropDelay,
  dropDuration,
  staggerStep,
  staggerReverse = false,
  ...rest
}: DropEffectProps) {
  const baseDelay = dropDelay ?? delay ?? 0;
  const baseDuration = dropDuration ?? duration ?? 300;

  // 🚫 enabled=false면 완전 no-op
  if (!enabled) {
    return (
      <View {...rest} style={style}>
        {children}
      </View>
    );
  }

  const useContainerOnly = !staggerStep || typeof dropFromY !== 'number';

  // ── A) 컨테이너 단일 ─────────────────────
  if (useContainerOnly) {
    const initialY = typeof dropFromY === 'number' ? (dropFromY as number) : 0;
    const translateY = useRef(new Animated.Value(initialY)).current;
    const prevKeyRef = useRef(triggerKey);

    // mount
    useEffect(() => {
      if (typeof dropFromY === 'number' && dropFromY !== 0) {
        Animated.timing(translateY, {
          toValue: 0,
          duration: baseDuration,
          delay: baseDelay,
          useNativeDriver: true,
        }).start();
      }
    }, [dropFromY, baseDelay, baseDuration, translateY]);

    // trigger: pre-paint reset
    useLayoutEffect(() => {
      if (triggerKey === undefined) return;
      const changed = prevKeyRef.current !== triggerKey;
      if (!changed) return;
      if (typeof dropFromY === 'number') translateY.setValue(dropFromY);
      prevKeyRef.current = triggerKey;
    }, [triggerKey, dropFromY, translateY]);

    // trigger: animate
    useEffect(() => {
      if (triggerKey === undefined) return;
      Animated.timing(translateY, {
        toValue: 0,
        duration: baseDuration,
        delay: baseDelay,
        useNativeDriver: true,
      }).start();
    }, [triggerKey, baseDelay, baseDuration, translateY]);

    return (
      <Animated.View {...rest} style={[style, { transform: [{ translateY }] }]}>
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
      const init = typeof dropFromY === 'number' ? (dropFromY as number) : 0;
      return prev[i] ?? new Animated.Value(init);
    });
  }

  const play = (base: number) => {
    const order = [...Array(n).keys()];
    if (staggerReverse) order.reverse();
    order.forEach((idx, i) => {
      const v = valuesRef.current[idx];
      const d = base + i * (staggerStep ?? 0);
      Animated.timing(v, {
        toValue: 0,
        duration: baseDuration,
        delay: d,
        useNativeDriver: true,
      }).start();
    });
  };

  // mount
  useEffect(() => {
    if (typeof dropFromY !== 'number') return;
    valuesRef.current.forEach((v) => v.setValue(dropFromY));
    play(baseDelay);
  }, [dropFromY, baseDelay, baseDuration, staggerStep, staggerReverse]);

  // trigger: pre-paint reset
  useLayoutEffect(() => {
    if (triggerKey === undefined) return;
    if (typeof dropFromY !== 'number') return;
    valuesRef.current.forEach((v) => v.setValue(dropFromY));
  }, [triggerKey, dropFromY]);

  // trigger: animate
  useEffect(() => {
    if (triggerKey === undefined) return;
    play(baseDelay);
  }, [triggerKey, baseDelay, baseDuration, staggerStep, staggerReverse]);

  return (
    <Animated.View {...rest} style={[{ flexDirection: 'row' }, style]}>
      {childArray.map((child, i) => (
        <Animated.View
          key={(child as any)?.key ?? i}
          style={{ transform: [{ translateY: valuesRef.current[i] }] }}
        >
          {child}
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export default DropEffect;
