import { TextProcessor } from '../dataPreprocessing/textProcessor';
import { FeatureExtractor } from '../dataPreprocessing/featureExtractor';

export class CategoryClassifier {
  private categories: string[] = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Investment',
    'Other'
  ];

  private rules = [
    // Food & Dining rules
    {
      category: 'Food & Dining',
      conditions: (desc: string, amount: number, hour: number) => {
        const keywordScore = TextProcessor.detectVietnameseKeywords(desc)['Food & Dining'] || 0;
        const isLunchTime = (hour >= 11 && hour <= 14);
        const isDinnerTime = (hour >= 17 && hour <= 20);
        const isMealAmount = amount >= 15000 && amount <= 500000;
        
        return keywordScore > 0 || (isMealAmount && (isLunchTime || isDinnerTime));
      },
      confidence: 0.8
    },
    
    // Transportation rules  
    {
      category: 'Transportation',
      conditions: (desc: string, amount: number, hour: number) => {
        const keywordScore = TextProcessor.detectVietnameseKeywords(desc)['Transportation'] || 0;
        const isCommutingTime = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 19);
        const isFuelAmount = amount >= 50000 && amount <= 2000000;
        const isRideAmount = amount >= 10000 && amount <= 200000;
        
        return keywordScore > 0 || 
               (isFuelAmount && desc.toLowerCase().includes('xăng')) ||
               (isRideAmount && isCommutingTime);
      },
      confidence: 0.75
    },
    
    // Shopping rules
    {
      category: 'Shopping',
      conditions: (desc: string, amount: number, hour: number) => {
        const keywordScore = TextProcessor.detectVietnameseKeywords(desc)['Shopping'] || 0;
        const isShoppingTime = hour >= 9 && hour <= 22;
        const isShoppingAmount = amount >= 20000;
        
        return keywordScore > 0 || 
               (isShoppingAmount && isShoppingTime && 
                (desc.toLowerCase().includes('mua') || 
                 desc.toLowerCase().includes('shop')));
      },
      confidence: 0.7
    },
    
    // Entertainment rules
    {
      category: 'Entertainment',
      conditions: (desc: string, amount: number, hour: number) => {
        const keywordScore = TextProcessor.detectVietnameseKeywords(desc)['Entertainment'] || 0;
        const isEveningTime = hour >= 18 && hour <= 23;
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
        
        return keywordScore > 0 || 
               (isEveningTime && isWeekend && amount >= 50000);
      },
      confidence: 0.65
    },
    
    // Bills & Utilities rules
    {
      category: 'Bills & Utilities',
      conditions: (desc: string, amount: number, hour: number) => {
        const keywordScore = TextProcessor.detectVietnameseKeywords(desc)['Bills & Utilities'] || 0;
        const isBillAmount = amount >= 100000 && amount <= 5000000;
        const dayOfMonth = new Date().getDate();
        const isPaymentDay = dayOfMonth >= 1 && dayOfMonth <= 10; // Usually pay bills early month
        
        return keywordScore > 0 || 
               (isBillAmount && isPaymentDay && 
                (desc.toLowerCase().includes('tiền') || 
                 desc.toLowerCase().includes('bill')));
      },
      confidence: 0.8
    },
    
    // Healthcare rules
    {
      category: 'Healthcare',
      conditions: (desc: string, amount: number, hour: number) => {
        const keywordScore = TextProcessor.detectVietnameseKeywords(desc)['Healthcare'] || 0;
        const isHealthAmount = amount >= 20000 && amount <= 2000000;
        
        return keywordScore > 0 || 
               (isHealthAmount && 
                (desc.toLowerCase().includes('khám') || 
                 desc.toLowerCase().includes('bệnh')));
      },
      confidence: 0.85
    }
  ];

  async predict(transaction: {
    description: string;
    amount: number;
    date: Date;
  }): Promise<{ category: string; confidence: number }> {
    
    const hour = transaction.date.getHours();
    let bestMatch = { category: 'Other', confidence: 0.3 };
    
    // Apply rules
    for (const rule of this.rules) {
      if (rule.conditions(transaction.description, transaction.amount, hour)) {
        if (rule.confidence > bestMatch.confidence) {
          bestMatch = {
            category: rule.category,
            confidence: rule.confidence
          };
        }
      }
    }
    
    // Enhance confidence based on keyword strength
    const allKeywordScores = TextProcessor.detectVietnameseKeywords(transaction.description);
    const maxKeywordScore = Math.max(...Object.values(allKeywordScores));
    
    if (maxKeywordScore > 1) {
      bestMatch.confidence = Math.min(0.95, bestMatch.confidence + 0.1);
    }
    
    // Lower confidence for very generic descriptions
    if (transaction.description.length < 5 || 
        transaction.description.toLowerCase().includes('other') ||
        transaction.description.toLowerCase().includes('khác')) {
      bestMatch.confidence *= 0.7;
    }
    
    return bestMatch;
  }

  async initializeModel(): Promise<void> {
    // No initialization needed for rule-based model
    console.log('Rule-based classifier ready');
  }

  async trainModel(trainingData: any[]): Promise<void> {
    // Future: Use training data to improve rules or train ML model
    console.log(`Training with ${trainingData.length} samples`);
    
    // For now, we can analyze the training data to improve rules
    const categoryStats = this.analyzeTrainingData(trainingData);
    console.log('Category distribution:', categoryStats);
  }

  private analyzeTrainingData(data: any[]): { [category: string]: number } {
    const stats: { [category: string]: number } = {};
    
    data.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1;
    });
    
    return stats;
  }

  getCategories(): string[] {
    return this.categories;
  }

  // Save/load methods (placeholder for future ML model)
  async saveModel(): Promise<void> {
    console.log('Rule-based model saved (no actual saving needed)');
  }

  async loadModel(): Promise<void> {
    console.log('Rule-based model loaded');
  }
}