import Toast from 'react-native-toast-message';

export const showToast = {
  success: (text1: string, text2?: string) => {
    Toast.show({
      type: 'success',
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  error: (text1: string, text2?: string) => {
    Toast.show({
      type: 'error',
      text1,
      text2,
      position: 'top',
      visibilityTime: 5000,
    });
  },
  info: (text1: string, text2?: string) => {
    Toast.show({
      type: 'info',
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
    });
  },
};
