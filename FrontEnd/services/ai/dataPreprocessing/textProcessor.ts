export class TextProcessor {
  // Làm sạch và chuẩn hóa text
  static preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, ' ') // Thay nhiều space bằng 1 space
      .trim();
  }

  // Trích xuất features từ text
  static extractFeatures(text: string): { [key: string]: number } {
    const words = this.preprocessText(text).split(' ');
    const features: { [key: string]: number } = {};
    
    // Bag of Words
    words.forEach(word => {
      if (word.length > 2) { // Bỏ qua từ quá ngắn
        features[`word_${word}`] = (features[`word_${word}`] || 0) + 1;
      }
    });

    // Thêm features về length, số từ
    features['text_length'] = text.length;
    features['word_count'] = words.length;
    
    return features;
  }

  // Detect Vietnamese keywords for specific categories
  static detectVietnameseKeywords(text: string): { [category: string]: number } {
    const keywords = {
      'Food & Dining': [
        'cà phê', 'coffee', 'ăn', 'uống', 'nhà hàng', 'quán', 'món', 'cơm', 
        'phở', 'bún', 'bánh', 'trà', 'nước', 'gà', 'thịt', 'cá', 'tôm', 
        'pizza', 'hamburger', 'kfc', 'lotteria', 'highland', 'starbucks',
        'food', 'restaurant', 'cafe', 'drink', 'meal', 'lunch', 'dinner', 'breakfast'
      ],
      'Transportation': [
        'xe', 'bus', 'taxi', 'grab', 'uber', 'xăng', 'petrol', 'gas', 'oto', 
        'xe máy', 'motorcycle', 'car', 'fuel', 'parking', 'đậu xe', 'vé xe',
        'ticket', 'metro', 'subway', 'train', 'tàu', 'máy bay', 'flight'
      ],
      'Shopping': [
        'mua', 'shopping', 'shop', 'mall', 'siêu thị', 'cửa hàng', 'store',
        'vinmart', 'coopmart', 'bigc', 'lotte', 'aeon', 'shopee', 'lazada',
        'quần áo', 'áo', 'quần', 'giày', 'dép', 'túi', 'clothes', 'shoes', 'bag'
      ],
      'Entertainment': [
        'phim', 'movie', 'cinema', 'cgv', 'lotte cinema', 'galaxy', 'netflix',
        'youtube', 'spotify', 'game', 'chơi', 'vui chơi', 'giải trí', 'karaoke',
        'bar', 'pub', 'club', 'concert', 'show', 'entertainment'
      ],
      'Bills & Utilities': [
        'điện', 'nước', 'gas', 'internet', 'wifi', 'điện thoại', 'phone',
        'bill', 'hóa đơn', 'tiền nhà', 'rent', 'thuê', 'electricity', 'water'
      ],
      'Healthcare': [
        'bệnh viện', 'hospital', 'doctor', 'bác sĩ', 'thuốc', 'medicine',
        'pharmacy', 'nhà thuốc', 'khám bệnh', 'medical', 'health', 'sức khỏe'
      ]
    };

    const categoryScores: { [category: string]: number } = {};
    const processedText = this.preprocessText(text);

    Object.entries(keywords).forEach(([category, keywordList]) => {
      let score = 0;
      keywordList.forEach(keyword => {
        if (processedText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      categoryScores[category] = score;
    });

    return categoryScores;
  }
}