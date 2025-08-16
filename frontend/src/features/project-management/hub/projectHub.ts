/**
 * Project Management Hub Facade
 * Bridges legacy combined store expectations with new modular stores
 * Provides aggregated selectors & initialization helper
 */
import { useState } from 'react';
import { useTaskStore } from '../tasks/store/taskStore';
import { useBudgetStore } from '../budget/store/budgetStore';
// Future: import inventory & analytics modular stores when implemented

export interface HubMetrics {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  budget: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    utilizationRate: number;
  };
}

export const useProjectHub = () => {
  const taskState = useTaskStore();
  const budgetState = useBudgetStore();
  const [hubLoading, setHubLoading] = useState(false);

  const taskMetrics = (() => {
    const total = taskState.tasks.length;
    const completed = taskState.tasks.filter(t => t.status === 'done').length;
    const inProgress = taskState.tasks.filter(t => t.status === 'in-progress').length;
    const overdue = taskState.tasks.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()).length;
    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total ? (completed / total) * 100 : 0
    };
  })();

  const budgetMetrics = (() => {
    const totalBudget = budgetState.categories.reduce((s, c) => s + c.budgetedAmount, 0);
    const totalSpent = budgetState.expenses.reduce((s, e) => s + e.amount, 0);
    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      utilizationRate: totalBudget ? (totalSpent / totalBudget) * 100 : 0
    };
  })();

  const metrics: HubMetrics = { tasks: taskMetrics, budget: budgetMetrics } as HubMetrics;

  const initialize = async () => {
    setHubLoading(true);
    try {
      console.info('Initializing project hub data...');
      
      // Create timeout promises to prevent hanging
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('Hub initialization timeout - continuing with current data');
          resolve();
        }, 5000); // 5 second timeout
      });

      // Initialize with mock data as fallback
      const initTasks = taskState.fetchTasks?.().catch(err => {
        console.error('Task fetch error:', err);
        return Promise.resolve();
      });
      
      const initCategories = budgetState.fetchCategories?.().catch(err => {
        console.error('Budget categories fetch error:', err);
        return Promise.resolve();
      });
      
      const initExpenses = budgetState.fetchExpenses?.().catch(err => {
        console.error('Budget expenses fetch error:', err);
        return Promise.resolve();
      });
      
      const initMetrics = budgetState.fetchMetrics?.().catch(err => {
        console.error('Budget metrics fetch error:', err);
        return Promise.resolve();
      });

      // Race the initialization against timeout
      await Promise.race([
        Promise.allSettled([
          initTasks,
          initCategories,
          initExpenses,
          initMetrics
        ]),
        timeoutPromise
      ]);
      
      console.info('Project hub data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize project hub:', error);
    } finally {
      setHubLoading(false);
    }
  };

  return {
    tasks: taskState.tasks,
    categories: budgetState.categories,
    expenses: budgetState.expenses,
    loading: hubLoading || taskState.loading || budgetState.loading,
    error: taskState.error || budgetState.error,
    metrics,
    initialize,
  };
};
