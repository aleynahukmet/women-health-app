import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Translation resources
const resources = {
  en: {
    translation: {
      welcome: {
        title_signup: "Create Your Account",
        title_signin: "Welcome Back!",
        subtitle_signup: "Join us and start your journey!",
        subtitle_signin: "We're glad to see you again.",
        google: "Sign up with Google",
        apple: "Sign up with Apple",
        divider: "Or sign up with email",
        email_label: "Email",
        password_label: "Password",
        signup_btn: "Sign up",
        signin_btn: "Sign in",
        footer_signup: "Already have an account? ",
        footer_signin: "Don't have an account? ",
      },
      onboarding: {
        age_title: "When were you born?",
        age_subtitle: "We use this to personalize your health insights and predictions.",
        goal_title: "What's your goal?",
        goal_subtitle: "Select your primary reason for using Gaia.",
        continue: "Continue",
        finish: "Finish Setup",
      },
      dashboard: {
        greeting: "Hello, {{name}}",
        cycle_day: "Cycle Day",
        period_in: "Period in {{days}} days",
        log_symptoms: "Log Symptoms",
        view_calendar: "View Calendar",
        insights: "Daily Insights",
        save_entry: "Save Entry",
        log_title: "Log for {{date}}",
        flow_title: "Flow Intensity",
        symptoms_title: "Symptoms & Mood",
      },
      symptoms: {
        cramps: "Cramps",
        headache: "Headache",
        mood_swing: "Mood Swings",
        bloating: "Bloating",
        fatigue: "Fatigue",
        acne: "Acne",
        tender_breasts: "Tender Breasts",
        backache: "Backache",
        nausea: "Nausea",
        insomnia: "Insomnia",
      },
      flow: {
        none: "None",
        light: "Light",
        medium: "Medium",
        heavy: "Heavy",
      },
      phases: {
        menstrual: "Menstrual",
        follicular: "Follicular",
        ovulatory: "Ovulatory",
        luteal: "Luteal",
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Force English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
