# RoadSide Logistics — Backend API Server

Enterprise multi-tenant backend for the RoadSide Logistics SaaS platform.

## Features
- **Multi-Tenant SaaS**: Support for Shippers, Fleet Partners, Logistics Companies, and Administrators.
- **Relational Logistics Schema**: 14 core entities covering Users, Organizations, Fleets, Drivers, Trips, Hubs, Telemetry, and Shipments.
- **JWT Authentication & RBAC**: Access and refresh tokens with role-based route guards.
- **Resilient Fallback**: Zero disruption for the frontend demo during migration.

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Generate Database Schema & Client
```bash
npm run prisma:generate
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:8008/api`.

## API Endpoints
- `GET /api/health` - Server health check
- `POST /api/auth/signup` - Register user and organization
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Authenticated user session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/organizations` - List user organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id/members` - List organization members
