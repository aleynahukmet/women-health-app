import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Animated, Dimensions, Keyboard, TouchableWithoutFeedback, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Target, ArrowRight, Droplets } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { healthApi } from '../services/api';
import { showToast } from '../utils/toast';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation, route }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const initialData = route.params;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: initialData?.email || '',
    dob: '', // DD/MM/YYYY
    goal: 'track',
    cycleLength: '28',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'dob'>('dob');

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnimStep1 = useRef(new Animated.Value(1)).current;
  const fadeAnimStep2 = useRef(new Animated.Value(0)).current;
  const fadeAnimStep3 = useRef(new Animated.Value(0)).current;

  const transitionToStep2 = () => {
    if (!data.dob || data.dob.length < 10) {
      showToast.error('Please enter a valid date of birth (DD/MM/YYYY)');
      return;
    }

    Keyboard.dismiss();
    setShowDatePicker(false);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep1, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep2, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setStep(2));
  };

  const transitionToStep3 = () => {
    Keyboard.dismiss();
    setShowDatePicker(false);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 2,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep2, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep3, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setStep(3));
  };

  const backToStep1 = () => {
    setShowDatePicker(false);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep1, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep2, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setStep(1));
  };

  const backToStep2 = () => {
    setShowDatePicker(false);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep2, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimStep3, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setStep(2));
  };

  const formatToISO = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    if (day && month && year && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const formatted = format(selectedDate, 'dd/MM/yyyy');
      setData({ ...data, [datePickerField]: formatted });
    }
  };

  const openDatePicker = (field: 'dob') => {
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  const handleComplete = async () => {
    Keyboard.dismiss();
    setShowDatePicker(false);
    setLoading(true);
    try {
      const isoDob = formatToISO(data.dob);
      const birthYear = parseInt(isoDob.split('-')[0]);
      const age = new Date().getFullYear() - birthYear;

      // Update profile with all data (PII + Health)
      await healthApi.saveProfile({
        name: data.email ? data.email.split('@')[0] : 'User',
        age: age,
        date_of_birth: isoDob,
        last_period_date: format(new Date(), 'yyyy-MM-dd'), // Default to today since we removed the input
        average_cycle_length: parseInt(data.cycleLength) || 28,
        goal: data.goal,
      });

      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Failed to complete setup:', error);
      showToast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    { id: 'track', label: 'Track my cycle', description: 'Understand my body better' },
    { id: 'conceive', label: 'Try to conceive', description: 'Identify my fertile window' },
    { id: 'avoid', label: 'Avoid pregnancy', description: 'Natural contraception support' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerNav}>
            {step > 1 && (
              <TouchableOpacity 
                onPress={() => {
                  if (step === 2) backToStep1();
                  else if (step === 3) backToStep2();
                }} 
                style={styles.backButton}
              >
                <ChevronLeft size={24} color={Colors.text} />
              </TouchableOpacity>
            )}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
            </View>
          </View>

          <Animated.View 
            style={[
              styles.slideContainer, 
              { transform: [{ translateX: slideAnim }], width: width * 3 }
            ]}
          >
            {/* Step 1: Age */}
            <Animated.View style={[styles.stepWrapper, { opacity: fadeAnimStep1 }]}>
              <View style={styles.iconCircle}>
                <Calendar size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>{t('onboarding.age_title')}</Text>
              <Text style={styles.stepSubtitle}>
                {t('onboarding.age_subtitle')}
              </Text>
              
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => openDatePicker('dob')}
              >
                <Text style={[styles.dateInputText, !data.dob && { color: Colors.textLight }]}>
                  {data.dob || "DD/MM/YYYY"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.nextButton, (!data.dob || data.dob.length < 10) && styles.disabledButton]} 
                onPress={transitionToStep2}
              >
                <Text style={styles.nextButtonText}>{t('onboarding.continue')}</Text>
                <ArrowRight size={20} color={Colors.card} />
              </TouchableOpacity>
            </Animated.View>

            {/* Step 2: Goal */}
            <Animated.View style={[styles.stepWrapper, { opacity: fadeAnimStep2 }]}>
              <View style={styles.iconCircle}>
                <Target size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>{t('onboarding.goal_title')}</Text>
              <Text style={styles.stepSubtitle}>
                {t('onboarding.goal_subtitle')}
              </Text>
              
              <View style={styles.goalsList}>
                {goals.map((goal) => (
                  <TouchableOpacity 
                    key={goal.id}
                    style={[styles.goalCard, data.goal === goal.id && styles.selectedGoal]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setData({ ...data, goal: goal.id });
                    }}
                  >
                    <View style={styles.goalTextWrapper}>
                      <Text style={[styles.goalLabel, data.goal === goal.id && styles.selectedGoalLabel]}>
                        {goal.label}
                      </Text>
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    </View>
                    {data.goal === goal.id && (
                      <View style={styles.checkCircle}>
                        <View style={styles.checkInner} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={transitionToStep3}
              >
                <Text style={styles.nextButtonText}>{t('onboarding.continue')}</Text>
                <ArrowRight size={20} color={Colors.card} />
              </TouchableOpacity>
            </Animated.View>

            {/* Step 3: Cycle Length */}
            <Animated.View style={[styles.stepWrapper, { opacity: fadeAnimStep3 }]}>
              <View style={styles.iconCircle}>
                <Droplets size={32} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>Cycle Details</Text>
              <Text style={styles.stepSubtitle}>
                What is your average cycle length? This helps us predict your next period.
              </Text>
              
              <Text style={[styles.inputLabel, { marginTop: 20 }]}>Average Cycle Length (days)</Text>
              <TextInput 
                style={[styles.dateInput, { fontSize: 24, padding: 20, marginBottom: 40 }]}
                placeholder="28"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                value={data.cycleLength}
                onChangeText={(text) => setData({ ...data, cycleLength: text.replace(/\D/g, '') })}
                maxLength={2}
              />

              <TouchableOpacity 
                style={[styles.finishButton, loading && styles.disabledButton]} 
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.card} />
                ) : (
                  <Text style={styles.finishButtonText}>{t('onboarding.finish')}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={data[datePickerField] ? parseISO(formatToISO(data[datePickerField])) : new Date()}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      textColor={Colors.text}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={data[datePickerField] ? parseISO(formatToISO(data[datePickerField])) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pickerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  doneButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 20,
    height: 60,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  slideContainer: {
    flexDirection: 'row',
    width: width * 3,
    flex: 1,
  },
  stepWrapper: {
    width: width,
    padding: Spacing.lg,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  dateInput: {
    width: '100%',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  dateInputText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    width: '100%',
    padding: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  goalsList: {
    width: '100%',
    marginBottom: 32,
  },
  goalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: BorderRadius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedGoal: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  goalTextWrapper: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedGoalLabel: {
    color: Colors.primary,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    width: '100%',
    padding: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
    opacity: 0.7,
  },
});
