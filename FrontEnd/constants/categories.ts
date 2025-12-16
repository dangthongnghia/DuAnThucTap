import { Ionicons } from '@expo/vector-icons';

export interface Category {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  keywords?: string[]; // For smart suggestions
}

export const expenseCategories: Category[] = [
  {
    id: '1',
    title: 'Food & Dining',
    icon: 'restaurant-outline',
    color: '#ef4444',
    keywords: ['lunch', 'dinner', 'breakfast', 'restaurant', 'food', 'cafe', 'coffee'],
  },
  {
    id: '2',
    title: 'Shopping',
    icon: 'cart-outline',
    color: '#f59e0b',
    keywords: ['shop', 'buy', 'purchase', 'store', 'mall', 'clothes'],
  },
  {
    id: '3',
    title: 'Transportation',
    icon: 'car-outline',
    color: '#3b82f6',
    keywords: ['taxi', 'uber', 'grab', 'bus', 'train', 'fuel', 'gas', 'parking'],
  },
  {
    id: '4',
    title: 'Entertainment',
    icon: 'game-controller-outline',
    color: '#8b5cf6',
    keywords: ['movie', 'cinema', 'game', 'concert', 'fun', 'party'],
  },
  {
    id: '5',
    title: 'Bills & Utilities',
    icon: 'receipt-outline',
    color: '#06b6d4',
    keywords: ['bill', 'electricity', 'water', 'internet', 'phone', 'rent'],
  },
  {
    id: '6',
    title: 'Healthcare',
    icon: 'medical-outline',
    color: '#ec4899',
    keywords: ['doctor', 'hospital', 'medicine', 'pharmacy', 'health', 'clinic'],
  },
  {
    id: '7',
    title: 'Education',
    icon: 'school-outline',
    color: '#10b981',
    keywords: ['school', 'course', 'book', 'tuition', 'class', 'learn'],
  },
  {
    id: '8',
    title: 'Subscription',
    icon: 'repeat-outline',
    color: '#6366f1',
    keywords: ['netflix', 'spotify', 'subscription', 'membership', 'premium'],
  },
  {
    id: '9',
    title: 'Fitness',
    icon: 'fitness-outline',
    color: '#14b8a6',
    keywords: ['gym', 'workout', 'fitness', 'yoga', 'sports'],
  },
  {
    id: '10',
    title: 'Travel',
    icon: 'airplane-outline',
    color: '#f97316',
    keywords: ['travel', 'flight', 'hotel', 'vacation', 'trip', 'tour'],
  },
  {
    id: '11',
    title: 'Gifts & Donations',
    icon: 'gift-outline',
    color: '#d946ef',
    keywords: ['gift', 'present', 'donate', 'charity'],
  },
  {
    id: '12',
    title: 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: '#6b7280',
    keywords: [],
  },
];

export const incomeCategories: Category[] = [
  {
    id: '1',
    title: 'Salary',
    icon: 'briefcase-outline',
    color: '#10b981',
    keywords: ['salary', 'wage', 'paycheck', 'income'],
  },
  {
    id: '2',
    title: 'Bonus',
    icon: 'trophy-outline',
    color: '#f59e0b',
    keywords: ['bonus', 'reward', 'incentive'],
  },
  {
    id: '3',
    title: 'Investment',
    icon: 'trending-up-outline',
    color: '#3b82f6',
    keywords: ['stock', 'dividend', 'interest', 'investment', 'profit'],
  },
  {
    id: '4',
    title: 'Freelance',
    icon: 'laptop-outline',
    color: '#8b5cf6',
    keywords: ['freelance', 'project', 'contract', 'gig'],
  },
  {
    id: '5',
    title: 'Gift',
    icon: 'gift-outline',
    color: '#ec4899',
    keywords: ['gift', 'present', 'lucky money'],
  },
  {
    id: '6',
    title: 'Refund',
    icon: 'return-down-back-outline',
    color: '#06b6d4',
    keywords: ['refund', 'return', 'cashback'],
  },
  {
    id: '7',
    title: 'Business',
    icon: 'storefront-outline',
    color: '#14b8a6',
    keywords: ['business', 'sale', 'revenue'],
  },
  {
    id: '8',
    title: 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: '#6b7280',
    keywords: [],
  },
];

// Smart category suggestion based on title
export const suggestCategory = (title: string, type: 'income' | 'expense'): Category | null => {
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const lowerTitle = title.toLowerCase();

  for (const category of categories) {
    if (category.keywords) {
      for (const keyword of category.keywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
  }

  return null;
};
