import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Apple, Eye, EyeOff } from 'lucide-react-native';
import { authApi } from '../services/api';
import { showToast } from '../utils/toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

// Google Sign-In initialization
let GoogleSignin: any = null;
if (Constants.appOwnership !== 'expo') {
  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleSigninModule.GoogleSignin;
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    });
  } catch (e) {
    console.log('GoogleSignin module not found or failed to configure');
  }
}

import { Colors, Spacing, BorderRadius } from '../theme/theme';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSocialPicker, setShowSocialPicker] = useState(false);
  const [socialType, setSocialType] = useState<'google' | 'apple' | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const mockAccounts = [
    { email: 'sarah.jones@gmail.com', name: 'Sarah Jones' },
    { email: 'alex.smith@gmail.com', name: 'Alex Smith' },
  ];

  const handleSocialLogin = async (email: string) => {
    setShowSocialPicker(false);
    
    try {
      setLoading(true);
      // Call our new social login endpoint to get a real JWT token
      const response = await authApi.socialLogin(email);
      console.log('Social login success:', response);
      
      try {
        const profile = await healthApi.getProfile();
        if (profile) {
          navigation.navigate('Dashboard');
        } else {
          navigation.navigate('Onboarding', { email, mode: 'social', provider: socialType });
        }
      } catch (e) {
        navigation.navigate('Onboarding', { email, mode: 'social', provider: socialType });
      }
      
      showToast.success('Welcome!');
    } catch (error: any) {
      console.error('Social login error:', error.response?.data || error.message);
      showToast.error('Social login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Handle success
      if (credential.email) {
        handleSocialLogin(credential.email);
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle cancel
      } else {
        // handle other errors
      }
    }
  };

  const handleGoogleLogin = async () => {
    // If running in Expo Go, use mock login since native Google Sign-In isn't supported
    if (Constants.appOwnership === 'expo' || !GoogleSignin) {
      console.log('Running in Expo Go or GoogleSignin not available - switching to mock Google login');
      setSocialType('google');
      setShowSocialPicker(true);
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.user.email) {
        handleSocialLogin(userInfo.user.email);
      }
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      // Fallback to mock for testing if needed
      setSocialType('google');
      setShowSocialPicker(true);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showToast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        const response = await authApi.register({ email, password });
        console.log('Signup success:', response);
        // After signup, we need to login to get the token
        await authApi.login({ username: email, password });
        navigation.navigate('Onboarding', { email, password, mode: 'signup', user: response });
      } else {
        const response = await authApi.login({ username: email, password });
        console.log('Login success:', response);
        navigation.navigate('Onboarding', { email, password, mode: 'signin', ...response });
      }
    } catch (error: any) {
      console.error('Auth error:', error.response?.data || error.message);
      showToast.error(error.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>{isSignUp ? t('welcome.title_signup') : t('welcome.title_signin')}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? t('welcome.subtitle_signup') : t('welcome.subtitle_signin')}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.socialContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleGoogleLogin}
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>
                {isSignUp ? t('welcome.google') : t('welcome.google')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, { marginTop: 12 }]}
              onPress={handleAppleLogin}
            >
              <Apple size={20} color={Colors.text} fill={Colors.text} />
              <Text style={styles.socialButtonText}>
                {isSignUp ? t('welcome.apple') : t('welcome.apple')}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.dividerContainer, { opacity: fadeAnim }]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {t('welcome.divider')}
            </Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.inputLabel}>{t('welcome.email_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder="jane@example.com"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={[styles.labelRow, { marginTop: 20 }]}>
              <Text style={styles.inputLabel}>{t('welcome.password_label')}</Text>
              {!isSignUp && (
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} color={Colors.textSecondary} /> : <Eye size={20} color={Colors.textSecondary} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.card} />
              ) : (
                <Text style={styles.primaryButtonText}>{isSignUp ? t('welcome.signup_btn') : t('welcome.signin_btn')}</Text>
              )}
            </TouchableOpacity>

            {isSignUp && (
              <Text style={styles.termsText}>
                By signing up, you agree to our 
                <Text style={styles.linkText}> Terms and Conditions</Text> and 
                <Text style={styles.linkText}> Privacy Policy</Text>.
              </Text>
            )}
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? t('welcome.footer_signup') : t('welcome.footer_signin')}
              <Text 
                style={styles.footerLink} 
                onPress={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? t('welcome.signin_btn') : t('welcome.signup_btn')}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showSocialPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an account</Text>
            <Text style={styles.modalSubtitle}>to continue to Gaia</Text>
            
            {mockAccounts.map((account) => (
              <TouchableOpacity 
                key={account.email} 
                style={styles.accountItem}
                onPress={() => handleSocialLogin(account.email)}
              >
                <View style={styles.accountAvatar}>
                  <Text style={styles.avatarText}>{account.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountEmail}>{account.email}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.useAnotherButton}
              onPress={() => {
                setShowSocialPicker(false);
                setShowEmailModal(true);
              }}
            >
              <Text style={styles.useAnotherText}>Use another account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowSocialPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowEmailModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Enter your email</Text>
            <Text style={styles.modalSubtitle}>to continue with {socialType === 'google' ? 'Google' : 'Apple'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="jane@example.com"
              placeholderTextColor={Colors.textLight}
              value={modalEmail}
              onChangeText={setModalEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus={true}
            />

            <TouchableOpacity 
              style={[styles.primaryButton, (!modalEmail || loading) && styles.disabledButton]} 
              onPress={() => {
                if (modalEmail) {
                  setShowEmailModal(false);
                  handleSocialLogin(modalEmail);
                }
              }}
              disabled={!modalEmail || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.card} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowEmailModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  socialContainer: {
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: Colors.textLight,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.card,
  },
  passwordWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
  },
  primaryButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.text,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.card,
    fontWeight: '700',
    fontSize: 18,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  accountEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  useAnotherButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  useAnotherText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});
