import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SheetBottom } from './SheetBottom';
import RadioList from '../List/RadioList';
import { useData, SortOrder, Filters } from '../../contexts/DataContext';
import { theme } from '../../constants/theme';
import { useSettings } from '../../contexts/SettingsContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const sortOptions = [
  { id: 'date-desc', title: 'Date (Newest First)' },
  { id: 'date-asc', title: 'Date (Oldest First)' },
  { id: 'amount-desc', title: 'Amount (Highest First)' },
  { id: 'amount-asc', title: 'Amount (Lowest First)' },
];

const typeOptions = [
  { id: 'all', title: 'All' },
  { id: 'income', title: 'Income' },
  { id: 'expense', title: 'Expense' },
];

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const { sortOrder, setSortOrder, filters, setFilters, transactions } = useData();
  const { isDarkMode } = useSettings();

  // Local state for the modal that is only applied on press
const [localSort, setLocalSort] = useState<SortOrder>(sortOrder);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const availableCategories = useMemo(() => {
      const allCategories = transactions.map(t => t.category);
      const uniqueCategories = [...new Set(allCategories)];
      const categoryOptions = uniqueCategories.map(c => ({id: c, title: c}));
      return [{id: 'all', title: 'All Categories'}, ...categoryOptions];
  }, [transactions]);


  const handleApply = () => {
    setSortOrder(localSort);
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
      const defaultFilters: Filters = { type: 'all', category: null, startDate: null, endDate: null };
      setLocalSort('date-desc');
      setLocalFilters(defaultFilters);
      // Apply immediately
      setSortOrder('date-desc');
      setFilters(defaultFilters);
      onClose();
  }

  const styles = getDynamicStyles(isDarkMode);

  return (
      <SheetBottom type="FilterTransaction" visible={visible} onClose={onClose} title="Filter & Sort">
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <RadioList items={sortOptions} selectedId={localSort} onSelect={(id) => setLocalSort(id as SortOrder)} />

        <Text style={styles.sectionTitle}>Filter by Type</Text>
        <RadioList items={typeOptions} selectedId={localFilters.type} onSelect={(id) => setLocalFilters(f => ({...f, type: id as Filters['type']}))} />
        
        <Text style={styles.sectionTitle}>Filter by Category</Text>
        <RadioList items={availableCategories} selectedId={localFilters.category || 'all'} onSelect={(id) => setLocalFilters(f => ({...f, category: id === 'all' ? null : id}))} />

        <Text style={styles.sectionTitle}>Filter by Date Range</Text>
        <View style={styles.dateInputContainer}>
            <TextInput 
                style={[styles.dateInput, {marginRight: 8}]}
                placeholder="Start Date (YYYY-MM-DD)"
                placeholderTextColor={theme.colors.baseLightLight20}
                value={localFilters.startDate || ''}
                onChangeText={(text) => setLocalFilters(f => ({...f, startDate: text || null}))}
            />
            <TextInput 
                style={styles.dateInput}
                placeholder="End Date (YYYY-MM-DD)"
                placeholderTextColor={theme.colors.baseLightLight20}
                value={localFilters.endDate || ''}
                onChangeText={(text) => setLocalFilters(f => ({...f, endDate: text || null}))}
            />
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SheetBottom>
  );
}

const getDynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: { padding: 16, paddingBottom: 32 },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginTop: 16, 
        marginBottom: 8, 
        color: isDarkMode ? '#E5E7EB' : theme.colors.baseDarkDark50 
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: isDarkMode ? '#4B5563' : theme.colors.baseLightLight40,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: isDarkMode ? '#F3F4F6' : theme.colors.baseDarkDark75,
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        flex: 1,
    },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 24 },
    button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    applyButton: { backgroundColor: theme.colors.violetViolet100, marginLeft: 8 },
    resetButton: { backgroundColor: theme.colors.baseLightLight40, marginRight: 8 },
    applyButtonText: { color: 'white', fontWeight: 'bold' },
    resetButtonText: { color: theme.colors.baseDarkDark75, fontWeight: 'bold' },
});
