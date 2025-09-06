# Backend Specification - LezerPrint
## 3D Printer Management System & Portfolio

**Version:** 1.0  
**Date:** September 2025  
**Document Type:** Backend Technical Specification  
**Project:** LezerPrint (Open Source)

---

## 1. Backend Architecture Overview

### 1.1 Technology Stack
```
Core Runtime:
├── Node.js 20+ LTS
├── TypeScript 5.0+
└── pnpm (package manager)

Framework & Libraries:
├── Express.js 4.18+ (HTTP server)
├── Socket.io 4.6+ (WebSocket)
├── Prisma 5.0+ (ORM)
└── Zod (validation)

Database:
├── PostgreSQL 15+ (primary)
├── Redis 7+ (cache & sessions)
└── SQLite (development)

Printer Communication:
├── SerialPort (USB/Serial)
├── node-usb (USB direct)
├── gcode-parser (custom)
└── Marlin Protocol

File Processing:
├── Multer (uploads)
├── Sharp (image processing)
├── three-stdlib (STL parsing)
└── FFmpeg (video processing)

Security:
├── JWT (authentication)
├── bcrypt (passwords)
├── helmet (headers)
├── rate-limiter-flexible
└── express-validator

Monitoring & Logging:
├── Winston (logging)
├── Morgan (HTTP logs)
├── Prometheus (metrics)
└── Sentry (error tracking)

Testing:
├── Jest (unit tests)
├── Supertest (API tests)
└── Faker (test data)
```

### 1.2 Project Structure
```
lezerprint-backend/
├── src/
│   ├── api/
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── printer.routes.ts
│   │   │   ├── files.routes.ts
│   │   │   ├── jobs.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Express middlewares
│   │   └── validators/       # Input validation
│   ├── services/
│   │   ├── printer/          # Printer communication
│   │   │   ├── PrinterService.ts
│   │   │   ├── GCodeParser.ts
│   │   │   ├── SerialManager.ts
│   │   │   └── PrinterProtocol.ts
│   │   ├── auth/             # Authentication
│   │   ├── files/            # File management
│   │   ├── camera/           # Camera streaming
│   │   └── analytics/        # Analytics & AI
│   ├── models/               # Database models
│   ├── websocket/            # WebSocket handlers
│   ├── workers/              # Background jobs
│   ├── utils/                # Utilities
│   ├── config/               # Configuration
│   └── server.ts             # Entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── tests/                    # Test files
├── scripts/                  # Utility scripts
└── docker/                   # Docker configs
```

---

## 2. Database Architecture

### 2.1 Database Schema (Prisma)
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  role          UserRole  @default(VIEWER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  files         File[]
  printJobs     PrintJob[]
  notifications Notification[]
  sessions      Session[]
  preferences   Json      @default("{}")
  
  @@index([email])
  @@index([username])
}

enum UserRole {
  ADMIN
  OPERATOR
  VIEWER
}

// Session Management
model Session {
  id           String   @id @default(uuid())
  userId       String
  token        String   @unique
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
}

// File Management
model File {
  id           String   @id @default(uuid())
  userId       String
  originalName String
  fileName     String
  filePath     String
  fileType     FileType
  fileSize     BigInt
  metadata     Json?
  thumbnailUrl String?
  printCount   Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  user      User       @relation(fields: [userId], references: [id])
  printJobs PrintJob[]
  slicedFiles SlicedFile[]
  
  @@index([userId])
  @@index([fileType])
}

enum FileType {
  STL
  GCODE
  OBJ
  THREEMF
}

// Sliced Files (G-code)
model SlicedFile {
  id            String   @id @default(uuid())
  sourceFileId  String
  filePath      String
  profileId     String
  estimatedTime Int      // seconds
  filamentUsage Float    // grams
  layerHeight   Float
  metadata      Json
  createdAt     DateTime @default(now())
  
  sourceFile File          @relation(fields: [sourceFileId], references: [id], onDelete: Cascade)
  profile    PrintProfile  @relation(fields: [profileId], references: [id])
  printJobs  PrintJob[]
  
  @@index([sourceFileId])
}

// Print Jobs
model PrintJob {
  id            String    @id @default(uuid())
  userId        String
  fileId        String
  slicedFileId  String?
  status        JobStatus
  progress      Float     @default(0)
  startedAt     DateTime?
  completedAt   DateTime?
  estimatedTime Int?      // seconds
  actualTime    Int?      // seconds
  filamentUsed  Float?    // grams
  cost          Decimal?  @db.Decimal(10, 2)
  notes         String?
  errorMessage  String?
  
  // Relations
  user        User              @relation(fields: [userId], references: [id])
  file        File              @relation(fields: [fileId], references: [id])
  slicedFile  SlicedFile?       @relation(fields: [slicedFileId], references: [id])
  temperatures TemperatureLog[]
  events      PrintEvent[]
  timelapse   Timelapse?
  
  @@index([userId])
  @@index([status])
  @@index([startedAt])
}

enum JobStatus {
  QUEUED
  PREPARING
  PRINTING
  PAUSED
  COMPLETED
  FAILED
  CANCELLED
}

// Temperature Logging
model TemperatureLog {
  id           String   @id @default(uuid())
  jobId        String
  hotendTemp   Float
  hotendTarget Float
  bedTemp      Float
  bedTarget    Float
  chamberTemp  Float?
  timestamp    DateTime @default(now())
  
  job PrintJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  @@index([jobId, timestamp])
}

// Print Events
model PrintEvent {
  id        String    @id @default(uuid())
  jobId     String
  eventType EventType
  message   String
  severity  Severity
  metadata  Json?
  timestamp DateTime  @default(now())
  
  job PrintJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  @@index([jobId, timestamp])
}

enum EventType {
  JOB_STARTED
  JOB_PAUSED
  JOB_RESUMED
  JOB_COMPLETED
  JOB_FAILED
  JOB_CANCELLED
  FILAMENT_CHANGE
  POWER_LOSS
  THERMAL_RUNAWAY
  POSITION_ERROR
  CUSTOM
}

enum Severity {
  INFO
  WARNING
  ERROR
  CRITICAL
}

// Printer Profiles
model PrintProfile {
  id            String   @id @default(uuid())
  name          String   @unique
  description   String?
  layerHeight   Float
  printSpeed    Float
  nozzleTemp    Float
  bedTemp       Float
  retraction    Float
  infill        Int
  supports      Boolean
  metadata      Json
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  slicedFiles SlicedFile[]
}

// Printer Settings
model PrinterSettings {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  category    String
  description String?
  updatedAt   DateTime @updatedAt
  
  @@index([category])
}

// Notifications
model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  metadata  Json?
  createdAt DateTime         @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  PRINT_COMPLETE
  PRINT_FAILED
  MAINTENANCE
}

// Time-lapse Videos
model Timelapse {
  id         String   @id @default(uuid())
  jobId      String   @unique
  videoPath  String
  frameCount Int
  duration   Int      // seconds
  fileSize   BigInt
  createdAt  DateTime @default(now())
  
  job PrintJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
}

// System Events (Audit Log)
model SystemEvent {
  id          String   @id @default(uuid())
  eventType   String
  description String
  userId      String?
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  timestamp   DateTime @default(now())
  
  @@index([eventType, timestamp])
  @@index([userId])
}
```

### 2.2 Database Indexes Strategy
```sql
-- Performance indexes
CREATE INDEX idx_print_jobs_active ON print_jobs(status) 
  WHERE status IN ('PRINTING', 'PAUSED', 'QUEUED');

CREATE INDEX idx_temperature_recent ON temperature_logs(timestamp DESC) 
  WHERE timestamp > NOW() - INTERVAL '24 hours';

CREATE INDEX idx_files_user_type ON files(user_id, file_type);

-- Full-text search
CREATE INDEX idx_files_search ON files 
  USING gin(to_tsvector('english', original_name));
```

---

## 3. API Design

### 3.1 RESTful Endpoints

#### Authentication Endpoints
```typescript
// POST /api/auth/register
{
  email: string;
  username: string;
  password: string;
}
// Response: { user, accessToken, refreshToken }

// POST /api/auth/login
{
  email: string;
  password: string;
}
// Response: { user, accessToken, refreshToken }

// POST /api/auth/refresh
{
  refreshToken: string;
}
// Response: { accessToken, refreshToken }

// POST /api/auth/logout
// Headers: Authorization: Bearer <token>
// Response: { success: true }

// GET /api/auth/me
// Headers: Authorization: Bearer <token>
// Response: { user }
```

#### Printer Control Endpoints
```typescript
// GET /api/printer/status
// Response: {
//   state: 'idle' | 'printing' | 'paused' | 'error',
//   temperatures: { hotend, bed, chamber },
//   position: { x, y, z, e },
//   currentJob: { ... } | null
// }

// POST /api/printer/command
{
  command: string; // G-code command
  wait: boolean;   // Wait for response
}
// Response: { response: string }

// POST /api/printer/home
{
  axes: ['X', 'Y', 'Z'] | 'all';
}

// POST /api/printer/move
{
  axis: 'X' | 'Y' | 'Z' | 'E';
  distance: number;
  speed: number;
}

// POST /api/printer/temperature
{
  hotend?: number;
  bed?: number;
  chamber?: number;
}

// POST /api/printer/emergency-stop
// Response: { success: true }

// POST /api/printer/pause
// POST /api/printer/resume
// POST /api/printer/cancel
```

#### File Management Endpoints
```typescript
// GET /api/files
// Query: ?folder=string&type=STL|GCODE&sort=name|date|size&page=1&limit=20
// Response: { files: [], total, page, pages }

// GET /api/files/:id
// Response: { file }

// POST /api/files/upload
// Body: FormData { file, folder?, name? }
// Response: { file }

// DELETE /api/files/:id
// Response: { success: true }

// POST /api/files/:id/slice
{
  profileId: string;
  settings?: {
    layerHeight?: number;
    infill?: number;
    supports?: boolean;
  }
}
// Response: { slicedFile }

// GET /api/files/:id/preview
// Response: 3D preview data or image

// GET /api/files/:id/download
// Response: File stream
```

#### Print Job Endpoints
```typescript
// GET /api/jobs
// Query: ?status=printing|completed&page=1&limit=20
// Response: { jobs: [], total, page, pages }

// GET /api/jobs/current
// Response: { job } | null

// GET /api/jobs/:id
// Response: { job, events, temperatures }

// POST /api/jobs/start
{
  fileId: string;
  slicedFileId?: string;
  settings?: {
    profileId?: string;
    temperature?: { hotend, bed };
  }
}
// Response: { job }

// POST /api/jobs/:id/pause
// POST /api/jobs/:id/resume
// POST /api/jobs/:id/cancel
// Response: { job }

// GET /api/jobs/:id/timelapse
// Response: { videoUrl }
```

#### Analytics Endpoints
```typescript
// GET /api/analytics/dashboard
// Response: {
//   totalPrints, successRate, totalTime,
//   materialUsed, averagePrintTime, trends
// }

// GET /api/analytics/statistics
// Query: ?from=date&to=date&groupBy=day|week|month
// Response: { statistics }

// GET /api/analytics/materials
// Response: { materials: [{ type, usage, cost }] }

// GET /api/analytics/failures
// Response: { failures: [{ reason, count, percentage }] }

// POST /api/analytics/predict
{
  fileId: string;
  profileId: string;
}
// Response: { estimatedTime, filamentUsage, successProbability }
```

#### Camera Endpoints
```typescript
// GET /api/camera/stream
// Response: MJPEG stream

// GET /api/camera/snapshot
// Response: JPEG image

// POST /api/camera/record/start
{
  quality: 'low' | 'medium' | 'high';
  maxDuration?: number;
}

// POST /api/camera/record/stop
// Response: { videoUrl }

// GET /api/camera/settings
// POST /api/camera/settings
{
  resolution: string;
  fps: number;
  quality: number;
}
```

### 3.2 API Response Format
```typescript
// Success Response
{
  success: true,
  data: any,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  }
}

// Error Response
{
  success: false,
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

---

## 4. Printer Communication Service

### 4.1 Serial Communication Manager
```typescript
// services/printer/SerialManager.ts
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import EventEmitter from 'events';

export class SerialManager extends EventEmitter {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private commandQueue: Command[] = [];
  private isConnected: boolean = false;
  private currentCommand: Command | null = null;

  async connect(portPath: string, baudRate: number = 115200) {
    try {
      this.port = new SerialPort({
        path: portPath,
        baudRate,
        autoOpen: false,
      });

      this.parser = this.port.pipe(new ReadlineParser({ 
        delimiter: '\n' 
      }));

      await this.openPort();
      this.setupEventHandlers();
      await this.initialize();
      
      this.isConnected = true;
      this.emit('connected');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    this.parser?.on('data', (line: string) => {
      this.handleResponse(line);
    });

    this.port?.on('error', (error) => {
      this.emit('error', error);
    });

    this.port?.on('close', () => {
      this.isConnected = false;
      this.emit('disconnected');
    });
  }

  private handleResponse(line: string) {
    // Parse printer response
    const response = this.parseResponse(line);
    
    // Emit response event
    this.emit('response', response);
    
    // Handle temperature reports
    if (response.type === 'temperature') {
      this.emit('temperature', response.data);
    }
    
    // Handle position reports
    if (response.type === 'position') {
      this.emit('position', response.data);
    }
    
    // Process command queue
    if (response.type === 'ok' && this.currentCommand) {
      this.currentCommand.resolve(response);
      this.currentCommand = null;
      this.processQueue();
    }
    
    // Handle errors
    if (response.type === 'error') {
      if (this.currentCommand) {
        this.currentCommand.reject(new Error(response.message));
        this.currentCommand = null;
      }
      this.emit('printer-error', response);
    }
  }

  async sendCommand(gcode: string, priority: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      const command: Command = {
        gcode,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      if (priority) {
        this.commandQueue.unshift(command);
      } else {
        this.commandQueue.push(command);
      }

      this.processQueue();
    });
  }

  private processQueue() {
    if (!this.isConnected || this.currentCommand || this.commandQueue.length === 0) {
      return;
    }

    this.currentCommand = this.commandQueue.shift()!;
    this.port?.write(this.currentCommand.gcode + '\n');
  }

  async emergencyStop() {
    // Clear queue
    this.commandQueue = [];
    this.currentCommand = null;
    
    // Send M112 (Emergency Stop)
    this.port?.write('M112\n');
    
    // Reset printer
    await this.reset();
  }

  async disconnect() {
    this.isConnected = false;
    this.commandQueue = [];
    
    if (this.port?.isOpen) {
      await new Promise<void>((resolve) => {
        this.port?.close(() => resolve());
      });
    }
  }
}
```

### 4.2 G-code Parser
```typescript
// services/printer/GCodeParser.ts
export class GCodeParser {
  private fileContent: string;
  private lines: string[];
  private metadata: GCodeMetadata = {};

  constructor(gcode: string) {
    this.fileContent = gcode;
    this.lines = gcode.split('\n');
    this.parseMetadata();
  }

  private parseMetadata() {
    for (const line of this.lines) {
      // Parse Cura metadata
      if (line.includes(';FLAVOR:')) {
        this.metadata.flavor = line.split(':')[1].trim();
      }
      if (line.includes(';TIME:')) {
        this.metadata.estimatedTime = parseInt(line.split(':')[1]);
      }
      if (line.includes(';Filament used:')) {
        this.metadata.filamentUsed = parseFloat(line.split(':')[1]);
      }
      if (line.includes(';Layer height:')) {
        this.metadata.layerHeight = parseFloat(line.split(':')[1]);
      }
      
      // Parse PrusaSlicer metadata
      if (line.includes('; estimated printing time')) {
        const match = line.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
        if (match) {
          this.metadata.estimatedTime = this.parseTimeString(match[0]);
        }
      }
    }
  }

  getLayerCount(): number {
    return this.lines.filter(line => 
      line.includes(';LAYER:') || line.includes('; layer')
    ).length;
  }

  getLayerCommands(layerIndex: number): string[] {
    const layerCommands: string[] = [];
    let currentLayer = -1;
    let inTargetLayer = false;

    for (const line of this.lines) {
      if (line.includes(';LAYER:') || line.includes('; layer')) {
        currentLayer++;
        inTargetLayer = currentLayer === layerIndex;
      }
      
      if (inTargetLayer && !line.startsWith(';')) {
        layerCommands.push(line);
      }
      
      if (currentLayer > layerIndex) break;
    }

    return layerCommands;
  }

  estimatePrintTime(): number {
    if (this.metadata.estimatedTime) {
      return this.metadata.estimatedTime;
    }

    // Simple estimation based on movements
    let totalTime = 0;
    let currentPosition = { x: 0, y: 0, z: 0, e: 0 };
    let feedRate = 1000; // mm/min default

    for (const line of this.lines) {
      if (line.startsWith('G0') || line.startsWith('G1')) {
        const newPosition = this.parsePosition(line);
        const newFeedRate = this.parseFeedRate(line);
        
        if (newFeedRate) feedRate = newFeedRate;
        
        const distance = this.calculateDistance(currentPosition, newPosition);
        totalTime += (distance / feedRate) * 60; // Convert to seconds
        
        currentPosition = { ...currentPosition, ...newPosition };
      }
    }

    return Math.round(totalTime);
  }

  private parsePosition(line: string): Partial<Position> {
    const position: Partial<Position> = {};
    
    const xMatch = line.match(/X([-\d.]+)/);
    const yMatch = line.match(/Y([-\d.]+)/);
    const zMatch = line.match(/Z([-\d.]+)/);
    const eMatch = line.match(/E([-\d.]+)/);
    
    if (xMatch) position.x = parseFloat(xMatch[1]);
    if (yMatch) position.y = parseFloat(yMatch[1]);
    if (zMatch) position.z = parseFloat(zMatch[1]);
    if (eMatch) position.e = parseFloat(eMatch[1]);
    
    return position;
  }

  private parseFeedRate(line: string): number | null {
    const match = line.match(/F([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }

  private calculateDistance(p1: Position, p2: Partial<Position>): number {
    const dx = (p2.x ?? p1.x) - p1.x;
    const dy = (p2.y ?? p1.y) - p1.y;
    const dz = (p2.z ?? p1.z) - p1.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
```

### 4.3 Printer Service
```typescript
// services/printer/PrinterService.ts
export class PrinterService {
  private serialManager: SerialManager;
  private currentJob: PrintJob | null = null;
  private isPrinting: boolean = false;
  private isPaused: boolean = false;
  private printQueue: string[] = [];
  private currentLineIndex: number = 0;
  private temperatures: TemperatureData;
  private position: Position;

  constructor() {
    this.serialManager = new SerialManager();
    this.setupEventHandlers();
    this.startMonitoring();
  }

  private setupEventHandlers() {
    this.serialManager.on('temperature', (temp) => {
      this.temperatures = temp;
      this.emitStatusUpdate();
    });

    this.serialManager.on('position', (pos) => {
      this.position = pos;
    });

    this.serialManager.on('printer-error', async (error) => {
      await this.handlePrinterError(error);
    });
  }

  async startPrint(jobId: string, gcode: string) {
    if (this.isPrinting) {
      throw new Error('Printer is already printing');
    }

    this.currentJob = await this.loadJob(jobId);
    this.printQueue = gcode.split('\n').filter(line => 
      line && !line.startsWith(';')
    );
    
    this.currentLineIndex = 0;
    this.isPrinting = true;
    this.isPaused = false;

    // Preheat if needed
    await this.preheat();
    
    // Home axes
    await this.home(['X', 'Y', 'Z']);
    
    // Start printing
    this.processPrintQueue();
  }

  private async processPrintQueue() {
    while (this.isPrinting && this.currentLineIndex < this.printQueue.length) {
      if (this.isPaused) {
        await this.wait(1000);
        continue;
      }

      const command = this.printQueue[this.currentLineIndex];
      
      try {
        await this.serialManager.sendCommand(command);
        this.currentLineIndex++;
        
        // Update progress
        const progress = (this.currentLineIndex / this.printQueue.length) * 100;
        await this.updateJobProgress(this.currentJob!.id, progress);
        
        // Emit progress
        this.emitProgressUpdate(progress);
        
      } catch (error) {
        await this.handlePrintError(error);
      }
    }

    if (this.isPrinting && this.currentLineIndex >= this.printQueue.length) {
      await this.completePrint();
    }
  }

  async pausePrint() {
    if (!this.isPrinting || this.isPaused) return;
    
    this.isPaused = true;
    
    // Save current position
    const savedPosition = { ...this.position };
    
    // Move to pause position
    await this.serialManager.sendCommand('G91'); // Relative positioning
    await this.serialManager.sendCommand('G1 Z10 F300'); // Lift Z
    await this.serialManager.sendCommand('G90'); // Absolute positioning
    await this.serialManager.sendCommand('G1 X0 Y0 F3000'); // Park
    
    // Lower bed temperature
    await this.serialManager.sendCommand('M140 S40');
    
    // Store pause state
    await this.savePauseState(savedPosition);
  }

  async resumePrint() {
    if (!this.isPrinting || !this.isPaused) return;
    
    const pauseState = await this.loadPauseState();
    
    // Reheat
    await this.preheat();
    
    // Return to position
    await this.serialManager.sendCommand(`G1 X${pauseState.x} Y${pauseState.y} F3000`);
    await this.serialManager.sendCommand(`G1 Z${pauseState.z} F300`);
    
    this.isPaused = false;
    this.processPrintQueue();
  }

  async cancelPrint() {
    this.isPrinting = false;
    this.isPaused = false;
    this.printQueue = [];
    
    // Stop heating
    await this.serialManager.sendCommand('M104 S0'); // Hotend off
    await this.serialManager.sendCommand('M140 S0'); // Bed off
    
    // Park
    await this.serialManager.sendCommand('G91');
    await this.serialManager.sendCommand('G1 Z10 F300');
    await this.serialManager.sendCommand('G90');
    await this.serialManager.sendCommand('G1 X0 Y0 F3000');
    
    // Update job status
    if (this.currentJob) {
      await this.updateJobStatus(this.currentJob.id, 'CANCELLED');
    }
    
    this.currentJob = null;
  }

  async emergencyStop() {
    await this.serialManager.emergencyStop();
    this.isPrinting = false;
    this.isPaused = false;
    this.printQueue = [];
    this.currentJob = null;
  }

  private async startMonitoring() {
    setInterval(async () => {
      if (this.serialManager.isConnected) {
        // Request temperature
        await this.serialManager.sendCommand('M105');
        
        // Request position periodically
        if (this.isPrinting) {
          await this.serialManager.sendCommand('M114');
        }
      }
    }, 2000); // Every 2 seconds
  }
}
```

---

## 5. WebSocket Implementation

### 5.1 WebSocket Server
```typescript
// websocket/WebSocketServer.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export class WebSocketServer {
  private io: Server;
  private clients: Map<string, ClientInfo> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          // Allow demo mode without auth
          if (socket.handshake.query.demo === 'true') {
            socket.data.isDemo = true;
            return next();
          }
          throw new Error('Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
        
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Store client info
      this.clients.set(socket.id, {
        socketId: socket.id,
        userId: socket.data.userId,
        isDemo: socket.data.isDemo,
        role: socket.data.role,
        connectedAt: new Date(),
      });

      // Join rooms
      if (socket.data.isDemo) {
        socket.join('demo');
      } else {
        socket.join('authenticated');
        socket.join(`user:${socket.data.userId}`);
      }

      // Subscribe to events
      socket.on('subscribe:status', () => {
        socket.join('status-updates');
      });

      socket.on('subscribe:temperature', () => {
        socket.join('temperature-updates');
      });

      socket.on('subscribe:camera', () => {
        if (!socket.data.isDemo || this.isDemoCameraAllowed()) {
          socket.join('camera-stream');
        }
      });

      // Control commands (authenticated only)
      socket.on('control:pause', async () => {
        if (this.canControl(socket)) {
          await this.handlePauseCommand(socket);
        }
      });

      socket.on('control:resume', async () => {
        if (this.canControl(socket)) {
          await this.handleResumeCommand(socket);
        }
      });

      socket.on('control:stop', async () => {
        if (this.canControl(socket)) {
          await this.handleStopCommand(socket);
        }
      });

      socket.on('control:emergency', async () => {
        if (this.canControl(socket)) {
          await this.handleEmergencyStop(socket);
        }
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.clients.delete(socket.id);
      });
    });
  }

  private canControl(socket: any): boolean {
    return !socket.data.isDemo && 
           ['ADMIN', 'OPERATOR'].includes(socket.data.role);
  }

  // Broadcast methods
  broadcastStatus(status: PrinterStatus) {
    this.io.to('status-updates').emit('status:update', status);
  }

  broadcastTemperature(temperature: TemperatureData) {
    this.io.to('temperature-updates').emit('temperature:update', temperature);
  }

  broadcastProgress(progress: ProgressData) {
    this.io.to('authenticated').emit('progress:update', progress);
    
    // Send limited data to demo
    this.io.to('demo').emit('progress:update', {
      percentage: progress.percentage,
      timeRemaining: progress.timeRemaining,
    });
  }

  broadcastAlert(alert: Alert) {
    this.io.to('authenticated').emit('alert', alert);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Camera streaming
  streamCameraFrame(frame: Buffer) {
    // Convert to base64 for web transmission
    const base64Frame = frame.toString('base64');
    
    this.io.to('camera-stream').emit('camera:frame', {
      timestamp: Date.now(),
      frame: base64Frame,
    });
  }
}
```

### 5.2 WebSocket Events
```typescript
// websocket/events.ts
export enum ClientEvents {
  // Subscriptions
  SUBSCRIBE_STATUS = 'subscribe:status',
  SUBSCRIBE_TEMPERATURE = 'subscribe:temperature',
  SUBSCRIBE_CAMERA = 'subscribe:camera',
  SUBSCRIBE_PROGRESS = 'subscribe:progress',
  
  // Control
  CONTROL_PAUSE = 'control:pause',
  CONTROL_RESUME = 'control:resume',
  CONTROL_STOP = 'control:stop',
  CONTROL_EMERGENCY = 'control:emergency',
  CONTROL_COMMAND = 'control:command',
  
  // File operations
  FILE_UPLOAD_START = 'file:upload:start',
  FILE_UPLOAD_PROGRESS = 'file:upload:progress',
  FILE_UPLOAD_COMPLETE = 'file:upload:complete',
}

export enum ServerEvents {
  // Status updates
  STATUS_UPDATE = 'status:update',
  TEMPERATURE_UPDATE = 'temperature:update',
  POSITION_UPDATE = 'position:update',
  PROGRESS_UPDATE = 'progress:update',
  
  // Alerts
  ALERT = 'alert',
  ERROR = 'error',
  
  // Print events
  PRINT_STARTED = 'print:started',
  PRINT_PAUSED = 'print:paused',
  PRINT_RESUMED = 'print:resumed',
  PRINT_COMPLETED = 'print:completed',
  PRINT_FAILED = 'print:failed',
  PRINT_CANCELLED = 'print:cancelled',
  
  // Camera
  CAMERA_FRAME = 'camera:frame',
  CAMERA_ERROR = 'camera:error',
  
  // File events
  FILE_UPLOAD_PROGRESS = 'file:upload:progress',
  FILE_PROCESSED = 'file:processed',
}
```

---

## 6. File Processing Service

### 6.1 File Upload Handler
```typescript
// services/files/FileUploadService.ts
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export class FileUploadService {
  private upload: multer.Multer;
  
  constructor() {
    this.upload = multer({
      storage: multer.diskStorage({
        destination: async (req, file, cb) => {
          const folder = req.body.folder || 'uploads';
          const uploadPath = path.join(process.env.UPLOAD_DIR!, folder);
          await this.ensureDirectory(uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueName}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.stl', '.gcode', '.obj', '.3mf'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${ext} not allowed`));
        }
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
    });
  }

  async processUpload(file: Express.Multer.File, userId: string) {
    const fileInfo = await this.extractFileInfo(file);
    
    // Generate thumbnail for STL files
    let thumbnailUrl = null;
    if (file.originalname.endsWith('.stl')) {
      thumbnailUrl = await this.generateSTLThumbnail(file.path);
    }
    
    // Save to database
    const savedFile = await prisma.file.create({
      data: {
        userId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileType: this.getFileType(file.originalname),
        fileSize: file.size,
        metadata: fileInfo,
        thumbnailUrl,
      },
    });
    
    // Emit upload complete event
    websocketServer.sendToUser(userId, 'file:uploaded', savedFile);
    
    return savedFile;
  }

  private async generateSTLThumbnail(filePath: string): Promise<string> {
    // Use STL thumbnail generator
    const thumbnailPath = filePath.replace(/\.[^.]+$/, '_thumb.png');
    
    // Generate thumbnail using three.js in a worker thread
    await this.runSTLThumbnailWorker(filePath, thumbnailPath);
    
    return thumbnailPath;
  }

  private async extractFileInfo(file: Express.Multer.File) {
    const info: any = {
      originalSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
    };
    
    // Extract STL information
    if (file.originalname.endsWith('.stl')) {
      const stlInfo = await this.parseSTL(file.path);
      info.vertices = stlInfo.vertices;
      info.faces = stlInfo.faces;
      info.boundingBox = stlInfo.boundingBox;
    }
    
    // Extract G-code information
    if (file.originalname.endsWith('.gcode')) {
      const gcodeParser = new GCodeParser(
        await fs.readFile(file.path, 'utf-8')
      );
      info.estimatedTime = gcodeParser.estimatePrintTime();
      info.layerCount = gcodeParser.getLayerCount();
      info.metadata = gcodeParser.metadata;
    }
    
    return info;
  }
}
```

### 6.2 STL Processing
```typescript
// services/files/STLProcessor.ts
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

export class STLProcessor {
  private loader: STLLoader;

  constructor() {
    this.loader = new STLLoader();
  }

  async parseSTL(filePath: string): Promise<STLInfo> {
    const buffer = await fs.readFile(filePath);
    const geometry = this.loader.parse(buffer.buffer);
    
    // Calculate bounding box
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    
    // Calculate volume
    const volume = this.calculateVolume(geometry);
    
    // Get vertex and face count
    const vertices = geometry.attributes.position.count;
    const faces = vertices / 3;
    
    return {
      vertices,
      faces,
      volume,
      boundingBox: {
        min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
        max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z },
        size: {
          x: bbox.max.x - bbox.min.x,
          y: bbox.max.y - bbox.min.y,
          z: bbox.max.z - bbox.min.z,
        },
      },
      centerOfMass: this.calculateCenterOfMass(geometry),
    };
  }

  private calculateVolume(geometry: THREE.BufferGeometry): number {
    const position = geometry.attributes.position;
    let volume = 0;

    for (let i = 0; i < position.count; i += 3) {
      const v1 = new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      );
      const v2 = new THREE.Vector3(
        position.getX(i + 1),
        position.getY(i + 1),
        position.getZ(i + 1)
      );
      const v3 = new THREE.Vector3(
        position.getX(i + 2),
        position.getY(i + 2),
        position.getZ(i + 2)
      );

      // Calculate signed volume of tetrahedron
      volume += v1.dot(v2.cross(v3)) / 6;
    }

    return Math.abs(volume);
  }

  private calculateCenterOfMass(geometry: THREE.BufferGeometry): Vector3 {
    const position = geometry.attributes.position;
    const center = new THREE.Vector3();
    
    for (let i = 0; i < position.count; i++) {
      center.x += position.getX(i);
      center.y += position.getY(i);
      center.z += position.getZ(i);
    }
    
    center.divideScalar(position.count);
    
    return {
      x: center.x,
      y: center.y,
      z: center.z,
    };
  }

  async generatePreview(filePath: string, outputPath: string) {
    // This would run in a worker thread
    // Generate a PNG preview of the STL file
    // Using headless three.js rendering
  }
}
```

---

## 7. Camera Service

### 7.1 Camera Stream Manager
```typescript
// services/camera/CameraService.ts
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export class CameraService extends EventEmitter {
  private ffmpeg: any = null;
  private isStreaming: boolean = false;
  private streamUrl: string;
  private recordingProcess: any = null;
  private snapshotQueue: Function[] = [];

  constructor(streamUrl: string) {
    super();
    this.streamUrl = streamUrl;
  }

  async startStreaming() {
    if (this.isStreaming) return;

    this.ffmpeg = spawn('ffmpeg', [
      '-f', 'mjpeg',
      '-i', this.streamUrl,
      '-f', 'mjpeg',
      '-q:v', '5',
      '-r', '30',
      'pipe:1'
    ]);

    this.ffmpeg.stdout.on('data', (chunk: Buffer) => {
      // Parse MJPEG stream and emit frames
      const frames = this.parseMJPEG(chunk);
      frames.forEach(frame => {
        this.emit('frame', frame);
        websocketServer.streamCameraFrame(frame);
      });
    });

    this.ffmpeg.stderr.on('data', (data: Buffer) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

    this.ffmpeg.on('close', (code: number) => {
      console.log(`FFmpeg process exited with code ${code}`);
      this.isStreaming = false;
      
      // Auto-restart on failure
      if (code !== 0) {
        setTimeout(() => this.startStreaming(), 5000);
      }
    });

    this.isStreaming = true;
  }

  async takeSnapshot(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const snapshot = spawn('ffmpeg', [
        '-f', 'mjpeg',
        '-i', this.streamUrl,
        '-vframes', '1',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        'pipe:1'
      ]);

      const chunks: Buffer[] = [];
      
      snapshot.stdout.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      snapshot.on('close', (code: number) => {
        if (code === 0) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(new Error(`Snapshot failed with code ${code}`));
        }
      });

      setTimeout(() => {
        snapshot.kill();
        reject(new Error('Snapshot timeout'));
      }, 5000);
    });
  }

  async startRecording(outputPath: string, duration?: number) {
    if (this.recordingProcess) {
      throw new Error('Already recording');
    }

    const args = [
      '-f', 'mjpeg',
      '-i', this.streamUrl,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
    ];

    if (duration) {
      args.push('-t', duration.toString());
    }

    args.push(outputPath);

    this.recordingProcess = spawn('ffmpeg', args);

    this.recordingProcess.on('close', (code: number) => {
      this.recordingProcess = null;
      this.emit('recordingComplete', outputPath);
    });

    return outputPath;
  }

  async stopRecording() {
    if (this.recordingProcess) {
      this.recordingProcess.kill('SIGINT');
      this.recordingProcess = null;
    }
  }

  async createTimelapse(images: string[], outputPath: string, fps: number = 30) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-framerate', fps.toString(),
        '-pattern_type', 'glob',
        '-i', '*.jpg',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '22',
        '-pix_fmt', 'yuv420p',
        outputPath
      ]);

      ffmpeg.on('close', (code: number) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`Timelapse creation failed with code ${code}`));
        }
      });
    });
  }

  private parseMJPEG(buffer: Buffer): Buffer[] {
    const frames: Buffer[] = [];
    const SOI = Buffer.from([0xFF, 0xD8]); // Start of Image
    const EOI = Buffer.from([0xFF, 0xD9]); // End of Image
    
    let start = 0;
    while (start < buffer.length) {
      const soiIndex = buffer.indexOf(SOI, start);
      if (soiIndex === -1) break;
      
      const eoiIndex = buffer.indexOf(EOI, soiIndex);
      if (eoiIndex === -1) break;
      
      frames.push(buffer.slice(soiIndex, eoiIndex + 2));
      start = eoiIndex + 2;
    }
    
    return frames;
  }
}
```

---

## 8. Background Jobs

### 8.1 Job Queue Manager
```typescript
// workers/JobQueue.ts
import Bull from 'bull';
import { Worker } from 'worker_threads';

export class JobQueue {
  private queues: Map<string, Bull.Queue> = new Map();

  constructor() {
    this.initializeQueues();
  }

  private initializeQueues() {
    // File processing queue
    this.createQueue('file-processing', async (job) => {
      const { fileId, operation } = job.data;
      
      switch (operation) {
        case 'generate-thumbnail':
          await this.generateThumbnail(fileId);
          break;
        case 'slice':
          await this.sliceFile(fileId, job.data.profileId);
          break;
        case 'analyze':
          await this.analyzeFile(fileId);
          break;
      }
    });

    // Maintenance queue
    this.createQueue('maintenance', async (job) => {
      const { task } = job.data;
      
      switch (task) {
        case 'cleanup-old-files':
          await this.cleanupOldFiles();
          break;
        case 'generate-reports':
          await this.generateReports();
          break;
        case 'backup-database':
          await this.backupDatabase();
          break;
      }
    });

    // Notification queue
    this.createQueue('notifications', async (job) => {
      const { userId, type, data } = job.data;
      await this.sendNotification(userId, type, data);
    });

    // Analytics queue
    this.createQueue('analytics', async (job) => {
      const { type, data } = job.data;
      
      switch (type) {
        case 'process-print-data':
          await this.processPrintAnalytics(data);
          break;
        case 'generate-insights':
          await this.generateInsights(data);
          break;
      }
    });
  }

  private createQueue(name: string, processor: Bull.ProcessCallbackFunction<any>) {
    const queue = new Bull(name, {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    });

    queue.process(processor);
    
    queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} in queue ${name} failed:`, err);
    });

    this.queues.set(name, queue);
  }

  async addJob(queueName: string, data: any, options?: Bull.JobOptions) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    return queue.add(data, options);
  }

  // Scheduled jobs
  setupScheduledJobs() {
    // Daily cleanup
    this.addJob('maintenance', 
      { task: 'cleanup-old-files' },
      { repeat: { cron: '0 2 * * *' } } // 2 AM daily
    );

    // Weekly reports
    this.addJob('maintenance',
      { task: 'generate-reports' },
      { repeat: { cron: '0 9 * * MON' } } // Monday 9 AM
    );

    // Hourly analytics processing
    this.addJob('analytics',
      { type: 'process-print-data' },
      { repeat: { cron: '0 * * * *' } } // Every hour
    );
  }
}
```

### 8.2 Worker Thread Tasks
```typescript
// workers/tasks/SlicingWorker.ts
import { parentPort, workerData } from 'worker_threads';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function sliceSTL() {
  const { inputFile, outputFile, profile } = workerData;

  try {
    // Use PrusaSlicer or Cura in command-line mode
    const command = `prusa-slicer --load "${profile}" --export-gcode --output "${outputFile}" "${inputFile}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    // Parse output for metadata
    const metadata = parseSlicerOutput(stdout);
    
    parentPort?.postMessage({
      success: true,
      outputFile,
      metadata,
    });
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: error.message,
    });
  }
}

function parseSlicerOutput(output: string) {
  const metadata: any = {};
  
  // Parse estimated time
  const timeMatch = output.match(/Estimated print time: ([\d:]+)/);
  if (timeMatch) {
    metadata.estimatedTime = parseTimeString(timeMatch[1]);
  }
  
  // Parse filament usage
  const filamentMatch = output.match(/Filament used: ([\d.]+)m/);
  if (filamentMatch) {
    metadata.filamentLength = parseFloat(filamentMatch[1]);
  }
  
  return metadata;
}

// Run the worker
sliceSTL();
```

---

## 9. Security Implementation

### 9.1 Authentication Middleware
```typescript
// middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Check if demo mode is allowed
      if (req.path.startsWith('/api/public/')) {
        return next();
      }
      
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired',
        },
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }

    next();
  };
};
```

### 9.2 Rate Limiting
```typescript
// middlewares/rateLimit.middleware.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Different rate limiters for different endpoints
const rateLimiters = {
  api: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:api',
    points: 100, // requests
    duration: 60, // per minute
  }),
  
  auth: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:auth',
    points: 5,
    duration: 60 * 15, // 5 attempts per 15 minutes
  }),
  
  upload: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:upload',
    points: 10,
    duration: 60 * 60, // 10 uploads per hour
  }),
  
  control: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:control',
    points: 30,
    duration: 60, // 30 control commands per minute
  }),
};

export const rateLimit = (type: keyof typeof rateLimiters) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limiter = rateLimiters[type];
      const key = req.user?.id || req.ip;
      
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60,
        },
      });
    }
  };
};
```

### 9.3 Input Validation
```typescript
// validators/printer.validator.ts
import { z } from 'zod';

export const printerCommandSchema = z.object({
  command: z.string()
    .min(1)
    .max(100)
    .regex(/^[A-Z][0-9]*(\s+[A-Z][-\d.]+)*$/i, 'Invalid G-code format'),
  wait: z.boolean().optional(),
});

export const temperatureSchema = z.object({
  hotend: z.number().min(0).max(300).optional(),
  bed: z.number().min(0).max(120).optional(),
  chamber: z.number().min(0).max(80).optional(),
});

export const moveSchema = z.object({
  axis: z.enum(['X', 'Y', 'Z', 'E']),
  distance: z.number().min(-200).max(200),
  speed: z.number().min(1).max(10000),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
};
```

---

## 10. Monitoring & Logging

### 10.1 Logger Configuration
```typescript
// utils/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lezerprint-backend' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File rotation
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    
    // Error log
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
  ],
});

// Production additions
if (process.env.NODE_ENV === 'production') {
  // Sentry integration
  logger.add(new SentryTransport({
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
    level: 'error',
  }));
}

export default logger;
```

### 10.2 Metrics Collection
```typescript
// monitoring/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const printJobsTotal = new Counter({
  name: 'print_jobs_total',
  help: 'Total number of print jobs',
  labelNames: ['status'],
  registers: [register],
});

export const printerTemperature = new Gauge({
  name: 'printer_temperature_celsius',
  help: 'Current printer temperatures',
  labelNames: ['component'],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

// Middleware to track HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};
```

---

## 11. Testing Strategy

### 11.1 Unit Tests
```typescript
// tests/services/printer.test.ts
import { PrinterService } from '@/services/printer/PrinterService';
import { SerialManager } from '@/services/printer/SerialManager';

jest.mock('@/services/printer/SerialManager');

describe('PrinterService', () => {
  let printerService: PrinterService;
  let mockSerialManager: jest.Mocked<SerialManager>;

  beforeEach(() => {
    mockSerialManager = new SerialManager() as jest.Mocked<SerialManager>;
    printerService = new PrinterService();
    printerService['serialManager'] = mockSerialManager;
  });

  describe('startPrint', () => {
    it('should start a print job successfully', async () => {
      const jobId = 'test-job-id';
      const gcode = 'G28\nG1 X10 Y10\nM104 S200';
      
      mockSerialManager.sendCommand.mockResolvedValue('ok');
      
      await printerService.startPrint(jobId, gcode);
      
      expect(mockSerialManager.sendCommand).toHaveBeenCalledWith('G28');
      expect(printerService['isPrinting']).toBe(true);
    });

    it('should throw error if already printing', async () => {
      printerService['isPrinting'] = true;
      
      await expect(printerService.startPrint('job', 'G28'))
        .rejects.toThrow('Printer is already printing');
    });
  });

  describe('emergencyStop', () => {
    it('should stop printer immediately', async () => {
      mockSerialManager.emergencyStop.mockResolvedValue(undefined);
      
      await printerService.emergencyStop();
      
      expect(mockSerialManager.emergencyStop).toHaveBeenCalled();
      expect(printerService['isPrinting']).toBe(false);
    });
  });
});
```

### 11.2 Integration Tests
```typescript
// tests/api/printer.test.ts
import request from 'supertest';
import app from '@/server';
import { printerService } from '@/services';

describe('Printer API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test user and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpass',
      });
    
    authToken = response.body.data.accessToken;
  });

  describe('GET /api/printer/status', () => {
    it('should return printer status', async () => {
      const response = await request(app)
        .get('/api/printer/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('state');
      expect(response.body.data).toHaveProperty('temperatures');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/printer/status')
        .expect(401);
    });
  });

  describe('POST /api/printer/command', () => {
    it('should send command to printer', async () => {
      jest.spyOn(printerService, 'sendCommand')
        .mockResolvedValue('ok');

      const response = await request(app)
        .post('/api/printer/command')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          command: 'G28',
          wait: true,
        })
        .expect(200);

      expect(response.body.data.response).toBe('ok');
    });

    it('should validate command format', async () => {
      const response = await request(app)
        .post('/api/printer/command')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          command: 'invalid command!',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

---

## 12. Deployment Configuration

### 12.1 Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Build application
COPY . .
RUN npm run build
RUN npx prisma generate

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set permissions
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### 12.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@postgres:5432/lezerprint
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PRINTER_PORT: /dev/ttyUSB0
      CAMERA_URL: http://camera:8080/stream
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
      - /dev/ttyUSB0:/dev/ttyUSB0
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lezerprint
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 12.3 Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lezerprint
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret
BCRYPT_ROUNDS=12

# Printer
PRINTER_PORT=/dev/ttyUSB0
PRINTER_BAUDRATE=115200

# Camera
CAMERA_URL=http://192.168.1.100:8080/stream

# Storage
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=524288000

# Frontend
FRONTEND_URL=https://lezerprint.com
CORS_ORIGIN=https://lezerprint.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 13. API Documentation

### 13.1 OpenAPI Specification
```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: LezerPrint API
  version: 1.0.0
  description: 3D Printer Management System API

servers:
  - url: http://localhost:3001/api
    description: Development server
  - url: https://api.lezerprint.com
    description: Production server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    PrinterStatus:
      type: object
      properties:
        state:
          type: string
          enum: [idle, printing, paused, error]
        temperatures:
          $ref: '#/components/schemas/TemperatureData'
        position:
          $ref: '#/components/schemas/Position'
        currentJob:
          $ref: '#/components/schemas/PrintJob'

paths:
  /printer/status:
    get:
      summary: Get printer status
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Current printer status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PrinterStatus'
```

---

## Conclusion

This backend specification provides a comprehensive blueprint for building LezerPrint's server infrastructure. The architecture emphasizes:

- **Real-time Communication**: WebSocket integration for live updates
- **Hardware Integration**: Direct printer control via serial communication
- **Scalability**: Microservices architecture with job queues
- **Security**: JWT authentication, rate limiting, input validation
- **Reliability**: Error handling, monitoring, and logging
- **Performance**: Caching, database optimization, worker threads

The specification serves as the definitive guide for backend development, ensuring robust printer management, secure API endpoints, and reliable system operation.