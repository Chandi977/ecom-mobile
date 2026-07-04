import { createNavigationContainerRef } from '@react-navigation/native';

// Global navigation ref so non-component code (e.g. push-notification tap
// handlers) can navigate without a hook.
export const navigationRef = createNavigationContainerRef();

// A tap from a *killed* app fires before the NavigationContainer is ready, so the
// target is queued here and flushed by `onReady` (see StackNavigation). Only the
// most recent pending intent is kept — you only ever open one screen from a tap.
let pendingNavigation = null;

export const navigate = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    pendingNavigation = { name, params };
  }
};

export const flushPendingNavigation = () => {
  if (pendingNavigation && navigationRef.isReady()) {
    const { name, params } = pendingNavigation;
    pendingNavigation = null;
    navigationRef.navigate(name, params);
  }
};
