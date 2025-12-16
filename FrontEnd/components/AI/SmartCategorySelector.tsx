import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryClassifier, TrainingDataCollector } from '../../services/ai';
import { useSettings } from '../../contexts/SettingsContext';
import { Transaction } from '../../types/transaction';

interface SmartCategorySelectorProps {
  description: string;
  amount: number;
  date: Date;
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
}

export const SmartCategorySelector: React.FC<SmartCategorySelectorProps> = ({
  description,
  amount,
  date,
  onCategorySelect,
  selectedCategory
}) => {
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    confidence: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [classifier] = useState(new CategoryClassifier());
  const { isDarkMode } = useSettings();

  useEffect(() => {
    if (description.length > 2) {
      predictCategory();
    }
  }, [description, amount]);

  const predictCategory = async () => {
    setIsLoading(true);
    try {
      const prediction = await classifier.predict({ description, amount, date });
      setAiSuggestion(prediction);
      
      // Auto-select if confidence is high
      if (prediction.confidence > 0.8 && !selectedCategory) {
        onCategorySelect(prediction.category);
      }
    } catch (error) {
      console.error('AI prediction error:', error);
    }
    setIsLoading(false);
  };

  const handleCategoryAccept = () => {
    if (aiSuggestion) {
      onCategorySelect(aiSuggestion.category);
      // Collect training data
      const now = new Date().toISOString();
      TrainingDataCollector.collectTrainingData(
        { 
          id: '', 
          title: 'AI Suggestion',
          description,
          amount, 
          type: 'expense',
          category: '',
          date: date.toISOString(),
          note: '',
          createdAt: now,
          updatedAt: now
        } as Transaction,
        aiSuggestion.category,
        aiSuggestion.category,
        true
      );
    }
  };

  const handleCategoryReject = () => {
    // Show manual category selector
    // Collect negative training data if user selects different category
  };

  if (isLoading) {
    return (
      <View className={`p-4 rounded-xl mx-4 my-2 shadow-sm border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color={isDarkMode ? "#a78bfa" : "#7f3dff"} />
          <Text className={`text-sm italic ml-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            AI đang phân tích...
          </Text>
        </View>
      </View>
    );
  }

  if (!aiSuggestion) return null;

  return (
    <View className={`p-4 rounded-xl mx-4 my-2 shadow-sm border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <View className={`p-4 rounded-xl border ${
        isDarkMode 
          ? 'bg-violet-900/30 border-violet-800' 
          : 'bg-violet-50 border-violet-200'
      }`}>
        {/* Header with AI icon and confidence */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons 
              name="sparkles" 
              size={16} 
              color={isDarkMode ? "#a78bfa" : "#7f3dff"} 
            />
            <Text className={`text-xs font-semibold ml-1 ${
              isDarkMode ? 'text-violet-400' : 'text-violet-600'
            }`}>
              AI Gợi ý
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${
            isDarkMode ? 'bg-violet-600' : 'bg-violet-500'
          }`}>
            <Text className="text-white text-xs font-semibold">
              {Math.round(aiSuggestion.confidence * 100)}%
            </Text>
          </View>
        </View>

        {/* Suggested category name */}
        <Text className={`text-lg font-semibold mb-3 ${
          isDarkMode ? 'text-violet-300' : 'text-violet-900'
        }`}>
          {aiSuggestion.category}
        </Text>

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-lg ${
              isDarkMode ? 'bg-violet-600' : 'bg-violet-500'
            }`}
            onPress={handleCategoryAccept}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text className="text-white text-sm font-medium ml-1">
              Chấp nhận
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 border flex-row items-center justify-center py-2 px-4 rounded-lg ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-300 bg-white'
            }`}
            onPress={handleCategoryReject}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="close" 
              size={16} 
              color={isDarkMode ? "#9ca3af" : "#6b7280"} 
            />
            <Text className={`text-sm font-medium ml-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Khác
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confidence indicator bar */}
        <View className="mt-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-xs ${
              isDarkMode ? 'text-violet-400' : 'text-violet-600'
            }`}>
              Độ tin cậy
            </Text>
            <Text className={`text-xs font-medium ${
              isDarkMode ? 'text-violet-400' : 'text-violet-600'
            }`}>
              {aiSuggestion.confidence > 0.8 ? 'Cao' : 
               aiSuggestion.confidence > 0.6 ? 'Trung bình' : 'Thấp'}
            </Text>
          </View>
          <View className={`h-2 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-violet-800' : 'bg-violet-200'
          }`}>
            <View 
              className={`h-full rounded-full transition-all duration-300 ${
                isDarkMode ? 'bg-violet-500' : 'bg-violet-600'
              }`}
              style={{ width: `${aiSuggestion.confidence * 100}%` }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};