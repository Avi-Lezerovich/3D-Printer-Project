# 3D Printer Control System

A streamlined 3D printer control system with a clean React interface and essential backend services. Focused on core functionality: monitoring, control, and configuration.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Avi-Lezerovich/3D-Printer-Project.git
cd 3D-Printer-Project
npm run install:all

# Start development servers
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api/v2
# API Documentation: http://localhost:3000/api/v1/docs
```

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express, TypeScript, Socket.io, JWT Authentication
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Infrastructure**: Docker, Redis, Nginx
- **Testing**: Vitest, Testing Library, Supertest

## 📁 Project Structure

```
3D-Printer-Project/
├── frontend/          # React SPA with TypeScript
├── backend/           # Express API server
├── shared/            # Shared types and utilities  
├── docs/              # Comprehensive documentation
└── deployment/        # Docker and deployment configs
```

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [Setup Guide](docs/SETUP.md) | Complete installation and deployment guide |
| [Architecture](docs/ARCHITECTURE.md) | System design and best practices |
| [API Documentation](docs/API.md) | REST API endpoints and examples |
| [Security](docs/SECURITY.md) | Security implementation and guidelines |
| [Testing](docs/TESTING.md) | Testing strategies and patterns |

## ✨ Key Features

- **3D Printer Control Panel**: Real-time monitoring and print management
- **Dashboard**: Clean overview with project showcase and system status
- **Settings Management**: Configuration for printer parameters and preferences  
- **Help & Documentation**: Comprehensive user guidance and troubleshooting
- **Secure Authentication**: JWT-based user sessions with refresh token rotation
- **Modern Architecture**: Clean separation between frontend, backend, and shared types

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers (frontend + backend) |
| `npm run build` | Build all packages for production |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |

### Development Workflow

1. **Feature Development**: Create feature branch and make changes
2. **Quality Checks**: Run `npm run lint && npm test && npm run build`
3. **Testing**: Comprehensive unit, integration, and e2e test coverage

## 🐳 Deployment

### Docker (Recommended)

```bash
# Build and start all services
npm run deploy:local:build
npm run deploy:local:up

# Monitor logs
npm run deploy:local:logs
```

### Manual Deployment

See the [Setup Guide](docs/SETUP.md) for detailed deployment instructions.

## 🔒 Security

The project implements security-by-design with:
- JWT authentication with refresh token rotation
- CSRF protection for state-changing requests
- Input validation and sanitization
- Security headers (Helmet, CORS, CSP)
- Rate limiting and request throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

See [Architecture Guide](docs/ARCHITECTURE.md) for coding standards and best practices.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

For detailed documentation, see the [docs](docs/) directory.