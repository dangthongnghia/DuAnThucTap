import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'YOUR_API_URL'; // Thay bằng URL API của bạn

interface Transaction {
  id: string;
  amount: number;
  category: string;
  paymentMethod: string;
  note?: string;
  date: string;
  type: 'income' | 'expense';
}

class StorageService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async isUserLoggedIn(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null;
  }

  // Lưu giao dịch
  async saveTransaction(transaction: Transaction): Promise<void> {
    const isLoggedIn = await this.isUserLoggedIn();

    if (isLoggedIn) {
      // Lưu vào database
      await this.saveToDatabase(transaction);
    } else {
      // Lưu vào AsyncStorage
      await this.saveToAsyncStorage(transaction);
    }
  }

  // Lấy danh sách giao dịch
  async getTransactions(): Promise<Transaction[]> {
    const isLoggedIn = await this.isUserLoggedIn();

    if (isLoggedIn) {
      return await this.getFromDatabase();
    } else {
      return await this.getFromAsyncStorage();
    }
  }

  // Cập nhật giao dịch
  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    const isLoggedIn = await this.isUserLoggedIn();

    if (isLoggedIn) {
      await this.updateInDatabase(id, transaction);
    } else {
      await this.updateInAsyncStorage(id, transaction);
    }
  }

  // Xóa giao dịch
  async deleteTransaction(id: string): Promise<void> {
    const isLoggedIn = await this.isUserLoggedIn();

    if (isLoggedIn) {
      await this.deleteFromDatabase(id);
    } else {
      await this.deleteFromAsyncStorage(id);
    }
  }

  // ASYNC STORAGE METHODS
  private async saveToAsyncStorage(transaction: Transaction): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('transactions');
      const transactions: Transaction[] = existing ? JSON.parse(existing) : [];
      transactions.push(transaction);
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      throw error;
    }
  }

  private async getFromAsyncStorage(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem('transactions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return [];
    }
  }

  private async updateInAsyncStorage(id: string, updatedData: Partial<Transaction>): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('transactions');
      const transactions: Transaction[] = existing ? JSON.parse(existing) : [];
      const index = transactions.findIndex(t => t.id === id);
      
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedData };
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error updating in AsyncStorage:', error);
      throw error;
    }
  }

  private async deleteFromAsyncStorage(id: string): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('transactions');
      const transactions: Transaction[] = existing ? JSON.parse(existing) : [];
      const filtered = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem('transactions', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from AsyncStorage:', error);
      throw error;
    }
  }

  // DATABASE METHODS
  private async saveToDatabase(transaction: Transaction): Promise<void> {
    try {
      const token = await this.getAuthToken();
      await axios.post(`${API_URL}/transactions`, transaction, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  }

  private async getFromDatabase(): Promise<Transaction[]> {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get<Transaction[]>(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error reading from database:', error);
      return [];
    }
  }

  private async updateInDatabase(id: string, updatedData: Partial<Transaction>): Promise<void> {
    try {
      const token = await this.getAuthToken();
      await axios.put(`${API_URL}/transactions/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating in database:', error);
      throw error;
    }
  }

  private async deleteFromDatabase(id: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting from database:', error);
      throw error;
    }
  }

  // Đồng bộ dữ liệu khi người dùng đăng nhập
  async syncLocalToServer(): Promise<void> {
    try {
      const localTransactions = await this.getFromAsyncStorage();
      
      if (localTransactions.length > 0) {
        const token = await this.getAuthToken();
        
        // Gửi tất cả giao dịch local lên server
        await axios.post(`${API_URL}/transactions/bulk`, 
          { transactions: localTransactions },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        // Xóa dữ liệu local sau khi đồng bộ thành công
        await AsyncStorage.removeItem('transactions');
      }
    } catch (error) {
      console.error('Error syncing to server:', error);
      throw error;
    }
  }

  // Tải dữ liệu từ server về local khi logout
  async syncServerToLocal(): Promise<void> {
    try {
      const serverTransactions = await this.getFromDatabase();
      await AsyncStorage.setItem('transactions', JSON.stringify(serverTransactions));
    } catch (error) {
      console.error('Error syncing to local:', error);
      throw error;
    }
  }
}

export default new StorageService();