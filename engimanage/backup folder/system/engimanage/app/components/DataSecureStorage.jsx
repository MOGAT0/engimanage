import * as SecureStore from "expo-secure-store";

const DataSecureStorage = {
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`Saved: ${key}`);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  },

  async getItem(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      // console.log(`Retrived ${key}: ${value}`);
      
      return value;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  async updateItem(key, newValue) {
    try {
      const existingValue = await SecureStore.getItemAsync(key);
      if (existingValue !== null) {
        await SecureStore.setItemAsync(key, newValue);
        console.log(`Updated ${key}`);
      } else {
        console.warn(`${key} does not exist. Creating new item.`);
        await SecureStore.setItemAsync(key, newValue);
      }
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  },

  async deleteItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`Deleted ${key}`);
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
    }
  }
};

export default DataSecureStorage;
