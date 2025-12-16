import React from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Transaction {
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
}

type Period = 'week' | 'month' | 'year' | 'all';

export const useExportActions = () => {
  const exportToCSV = async (transactions: Transaction[], selectedPeriod: Period) => {
    try {
      const csv = [
        'Date,Type,Category,Amount,Note',
        ...transactions.map(t =>
          `${t.date},${t.type},${t.category},${t.amount},"${t.note}"`
        ),
      ].join('\n');

      const filename = `report_${selectedPeriod}_${new Date().getTime()}.csv`;
      const documentDir = FileSystem.Directory;
      const fileUri = `${documentDir}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert('Xuất file thành công: ' + fileUri);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Không thể xuất file');
    }
  };

  const exportToPDF = async (stats: any, transactions: Transaction[]) => {
    // This would require additional PDF generation library
    // For now, just show alert
    alert('Chức năng xuất PDF sẽ được phát triển trong tương lai');
  };

  const shareReport = async (reportData: any) => {
    try {
      const shareContent = `
Báo cáo tài chính
---
Thu nhập: ${reportData.totalIncome}
Chi tiêu: ${reportData.totalExpense}
Số dư: ${reportData.balance}
Tỷ lệ tiết kiệm: ${reportData.savingsRate}%
      `.trim();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent);
      } else {
        alert('Chia sẻ không khả dụng trên thiết bị này');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Không thể chia sẻ báo cáo');
    }
  };

  return {
    exportToCSV,
    exportToPDF,
    shareReport,
  };
};