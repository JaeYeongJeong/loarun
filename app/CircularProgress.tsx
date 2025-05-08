import React from 'react';
import { Svg, Circle, Text } from 'react-native-svg';

type CircularProgressProps = {
  percentage: number; // 0 ~ 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#4CAF50',
  bgColor = '#e9ecef',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <Svg width={size} height={size} className="circular-progress">
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <Text
        x="50%"
        y="50%"
        textAnchor="middle"
        fill="#212529"
        fontSize={size / 5}
        fontWeight="bold"
      >
        {percentage}%
      </Text>
    </Svg>
  );
};

export default CircularProgress;
