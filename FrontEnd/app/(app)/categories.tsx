import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Modal, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/api/useCategories';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Edit2, Trash2, Check, X } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriesScreen() {
    const { data: categories = [], isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();
    const { t } = useTranslation();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    // Form state
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('help-circle-outline');
    const [color, setColor] = useState('#7C3AED');

    const filteredCategories = categories.filter(c => c.type === activeTab);

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setIcon(category.icon || 'help-circle-outline');
            setColor(category.color || '#7C3AED');
        } else {
            setEditingCategory(null);
            setName('');
            setIcon('help-circle-outline');
            setColor('#7C3AED');
        }
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
            return;
        }

        try {
            if (editingCategory) {
                await updateMutation.mutateAsync({ id: editingCategory.id, data: { name, icon, color } });
            } else {
                await createMutation.mutateAsync({ name, type: activeTab, icon, color });
            }
            setIsModalVisible(false);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu danh mục');
        }
    };

    const handleDelete = (id: string, isSystem: boolean) => {
        if (isSystem) {
            Alert.alert('Thông báo', 'Không thể xóa danh mục hệ thống');
            return;
        }

        Alert.alert(
            'Xóa danh mục',
            'Bạn có chắc chắn muốn xóa danh mục này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => deleteMutation.mutateAsync(id)
                }
            ]
        );
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between bg-background">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 p-2 -ml-2 rounded-full active:bg-secondary"
                    >
                        <ArrowLeft size={24} color={theme.foreground} />
                    </TouchableOpacity>
                    <Typography variant="h3">Danh mục</Typography>
                </View>
                <TouchableOpacity
                    onPress={() => handleOpenModal()}
                    className="bg-primary/10 p-2 rounded-full"
                >
                    <Plus size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="px-6 mt-4 flex-row gap-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('expense')}
                    className={`flex-1 py-3 items-center rounded-2xl border ${activeTab === 'expense' ? 'bg-primary border-primary' : 'bg-transparent border-border'
                        }`}
                >
                    <Typography className={activeTab === 'expense' ? 'text-white font-bold' : 'text-muted-foreground'}>
                        Chi tiêu
                    </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('income')}
                    className={`flex-1 py-3 items-center rounded-2xl border ${activeTab === 'income' ? 'bg-primary border-primary' : 'bg-transparent border-border'
                        }`}
                >
                    <Typography className={activeTab === 'income' ? 'text-white font-bold' : 'text-muted-foreground'}>
                        Thu nhập
                    </Typography>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {filteredCategories.map((cat) => (
                    <Card key={cat.id} className="flex-row items-center justify-between p-4 mb-3 border border-border/50">
                        <View className="flex-row items-center gap-4">
                            <View
                                style={{ backgroundColor: `${cat.color}20` }}
                                className="h-12 w-12 rounded-full items-center justify-center"
                            >
                                <Ionicons name={cat.icon as any || 'help-circle-outline'} size={24} color={cat.color || theme.primary} />
                            </View>
                            <View>
                                <Typography variant="body" className="font-semibold">{cat.name}</Typography>
                                {cat.isSystem && (
                                    <Typography variant="caption" className="text-muted-foreground italic">Mặc định</Typography>
                                )}
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => handleOpenModal(cat)}
                                className="p-2 bg-secondary/50 rounded-full"
                            >
                                <Edit2 size={18} color={theme.mutedForeground} />
                            </TouchableOpacity>
                            {!cat.isSystem && (
                                <TouchableOpacity
                                    onPress={() => handleDelete(cat.id, !!cat.isSystem)}
                                    className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"
                                >
                                    <Trash2 size={18} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                ))}

                {filteredCategories.length === 0 && (
                    <View className="items-center py-10">
                        <Typography className="text-muted-foreground">Chưa có danh mục nào</Typography>
                    </View>
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-background rounded-t-[40px] p-6 pb-12 shadow-2xl">
                        <View className="flex-row items-center justify-between mb-6">
                            <Typography variant="h3">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</Typography>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={24} color={theme.foreground} />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-6">
                            <View>
                                <Typography variant="caption" className="mb-2 ml-1">Tên danh mục</Typography>
                                <View className="bg-secondary/50 rounded-2xl px-4 py-3 flex-row items-center">
                                    <TextInput
                                        className="flex-1 text-base text-foreground font-medium"
                                        placeholder="VD: Cà phê, Lương..."
                                        value={name}
                                        onChangeText={setName}
                                        placeholderTextColor={theme.mutedForeground}
                                    />
                                </View>
                            </View>

                            <View>
                                <Typography variant="caption" className="mb-2 ml-1">Màu sắc</Typography>
                                <View className="flex-row flex-wrap gap-4">
                                    {['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#8E8E93'].map(c => (
                                        <TouchableOpacity
                                            key={c}
                                            onPress={() => setColor(c)}
                                            style={{ backgroundColor: c }}
                                            className="h-10 w-10 rounded-full items-center justify-center"
                                        >
                                            {color === c && <Check size={20} color="white" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <Button
                                label={editingCategory ? "Cập nhật" : "Thêm mới"}
                                onPress={handleSave}
                                className="mt-4"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
