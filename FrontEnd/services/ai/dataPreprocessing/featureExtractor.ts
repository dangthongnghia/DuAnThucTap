import { TextProcessor } from './textProcessor';

export class FeatureExtractor {
  private static COMMON_WORDS = [
    'coffee', 'food', 'gas', 'grocery', 'restaurant', 'shopping',
    'uber', 'taxi', 'movie', 'netflix', 'spotify', 'gym', 'pharmacy',
    'cà phê', 'ăn', 'xăng', 'mua', 'grab', 'phim', 'thuốc'
  ];

  static extractAllFeatures(transaction: {
    description: string;
    amount: number;
    date: Date;
    type: 'income' | 'expense';
  }): number[] {
    const featureVector: number[] = [];
    
    // 1. Amount-based features
    featureVector.push(Math.log(transaction.amount + 1)); // Log amount
    featureVector.push(transaction.amount > 100000 ? 1 : 0); // High amount flag (>100k VND)
    featureVector.push(transaction.amount > 500000 ? 1 : 0); // Very high amount flag (>500k VND)
    featureVector.push(transaction.amount < 20000 ? 1 : 0); // Small amount flag (<20k VND)
    
    // 2. Time-based features  
    const hour = transaction.date.getHours();
    const dayOfWeek = transaction.date.getDay();
    const dayOfMonth = transaction.date.getDate();
    
    featureVector.push(hour / 24); // Normalized hour
    featureVector.push(dayOfWeek / 7); // Normalized day of week
    featureVector.push(dayOfMonth / 31); // Normalized day of month
    
    // Time of day categories
    featureVector.push(hour >= 6 && hour < 10 ? 1 : 0); // Morning
    featureVector.push(hour >= 10 && hour < 14 ? 1 : 0); // Midday  
    featureVector.push(hour >= 14 && hour < 18 ? 1 : 0); // Afternoon
    featureVector.push(hour >= 18 && hour < 22 ? 1 : 0); // Evening
    featureVector.push(hour >= 22 || hour < 6 ? 1 : 0); // Night
    
    // Weekend flag
    featureVector.push(dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0); // Weekend
    
    // 3. Transaction type
    featureVector.push(transaction.type === 'income' ? 1 : 0);
    featureVector.push(transaction.type === 'expense' ? 1 : 0);
    
    // 4. Text features - Vietnamese keyword detection
    const keywordScores = TextProcessor.detectVietnameseKeywords(transaction.description);
    Object.values(keywordScores).forEach(score => {
      featureVector.push(score > 0 ? 1 : 0); // Binary presence
    });
    
    // 5. Common words presence
    this.COMMON_WORDS.forEach(word => {
      featureVector.push(
        transaction.description.toLowerCase().includes(word) ? 1 : 0
      );
    });
    
    // 6. Text statistics
    const words = transaction.description.trim().split(/\s+/);
    featureVector.push(words.length); // Word count
    featureVector.push(transaction.description.length); // Character count
    featureVector.push(words.filter(word => word.length > 5).length); // Long words count
    
    // 7. Numeric patterns in description
    const hasNumbers = /\d/.test(transaction.description);
    const hasPhone = /\d{10,11}/.test(transaction.description);
    featureVector.push(hasNumbers ? 1 : 0);
    featureVector.push(hasPhone ? 1 : 0);

    return featureVector;
  }

  static getFeatureNames(): string[] {
    return [
      'log_amount', 'high_amount', 'very_high_amount', 'small_amount',
      'hour_normalized', 'day_of_week', 'day_of_month',
      'morning', 'midday', 'afternoon', 'evening', 'night', 'weekend',
      'is_income', 'is_expense',
      'food_keywords', 'transport_keywords', 'shopping_keywords', 
      'entertainment_keywords', 'bills_keywords', 'healthcare_keywords',
      ...this.COMMON_WORDS.map(word => `has_${word}`),
      'word_count', 'char_count', 'long_words_count', 
      'has_numbers', 'has_phone'
    ];
  }

  static getFeatureCount(): number {
    return this.getFeatureNames().length;
  }
}