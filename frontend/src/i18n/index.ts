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
  },
  tr: {
    translation: {
      welcome: {
        title_signup: "Hesabınızı Oluşturun",
        title_signin: "Tekrar Hoş Geldiniz!",
        subtitle_signup: "Bize katılın ve yolculuğunuza başlayın!",
        subtitle_signin: "Sizi tekrar gördüğümüze sevindik.",
        google: "Google ile Kaydol",
        apple: "Apple ile Kaydol",
        divider: "Veya e-posta ile kaydolun",
        email_label: "E-posta",
        password_label: "Şifre",
        signup_btn: "Kaydol",
        signin_btn: "Giriş Yap",
        footer_signup: "Zaten bir hesabınız var mı? ",
        footer_signin: "Hesabınız yok mu? ",
      },
      onboarding: {
        age_title: "Ne zaman doğdunuz?",
        age_subtitle: "Bunu sağlık içgörülerinizi ve tahminlerinizi kişiselleştirmek için kullanıyoruz.",
        goal_title: "Hedefiniz nedir?",
        goal_subtitle: "Gaia'yı kullanma temel nedeninizi seçin.",
        continue: "Devam Et",
        finish: "Kurulumu Tamamla",
      },
      dashboard: {
        greeting: "Merhaba, {{name}}",
        cycle_day: "Döngü Günü",
        period_in: "Adet {{days}} gün içinde",
        log_symptoms: "Belirti Kaydet",
        view_calendar: "Takvimi Görüntüle",
        insights: "Günlük İçgörüler",
        save_entry: "Kaydet",
        log_title: "{{date}} için Kayıt",
        flow_title: "Akış Yoğunluğu",
        symptoms_title: "Belirtiler ve Ruh Hali",
      },
      symptoms: {
        cramps: "Kramplar",
        headache: "Baş Ağrısı",
        mood_swing: "Ruh Hali Değişimi",
        bloating: "Şişkinlik",
        fatigue: "Yorgunluk",
        acne: "Akne",
        tender_breasts: "Göğüs Hassasiyeti",
        backache: "Sırt Ağrısı",
        nausea: "Mide Bulantısı",
        insomnia: "Uykusuzluk",
      },
      flow: {
        none: "Yok",
        light: "Hafif",
        medium: "Orta",
        heavy: "Yoğun",
      },
      phases: {
        menstrual: "Menstrual",
        follicular: "Foliküler",
        ovulatory: "Ovülasyon",
        luteal: "Luteal",
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'en', // More robust way to get language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
