import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Storage Service for securely storing and retrieving encrypted data
 */

const StorageService = {
  /**
   * Store data securely
   * @param {string} key - The storage key
   * @param {any} value - The value to store (will be stringified if object)
   */
  async setItem(key, value) {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await EncryptedStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Retrieve data from secure storage
   * @param {string} key - The storage key
   * @returns {Promise<any>} The retrieved value (parsed if JSON)
   */
  async getItem(key) {
    try {
      const value = await EncryptedStorage.getItem(key);
      if (value === null) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove data from secure storage
   * @param {string} key - The storage key
   */
  async removeItem(key) {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear all data from secure storage
   */
  async clear() {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

export default StorageService;
