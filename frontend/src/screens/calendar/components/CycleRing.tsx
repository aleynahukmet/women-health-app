import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors } from '../../../theme/theme';

interface CycleRingProps {
  size: number;
  progress: number; // 0 to 1
  currentPhase: string;
  themeColor: string;
  cycleDay: number;
}

export const CycleRing: React.FC<CycleRingProps> = ({ 
  size, 
  progress, 
  currentPhase, 
  themeColor,
  cycleDay 
}) => {
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Define phase segments (simplified for visualization)
  // In a real app, these would come from predictions
  const segments = [
    { name: 'Menstrual', length: 0.2, color: Colors.menstrual },
    { name: 'Follicular', length: 0.3, color: Colors.follicular },
    { name: 'Ovulatory', length: 0.1, color: Colors.ovulation },
    { name: 'Luteal', length: 0.4, color: Colors.luteal },
  ];

  let currentOffset = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background Ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.3}
          />
          
          {/* Phase Segments */}
          {segments.map((segment, index) => {
            const segmentOffset = circumference * (1 - segment.length);
            const rotation = currentOffset * 360;
            currentOffset += segment.length;
            
            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * segment.length} ${circumference}`}
                fill="none"
                transform={`rotate(${rotation}, ${center}, ${center})`}
                opacity={0.5}
              />
            );
          })}

          {/* Active Progress Indicator */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={themeColor}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      
      <View style={styles.content}>
        <Text style={styles.dayNumber}>{cycleDay}</Text>
        <Text style={styles.dayLabel}>Day</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
  },
  dayLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: -4,
  },
});
