# 3D Printer Project

A modern full-stack 3D printer management platform featuring React frontend, Express backend, and comprehensive project management tools.

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
# API: http://localhost:3000/api/v1/docs
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

- **Project Management Hub**: Task tracking, budget management, inventory system
- **3D Printer Control Panel**: Real-time monitoring and control interface  
- **Portfolio Showcase**: Professional project presentation
- **Real-time Updates**: WebSocket-based live data synchronization
- **Comprehensive Security**: JWT auth, CSRF protection, input validation
- **Modern Architecture**: Monorepo with clear separation of concerns

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