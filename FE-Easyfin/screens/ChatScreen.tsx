import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock Messages
const MOCK_MESSAGES = [
  { id: '1', text: 'Xin chào! Tôi là trợ lý tài chính EasyFin của bạn. Tôi có thể giúp gì hôm nay?', sender: 'bot', time: '09:00' },
  { id: '2', text: 'Chào bạn, làm sao để tôi tiết kiệm 5 triệu trong tháng này?', sender: 'user', time: '09:05' },
  { id: '3', text: 'Để tiết kiệm 5 triệu, bạn có thể thử cắt giảm chi phí ăn uống ngoài và hủy các gói đăng ký không cần thiết. Tôi có thể lập kế hoạch chi tiết cho bạn nếu bạn muốn.', sender: 'bot', time: '09:06' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulate Bot Response
    setTimeout(() => {
        const botResponse = {
            id: (Date.now() + 1).toString(),
            text: 'Cảm ơn câu hỏi của bạn. Tôi đang phân tích dữ liệu...',
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const renderItem = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => {
    const isUser = item.sender === 'user';
    return (
      <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-2">
             <MaterialCommunityIcons name="robot" size={20} color="#10B981" />
          </View>
        )}
        <View
          className={`px-4 py-3 max-w-[75%] rounded-2xl ${
            isUser ? 'bg-emerald-500 rounded-tr-none' : 'bg-gray-100 rounded-tl-none'
          }`}
        >
          <Text className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {item.text}
          </Text>
          <Text className={`text-[10px] mt-1 text-right ${isUser ? 'text-emerald-100' : 'text-gray-400'}`}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">Trợ lý EasyFin</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              <Text className="text-xs text-green-500">Đang hoạt động</Text>
            </View>
          </View>
          <TouchableOpacity>
             <MaterialCommunityIcons name="dots-vertical" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <View className="flex-row items-center p-3 border-t border-gray-100 bg-white pb-6">
          <TouchableOpacity className="p-2 mr-2">
             <MaterialCommunityIcons name="plus-circle-outline" size={28} color="#9CA3AF" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-2">
            <TextInput
              className="flex-1 text-gray-800 max-h-24"
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity 
            onPress={sendMessage}
            className={`p-3 rounded-full ${inputText.trim() ? 'bg-emerald-500' : 'bg-gray-200'}`}
            disabled={!inputText.trim()}
          >
             <MaterialCommunityIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
