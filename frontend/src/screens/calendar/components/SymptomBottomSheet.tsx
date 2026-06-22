import React, { forwardRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  Layout,
  FadeIn,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Check, Edit3 } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { SYMPTOM_CATEGORIES, SYMPTOMS_BY_CATEGORY } from '../constants';
import { Spacing, BorderRadius, useTheme } from '../../../theme/theme';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const createStyles = (Colors: any) => StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.card,
  },
  categoryTabsContainer: {
    position: 'relative',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  categoryTabs: {
    paddingHorizontal: 8,
  },
  edgeFade: {
    position: 'absolute',
    top: 0,
    bottom: 12,
    width: 20,
    zIndex: 1,
  },
  edgeFadeLeft: {
    left: 0,
  },
  edgeFadeRight: {
    right: 0,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginRight: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelActive: {
    color: Colors.primary,
  },
  categoryContent: {
    flex: 1,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 32,
  },
  symptomCard: {
    width: (width - 64) / 3,
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.background,
    backgroundColor: Colors.background,
    margin: 4,
    position: 'relative',
  },
  symptomCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  symptomCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  intensityDots: {
    flexDirection: 'row',
    marginTop: 8,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  checkBadgeSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  journalInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 16,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

interface SymptomCardProps {
  item: any;
  isSelected: boolean;
  intensity: number;
  activeCategory: string;
  onPress: () => void;
}

const SymptomCard: React.FC<SymptomCardProps> = ({ 
  item, 
  isSelected, 
  intensity, 
  activeCategory, 
  onPress 
}) => {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  
  const handlePress = () => {
    onPress();
  };

  const getSeverityColor = (level: number) => {
    if (level === 1) return Colors.severity.low;
    if (level === 2) return Colors.severity.medium;
    if (level === 3) return Colors.severity.high;
    return Colors.border;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.symptomCard, 
        isSelected && { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
        intensity > 0 && { borderColor: getSeverityColor(intensity), backgroundColor: getSeverityColor(intensity) + '10' }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.symptomCardIcon}>{item.icon}</Text>
      <Text style={styles.symptomCardLabel}>{item.label}</Text>
      {intensity > 0 && (
        <View style={styles.intensityDots}>
          {[1, 2, 3].map(dot => (
            <View 
              key={dot} 
              style={[
                styles.intensityDot, 
                { backgroundColor: dot <= intensity ? getSeverityColor(intensity) : Colors.border }
              ]} 
            />
          ))}
        </View>
      )}
      {isSelected && (
        <View style={[styles.checkBadgeSmall, { backgroundColor: intensity > 0 ? getSeverityColor(intensity) : Colors.primary }]}>
          <Check size={10} color={Colors.card} />
        </View>
      )}
    </TouchableOpacity>
  );
};

interface SymptomBottomSheetProps {
  selectedDate: Date;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  currentLog: any;
  onToggleSymptom: (categoryId: string, symptomId: any) => void;
  onUpdateNotes: (notes: string) => void;
  onSave: () => void;
  themeColor: string;
  snapPoints: string[];
}

export const SymptomBottomSheet = forwardRef<BottomSheet, SymptomBottomSheetProps>(({
  selectedDate,
  activeCategory,
  setActiveCategory,
  currentLog,
  onToggleSymptom,
  onUpdateNotes,
  onSave,
  themeColor,
  snapPoints,
}, ref) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.card }}
      handleIndicatorStyle={{ backgroundColor: Colors.border }}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onSave}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        {/* Category Tabs */}
        <View style={styles.categoryTabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {SYMPTOM_CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                style={[styles.categoryTab, activeCategory === cat.id && styles.categoryTabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat.id);
                }}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Edge Fades */}
          <View style={[styles.edgeFade, styles.edgeFadeLeft, { backgroundColor: Colors.card + '80' }]} pointerEvents="none" />
          <View style={[styles.edgeFade, styles.edgeFadeRight, { backgroundColor: Colors.card + '80' }]} pointerEvents="none" />
        </View>

        <ScrollView style={styles.categoryContent} showsVerticalScrollIndicator={false}>
          <View style={styles.symptomGrid}>
            {SYMPTOMS_BY_CATEGORY[activeCategory].map((item) => {
              let isSelected = false;
              let intensity = 0;

              if (activeCategory === 'flow') {
                isSelected = currentLog.flow_level === item.id && item.id !== 0;
                // Map flow levels 1-4 to dots 1-3 (approximate) or just show as selected
                if (isSelected) intensity = Math.min(item.id, 3);
              } else if (activeCategory === 'pain') {
                intensity = currentLog.pain_metrics[item.id] || 0;
                isSelected = intensity > 0;
              } else if (activeCategory === 'mood') {
                isSelected = currentLog.mood_metrics.includes(item.id);
              } else if (activeCategory === 'energy' || activeCategory === 'body') {
                intensity = currentLog.lifestyle_metrics[item.id] || 0;
                isSelected = intensity > 0;
              } else if (activeCategory === 'sex') {
                isSelected = !!currentLog.sex_logged[item.id];
              }

              return (
                <SymptomCard 
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  intensity={intensity}
                  activeCategory={activeCategory}
                  onPress={() => onToggleSymptom(activeCategory, item.id)}
                />
              );
            })}
          </View>

          {/* Journaling Module */}
          <View style={styles.journalSection}>
            <View style={styles.journalHeader}>
              <Edit3 size={18} color={Colors.primary} />
              <Text style={styles.journalTitle}>Body Journal</Text>
            </View>
            <TextInput
              style={styles.journalInput}
              placeholder="How are you feeling today? (e.g., 'feeling a bit tired but happy')"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              value={currentLog.notes || ''}
              onChangeText={onUpdateNotes}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});
