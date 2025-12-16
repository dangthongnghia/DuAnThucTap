import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { recurringStorage } from '../lib/recurringStorage';
import { getData, storeData } from '../lib/storage';
import { Transaction } from '../contexts/DataContext';

const RECURRING_TASK_NAME = 'RECURRING_TRANSACTION_TASK';

const calculateNextDate = (current: Date, frequency: string, interval: number): Date => {
  const next = new Date(current);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + (interval * 7));
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  return next;
};

TaskManager.defineTask(RECURRING_TASK_NAME, async () => {
  try {
    console.log('Running recurring transaction task...');
    const now = new Date();
    const activeRecurring = await recurringStorage.getActive();

    const creatable = activeRecurring.filter(r => 
      r.autoCreate && new Date(r.nextDate) <= now
    );

    if (creatable.length === 0) {
      console.log('No recurring transactions to create.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    let existingTransactions = await getData('transactions') || [];

    for (const recurring of creatable) {
      const nextDate = new Date(recurring.nextDate);

      // Create new transaction
      const newTransaction: Omit<Transaction, 'id'> = {
        title: recurring.name,
        amount: recurring.amount,
        type: recurring.type,
        category: recurring.category,
        date: nextDate.toISOString(),
        note: recurring.description || `Auto-created from recurring: ${recurring.name}`,
        recurringId: recurring.id,
      };
      
      const fullTransaction: Transaction = { ...newTransaction, id: `txn_${Date.now()}` };
      existingTransactions.push(fullTransaction);

      // Update the recurring transaction with the new nextDate
      const updatedNextDate = calculateNextDate(nextDate, recurring.frequency, recurring.interval);
      const updatedRecurring = {
        ...recurring,
        nextDate: updatedNextDate.toISOString(),
        lastCreatedDate: nextDate.toISOString(),
      };
      await recurringStorage.save(updatedRecurring);
    }

    await storeData('transactions', existingTransactions);
    console.log(`Successfully created ${creatable.length} transactions.`);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task for recurring transactions failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerRecurringTask() {
  try {
    await BackgroundFetch.registerTaskAsync(RECURRING_TASK_NAME, {
      minimumInterval: 60 * 60, // 1 hour
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Recurring transaction task registered.');
  } catch (error) {
    console.error('Failed to register recurring task:', error);
  }
}

export async function unregisterRecurringTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(RECURRING_TASK_NAME);
    console.log('Recurring transaction task unregistered.');
  } catch (error) {
    console.error('Failed to unregister recurring task:', error);
  }
}
