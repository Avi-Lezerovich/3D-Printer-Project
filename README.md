# 3D Printer Project

A full-stack 3D printer management system with React frontend, Express backend, and comprehensive project management features.

## 📁 Project Structure

```
3D-Printer-Project/
│
├── 📁 frontend/                    # React frontend application
│   ├── src/                       # React components, pages, services
│   ├── public/                    # Static assets
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite configuration
│
├── 📁 backend/                     # Express.js API server
│   ├── src/                      # Server routes, middleware, types
│   ├── dist/                     # Compiled TypeScript output
│   ├── package.json              # Backend dependencies
│   └── tsconfig.json             # Backend TypeScript config
│
├── 📁 deployment/                  # Infrastructure & deployment
│   ├── docker/                   # Docker configurations
│   ├── scripts/                  # Deployment scripts
│   └── config/                   # Environment configurations
│
├── 📁 docs/                       # Project documentation
├── package.json                   # Root workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 3D-Printer-Project
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp deployment/config/.env.example deployment/config/.env
   # Edit the .env file with your configuration
   ```

### Development

**Start both frontend and backend in development mode:**
```bash
npm run dev
```

**Or run individually:**
```bash
# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:8080)
npm run dev:backend
```

### Building

**Build both applications:**
```bash
npm run build
```

**Build individually:**
```bash
npm run build:frontend
npm run build:backend
```

## 🐳 Docker Deployment

**Quick deployment with Docker Compose:**
```bash
./deployment/scripts/deploy.sh
```

**Manual Docker commands:**
```bash
cd deployment/docker
docker-compose up -d
```

## 🧪 Testing

**Run all tests:**
```bash
npm run test
```

**Run with coverage:**
```bash
npm run test:coverage
```

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run build` | Build both applications for production |
| `npm run test` | Run all tests |
| `npm run lint` | Run ESLint on both applications |
| `npm run format` | Format code with Prettier |

## 📚 Features

### Frontend (React + TypeScript)
- 🎨 Modern React with TypeScript
- 🎭 Framer Motion animations
- 🎯 3D visualization with Three.js
- 📊 Interactive charts with Recharts
- 🎨 Responsive design
- 🧪 Component testing with Vitest

### Backend (Express + TypeScript)  
- 🔒 JWT authentication
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📝 Request validation
- 🧪 API testing with Supertest
- 📊 Real-time updates with Socket.io

### Infrastructure
- 🐳 Docker containerization
- 🔄 Hot reload for development
- 📦 Optimized production builds
- 🚀 Easy deployment scripts

## 🏗️ Architecture

This project follows a **monorepo** structure with clear separation of concerns:

- **Frontend**: Handles all user interface and client-side logic
- **Backend**: Provides REST APIs and business logic  
- **Deployment**: Contains infrastructure and deployment configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
