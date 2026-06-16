import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, G, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

const { width } = Dimensions.get('window');

interface SymptomTrendChartProps {
  title: string;
  data: { label: string; value: number }[];
  color: string;
}

export const SymptomTrendChart: React.FC<SymptomTrendChartProps> = ({ title, data, color }) => {
  const chartHeight = 150;
  const chartWidth = width - Spacing.lg * 4;
  const barWidth = 30;
  const gap = (chartWidth - data.length * barWidth) / (data.length + 1);
  const maxValue = Math.max(...data.map(d => d.value), 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight + 30}>
          <G y={chartHeight}>
            {/* X-Axis */}
            <Line
              x1="0"
              y1="0"
              x2={chartWidth}
              y2="0"
              stroke={Colors.border}
              strokeWidth="1"
            />
            
            {data.map((item, index) => {
              const x = gap + index * (barWidth + gap);
              const barHeight = (item.value / maxValue) * chartHeight;
              
              return (
                <G key={index}>
                  {/* Bar */}
                  <Rect
                    x={x}
                    y={-barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    rx={4}
                    opacity={0.8}
                  />
                  
                  {/* Label */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={20}
                    fontSize="10"
                    fill={Colors.textSecondary}
                    textAnchor="middle"
                  >
                    {item.label}
                  </SvgText>

                  {/* Value on top of bar */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={-barHeight - 5}
                    fontSize="10"
                    fontWeight="700"
                    fill={color}
                    textAnchor="middle"
                  >
                    {item.value}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: 'center',
  },
});
