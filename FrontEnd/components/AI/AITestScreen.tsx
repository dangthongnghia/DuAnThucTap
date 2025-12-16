import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CategoryClassifier, TrainingDataCollector } from '../../services/ai';

export const AITestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [classifier] = useState(new CategoryClassifier());

  const testCases = [
    { description: 'Cà phê Highland Coffee', amount: 45000, type: 'expense' as const },
    { description: 'Grab từ nhà về công ty', amount: 25000, type: 'expense' as const },
    { description: 'Mua áo tại Uniqlo', amount: 299000, type: 'expense' as const },
    { description: 'Xem phim CGV', amount: 85000, type: 'expense' as const },
    { description: 'Tiền điện tháng 11', amount: 450000, type: 'expense' as const },
    { description: 'Khám bệnh tại bệnh viện', amount: 150000, type: 'expense' as const },
    { description: 'Xăng xe máy', amount: 120000, type: 'expense' as const },
    { description: 'Lương tháng 11', amount: 15000000, type: 'income' as const },
    { description: 'Ăn trưa cơm văn phòng', amount: 35000, type: 'expense' as const },
    { description: 'Mua sách trên Shopee', amount: 89000, type: 'expense' as const },
  ];

  const runTests = async () => {
    setTestResults([]);
    const results = [];

    for (const testCase of testCases) {
      try {
        const prediction = await classifier.predict({
          description: testCase.description,
          amount: testCase.amount,
          date: new Date()
        });

        results.push({
          ...testCase,
          predicted: prediction.category,
          confidence: prediction.confidence,
          success: true
        });
      } catch (error) {
        results.push({
          ...testCase,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    setTestResults(results);
  };

  const clearTrainingData = async () => {
    try {
      await TrainingDataCollector.clearTrainingData();
      Alert.alert('Thành công', 'Đã xóa dữ liệu huấn luyện');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa dữ liệu');
    }
  };

  const showTrainingStats = async () => {
    try {
      const stats = await TrainingDataCollector.getTrainingStats();
      Alert.alert(
        'Thống kê Training Data',
        `Tổng mẫu: ${stats.totalSamples}\nĐộ chính xác: ${(stats.accuracy * 100).toFixed(1)}%\n\nPhân bố danh mục:\n${Object.entries(stats.categoryCounts).map(([cat, count]) => `${cat}: ${count}`).join('\n')}`
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy thống kê');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6">
        AI Category Classification Test
      </Text>

      {/* Control Buttons */}
      <View className="flex-row gap-2 mb-6">
        <TouchableOpacity
          className="flex-1 bg-blue-500 py-3 px-4 rounded-lg"
          onPress={runTests}
        >
          <Text className="text-white font-semibold text-center">
            Chạy Test
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-green-500 py-3 px-4 rounded-lg"
          onPress={showTrainingStats}
        >
          <Text className="text-white font-semibold text-center">
            Thống kê
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-red-500 py-3 px-4 rounded-lg"
          onPress={clearTrainingData}
        >
          <Text className="text-white font-semibold text-center">
            Xóa Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View className="bg-white rounded-lg p-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Kết quả Test:
          </Text>

          {testResults.map((result, index) => (
            <View
              key={index}
              className={`p-3 mb-2 rounded-lg border ${
                result.success
                  ? result.confidence > 0.7
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <Text className="font-semibold text-gray-900">
                {result.description}
              </Text>
              <Text className="text-sm text-gray-600">
                Số tiền: {result.amount.toLocaleString()} VND
              </Text>

              {result.success ? (
                <View className="mt-1">
                  <Text className="text-sm font-medium text-blue-600">
                    Dự đoán: {result.predicted}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Độ tin cậy: {(result.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ) : (
                <Text className="text-sm text-red-600 mt-1">
                  Lỗi: {result.error}
                </Text>
              )}
            </View>
          ))}

          {/* Summary */}
          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text className="font-semibold text-blue-900">
              Tóm tắt:
            </Text>
            <Text className="text-sm text-blue-700">
              - Tổng test cases: {testResults.length}
            </Text>
            <Text className="text-sm text-blue-700">
              - Thành công: {testResults.filter(r => r.success).length}
            </Text>
            <Text className="text-sm text-blue-700">
              - Độ tin cậy cao ({'>'}70%): {testResults.filter(r => r.success && r.confidence > 0.7).length}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};