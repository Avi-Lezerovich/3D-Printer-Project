/**
 * Three.js and @react-three/fiber mocking utilities
 * Provides comprehensive mocking for 3D rendering functionality testing
 */

/**
 * Mock Three.js objects and methods
 */
export const mockThreeObjects = {
  Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: vi.fn(),
    add: vi.fn(),
    normalize: vi.fn(),
    clone: vi.fn(() => ({ x, y, z }))
  })),
  
  Group: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  })),
  
  Mesh: vi.fn().mockImplementation(() => ({
    geometry: null,
    material: null,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  })),
  
  BoxGeometry: vi.fn().mockImplementation((width = 1, height = 1, depth = 1) => ({
    type: 'BoxGeometry',
    parameters: { width, height, depth }
  })),
  
  MeshStandardMaterial: vi.fn().mockImplementation((params = {}) => ({
    type: 'MeshStandardMaterial',
    color: params.color || '#ffffff'
  })),
  
  PerspectiveCamera: vi.fn().mockImplementation((fov = 75, aspect = 1, near = 0.1, far = 1000) => ({
    type: 'PerspectiveCamera',
    fov, aspect, near, far,
    position: { x: 0, y: 0, z: 5 }
  })),
  
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas')
  })),
  
  Clock: vi.fn().mockImplementation(() => ({
    getElapsedTime: vi.fn(() => Date.now() / 1000),
    getDelta: vi.fn(() => 0.016) // ~60fps
  }))
}

/**
 * Mock @react-three/fiber components
 */
export const mockR3FComponents = {
  Canvas: vi.fn().mockImplementation(({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': 'r3f-canvas',
      'data-camera-position': JSON.stringify(props.camera?.position),
      'data-camera-fov': props.camera?.fov,
      style: { width: '100%', height: '500px' }
    }, children)
  }),
  
  useFrame: vi.fn().mockImplementation((callback) => {
    // Store callback for manual triggering in tests
    if (!globalThis.__r3f_frame_callbacks) {
      globalThis.__r3f_frame_callbacks = []
    }
    globalThis.__r3f_frame_callbacks.push(callback)
    
    // Simulate frame loop for testing
    React.useEffect(() => {
      const mockState = {
        clock: {
          elapsedTime: Date.now() / 1000,
          delta: 0.016
        },
        camera: mockThreeObjects.PerspectiveCamera(),
        scene: mockThreeObjects.Group()
      }
      
      const interval = setInterval(() => callback(mockState), 16)
      return () => clearInterval(interval)
    }, [callback])
  }),
  
  useThree: vi.fn().mockReturnValue({
    camera: mockThreeObjects.PerspectiveCamera(),
    scene: mockThreeObjects.Group(),
    gl: mockThreeObjects.WebGLRenderer(),
    clock: mockThreeObjects.Clock()
  }),
  
  useLoader: vi.fn().mockReturnValue(null), // Mock loaded resources
  
  useRef: React.useRef // Use actual useRef for component refs
}

/**
 * Mock @react-three/drei components
 */
export const mockDreiComponents = {
  OrbitControls: vi.fn().mockImplementation((props) => {
    return React.createElement('primitive', {
      'data-testid': 'orbit-controls',
      'data-enable-pan': props.enablePan,
      'data-enable-zoom': props.enableZoom,
      'data-auto-rotate': props.autoRotate,
      'data-min-distance': props.minDistance,
      'data-max-distance': props.maxDistance
    })
  }),
  
  Environment: vi.fn().mockImplementation((props) => {
    return React.createElement('primitive', {
      'data-testid': 'environment',
      'data-preset': props.preset
    })
  }),
  
  ContactShadows: vi.fn().mockImplementation(() => {
    return React.createElement('primitive', {
      'data-testid': 'contact-shadows'
    })
  }),
  
  Text: vi.fn().mockImplementation(({ children, ...props }) => {
    return React.createElement('div', {
      'data-testid': '3d-text',
      'data-font-size': props.fontSize
    }, children)
  })
}

/**
 * Performance monitoring for 3D scenes
 */
export class ThreeJSTestUtils {
  private static frameCallbacks: Function[] = []
  private static performanceMetrics = {
    frameCount: 0,
    averageFps: 60,
    lastFrameTime: performance.now()
  }
  
  /**
   * Manually trigger frame updates for testing
   */
  static triggerFrame(state?: Partial<any>) {
    const defaultState = {
      clock: {
        elapsedTime: performance.now() / 1000,
        delta: 0.016
      },
      camera: mockThreeObjects.PerspectiveCamera(),
      scene: mockThreeObjects.Group(),
      ...state
    }
    
    this.frameCallbacks.forEach(callback => {
      try {
        callback(defaultState)
      } catch (error) {
        console.warn('Frame callback error:', error)
      }
    })
    
    this.updatePerformanceMetrics()
  }
  
  /**
   * Add frame callback for testing
   */
  static addFrameCallback(callback: Function) {
    this.frameCallbacks.push(callback)
  }
  
  /**
   * Clear all frame callbacks
   */
  static clearFrameCallbacks() {
    this.frameCallbacks = []
  }
  
  /**
   * Update performance metrics
   */
  private static updatePerformanceMetrics() {
    const now = performance.now()
    const deltaTime = now - this.performanceMetrics.lastFrameTime
    
    this.performanceMetrics.frameCount++
    this.performanceMetrics.averageFps = 1000 / deltaTime
    this.performanceMetrics.lastFrameTime = now
  }
  
  /**
   * Get current performance metrics
   */
  static getPerformanceMetrics() {
    return { ...this.performanceMetrics }
  }
  
  /**
   * Reset performance metrics
   */
  static resetPerformanceMetrics() {
    this.performanceMetrics = {
      frameCount: 0,
      averageFps: 60,
      lastFrameTime: performance.now()
    }
  }
  
  /**
   * Simulate loading states for testing
   */
  static mockLoadingState(isLoading: boolean, progress: number = 0) {
    return {
      isLoading,
      progress: Math.max(0, Math.min(100, progress)),
      error: null
    }
  }
  
  /**
   * Create mock 3D printer model for testing
   */
  static createMockPrinterModel() {
    return {
      base: mockThreeObjects.Mesh(),
      frame: [
        mockThreeObjects.Mesh(),
        mockThreeObjects.Mesh(),
        mockThreeObjects.Mesh(),
        mockThreeObjects.Mesh()
      ],
      printHead: mockThreeObjects.Mesh(),
      printBed: mockThreeObjects.Mesh(),
      animations: {
        rotation: vi.fn(),
        printHeadMovement: vi.fn()
      }
    }
  }
}

/**
 * Setup comprehensive Three.js mocks
 */
export function setupThreeJSMocks() {
  // Mock Three.js
  vi.mock('three', () => mockThreeObjects)
  
  // Mock @react-three/fiber
  vi.mock('@react-three/fiber', () => mockR3FComponents)
  
  // Mock @react-three/drei
  vi.mock('@react-three/drei', () => mockDreiComponents)
  
  // Clear frame callbacks on setup
  ThreeJSTestUtils.clearFrameCallbacks()
  
  return {
    mockThreeObjects,
    mockR3FComponents,
    mockDreiComponents,
    testUtils: ThreeJSTestUtils
  }
}

/**
 * 3D rendering test scenarios
 */
export const threejsTestScenarios = {
  /**
   * Basic scene rendering
   */
  basicScene: () => ({
    camera: { position: [5, 3, 5], fov: 50 },
    lights: {
      ambient: { intensity: 0.6 },
      directional: { position: [10, 10, 5], intensity: 1.2 }
    },
    expected: {
      rendered: true,
      objectCount: 4 // base, frame parts, print head, print bed
    }
  }),
  
  /**
   * Animation performance test
   */
  animationPerformance: () => ({
    frameRate: 60,
    duration: 5000, // 5 seconds
    expected: {
      minFps: 30,
      maxFrameTime: 33.33 // milliseconds
    }
  }),
  
  /**
   * Interactive controls test
   */
  interactiveControls: () => ({
    orbitControls: {
      enablePan: false,
      enableZoom: true,
      autoRotate: true,
      minDistance: 4,
      maxDistance: 12
    },
    expected: {
      controllable: true,
      autoRotating: true
    }
  })
}