import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, Target, ArrowRight } from 'lucide-react-native';
import { healthApi } from '../services/api';
import { showToast } from '../utils/toast';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from 'react-i18next';

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
    lastPeriod: '', // DD/MM/YYYY
    cycleLength: '28',
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnimStep1 = useRef(new Animated.Value(1)).current;
  const fadeAnimStep2 = useRef(new Animated.Value(0)).current;

  const transitionToStep2 = () => {
    if (!data.dob || data.dob.length < 10) {
      showToast.error('Please enter a valid date of birth (DD/MM/YYYY)');
      return;
    }

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

  const backToStep1 = () => {
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

  const formatToISO = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    if (day && month && year && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const handleDateChange = (text: string, field: 'dob' | 'lastPeriod') => {
    let cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
    }
    setData({ ...data, [field]: formatted.slice(0, 10) });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const isoDob = formatToISO(data.dob);
      const birthYear = parseInt(isoDob.split('-')[0]);
      const age = new Date().getFullYear() - birthYear;

      // Update profile with all data (PII + Health)
      await healthApi.saveProfile({
        name: data.email ? data.email.split('@')[0] : 'User', // Safety check for split
        age: age,
        date_of_birth: isoDob,
        last_period_date: '2026-06-01', // Mock for now
        average_cycle_length: 28,
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
      <View style={styles.headerNav}>
        {step === 2 && (
          <TouchableOpacity onPress={backToStep1} style={styles.backButton}>
            <ChevronLeft size={24} color="#2D3436" />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: step === 1 ? '50%' : '100%' }]} />
        </View>
      </View>

      <Animated.View 
        style={[
          styles.slideContainer, 
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Step 1: Age */}
        <Animated.View style={[styles.stepWrapper, { opacity: fadeAnimStep1 }]}>
          <View style={styles.iconCircle}>
            <Calendar size={32} color="#A29BFE" />
          </View>
          <Text style={styles.stepTitle}>{t('onboarding.age_title')}</Text>
          <Text style={styles.stepSubtitle}>
            {t('onboarding.age_subtitle')}
          </Text>
          
          <TextInput 
            style={styles.dateInput}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#B2BEC3"
            keyboardType="numeric"
            value={data.dob}
            onChangeText={(text) => handleDateChange(text, 'dob')}
            maxLength={10}
            autoFocus={true}
          />

          <TouchableOpacity 
            style={[styles.nextButton, (!data.dob || data.dob.length < 10) && styles.disabledButton]} 
            onPress={transitionToStep2}
          >
            <Text style={styles.nextButtonText}>{t('onboarding.continue')}</Text>
            <ArrowRight size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Step 2: Goal */}
        <Animated.View style={[styles.stepWrapper, { opacity: fadeAnimStep2 }]}>
          <View style={styles.iconCircle}>
            <Target size={32} color="#A29BFE" />
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
                onPress={() => setData({ ...data, goal: goal.id })}
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
            style={[styles.finishButton, loading && styles.disabledButton]} 
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.finishButtonText}>{t('onboarding.finish')}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F2F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A29BFE',
    borderRadius: 3,
  },
  slideContainer: {
    flexDirection: 'row',
    width: width * 2,
    flex: 1,
  },
  stepWrapper: {
    width: width,
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  dateInput: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#A29BFE',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFF',
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
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedGoal: {
    borderColor: '#A29BFE',
    backgroundColor: '#F8F7FF',
  },
  goalTextWrapper: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  selectedGoalLabel: {
    color: '#A29BFE',
  },
  goalDescription: {
    fontSize: 14,
    color: '#636E72',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A29BFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A29BFE',
  },
  finishButton: {
    backgroundColor: '#2D3436',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#B2BEC3',
    opacity: 0.7,
  },
});
