# 3D Printer Control System – Documentation Hub

This directory contains documentation for the simplified 3D Printer Control System, focusing on essential 3D printer control functionality with clean architecture.

## 📚 Documentation Guide

### Getting Started
Start with these documents to understand and set up the project:

| Document | Purpose | Audience |
|----------|---------|----------|
| [🚀 Setup Guide](SETUP.md) | Installation, development, and deployment | Developers, DevOps |
| [🏗️ Architecture Guide](ARCHITECTURE.md) | System design, patterns, and best practices | Developers, Architects |
| [🔒 Security Guide](SECURITY.md) | Security implementation and guidelines | Security Engineers |

### Development Resources
Technical guides for working with the codebase:

| Document | Purpose | Audience |
|----------|---------|----------|
| [📖 API Documentation](API.md) | REST API endpoints and examples | Frontend/Backend Devs |
| [🧪 Testing Guide](TESTING.md) | Testing strategies and patterns | QA Engineers, Developers |
| [📈 Project Status](PROJECT_STATUS.md) | Current state, features, and roadmap | All stakeholders |

### Additional Resources
| Document | Purpose |
|----------|---------|

## 🏗️ High-Level System Overview

The system consists of three main deployable units:

**Frontend (React SPA)**
- Dashboard with portfolio showcase and system overview
- Control panel for 3D printer monitoring and control
- Settings management for user configuration
- Help system with comprehensive documentation

**Backend (Express API)**
- Authentication and session management
- Basic project management services
- Real-time event gateway with Socket.io
- Security, caching, validation, and system monitoring

**Infrastructure**
- Containerized deployment with Docker
- Database layer with Prisma ORM (SQLite dev / PostgreSQL prod)
- Optional Redis for caching and session scaling

## 🎯 Quick Navigation

### For New Developers
1. **Start Here**: [Setup Guide](SETUP.md) - Get the project running
2. **Understand Design**: [Architecture Guide](ARCHITECTURE.md) - System structure
3. **API Integration**: [API Documentation](API.md) - Backend endpoints

### For DevOps Engineers
1. **Deployment**: [Setup Guide](SETUP.md) - Production deployment
2. **Security**: [Security Guide](SECURITY.md) - Security measures
3. **Monitoring**: [Testing Guide](TESTING.md) - Health checks and testing

### For Technical Interviews
1. **Project Overview**: [Project Status](PROJECT_STATUS.md) - Features and achievements
2. **Code Quality**: [Architecture Guide](ARCHITECTURE.md) - Best practices
3. **Security**: [Security Guide](SECURITY.md) - OWASP compliance

## 🔐 Security & Architecture Highlights

- **Security-First**: JWT authentication, CSRF protection, input validation, security headers
- **Clean Architecture**: Clear separation of concerns with repository pattern
- **Modern Stack**: TypeScript, React 18, Express, Prisma, Docker
- **Real-time**: WebSocket integration for live updates
- **Testing**: Comprehensive unit, integration, and contract tests
- **Documentation**: Professional-grade documentation and API specs

## 🚀 Getting Started Commands

```bash
# Quick setup
git clone <repository-url>
cd 3D-Printer-Project
npm run install:all
npm run dev

# Access points
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api/v2
# API Docs: http://localhost:3000/api/v1/docs
# Health Check: http://localhost:3000/api/health
```

## 📞 Support

For questions about specific components:
- **Frontend**: Check the React components in `frontend/src/`
- **Backend**: Review API routes in `backend/src/routes/`
- **Database**: See Prisma schema in `backend/prisma/schema.prisma`
- **Deployment**: Check Docker configs in `deployment/docker/`

---

This documentation is maintained to reflect the current implementation. Update relevant files when making architectural or structural changes.
