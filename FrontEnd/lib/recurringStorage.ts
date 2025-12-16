import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecurringTransaction } from '../types/transaction';

const RECURRING_STORAGE_KEY = '@money_manager_recurring';

export const recurringStorage = {
  // Get all recurring transactions
  async getAll(): Promise<RecurringTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(RECURRING_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
      return [];
    }
  },

  // Get single recurring transaction by ID
  async getById(id: string): Promise<RecurringTransaction | null> {
    try {
      const recurring = await this.getAll();
      return recurring.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting recurring transaction:', error);
      return null;
    }
  },

  // Save a recurring transaction
  async save(recurring: RecurringTransaction): Promise<void> {
    try {
      const allRecurring = await this.getAll();
      const index = allRecurring.findIndex(r => r.id === recurring.id);
      
      if (index >= 0) {
        allRecurring[index] = recurring;
      } else {
        allRecurring.push(recurring);
      }
      
      await AsyncStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(allRecurring));
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      throw error;
    }
  },

  // Delete a recurring transaction
  async delete(id: string): Promise<void> {
    try {
      const allRecurring = await this.getAll();
      const filtered = allRecurring.filter(r => r.id !== id);
      await AsyncStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      throw error;
    }
  },

  // Get active recurring transactions
  async getActive(): Promise<RecurringTransaction[]> {
    try {
      const allRecurring = await this.getAll();
      const now = new Date();
      
      return allRecurring.filter(r => {
        if (!r.isActive) return false;
        if (r.endDate && new Date(r.endDate) < now) return false;
        return true;
      });
    } catch (error) {
      console.error('Error getting active recurring transactions:', error);
      return [];
    }
  },

  // Clear all recurring transactions (for testing)
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECURRING_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recurring transactions:', error);
      throw error;
    }
  },
};
