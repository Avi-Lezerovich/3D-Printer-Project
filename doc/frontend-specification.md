# Frontend Specification - LezerPrint
## 3D Printer Management System & Portfolio

**Version:** 1.0  
**Date:** September 2025  
**Document Type:** Frontend Technical Specification  
**Project:** LezerPrint (Open Source)

---

## 1. Frontend Architecture Overview

### 1.1 Technology Stack
```
Core Framework:
├── React 18.2+
├── Next.js 14+ (App Router)
├── TypeScript 5.0+
└── Node.js 20+ (build environment)

Styling & UI:
├── Tailwind CSS 3.4+
├── Framer Motion (animations)
├── Radix UI (accessible components)
└── CSS Modules (component-specific styles)

State Management:
├── Zustand (global state)
├── TanStack Query (server state)
├── React Hook Form (form state)
└── Jotai (atomic state)

Real-time & Communication:
├── Socket.io Client
├── EventSource (SSE)
└── Axios (HTTP client)

3D & Visualization:
├── Three.js (3D models)
├── React Three Fiber (React integration)
├── Recharts (charts)
└── D3.js (advanced visualizations)

Development Tools:
├── Vite/Next.js (bundler)
├── ESLint + Prettier
├── Jest + React Testing Library
└── Storybook (component development)
```

### 1.2 Application Structure
```
lezerprint-frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (public)/           # Public routes
│   │   │   ├── page.tsx        # Home/Portfolio
│   │   │   ├── demo/           # Demo mode
│   │   │   └── about/          # About pages
│   │   ├── (auth)/             # Auth routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── printer/        # Printer management
│   │   │   ├── files/          # File management
│   │   │   ├── history/        # Print history
│   │   │   └── settings/       # Settings
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── printer/            # Printer-specific
│   │   ├── charts/             # Data visualizations
│   │   ├── 3d/                 # 3D components
│   │   └── layouts/            # Layout components
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # State management
│   ├── services/               # API services
│   ├── lib/                    # Utilities
│   ├── styles/                 # Global styles
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── tests/                      # Test files
└── config/                     # Configuration
```

---

## 2. UI/UX Design System

### 2.1 Design Principles
- **Clarity First**: Information hierarchy over decoration
- **Real-time Feedback**: Instant visual responses
- **Mobile-First**: Touch-friendly, responsive design
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: 60fps animations, lazy loading

### 2.2 Color Palette
```scss
// Primary Colors
$primary-500: #3B82F6;      // Main brand color
$primary-600: #2563EB;      // Hover states
$primary-100: #DBEAFE;      // Backgrounds

// Status Colors
$success: #10B981;          // Successful prints
$warning: #F59E0B;          // Warnings
$error: #EF4444;            // Errors/failures
$info: #6366F1;             // Information

// Temperature Colors
$temp-cold: #3B82F6;        // Cold (< 50°C)
$temp-warm: #F59E0B;        // Warm (50-180°C)
$temp-hot: #EF4444;         // Hot (> 180°C)

// Neutral Colors
$gray-900: #111827;         // Primary text
$gray-700: #374151;         // Secondary text
$gray-400: #9CA3AF;         // Disabled/muted
$gray-100: #F3F4F6;         // Backgrounds
$white: #FFFFFF;            // Base white

// Dark Mode
$dark-bg: #0F172A;          // Dark background
$dark-surface: #1E293B;     // Card backgrounds
$dark-border: #334155;      // Borders
```

### 2.3 Typography
```scss
// Font Stack
$font-sans: 'Inter', system-ui, -apple-system, sans-serif;
$font-mono: 'JetBrains Mono', 'Fira Code', monospace;

// Font Sizes
$text-xs: 0.75rem;     // 12px - Labels, captions
$text-sm: 0.875rem;    // 14px - Secondary text
$text-base: 1rem;      // 16px - Body text
$text-lg: 1.125rem;    // 18px - Subheadings
$text-xl: 1.25rem;     // 20px - Section headers
$text-2xl: 1.5rem;     // 24px - Page titles
$text-3xl: 1.875rem;   // 30px - Hero text
$text-4xl: 2.25rem;    // 36px - Landing page

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### 2.4 Spacing System
```scss
// Base unit: 4px
$space-1: 0.25rem;   // 4px
$space-2: 0.5rem;    // 8px
$space-3: 0.75rem;   // 12px
$space-4: 1rem;      // 16px
$space-6: 1.5rem;    // 24px
$space-8: 2rem;      // 32px
$space-12: 3rem;     // 48px
$space-16: 4rem;     // 64px
```

### 2.5 Component Library

#### Base Components
```typescript
// Button variants
<Button variant="primary|secondary|danger|ghost" size="sm|md|lg" />
<IconButton icon={Icon} label="Accessible label" />

// Form controls
<Input type="text|number|email" error={errorMessage} />
<Select options={options} multiple={false} />
<Checkbox label="Option" />
<RadioGroup options={options} />
<Switch label="Toggle" />
<Slider min={0} max={100} step={1} />

// Feedback
<Alert type="info|success|warning|error" />
<Toast message="Notification" duration={5000} />
<Modal open={isOpen} onClose={handleClose} />
<Tooltip content="Help text" />

// Navigation
<Tabs items={tabs} />
<Breadcrumb items={paths} />
<Pagination total={100} pageSize={20} />

// Layout
<Card elevated={true} />
<Divider orientation="horizontal|vertical" />
<Skeleton loading={isLoading} />
<Spinner size="sm|md|lg" />
```

---

## 3. Page Components & Routes

### 3.1 Public Pages

#### Home/Portfolio Page (`/`)
```typescript
interface HomePageSections {
  hero: {
    title: string;
    subtitle: string;
    ctaButtons: ['View Demo', 'View Projects'];
    backgroundAnimation: Three.js scene;
  };
  stats: {
    printHours: number;
    successRate: percentage;
    projectsCompleted: number;
    liveStatus: 'Online' | 'Printing' | 'Offline';
  };
  featuredProject: {
    title: 'LezerPrint System';
    description: string;
    livePreview: MiniDashboard;
    technologies: string[];
  };
  projects: ProjectCard[];
  skills: SkillCategory[];
  contact: ContactForm;
}
```

#### Demo Mode (`/demo`)
```typescript
interface DemoModeFeatures {
  dashboard: {
    readOnly: true;
    mockData: false; // Real data
    components: [
      'PrinterStatus',
      'TemperatureChart',
      'LiveCamera',
      'PrintProgress',
      'RecentPrints'
    ];
  };
  restrictions: {
    noControls: true;
    noFileUpload: true;
    noSettings: true;
  };
  guidance: {
    tooltips: true;
    highlightFeatures: true;
    interactiveTour: optional;
  };
}
```

### 3.2 Dashboard Pages (Protected)

#### Main Dashboard (`/printer/dashboard`)
```typescript
interface DashboardLayout {
  grid: {
    layout: 'responsive-grid';
    columns: {
      mobile: 1;
      tablet: 2;
      desktop: 3;
      wide: 4;
    };
  };
  widgets: [
    {
      id: 'printer-status';
      size: 'large';
      position: 'top-left';
      component: PrinterStatusCard;
    },
    {
      id: 'temperature';
      size: 'medium';
      component: TemperatureMonitor;
    },
    {
      id: 'camera-feed';
      size: 'large';
      component: CameraViewer;
    },
    {
      id: 'quick-actions';
      size: 'small';
      component: QuickActions;
    },
    {
      id: 'print-progress';
      size: 'medium';
      component: PrintProgress;
    },
    {
      id: 'recent-alerts';
      size: 'medium';
      component: AlertsFeed;
    }
  ];
}
```

#### File Management (`/printer/files`)
```typescript
interface FileManagerFeatures {
  upload: {
    dragDrop: true;
    multiFile: true;
    formats: ['.stl', '.gcode', '.obj', '.3mf'];
    maxSize: '500MB';
    validation: true;
  };
  viewer: {
    preview3D: true;
    layerView: true;
    gcodePreview: true;
    metadata: true;
  };
  organization: {
    folders: true;
    tags: true;
    search: true;
    sort: ['name', 'date', 'size', 'prints'];
  };
}
```

---

## 4. State Management

### 4.1 Global State (Zustand)
```typescript
// stores/printerStore.ts
interface PrinterStore {
  // State
  status: PrinterStatus;
  currentJob: PrintJob | null;
  temperature: TemperatureData;
  position: Position3D;
  
  // Actions
  updateStatus: (status: PrinterStatus) => void;
  setCurrentJob: (job: PrintJob) => void;
  updateTemperature: (temp: TemperatureData) => void;
  emergencyStop: () => Promise<void>;
}

// stores/userStore.ts
interface UserStore {
  user: User | null;
  preferences: UserPreferences;
  isAuthenticated: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

// stores/uiStore.ts
interface UIStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  activeModal: ModalType | null;
  notifications: Notification[];
  
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (modal: ModalType) => void;
  addNotification: (notification: Notification) => void;
}
```

### 4.2 Server State (TanStack Query)
```typescript
// hooks/queries/usePrinterStatus.ts
export const usePrinterStatus = () => {
  return useQuery({
    queryKey: ['printer', 'status'],
    queryFn: fetchPrinterStatus,
    refetchInterval: 1000, // Real-time updates
    staleTime: 0,
  });
};

// hooks/queries/useFiles.ts
export const useFiles = (folder?: string) => {
  return useQuery({
    queryKey: ['files', folder],
    queryFn: () => fetchFiles(folder),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// hooks/mutations/useStartPrint.ts
export const useStartPrint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: startPrint,
    onSuccess: () => {
      queryClient.invalidateQueries(['printer', 'status']);
      queryClient.invalidateQueries(['jobs']);
    },
  });
};
```

---

## 5. Real-time Features

### 5.1 WebSocket Integration
```typescript
// services/websocket.ts
class WebSocketService {
  private socket: Socket;
  private subscribers: Map<string, Set<Function>>;

  connect() {
    this.socket = io(WS_URL, {
      auth: { token: getAuthToken() },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();
  }

  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  private setupEventHandlers() {
    // Printer status updates
    this.socket.on('printer:status', (data) => {
      this.emit('printer:status', data);
    });

    // Temperature updates
    this.socket.on('temperature:update', (data) => {
      this.emit('temperature:update', data);
    });

    // Print progress
    this.socket.on('print:progress', (data) => {
      this.emit('print:progress', data);
    });

    // Alerts
    this.socket.on('alert', (data) => {
      this.emit('alert', data);
    });
  }
}
```

### 5.2 Real-time Hooks
```typescript
// hooks/useRealtimeStatus.ts
export const useRealtimeStatus = () => {
  const [status, setStatus] = useState<PrinterStatus>();
  
  useEffect(() => {
    const ws = WebSocketService.getInstance();
    
    const unsubscribe = ws.subscribe('printer:status', (data) => {
      setStatus(data);
    });
    
    return unsubscribe;
  }, []);
  
  return status;
};

// hooks/useTemperatureStream.ts
export const useTemperatureStream = () => {
  const [temperatures, setTemperatures] = useState<TemperatureHistory>([]);
  
  useEffect(() => {
    const ws = WebSocketService.getInstance();
    
    const unsubscribe = ws.subscribe('temperature:update', (data) => {
      setTemperatures(prev => [...prev.slice(-100), data]); // Keep last 100
    });
    
    return unsubscribe;
  }, []);
  
  return temperatures;
};
```

---

## 6. 3D Visualization

### 6.1 Model Viewer Component
```typescript
// components/3d/ModelViewer.tsx
interface ModelViewerProps {
  file: File | string;
  controls: boolean;
  autoRotate: boolean;
  showGrid: boolean;
  showAxes: boolean;
  onLayerChange?: (layer: number) => void;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  file,
  controls = true,
  autoRotate = false,
  showGrid = true,
  showAxes = true,
  onLayerChange,
}) => {
  return (
    <Canvas camera={{ position: [50, 50, 50] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      
      {showGrid && <gridHelper args={[200, 20]} />}
      {showAxes && <axesHelper args={[100]} />}
      
      <STLModel file={file} />
      
      {controls && <OrbitControls autoRotate={autoRotate} />}
      
      <LayerSlicer 
        visible={!!onLayerChange}
        onLayerChange={onLayerChange}
      />
    </Canvas>
  );
};
```

### 6.2 G-code Visualizer
```typescript
// components/3d/GCodeVisualizer.tsx
interface GCodeVisualizerProps {
  gcode: string;
  currentLayer?: number;
  currentLine?: number;
  showTravel: boolean;
  showRetracts: boolean;
  colorBySpeed: boolean;
}

export const GCodeVisualizer: React.FC<GCodeVisualizerProps> = ({
  gcode,
  currentLayer,
  currentLine,
  showTravel,
  showRetracts,
  colorBySpeed,
}) => {
  const paths = useMemo(() => parseGCode(gcode), [gcode]);
  
  return (
    <Canvas>
      <PerspectiveCamera position={[100, 100, 100]} />
      <OrbitControls />
      
      {paths.map((path, index) => (
        <GCodePath
          key={index}
          path={path}
          visible={!currentLayer || path.layer <= currentLayer}
          highlight={currentLine && path.line === currentLine}
          color={colorBySpeed ? speedToColor(path.speed) : '#00ff00'}
          showTravel={showTravel}
        />
      ))}
      
      <BuildVolume dimensions={printerDimensions} />
    </Canvas>
  );
};
```

---

## 7. Camera Integration

### 7.1 Camera Viewer Component
```typescript
// components/printer/CameraViewer.tsx
interface CameraViewerProps {
  streamUrl: string;
  controls?: boolean;
  fullscreenEnabled?: boolean;
  snapshotEnabled?: boolean;
  recordEnabled?: boolean;
  multiView?: boolean;
}

export const CameraViewer: React.FC<CameraViewerProps> = ({
  streamUrl,
  controls = true,
  fullscreenEnabled = true,
  snapshotEnabled = true,
  recordEnabled = false,
  multiView = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  
  return (
    <div className="camera-viewer">
      <div className="camera-stream">
        {multiView ? (
          <MultiCameraGrid cameras={cameras} />
        ) : (
          <VideoStream 
            src={streamUrl}
            quality={quality}
            onError={handleStreamError}
          />
        )}
      </div>
      
      {controls && (
        <CameraControls
          onFullscreen={() => setIsFullscreen(!isFullscreen)}
          onSnapshot={handleSnapshot}
          onRecord={() => setIsRecording(!isRecording)}
          onQualityChange={setQuality}
          isRecording={isRecording}
          isFullscreen={isFullscreen}
        />
      )}
      
      <StreamStatus 
        connected={isConnected}
        fps={currentFPS}
        bitrate={bitrate}
      />
    </div>
  );
};
```

---

## 8. Performance Optimization

### 8.1 Code Splitting
```typescript
// Lazy load heavy components
const ModelViewer = lazy(() => import('@/components/3d/ModelViewer'));
const GCodeVisualizer = lazy(() => import('@/components/3d/GCodeVisualizer'));
const Analytics = lazy(() => import('@/components/analytics/Analytics'));

// Route-based splitting (Next.js automatic)
// Each route is automatically code-split
```

### 8.2 Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/printer-photo.jpg"
  alt="3D Printer"
  width={800}
  height={600}
  priority={false}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### 8.3 Memoization Strategy
```typescript
// Memoize expensive computations
const printStats = useMemo(() => 
  calculatePrintStatistics(printHistory),
  [printHistory]
);

// Memoize components
const ExpensiveChart = memo(({ data }) => {
  return <Chart data={data} />;
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// Use callback for stable references
const handlePrintStart = useCallback((fileId: string) => {
  startPrint(fileId);
}, [startPrint]);
```

### 8.4 Virtual Scrolling
```typescript
// For large lists (file manager, history)
import { VariableSizeList } from 'react-window';

<VariableSizeList
  height={600}
  itemCount={files.length}
  itemSize={getItemSize}
  width="100%"
>
  {FileRow}
</VariableSizeList>
```

---

## 9. Mobile Responsiveness

### 9.1 Breakpoints
```scss
// Tailwind default breakpoints
$breakpoints: (
  'sm': 640px,   // Mobile landscape
  'md': 768px,   // Tablet
  'lg': 1024px,  // Desktop
  'xl': 1280px,  // Large desktop
  '2xl': 1536px  // Wide screen
);
```

### 9.2 Mobile-Specific Features
```typescript
// Touch gestures
const bind = useGesture({
  onDrag: ({ offset: [x, y] }) => {
    // Handle model rotation on touch
  },
  onPinch: ({ offset: [scale] }) => {
    // Handle zoom
  },
});

// PWA capabilities
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Mobile-optimized controls
<MobileControls>
  <SwipeableDrawer />
  <FloatingActionButton />
  <BottomNavigation />
</MobileControls>
```

---

## 10. Testing Strategy

### 10.1 Unit Tests
```typescript
// Component testing
describe('PrinterStatusCard', () => {
  it('displays correct status', () => {
    render(<PrinterStatusCard status="printing" />);
    expect(screen.getByText('Printing')).toBeInTheDocument();
  });
  
  it('shows emergency stop when printing', () => {
    render(<PrinterStatusCard status="printing" />);
    expect(screen.getByRole('button', { name: /emergency stop/i }))
      .toBeInTheDocument();
  });
});
```

### 10.2 Integration Tests
```typescript
// API integration
describe('File Upload', () => {
  it('uploads STL file successfully', async () => {
    const file = new File(['content'], 'model.stl');
    
    render(<FileUploader />);
    
    const input = screen.getByLabelText(/upload/i);
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('model.stl')).toBeInTheDocument();
    });
  });
});
```

### 10.3 E2E Tests
```typescript
// Playwright tests
test('Complete print workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Login');
  
  // Login
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  // Upload file
  await page.goto('/printer/files');
  await page.setInputFiles('input[type=file]', 'test.stl');
  
  // Start print
  await page.click('text=Start Print');
  await expect(page.locator('.status')).toContainText('Printing');
});
```

---

## 11. Accessibility

### 11.1 WCAG 2.1 AA Compliance
```typescript
// Semantic HTML
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ARIA labels
<button 
  aria-label="Emergency Stop"
  aria-pressed={isStopped}
  aria-describedby="emergency-stop-description"
>
  <StopIcon />
</button>

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'Escape': closeModal(); break;
    case 'Enter': submitForm(); break;
    case 'Tab': handleTabNavigation(e); break;
  }
};

// Focus management
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  // Implement focus trap logic
};
```

### 11.2 Screen Reader Support
```typescript
// Live regions for updates
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  Print progress: {progress}%
</div>

// Descriptive text for visual elements
<img 
  src="/printer.jpg" 
  alt="Ender 3 V2 3D printer with current print showing a phone stand at 67% completion"
/>
```

---

## 12. Security Implementation

### 12.1 Authentication Flow
```typescript
// services/auth.ts
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    
    // Store tokens securely
    this.storeTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    });
    
    // Setup auto-refresh
    this.scheduleTokenRefresh();
    
    return response.data;
  }
  
  private storeTokens(tokens: Tokens) {
    // Use httpOnly cookies in production
    if (process.env.NODE_ENV === 'production') {
      // Server sets httpOnly cookie
    } else {
      // Development: use secure storage
      secureStorage.setItem('accessToken', tokens.accessToken);
    }
  }
  
  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    const response = await api.post('/auth/refresh', { refreshToken });
    this.storeTokens(response.data);
  }
}
```

### 12.2 Input Validation
```typescript
// Validate all user inputs
const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, 'File too large')
    .refine(file => ACCEPTED_TYPES.includes(file.type), 'Invalid file type'),
  name: z.string().min(1).max(255),
  folder: z.string().optional(),
});

// XSS prevention
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

---

## 13. Build & Deployment

### 13.1 Build Configuration
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'lezerprint.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
    NEXT_PUBLIC_WS_URL: process.env.WS_URL,
  },
};
```

### 13.2 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_CAMERA_URL=http://localhost:8080/stream
NEXT_PUBLIC_DEMO_MODE=true
```

### 13.3 Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 14. Development Guidelines

### 14.1 Code Standards
```typescript
// Component structure
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState();
  const { data } = useQuery();
  
  // 2. Computed values
  const computed = useMemo(() => {}, []);
  
  // 3. Effects
  useEffect(() => {}, []);
  
  // 4. Handlers
  const handleClick = useCallback(() => {}, []);
  
  // 5. Render
  return <div>{/* JSX */}</div>;
};
```

### 14.2 File Naming Conventions
```
components/
  ComponentName.tsx        # PascalCase for components
  componentName.module.css # camelCase for styles
  
hooks/
  useHookName.ts          # camelCase with 'use' prefix
  
utils/
  utilityName.ts          # camelCase for utilities
  
types/
  TypeName.ts             # PascalCase for types
```

### 14.3 Git Workflow
```bash
# Branch naming
feature/add-camera-viewer
fix/temperature-display
refactor/state-management
docs/update-readme

# Commit messages
feat: add real-time temperature monitoring
fix: resolve camera stream connection issue
refactor: optimize dashboard rendering
docs: update API documentation
test: add unit tests for file upload
```

---

## 15. Dependencies Management

### 15.1 Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.0.0",
    "@radix-ui/react-*": "^1.0.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "socket.io-client": "^4.5.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "recharts": "^2.10.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  }
}
```

### 15.2 Dev Dependencies
```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.7.0",
    "@playwright/test": "^1.40.0",
    "storybook": "^7.6.0"
  }
}
```

---

## Conclusion

This frontend specification provides a comprehensive blueprint for building LezerPrint's user interface. The architecture emphasizes:

- **Performance**: Through code splitting, memoization, and optimization
- **Real-time Updates**: Via WebSocket integration and live data streaming
- **Accessibility**: WCAG 2.1 AA compliance and keyboard navigation
- **Mobile-First**: Responsive design and PWA capabilities
- **Developer Experience**: TypeScript, testing, and clear conventions

The specification serves as the definitive guide for frontend development, ensuring consistency, quality, and maintainability throughout the project lifecycle.