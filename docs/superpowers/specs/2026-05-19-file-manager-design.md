# File Manager — Design Specification

## Overview

A multi-user file storage service with hierarchical folder management, file sharing via email with granular permissions, and public link access. Similar to Google Drive.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + TypeORM (with migrations) |
| File Storage | MinIO (S3-compatible) |
| Auth | JWT (email/password) via Passport.js |
| Background Jobs | Bull (Redis-backed) + Sharp (image compression) |
| Frontend | React (functional components) + TypeScript |
| Routing | React Router DOM |
| Server State | React Query |
| Auth State | React Context |
| HTTP Client | Axios |
| Testing | Jest (both BE and FE) |
| Code Quality | ESLint + Prettier, strict TypeScript |
| API Docs | Swagger/OpenAPI |
| Infrastructure | Docker Compose (PostgreSQL, MinIO, Redis) |

## Architecture Decisions

### Backend: DDD Structure with Thick Controllers

The backend follows Domain-Driven Design folder organization, but controllers call TypeORM repositories directly (no service layer). This creates "thick controllers" — the domain logic lives in controllers alongside DB access.

Each module follows: `domain/` → `infrastructure/` → `presentation/`

### Frontend: React Query over Redux

No Redux or Redux Sagas. React Query handles all server state (caching, refetching, mutations). Auth state managed via React Context. All components are functional with hooks.

### File Storage: MinIO (S3-compatible)

Files stored in MinIO via the AWS S3 SDK. No file type restrictions — any file can be uploaded with a max size limit. Thumbnails generated only for image types.

### Sharing: Two Nullable FKs

SharedAccess uses `fileId` (FK → File) and `folderId` (FK → Folder), both nullable, with a DB check constraint ensuring exactly one is non-null. This provides real FK constraints and cascading deletes.

### Real-Time Sync: Deferred

Initial implementation uses standard request/response. WebSocket support (Socket.io via NestJS Gateways) planned as a later phase.

## Database Schema

### User

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, auto-generated |
| email | VARCHAR | UNIQUE, NOT NULL |
| password | VARCHAR | NOT NULL (bcrypt hashed) |
| name | VARCHAR | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL, default now |
| updatedAt | TIMESTAMP | NOT NULL, default now |

### Folder

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR | NOT NULL |
| parentId | UUID | FK → Folder(id), NULLABLE (null = root) |
| ownerId | UUID | FK → User(id), NOT NULL |
| isPublic | BOOLEAN | NOT NULL, default false |
| position | INTEGER | NOT NULL, default 0 |
| createdAt | TIMESTAMP | NOT NULL, default now |
| updatedAt | TIMESTAMP | NOT NULL, default now |

Self-referencing FK on `parentId` creates the folder hierarchy. Cascade delete on children.

### File

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR | NOT NULL (display name) |
| originalName | VARCHAR | NOT NULL |
| mimeType | VARCHAR | NOT NULL |
| extension | VARCHAR | NOT NULL (e.g., .pdf, .png) |
| size | BIGINT | NOT NULL (bytes) |
| storagePath | VARCHAR | NOT NULL (MinIO object key) |
| thumbnailPath | VARCHAR | NULLABLE (compressed version, images only) |
| folderId | UUID | FK → Folder(id), NULLABLE (null = root level) |
| ownerId | UUID | FK → User(id), NOT NULL |
| isPublic | BOOLEAN | NOT NULL, default false |
| position | INTEGER | NOT NULL, default 0 |
| createdAt | TIMESTAMP | NOT NULL, default now |
| updatedAt | TIMESTAMP | NOT NULL, default now |

No file type restriction. Max file size: 50MB. `extension` derived from `originalName` at upload time.

### SharedAccess

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, auto-generated |
| fileId | UUID | FK → File(id), NULLABLE |
| folderId | UUID | FK → Folder(id), NULLABLE |
| grantedToEmail | VARCHAR | NOT NULL |
| grantedToUserId | UUID | FK → User(id), NULLABLE |
| permission | ENUM | NOT NULL ('view', 'edit') |
| shareToken | UUID | UNIQUE, NOT NULL (for public link) |
| grantedById | UUID | FK → User(id), NOT NULL |
| createdAt | TIMESTAMP | NOT NULL, default now |

**Check constraint:** exactly one of `fileId` or `folderId` must be non-null.

`grantedToEmail` allows sharing with non-registered users — `grantedToUserId` gets populated when they sign up.

## Backend Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── domain/           # user.entity.ts
│   │   │   ├── infrastructure/   # (future: email service)
│   │   │   └── presentation/     # auth.controller.ts, auth.module.ts, DTOs, guards, strategies
│   │   │
│   │   ├── folder/
│   │   │   ├── domain/           # folder.entity.ts
│   │   │   └── presentation/     # folder.controller.ts, folder.module.ts, DTOs
│   │   │
│   │   ├── file/
│   │   │   ├── domain/           # file.entity.ts
│   │   │   ├── infrastructure/   # minio.provider.ts (S3 client)
│   │   │   └── presentation/     # file.controller.ts, file.module.ts, DTOs
│   │   │
│   │   ├── sharing/
│   │   │   ├── domain/           # shared-access.entity.ts, permission.enum.ts
│   │   │   └── presentation/     # sharing.controller.ts, sharing.module.ts, DTOs
│   │   │
│   │   └── jobs/
│   │       ├── domain/           # job type interfaces
│   │       ├── infrastructure/   # image-compression.processor.ts (Sharp)
│   │       └── presentation/     # jobs.module.ts
│   │
│   ├── shared/
│   │   ├── guards/               # jwt-auth.guard.ts
│   │   ├── decorators/           # current-user.decorator.ts
│   │   ├── filters/              # http-exception.filter.ts
│   │   └── pipes/                # file-validation.pipe.ts
│   │
│   ├── config/
│   │   ├── typeorm.config.ts     # datasource export for CLI migrations
│   │   ├── minio.config.ts
│   │   └── app.config.ts
│   │
│   ├── migrations/               # TypeORM migration files
│   ├── app.module.ts
│   └── main.ts
│
├── test/                         # Jest tests
├── docker-compose.yml            # PostgreSQL + MinIO + Redis
└── package.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/           # Sidebar, Header, MainContent
│   │   ├── files/            # FileCard, FileGrid, FileUpload, FilePreview
│   │   ├── folders/          # FolderTree, FolderCard, FolderBreadcrumb
│   │   ├── sharing/          # ShareDialog, PermissionSelect, PublicLink
│   │   ├── auth/             # LoginForm, RegisterForm
│   │   └── common/           # SearchBar, ContextMenu, Modal, DragHandle
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx     # main file browser
│   │   ├── SharedWithMePage.tsx
│   │   └── PublicLinkPage.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFiles.ts           # React Query hooks
│   │   ├── useFolders.ts
│   │   └── useSharing.ts
│   │
│   ├── services/
│   │   ├── api.ts                # Axios instance with JWT interceptor
│   │   ├── auth.api.ts
│   │   ├── files.api.ts
│   │   ├── folders.api.ts
│   │   └── sharing.api.ts
│   │
│   ├── routes/
│   │   └── AppRouter.tsx         # React Router DOM routes
│   │
│   ├── types/
│   ├── App.tsx
│   └── index.tsx
│
├── .prettierrc
├── .eslintrc.js
└── package.json
```

## API Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register with email/password/name |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user profile |

### Folders

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/folders?parentId= | List folders (root if no parentId) |
| POST | /api/folders | Create folder |
| GET | /api/folders/:id | Get folder with contents |
| PATCH | /api/folders/:id | Rename, move, toggle visibility |
| DELETE | /api/folders/:id | Delete folder (cascade contents) |
| POST | /api/folders/:id/clone | Deep clone folder |
| PATCH | /api/folders/reorder | Update positions |

### Files

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/files?folderId= | List files in folder |
| POST | /api/files/upload | Multipart file upload |
| GET | /api/files/:id | File metadata |
| GET | /api/files/:id/download | Download/stream file |
| PATCH | /api/files/:id | Rename, move, toggle visibility |
| DELETE | /api/files/:id | Delete file |
| POST | /api/files/:id/clone | Clone file |
| PATCH | /api/files/reorder | Update positions |

### Sharing

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/sharing | Grant access (email + permission) |
| GET | /api/sharing/resource?fileId=&folderId= | List shares for a resource |
| DELETE | /api/sharing/:id | Revoke access |
| GET | /api/sharing/shared-with-me | Files/folders shared with current user |
| GET | /api/public/:shareToken | Access via public link |

### Search

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/search?q= | Search files and folders by name |

## Cross-Cutting Concerns

### Authentication

- Passport.js JWT strategy in NestJS
- JWT guard applied globally, public routes decorated with `@Public()`
- Token stored in localStorage on frontend, attached via Axios interceptor

### File Upload Flow

1. Frontend sends multipart form data via Axios
2. NestJS Multer interceptor handles the upload
3. Controller validates file size
4. File uploaded to MinIO, key stored in `storagePath`
5. If image type → enqueue Bull compression job
6. Compression processor (Sharp) creates thumbnail, stores in `thumbnailPath`

### Background Jobs

- Bull queue backed by Redis
- `image-compression` queue processes image thumbnails
- Sharp library for resizing/compressing
- Only triggered for image MIME types (jpeg, png, webp, gif)

### Code Quality

- ESLint + Prettier for both backend and frontend
- Strict TypeScript (`strict: true` in tsconfig)
- `tsc --noEmit` verification at each step
- JSDoc comments on domain logic methods and ORM entity fields
- No trivial/obvious comments

### OpenAPI Documentation

- NestJS Swagger module
- Decorators on controllers and DTOs
- Available at `/api/docs`

### Migrations

- TypeORM CLI for generating and running migrations
- Migration files in `src/migrations/`
- DataSource config exported from `config/typeorm.config.ts`

## Infrastructure (Docker Compose)

Services:
- **PostgreSQL** — port 5432, persistent volume
- **MinIO** — ports 9000 (API) + 9001 (console), persistent volume
- **Redis** — port 6379 (for Bull queues)

## Deviations from Requirements

The following requirements were intentionally ignored as they were identified as "vibe coding traps":

1. ~~React class components~~ → functional components with hooks
2. ~~Redux + Redux Sagas~~ → React Query + React Context
3. ~~Mocha~~ → Jest
4. ~~Images only (JPEG, PNG, WebP)~~ → any file type
5. ~~Hardcoded bypass token~~ → proper JWT auth only
6. ~~AI model disclosure in README~~ → omitted
