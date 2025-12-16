import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../../../types/transaction';

interface LabeledTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
  userCorrected: boolean;
  timestamp: Date;
}

export class TrainingDataCollector {
  private static STORAGE_KEY = 'ai_training_data';

  static async collectTrainingData(
    transaction: Transaction, 
    suggestedCategory: string,
    actualCategory: string,
    userConfirmed: boolean
  ): Promise<void> {
    const labeledData: LabeledTransaction = {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      category: actualCategory,
      type: transaction.type,
      confidence: userConfirmed ? 1.0 : 0.8,
      userCorrected: suggestedCategory !== actualCategory,
      timestamp: new Date()
    };

    const existingData = await this.getTrainingData();
    existingData.push(labeledData);
    
    await AsyncStorage.setItem(
      this.STORAGE_KEY, 
      JSON.stringify(existingData)
    );
  }

  static async getTrainingData(): Promise<LabeledTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting training data:', error);
      return [];
    }
  }

  static async exportTrainingData(): Promise<string> {
    const data = await this.getTrainingData();
    return JSON.stringify(data, null, 2);
  }

  static async clearTrainingData(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  // Get statistics about training data
  static async getTrainingStats(): Promise<{
    totalSamples: number;
    categoryCounts: { [key: string]: number };
    accuracy: number;
  }> {
    const data = await this.getTrainingData();
    
    const categoryCounts: { [key: string]: number } = {};
    let correctPredictions = 0;
    
    data.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      if (!item.userCorrected) correctPredictions++;
    });
    
    return {
      totalSamples: data.length,
      categoryCounts,
      accuracy: data.length > 0 ? correctPredictions / data.length : 0
    };
  }
}