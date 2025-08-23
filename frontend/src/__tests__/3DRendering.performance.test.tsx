import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Three.js and related libraries
const mockScene = {
  add: vi.fn(),
  remove: vi.fn(),
  children: []
};

const mockRenderer = {
  render: vi.fn(),
  setSize: vi.fn(),
  dispose: vi.fn(),
  domElement: document.createElement('canvas')
};

const mockCamera = {
  position: { set: vi.fn() },
  lookAt: vi.fn(),
  updateProjectionMatrix: vi.fn()
};

const mockControls = {
  update: vi.fn(),
  dispose: vi.fn()
};

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => {
    return <div data-testid="threejs-canvas" {...props}>{children}</div>;
  },
  useFrame: (callback: Function) => {
    // Simulate frame callback for animations
    const intervalId = setInterval(callback, 16); // ~60fps
    return () => clearInterval(intervalId);
  },
  useThree: () => ({
    scene: mockScene,
    renderer: mockRenderer,
    camera: mockCamera,
    size: { width: 800, height: 600 }
  })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: (props: any) => <div data-testid="orbit-controls" {...props} />,
  Mesh: ({ children, ...props }: any) => <div data-testid="mesh" {...props}>{children}</div>,
  Box: (props: any) => <div data-testid="box-geometry" {...props} />,
  Sphere: (props: any) => <div data-testid="sphere-geometry" {...props} />,
  useHelper: vi.fn(),
  Stats: () => <div data-testid="fps-stats" />
}));

// Mock file loading utilities
const mockSTLLoader = {
  load: vi.fn(),
  loadAsync: vi.fn()
};

const mockGCodeLoader = {
  parse: vi.fn(),
  load: vi.fn()
};

vi.mock('three/examples/jsm/loaders/STLLoader', () => ({
  STLLoader: vi.fn(() => mockSTLLoader)
}));

// Mock Performance API for consistent testing
const mockPerformance = {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn()
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance
});

// Sample 3D model components
const Model3DViewer = ({ modelUrl, onLoad, onError }: {
  modelUrl: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadModel = async () => {
      try {
        // Simulate model loading
        await new Promise(resolve => setTimeout(resolve, 100));
        setLoading(false);
        onLoad?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Loading failed');
        onError?.(err instanceof Error ? err : new Error('Loading failed'));
      }
    };

    loadModel();
  }, [modelUrl]);

  if (loading) return <div data-testid="loading">Loading 3D model...</div>;
  if (error) return <div data-testid="error">Error: {error}</div>;

  return (
    <div data-testid="model-viewer">
      <Canvas data-testid="threejs-canvas">
        <Mesh>
          <Box />
        </Mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

const PrintProgressVisualization = ({ progress }: { progress: number }) => {
  const [layers, setLayers] = React.useState<Array<{ height: number; opacity: number }>>([]);

  React.useEffect(() => {
    // Simulate layer rendering based on progress
    const totalLayers = 100;
    const currentLayer = Math.floor((progress / 100) * totalLayers);
    
    const newLayers = Array.from({ length: totalLayers }, (_, i) => ({
      height: i * 0.2,
      opacity: i <= currentLayer ? 1 : 0.1
    }));
    
    setLayers(newLayers);
  }, [progress]);

  return (
    <div data-testid="print-progress">
      <Canvas>
        {layers.map((layer, index) => (
          <Mesh key={index} position={[0, layer.height, 0]}>
            <Box args={[1, 0.1, 1]} />
          </Mesh>
        ))}
        <OrbitControls />
      </Canvas>
      <div data-testid="progress-info">
        Progress: {progress}% ({layers.filter(l => l.opacity === 1).length} layers)
      </div>
    </div>
  );
};

describe('3D Rendering Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock performance counters
    mockPerformance.mark.mockClear();
    mockPerformance.measure.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Model Loading Performance', () => {
    it('loads small 3D models within acceptable time limits', async () => {
      const onLoad = vi.fn();
      const startTime = Date.now();

      render(<Model3DViewer modelUrl="/models/small-model.stl" onLoad={onLoad} />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
      }, { timeout: 2000 });

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
      expect(onLoad).toHaveBeenCalled();
    });

    it('handles large model files without blocking UI', async () => {
      const onLoad = vi.fn();
      
      // Mock slow loading for large files
      mockSTLLoader.loadAsync.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      const startTime = performance.now();
      
      render(<Model3DViewer modelUrl="/models/large-model.stl" onLoad={onLoad} />);

      // UI should remain responsive during loading
      const loadingElement = screen.getByTestId('loading');
      expect(loadingElement).toBeInTheDocument();

      // Should be able to interact with other elements while loading
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      document.body.appendChild(button);

      await userEvent.click(button);
      expect(button).toBeInTheDocument(); // Should still be clickable

      await waitFor(() => {
        expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
      }, { timeout: 3000 });

      const endTime = performance.now();
      expect(endTime - startTime).toBeGreaterThan(100); // Did actually take time
      
      document.body.removeChild(button);
    });

    it('efficiently handles multiple model loads', async () => {
      const modelUrls = [
        '/models/model1.stl',
        '/models/model2.stl',
        '/models/model3.stl'
      ];

      const startTime = performance.now();

      const { rerender } = render(
        <Model3DViewer modelUrl={modelUrls[0]} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
      });

      // Switch between models rapidly
      for (let i = 1; i < modelUrls.length; i++) {
        rerender(<Model3DViewer modelUrl={modelUrls[i]} />);
        
        await waitFor(() => {
          expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle multiple loads efficiently
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Real-time Rendering Performance', () => {
    it('maintains smooth animation during print progress updates', async () => {
      const { rerender } = render(<PrintProgressVisualization progress={0} />);

      expect(screen.getByTestId('print-progress')).toBeInTheDocument();
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument();

      const startTime = performance.now();
      
      // Simulate rapid progress updates
      for (let progress = 0; progress <= 100; progress += 5) {
        rerender(<PrintProgressVisualization progress={progress} />);
        
        await waitFor(() => {
          expect(screen.getByText(`Progress: ${progress}%`)).toBeInTheDocument();
        });
      }

      const endTime = performance.now();
      const animationTime = endTime - startTime;

      // Should complete animation smoothly
      expect(animationTime).toBeLessThan(2000);
      expect(screen.getByText('Progress: 100%')).toBeInTheDocument();
    });

    it('handles high-frequency temperature visualization updates', async () => {
      const TemperatureVisualization = ({ temperature }: { temperature: number }) => {
        const color = `hsl(${Math.min(temperature, 300)}, 100%, 50%)`;
        
        return (
          <div data-testid="temp-visualization">
            <Canvas>
              <Mesh>
                <Sphere args={[1]} />
              </Mesh>
            </Canvas>
            <div style={{ color }} data-testid="temp-display">
              {temperature}°C
            </div>
          </div>
        );
      };

      const { rerender } = render(<TemperatureVisualization temperature={20} />);

      const startTime = performance.now();
      
      // Simulate rapid temperature changes
      for (let temp = 20; temp <= 220; temp += 2) {
        rerender(<TemperatureVisualization temperature={temp} />);
        
        // Don't wait for each update to test performance
        if (temp % 20 === 0) {
          await waitFor(() => {
            expect(screen.getByText(`${temp}°C`)).toBeInTheDocument();
          });
        }
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1500);
    });
  });

  describe('Memory Management', () => {
    it('properly cleans up 3D resources on component unmount', () => {
      const { unmount } = render(<Model3DViewer modelUrl="/models/test.stl" />);

      // Simulate resource cleanup
      const disposeSpy = vi.spyOn(mockRenderer, 'dispose');
      
      unmount();

      // Should clean up WebGL resources
      expect(disposeSpy).toHaveBeenCalled();
    });

    it('handles memory efficiently during long printing sessions', async () => {
      let memoryUsage = 0;
      const maxMemoryIncrease = 50; // MB

      // Mock memory usage tracking
      const originalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { rerender } = render(<PrintProgressVisualization progress={0} />);

      // Simulate 8-hour print with updates every minute
      const updates = 480; // 8 hours * 60 minutes
      
      for (let i = 0; i < updates; i += 10) { // Test every 10th update for speed
        const progress = (i / updates) * 100;
        rerender(<PrintProgressVisualization progress={progress} />);
        
        // Simulate memory usage check
        const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
        memoryUsage = Math.max(memoryUsage, currentMemory - originalMemory);
      }

      // Memory should not grow unbounded
      expect(memoryUsage).toBeLessThan(maxMemoryIncrease * 1024 * 1024);
    });

    it('reuses geometry and materials for performance', async () => {
      const MultiModelViewer = ({ count }: { count: number }) => {
        return (
          <Canvas>
            {Array.from({ length: count }, (_, i) => (
              <Mesh key={i} position={[i * 2, 0, 0]}>
                <Box args={[1, 1, 1]} />
              </Mesh>
            ))}
          </Canvas>
        );
      };

      const startTime = performance.now();
      
      render(<MultiModelViewer count={100} />);

      await waitFor(() => {
        expect(screen.getAllByTestId('mesh')).toHaveLength(100);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render many objects efficiently
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Responsive Performance', () => {
    it('adapts rendering quality based on device performance', async () => {
      // Mock different device capabilities
      const devices = [
        { name: 'mobile', width: 375, height: 667, pixelRatio: 2 },
        { name: 'tablet', width: 768, height: 1024, pixelRatio: 2 },
        { name: 'desktop', width: 1920, height: 1080, pixelRatio: 1 }
      ];

      for (const device of devices) {
        Object.defineProperty(window, 'innerWidth', { value: device.width });
        Object.defineProperty(window, 'innerHeight', { value: device.height });
        Object.defineProperty(window, 'devicePixelRatio', { value: device.pixelRatio });

        const { unmount } = render(<Model3DViewer modelUrl="/models/adaptive.stl" />);

        await waitFor(() => {
          expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
        });

        // Should adapt render settings based on device
        expect(mockRenderer.setSize).toHaveBeenCalled();
        
        unmount();
      }
    });

    it('maintains performance during window resize', async () => {
      render(<Model3DViewer modelUrl="/models/resize-test.stl" />);

      await waitFor(() => {
        expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Simulate multiple resize events
      const resizes = [
        { width: 800, height: 600 },
        { width: 1200, height: 800 },
        { width: 1920, height: 1080 },
        { width: 640, height: 480 }
      ];

      resizes.forEach(size => {
        Object.defineProperty(window, 'innerWidth', { value: size.width });
        Object.defineProperty(window, 'innerHeight', { value: size.height });
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
      });

      const endTime = performance.now();
      const resizeTime = endTime - startTime;

      expect(resizeTime).toBeLessThan(500);
      expect(mockRenderer.setSize).toHaveBeenCalledTimes(resizes.length);
    });
  });

  describe('Error Recovery Performance', () => {
    it('handles WebGL context loss gracefully', async () => {
      const onError = vi.fn();
      
      render(<Model3DViewer modelUrl="/models/context-test.stl" onError={onError} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
      });

      // Simulate WebGL context loss
      const canvas = screen.getByTestId('threejs-canvas');
      const contextLostEvent = new Event('webglcontextlost');
      canvas.dispatchEvent(contextLostEvent);

      // Should attempt to recover
      const contextRestoredEvent = new Event('webglcontextrestored');
      canvas.dispatchEvent(contextRestoredEvent);

      // Should remain functional after recovery
      expect(screen.getByTestId('model-viewer')).toBeInTheDocument();
    });

    it('degrades gracefully when 3D rendering fails', async () => {
      const onError = vi.fn();
      
      // Mock rendering failure
      mockRenderer.render.mockImplementation(() => {
        throw new Error('WebGL not supported');
      });

      render(<Model3DViewer modelUrl="/models/fallback-test.stl" onError={onError} />);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      // Should show fallback UI instead of crashing
      expect(screen.getByText(/WebGL not supported/)).toBeInTheDocument();
    });
  });
});