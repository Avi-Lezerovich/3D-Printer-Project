import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiWithToasts } from '../useApiWithToasts';
import { ApiError } from '../../services/api';

// Mock the dependencies
vi.mock('../../services/api', () => ({
  apiFetch: vi.fn(),
  ApiError: class MockApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }
}));

vi.mock('../../shared/store', () => ({
  useAppStore: vi.fn()
}));

describe('useApiWithToasts', () => {
  let mockApiFetch: any;
  let mockPushToast: any;
  let mockUseAppStore: any;

  beforeEach(async () => {
    const apiModule = await import('../../services/api');
    const storeModule = await import('../../shared/store');
    
    mockApiFetch = vi.mocked(apiModule.apiFetch);
    mockPushToast = vi.fn();
    mockUseAppStore = vi.mocked(storeModule.useAppStore);
    mockUseAppStore.mockReturnValue(mockPushToast);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns successful API responses without showing toast', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: 'success' });

    const { result } = renderHook(() => useApiWithToasts());
    
    const response = await act(async () => {
      return result.current('/api/test');
    });

    expect(response).toEqual({ data: 'success' });
    expect(mockApiFetch).toHaveBeenCalledWith('/api/test', undefined);
    expect(mockPushToast).not.toHaveBeenCalled();
  });

  it('shows warning toast for client errors (4xx)', async () => {
    const apiError = new ApiError('Bad request', 400);
    mockApiFetch.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useApiWithToasts());
    
    let thrownError;
    await act(async () => {
      try {
        await result.current('/api/test');
      } catch (e) {
        thrownError = e;
      }
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'warning',
      title: 'Error 400',
      message: 'Bad request',
      timeoutMs: 6000
    });
    expect(thrownError).toBe(apiError);
  });

  it('shows error toast for server errors (5xx)', async () => {
    const apiError = new ApiError('Server error', 500);
    mockApiFetch.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useApiWithToasts());
    
    let thrownError;
    await act(async () => {
      try {
        await result.current('/api/test');
      } catch (e) {
        thrownError = e;
      }
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'error',
      title: 'Error 500',
      message: 'Server error',
      timeoutMs: 6000
    });
    expect(thrownError).toBe(apiError);
  });

  it('shows network toast for API errors without status', async () => {
    const apiError = new ApiError('Network error', 0);
    mockApiFetch.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useApiWithToasts());
    
    let thrownError;
    await act(async () => {
      try {
        await result.current('/api/test');
      } catch (e) {
        thrownError = e;
      }
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'warning',
      title: 'Network',
      message: 'Network error',
      timeoutMs: 6000
    });
    expect(thrownError).toBe(apiError);
  });

  it('shows generic error toast for non-API errors', async () => {
    const genericError = new Error('Something went wrong');
    mockApiFetch.mockRejectedValueOnce(genericError);

    const { result } = renderHook(() => useApiWithToasts());
    
    let thrownError;
    await act(async () => {
      try {
        await result.current('/api/test');
      } catch (e) {
        thrownError = e;
      }
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'error',
      title: 'Error',
      message: 'Unexpected failure',
      timeoutMs: 6000
    });
    expect(thrownError).toBe(genericError);
  });

  it('passes options to apiFetch', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: 'success' });

    const { result } = renderHook(() => useApiWithToasts());
    
    const options = { method: 'POST', body: JSON.stringify({ test: true }) };
    await act(async () => {
      return result.current('/api/test', options);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/test', options);
  });
});