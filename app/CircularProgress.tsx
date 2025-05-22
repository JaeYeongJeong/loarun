import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { Svg, Circle } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import CustomText from './components/CustomText';

type CircularProgressProps = {
  processed?: number;
  total?: number;
  size?: number;
  strokeWidth?: number;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  processed = 0,
  total = 0,
  size = 100,
  strokeWidth = 13,
}) => {
  const percentage = total > 0 ? (processed / total) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.grayLight}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>

      {/* 커스텀 분수 텍스트 */}
      <View style={styles.fractionWrapper}>
        <View style={[styles.fractionItem, styles.numerator]}>
          <CustomText style={[styles.text, { color: colors.black }]}>
            {processed}
          </CustomText>
        </View>
        <View style={[styles.fractionItem, styles.slash]}>
          <CustomText style={[styles.text, { color: colors.black }]}>
            /
          </CustomText>
        </View>
        <View style={[styles.fractionItem, styles.denominator]}>
          <CustomText style={[styles.text, { color: colors.black }]}>
            {total}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fractionWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 40,
    marginLeft: -30,
    marginTop: -20,
  },
  fractionItem: {
    position: 'absolute',
  },
  numerator: {
    top: 0,
    left: 5,
  },
  slash: {
    top: 10,
    left: 25,
    transform: [{ rotate: '25deg' }, { scaleX: 1.2 }],
  },
  denominator: {
    bottom: 0,
    right: 7,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CircularProgress;
