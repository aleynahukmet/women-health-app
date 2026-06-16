import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { LiquidWave } from './LiquidWave';
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

  // Dynamic phase colors based on UX maturity suggestions
  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'follicular': return Colors.follicular;
      case 'ovulatory': return Colors.ovulation;
      case 'luteal': return Colors.luteal;
      case 'menstrual': return Colors.menstrual;
      default: return themeColor;
    }
  };

  const activeColor = getPhaseColor(currentPhase);

  // Define phase segments (simplified for visualization)
  const segments = [
    { name: 'Menstrual', length: 0.2, color: Colors.menstrual },
    { name: 'Follicular', length: 0.3, color: Colors.follicular },
    { name: 'Ovulatory', length: 0.1, color: Colors.ovulation },
    { name: 'Luteal', length: 0.4, color: Colors.luteal },
  ];

  let currentOffset = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Liquid Wave Background for "Fullness" effect */}
      <View style={styles.waveContainer}>
        <LiquidWave 
          size={size - strokeWidth * 2} 
          progress={progress} 
          color={activeColor} 
        />
      </View>

      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background Ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          
          {/* Phase Segments */}
          {segments.map((segment, index) => {
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
                opacity={0.4}
              />
            );
          })}

          {/* Active Progress Indicator */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      
      <View style={styles.content}>
        <Text style={[styles.dayNumber, { color: Colors.text }]}>{cycleDay}</Text>
        <Text style={styles.dayLabel}>Day</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  waveContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  svg: {
    zIndex: 2,
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: '800',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dayLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: -4,
  },
});
