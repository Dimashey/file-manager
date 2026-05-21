# File Manager

A full-stack application for storing and managing files with hierarchical folder structure and sharing capabilities.

## Architecture

| Component | Technology | Port |
|-----------|------------|------|
| **Backend** | NestJS (Node.js, TypeScript) | `3001` |
| **Frontend** | React 19 + Vite (TypeScript) | `5174` |
| **Database** | PostgreSQL 16 | `5432` |
| **Object Storage** | MinIO | `9000` / `9001` (console) |
| **Queue / Cache** | Redis 7 | `6379` |

### Backend modules

- **Auth** — JWT-based registration and login
- **Files** — upload, download, delete, and share files (stored in MinIO)
- **Folders** — create and navigate a hierarchical folder tree

### Frontend

React SPA using MUI components, React Query for data fetching, React Hook Form + Zod for forms, and drag-and-drop via dnd-kit.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Setup and Start

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` if you need to change any defaults (JWT secret, credentials, ports).

### 2. Start all services

```bash
docker-compose up
```

This starts PostgreSQL, MinIO, Redis, the backend, and the frontend — all in Docker with hot-reload enabled.

| URL | Description |
|-----|-------------|
| `http://localhost:5174` | Frontend |
| `http://localhost:3001` | Backend API |
| `http://localhost:3001/api/docs` | Swagger / OpenAPI docs |
| `http://localhost:9001` | MinIO console |

### 3. Stop

```bash
docker-compose down
```

## Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd client && npm test
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USERNAME` | `filemanager` | PostgreSQL user |
| `DB_PASSWORD` | `filemanager` | PostgreSQL password |
| `DB_DATABASE` | `filemanager` | PostgreSQL database name |
| `JWT_SECRET` | — | Secret for signing JWT tokens |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `file-manager` | MinIO bucket name |
| `PORT` | `3001` | Backend port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
