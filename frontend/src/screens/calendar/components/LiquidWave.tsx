import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
// import Animated, { 
//   useAnimatedProps, 
//   useSharedValue, 
//   withRepeat, 
//   withTiming, 
//   easing,
//   interpolate
// } from 'react-native-reanimated';

const useSharedValue = (v: any) => ({ value: v });
const useAnimatedProps = (cb: any) => ({ d: '' });
const withRepeat = (v: any) => v;
const withTiming = (v: any) => v;
const easing = { linear: (v: any) => v };

const AnimatedPath = Path; // Mocked

interface LiquidWaveProps {
  size: number;
  progress: number; // 0 to 1
  color: string;
}

export const LiquidWave: React.FC<LiquidWaveProps> = ({ size, progress, color }) => {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);

  useEffect(() => {
    wave1.value = withRepeat(
      withTiming(1, { duration: 3000, easing: easing.linear }),
      -1,
      false
    );
    wave2.value = withRepeat(
      withTiming(1, { duration: 4000, easing: easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps1 = useAnimatedProps(() => {
    const waveHeight = 10;
    const y = size * (1 - progress);
    const xOffset = wave1.value * size;
    
    let path = `M ${-size} ${y} `;
    for (let x = -size; x <= size * 2; x += 10) {
      const angle = (x / size) * 2 * Math.PI;
      const waveY = y + Math.sin(angle + wave1.value * 2 * Math.PI) * waveHeight;
      path += `L ${x} ${waveY} `;
    }
    path += `L ${size * 2} ${size} L ${-size} ${size} Z`;
    
    return { d: path };
  });

  const animatedProps2 = useAnimatedProps(() => {
    const waveHeight = 15;
    const y = size * (1 - progress);
    
    let path = `M ${-size} ${y} `;
    for (let x = -size; x <= size * 2; x += 10) {
      const angle = (x / size) * 2 * Math.PI;
      const waveY = y + Math.cos(angle + wave2.value * 2 * Math.PI) * waveHeight;
      path += `L ${x} ${waveY} `;
    }
    path += `L ${size * 2} ${size} L ${-size} ${size} Z`;
    
    return { d: path };
  });

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.8" />
            <Stop offset="1" stopColor={color} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
        <AnimatedPath animatedProps={animatedProps2} fill="url(#grad)" opacity={0.4} />
        <AnimatedPath animatedProps={animatedProps1} fill="url(#grad)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F1F2F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
