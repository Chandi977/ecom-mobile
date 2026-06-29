import { createNavigationContainerRef } from '@react-navigation/native';

// Global navigation ref so non-component code (e.g. push-notification tap
// handlers) can navigate without a hook.
export const navigationRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};
