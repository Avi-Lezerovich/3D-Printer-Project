/**
 * API Test Utility
 * Test if the project management API endpoints are working
 */

import { apiFetch } from '../../../services/api';

export const testAPI = async () => {
  console.info('Testing API endpoints...');
  
  try {
    // Test health endpoint first
    const health = await apiFetch('/api/health');
    console.info('Health check:', health);
    
    // Test project management endpoints
    console.info('Testing tasks endpoint...');
    const tasks = await apiFetch('/api/v1/project-management/tasks');
    console.info('Tasks:', tasks);
    
    console.info('Testing budget categories endpoint...');
    const categories = await apiFetch('/api/v1/project-management/budget/categories');
    console.info('Categories:', categories);
    
    console.info('Testing budget expenses endpoint...');
    const expenses = await apiFetch('/api/v1/project-management/budget/expenses');
    console.info('Expenses:', expenses);
    
    return {
      health: true,
      tasks: true,
      categories: true,
      expenses: true
    };
  } catch (error) {
    console.error('API test failed:', error);
    return {
      health: false,
      tasks: false,
      categories: false,
      expenses: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
