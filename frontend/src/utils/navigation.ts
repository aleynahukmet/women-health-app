import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

export function resetToWelcome() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      StackActions.replace('Welcome')
    );
  }
}
