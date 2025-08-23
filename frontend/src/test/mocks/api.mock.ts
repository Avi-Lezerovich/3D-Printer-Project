/**
 * API mocking utilities
 * Enhanced mocking for API calls with realistic responses and error scenarios
 */

/**
 * Mock API response types
 */
export interface MockApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface MockApiError {
  message: string
  status: number
  code?: string
  details?: any
}

/**
 * Enhanced API mock utilities
 */
export class ApiMockUtils {
  private static mockResponses = new Map<string, MockApiResponse>()
  private static mockErrors = new Map<string, MockApiError>()
  
  /**
   * Set mock response for specific endpoint
   */
  static setMockResponse<T>(
    endpoint: string,
    data: T,
    status: number = 200,
    headers: Record<string, string> = {}
  ) {
    this.mockResponses.set(endpoint, {
      data,
      status,
      statusText: this.getStatusText(status),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
  }
  
  /**
   * Set mock error for specific endpoint
   */
  static setMockError(endpoint: string, error: MockApiError) {
    this.mockErrors.set(endpoint, error)
  }
  
  /**
   * Get mock response for endpoint
   */
  static getMockResponse(endpoint: string): MockApiResponse | undefined {
    return this.mockResponses.get(endpoint)
  }
  
  /**
   * Get mock error for endpoint
   */
  static getMockError(endpoint: string): MockApiError | undefined {
    return this.mockErrors.get(endpoint)
  }
  
  /**
   * Clear all mocks
   */
  static clearAll() {
    this.mockResponses.clear()
    this.mockErrors.clear()
  }
  
  /**
   * Create realistic API responses
   */
  static createRealisticResponses() {
    // Projects
    this.setMockResponse('/api/v1/projects', {
      projects: [
        {
          id: '1',
          name: '3D Printer Enclosure',
          status: 'active',
          progress: 75,
          tasks: 12,
          completedTasks: 9
        },
        {
          id: '2',
          name: 'Custom Print Parts',
          status: 'completed',
          progress: 100,
          tasks: 8,
          completedTasks: 8
        }
      ],
      total: 2,
      page: 1,
      pageSize: 10
    })
    
    // Tasks
    this.setMockResponse('/api/v1/tasks', {
      tasks: [
        {
          id: '1',
          title: 'Design printer frame',
          status: 'completed',
          priority: 'high',
          projectId: '1',
          assigneeId: 'user-1',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-16T14:30:00Z'
        },
        {
          id: '2',
          title: 'Test print quality',
          status: 'in-progress',
          priority: 'medium',
          projectId: '1',
          assigneeId: 'user-1',
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-16T15:00:00Z'
        }
      ]
    })
    
    // Printer status
    this.setMockResponse('/api/v1/printer/status', {
      id: 'printer-1',
      status: 'printing',
      temperature: {
        nozzle: 210,
        bed: 60,
        target: {
          nozzle: 210,
          bed: 60
        }
      },
      progress: 45,
      currentJob: {
        name: 'test-model.gcode',
        timeElapsed: 3600,
        timeRemaining: 4320,
        layerCount: 250,
        currentLayer: 112
      },
      lastUpdate: new Date().toISOString()
    })
    
    // File upload
    this.setMockResponse('/api/v1/files/upload', {
      files: [
        {
          id: 'file-1',
          name: 'test-model.gcode',
          size: 1024,
          type: 'gcode',
          uploadedAt: new Date().toISOString()
        }
      ],
      jobId: 'job-123'
    }, 201)
    
    // Authentication
    this.setMockResponse('/api/v1/auth/me', {
      id: 'user-1',
      email: 'test@example.com',
      role: 'user',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    })
  }
  
  /**
   * Create error scenarios
   */
  static createErrorScenarios() {
    // Network error
    this.setMockError('/api/v1/projects/error', {
      message: 'Network error',
      status: 0,
      code: 'NETWORK_ERROR'
    })
    
    // Unauthorized
    this.setMockError('/api/v1/tasks/unauthorized', {
      message: 'Unauthorized access',
      status: 401,
      code: 'UNAUTHORIZED'
    })
    
    // Validation error
    this.setMockError('/api/v1/tasks/validation', {
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: {
        title: 'Title is required',
        priority: 'Priority must be low, medium, or high'
      }
    })
    
    // Server error
    this.setMockError('/api/v1/printer/server-error', {
      message: 'Internal server error',
      status: 500,
      code: 'INTERNAL_SERVER_ERROR'
    })
    
    // File too large
    this.setMockError('/api/v1/files/upload/large', {
      message: 'File too large',
      status: 413,
      code: 'FILE_TOO_LARGE',
      details: {
        maxSize: '10MB',
        receivedSize: '15MB'
      }
    })
  }
  
  private static getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      413: 'Payload Too Large',
      500: 'Internal Server Error'
    }
    return statusTexts[status] || 'Unknown'
  }
}

/**
 * Mock fetch function for API testing
 */
export function createMockFetch() {
  return vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    const method = options?.method || 'GET'
    const endpoint = `${method.toUpperCase()} ${url}`
    
    // Check for mock error first
    const mockError = ApiMockUtils.getMockError(url) || ApiMockUtils.getMockError(endpoint)
    if (mockError) {
      throw new Error(mockError.message)
    }
    
    // Return mock response
    const mockResponse = ApiMockUtils.getMockResponse(url) || ApiMockUtils.getMockResponse(endpoint)
    if (mockResponse) {
      return {
        ok: mockResponse.status >= 200 && mockResponse.status < 300,
        status: mockResponse.status,
        statusText: mockResponse.statusText,
        headers: new Headers(mockResponse.headers),
        json: () => Promise.resolve(mockResponse.data),
        text: () => Promise.resolve(JSON.stringify(mockResponse.data))
      }
    }
    
    // Default response
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}')
    }
  })
}

/**
 * React Query test utilities
 */
export class ReactQueryTestUtils {
  /**
   * Create mock query client
   */
  static createMockQueryClient() {
    const queryCache = new Map()
    
    return {
      getQueryData: vi.fn((key) => queryCache.get(JSON.stringify(key))),
      setQueryData: vi.fn((key, data) => queryCache.set(JSON.stringify(key), data)),
      invalidateQueries: vi.fn(),
      refetchQueries: vi.fn(),
      clear: vi.fn(() => queryCache.clear())
    }
  }
  
  /**
   * Mock useQuery hook
   */
  static mockUseQuery(data: any, isLoading = false, error: any = null) {
    return {
      data,
      isLoading,
      isError: !!error,
      error,
      isSuccess: !isLoading && !error,
      refetch: vi.fn(),
      isFetching: isLoading
    }
  }
  
  /**
   * Mock useMutation hook
   */
  static mockUseMutation(
    mutationFn = vi.fn(),
    options: { isLoading?: boolean; error?: any } = {}
  ) {
    return {
      mutate: vi.fn((data) => {
        mutationFn(data)
        if (options.error) {
          throw options.error
        }
      }),
      mutateAsync: vi.fn().mockImplementation(async (data) => {
        if (options.error) {
          throw options.error
        }
        return mutationFn(data)
      }),
      isLoading: options.isLoading || false,
      isError: !!options.error,
      error: options.error,
      reset: vi.fn()
    }
  }
}

/**
 * API test scenarios
 */
export const apiTestScenarios = {
  /**
   * Successful data fetching
   */
  successfulFetch: {
    projects: () => ApiMockUtils.getMockResponse('/api/v1/projects')?.data,
    tasks: () => ApiMockUtils.getMockResponse('/api/v1/tasks')?.data,
    printerStatus: () => ApiMockUtils.getMockResponse('/api/v1/printer/status')?.data
  },
  
  /**
   * Error scenarios
   */
  errorScenarios: {
    networkError: () => ApiMockUtils.getMockError('/api/v1/projects/error'),
    unauthorized: () => ApiMockUtils.getMockError('/api/v1/tasks/unauthorized'),
    validation: () => ApiMockUtils.getMockError('/api/v1/tasks/validation'),
    serverError: () => ApiMockUtils.getMockError('/api/v1/printer/server-error')
  },
  
  /**
   * Loading states
   */
  loadingStates: {
    initial: { isLoading: true, data: undefined },
    refetching: { isLoading: false, isFetching: true, data: {} },
    error: { isLoading: false, isError: true, error: new Error('Test error') }
  }
}

/**
 * Setup API mocks
 */
export function setupApiMocks() {
  // Setup realistic responses and errors
  ApiMockUtils.createRealisticResponses()
  ApiMockUtils.createErrorScenarios()
  
  // Mock global fetch
  const mockFetch = createMockFetch()
  vi.stubGlobal('fetch', mockFetch)
  
  return {
    mockFetch,
    apiUtils: ApiMockUtils,
    queryUtils: ReactQueryTestUtils
  }
}