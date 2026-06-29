import { showMessage } from 'react-native-flash-message';

export const showSuccessMessage = message => {
  showMessage({
    message: message,
    icon: 'success',
    type: 'success',
  });
};

export const showErrorMessage = message => {
  showMessage({
    message: message,
    icon: 'danger',
    type: 'danger',
  });
};

export const parseStoredUser = storedUser => {
  if (!storedUser) return null;
  if (typeof storedUser === 'string') {
    try {
      return JSON.parse(storedUser);
    } catch {
      return storedUser;
    }
  }
  return storedUser;
};

export const parseStoredValue = parseStoredUser;
