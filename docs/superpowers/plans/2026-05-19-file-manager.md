# File Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack file manager (Google Drive-like) with NestJS DDD backend and React frontend.

**Architecture:** NestJS backend with DDD folder structure and thick controllers (repositories injected directly). React functional components with React Query for server state. PostgreSQL for data, MinIO for file storage, Redis + Bull for background image compression.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, MinIO, Redis, Bull, Sharp, Passport JWT, Swagger | React, TypeScript, React Query, React Router DOM, Axios, Vite | Jest, ESLint, Prettier

**Spec:** `docs/superpowers/specs/2026-05-19-file-manager-design.md`

---

## File Map

### Backend (`backend/`)

| File | Responsibility |
|------|---------------|
| `src/main.ts` | App bootstrap, global pipes/filters, Swagger, CORS |
| `src/app.module.ts` | Root module imports |
| `src/config/typeorm.config.ts` | DataSource for TypeORM CLI migrations |
| `src/config/minio.config.ts` | MinIO S3 client provider |
| `src/migrations/` | TypeORM migration files |
| `src/shared/guards/jwt-auth.guard.ts` | JWT passport guard |
| `src/shared/decorators/current-user.decorator.ts` | Extract user from request |
| `src/shared/decorators/public.decorator.ts` | Mark route as public (skip JWT) |
| `src/shared/filters/http-exception.filter.ts` | Global exception filter |
| `src/modules/auth/domain/user.entity.ts` | User entity |
| `src/modules/auth/presentation/auth.controller.ts` | Register, login, me |
| `src/modules/auth/presentation/auth.module.ts` | Auth module |
| `src/modules/auth/presentation/dto/register.dto.ts` | Register DTO |
| `src/modules/auth/presentation/dto/login.dto.ts` | Login DTO |
| `src/modules/auth/presentation/strategies/jwt.strategy.ts` | Passport JWT strategy |
| `src/modules/folder/domain/folder.entity.ts` | Folder entity |
| `src/modules/folder/presentation/folder.controller.ts` | Folder CRUD, clone, reorder |
| `src/modules/folder/presentation/folder.module.ts` | Folder module |
| `src/modules/folder/presentation/dto/create-folder.dto.ts` | Create folder DTO |
| `src/modules/folder/presentation/dto/update-folder.dto.ts` | Update folder DTO |
| `src/modules/folder/presentation/dto/reorder.dto.ts` | Reorder DTO |
| `src/modules/file/domain/file.entity.ts` | File entity |
| `src/modules/file/infrastructure/minio.provider.ts` | S3Client wrapper |
| `src/modules/file/presentation/file.controller.ts` | Upload, download, CRUD, clone, reorder |
| `src/modules/file/presentation/file.module.ts` | File module |
| `src/modules/file/presentation/dto/update-file.dto.ts` | Update file DTO |
| `src/modules/file/presentation/dto/reorder.dto.ts` | Reorder DTO |
| `src/modules/sharing/domain/shared-access.entity.ts` | SharedAccess entity |
| `src/modules/sharing/domain/permission.enum.ts` | Permission enum |
| `src/modules/sharing/presentation/sharing.controller.ts` | Grant, list, revoke, public link |
| `src/modules/sharing/presentation/sharing.module.ts` | Sharing module |
| `src/modules/sharing/presentation/dto/grant-access.dto.ts` | Grant access DTO |
| `src/modules/search/presentation/search.controller.ts` | Search files/folders by name |
| `src/modules/search/presentation/search.module.ts` | Search module |
| `src/modules/jobs/infrastructure/image-compression.processor.ts` | Sharp compression worker |
| `src/modules/jobs/presentation/jobs.module.ts` | Bull queue module |
| `test/auth.controller.spec.ts` | Auth tests |
| `test/folder.controller.spec.ts` | Folder tests |
| `test/file.controller.spec.ts` | File tests |
| `test/sharing.controller.spec.ts` | Sharing tests |

### Frontend (`frontend/`)

| File | Responsibility |
|------|---------------|
| `src/main.tsx` | Entry, providers |
| `src/App.tsx` | Root component |
| `src/routes/AppRouter.tsx` | Route definitions |
| `src/context/AuthContext.tsx` | Auth state + provider |
| `src/hooks/useAuth.ts` | Auth context consumer |
| `src/hooks/useFolders.ts` | React Query folder hooks |
| `src/hooks/useFiles.ts` | React Query file hooks |
| `src/hooks/useSharing.ts` | React Query sharing hooks |
| `src/hooks/useSearch.ts` | React Query search hook |
| `src/services/api.ts` | Axios instance with JWT interceptor |
| `src/services/auth.api.ts` | Auth API calls |
| `src/services/folders.api.ts` | Folder API calls |
| `src/services/files.api.ts` | File API calls |
| `src/services/sharing.api.ts` | Sharing API calls |
| `src/services/search.api.ts` | Search API calls |
| `src/types/index.ts` | Shared TS interfaces |
| `src/pages/LoginPage.tsx` | Login form page |
| `src/pages/RegisterPage.tsx` | Register form page |
| `src/pages/DashboardPage.tsx` | Main file browser |
| `src/pages/SharedWithMePage.tsx` | Shared with me view |
| `src/pages/PublicLinkPage.tsx` | Public share view |
| `src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `src/components/layout/Header.tsx` | Top bar with search |
| `src/components/folders/FolderBreadcrumb.tsx` | Path breadcrumb |
| `src/components/folders/FolderTree.tsx` | Sidebar folder tree |
| `src/components/files/FileGrid.tsx` | Grid of files/folders |
| `src/components/files/FileCard.tsx` | Individual file/folder card |
| `src/components/files/FileUpload.tsx` | Upload dropzone |
| `src/components/common/ContextMenu.tsx` | Right-click menu |
| `src/components/common/Modal.tsx` | Reusable modal |
| `src/components/common/SearchBar.tsx` | Search input |
| `src/components/sharing/ShareDialog.tsx` | Share/permissions dialog |

### Root

| File | Responsibility |
|------|---------------|
| `docker-compose.yml` | PostgreSQL, MinIO, Redis |
| `.env.example` | Environment variable template |

---

## Phase 1: Backend Infrastructure

### Task 1: Scaffold NestJS project + Docker Compose

**Files:**
- Create: `backend/` (NestJS scaffold)
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env`

- [ ] **Step 1: Scaffold NestJS project**

```bash
npx @nestjs/cli new backend --package-manager npm --skip-git
```

- [ ] **Step 2: Install backend dependencies**

```bash
cd backend && npm install @nestjs/config @nestjs/typeorm typeorm pg @nestjs/passport passport passport-jwt @nestjs/jwt @nestjs/swagger swagger-ui-express @nestjs/bull bull @aws-sdk/client-s3 bcrypt class-validator class-transformer sharp uuid
npm install -D @types/passport-jwt @types/bcrypt @types/bull @types/uuid
```

- [ ] **Step 3: Create `.env.example` at project root**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=filemanager
DB_PASSWORD=filemanager
DB_DATABASE=filemanager

# JWT
JWT_SECRET=your-secret-key-change-in-production

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=file-manager
MINIO_USE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

- [ ] **Step 4: Copy `.env.example` to `.env`**

```bash
cp .env.example .env
```

- [ ] **Step 5: Create `docker-compose.yml` at project root**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: filemanager
      POSTGRES_PASSWORD: filemanager
      POSTGRES_DB: filemanager
    volumes:
      - pgdata:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - miniodata:/data
    command: server /data --console-address ":9001"

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  miniodata:
  redisdata:
```

- [ ] **Step 6: Configure strict TypeScript in `backend/tsconfig.json`**

Ensure these are set in `compilerOptions`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictPropertyInitialization": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

`strictPropertyInitialization: false` is required because TypeORM entity columns use decorators instead of constructor assignment.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold NestJS project with Docker Compose"
```

---

### Task 2: ESLint + Prettier setup

**Files:**
- Modify: `backend/.eslintrc.js`
- Create: `backend/.prettierrc`

- [ ] **Step 1: Install ESLint + Prettier dependencies**

```bash
cd backend && npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

- [ ] **Step 2: Configure `.eslintrc.js`**

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 3: Configure `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

- [ ] **Step 4: Add lint/format scripts to `backend/package.json`**

Add to `"scripts"`:

```json
{
  "lint": "eslint \"{src,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 5: Run lint + format**

```bash
cd backend && npm run format && npm run lint
```

- [ ] **Step 6: Verify typecheck passes**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: configure ESLint and Prettier for backend"
```

---

### Task 3: TypeORM configuration + migrations setup

**Files:**
- Create: `backend/src/config/typeorm.config.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `src/config/typeorm.config.ts`**

This file exports a `DataSource` for the TypeORM CLI and a config factory for `TypeOrmModule`.

```typescript
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '..', '..', '.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'filemanager',
  password: process.env.DB_PASSWORD || 'filemanager',
  database: process.env.DB_DATABASE || 'filemanager',
  entities: [join(__dirname, '..', 'modules', '**', 'domain', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
```

- [ ] **Step 2: Configure `app.module.ts` with TypeORM and ConfigModule**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Add migration scripts to `backend/package.json`**

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/config/typeorm.config.ts",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/config/typeorm.config.ts",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/config/typeorm.config.ts"
}
```

- [ ] **Step 4: Start Docker Compose and verify DB connection**

```bash
docker compose up -d
cd backend && npm run start:dev
```

Expected: NestJS starts without TypeORM connection errors. Stop the dev server after verifying.

- [ ] **Step 5: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: configure TypeORM with PostgreSQL and migration scripts"
```

---

## Phase 2: Authentication Module

### Task 4: User entity + migration

**Files:**
- Create: `backend/src/modules/auth/domain/user.entity.ts`

- [ ] **Step 1: Create `user.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  /** Unique identifier for the user */
  id: string;

  @Column({ unique: true })
  /** User's email address, used for login and sharing */
  email: string;

  @Column()
  /** Bcrypt-hashed password */
  password: string;

  @Column()
  /** Display name */
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Generate migration**

```bash
cd backend && npm run migration:generate -- src/migrations/CreateUsers
```

- [ ] **Step 3: Run migration**

```bash
cd backend && npm run migration:run
```

- [ ] **Step 4: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add User entity and initial migration"
```

---

### Task 5: JWT strategy, guards, and decorators

**Files:**
- Create: `backend/src/modules/auth/presentation/strategies/jwt.strategy.ts`
- Create: `backend/src/shared/guards/jwt-auth.guard.ts`
- Create: `backend/src/shared/decorators/current-user.decorator.ts`
- Create: `backend/src/shared/decorators/public.decorator.ts`

- [ ] **Step 1: Create `jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Validates JWT payload and returns the User entity attached to the request */
  async validate(payload: { sub: string }): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

- [ ] **Step 2: Create `jwt-auth.guard.ts`**

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

- [ ] **Step 3: Create `public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Step 4: Create `current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/auth/domain/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
```

- [ ] **Step 5: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add JWT strategy, auth guard, and decorators"
```

---

### Task 6: Auth controller (register, login, me)

**Files:**
- Create: `backend/src/modules/auth/presentation/dto/register.dto.ts`
- Create: `backend/src/modules/auth/presentation/dto/login.dto.ts`
- Create: `backend/src/modules/auth/presentation/auth.controller.ts`
- Create: `backend/src/modules/auth/presentation/auth.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `register.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;
}
```

- [ ] **Step 2: Create `login.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsNotEmpty()
  password: string;
}
```

- [ ] **Step 3: Create `auth.controller.ts`**

```typescript
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../domain/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** Registers a new user account and returns a JWT token */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ token: string }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    const token = this.jwtService.sign({ sub: saved.id, email: saved.email });
    return { token };
  }

  /** Authenticates user credentials and returns a JWT token */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { token };
  }

  /** Returns the currently authenticated user's profile */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User): Promise<Omit<User, 'password'>> {
    const { password: _, ...profile } = user;
    return profile;
  }
}
```

- [ ] **Step 4: Create `auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { User } from '../domain/user.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [TypeOrmModule],
})
export class AuthModule {}
```

- [ ] **Step 5: Register AuthModule and global guard in `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, transform: true }) },
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Update `main.ts` with Swagger and global prefix**

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('File Manager API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
}
bootstrap();
```

- [ ] **Step 7: Verify typecheck + start dev server**

```bash
cd backend && npm run typecheck && npm run start:dev
```

Test endpoints manually:
```bash
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123","name":"Test"}'
```

Expected: `{"token":"eyJ..."}`

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: implement auth module with register, login, and JWT"
```

---

### Task 7: Auth controller tests

**Files:**
- Create: `backend/test/auth.controller.spec.ts`

- [ ] **Step 1: Write auth controller tests**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthController } from '../src/modules/auth/presentation/auth.controller';
import { User } from '../src/modules/auth/domain/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let userRepo: jest.Mocked<Partial<Repository<User>>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should create a user and return a token', async () => {
      userRepo.findOne!.mockResolvedValue(null);
      userRepo.create!.mockReturnValue({ id: 'uuid-1', email: 'a@b.com', name: 'A', password: 'hashed' } as User);
      userRepo.save!.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', name: 'A', password: 'hashed' } as User);

      const result = await controller.register({ email: 'a@b.com', password: 'pass123', name: 'A' });

      expect(result).toEqual({ token: 'mock-token' });
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email exists', async () => {
      userRepo.findOne!.mockResolvedValue({ id: 'uuid-1' } as User);

      await expect(
        controller.register({ email: 'a@b.com', password: 'pass123', name: 'A' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const hashed = await bcrypt.hash('pass123', 10);
      userRepo.findOne!.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password: hashed } as User);

      const result = await controller.login({ email: 'a@b.com', password: 'pass123' });

      expect(result).toEqual({ token: 'mock-token' });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('pass123', 10);
      userRepo.findOne!.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password: hashed } as User);

      await expect(
        controller.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepo.findOne!.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'no@user.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('should return user profile without password', async () => {
      const user = { id: 'uuid-1', email: 'a@b.com', name: 'A', password: 'hashed', createdAt: new Date(), updatedAt: new Date() } as User;

      const result = await controller.me(user);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', 'a@b.com');
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd backend && npx jest test/auth.controller.spec.ts --verbose
```

Expected: all 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: add auth controller unit tests"
```

---

## Phase 3: Folder Module

### Task 8: Folder entity + migration

**Files:**
- Create: `backend/src/modules/folder/domain/folder.entity.ts`

- [ ] **Step 1: Create `folder.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  /** Display name of the folder */
  name: string;

  @Column({ type: 'uuid', nullable: true })
  /** Parent folder ID. Null means root-level folder. */
  parentId: string | null;

  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Folder | null;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ default: false })
  /** Whether this folder is publicly accessible without authentication */
  isPublic: boolean;

  @Column({ default: 0 })
  /** Sort position within the parent folder. Lower values appear first. */
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Generate and run migration**

```bash
cd backend && npm run migration:generate -- src/migrations/CreateFolders
cd backend && npm run migration:run
```

- [ ] **Step 3: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Folder entity with self-referencing hierarchy"
```

---

### Task 9: Folder controller (CRUD, clone, reorder)

**Files:**
- Create: `backend/src/modules/folder/presentation/dto/create-folder.dto.ts`
- Create: `backend/src/modules/folder/presentation/dto/update-folder.dto.ts`
- Create: `backend/src/modules/folder/presentation/dto/reorder.dto.ts`
- Create: `backend/src/modules/folder/presentation/folder.controller.ts`
- Create: `backend/src/modules/folder/presentation/folder.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `create-folder.dto.ts`**

```typescript
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'My Documents' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
```

- [ ] **Step 2: Create `update-folder.dto.ts`**

```typescript
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
```

- [ ] **Step 3: Create `reorder.dto.ts`**

```typescript
import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderItemDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsInt()
  position: number;
}

export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
```

- [ ] **Step 4: Create `folder.controller.ts`**

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Folder } from '../domain/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ReorderDto } from './dto/reorder.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('folders')
@ApiBearerAuth()
@Controller('folders')
export class FolderController {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('parentId') parentId?: string,
  ): Promise<Folder[]> {
    return this.folderRepository.find({
      where: {
        ownerId: user.id,
        parentId: parentId || IsNull(),
      },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateFolderDto,
  ): Promise<Folder> {
    const folder = this.folderRepository.create({
      name: dto.name,
      parentId: dto.parentId || null,
      ownerId: user.id,
    });
    return this.folderRepository.save(folder);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
      relations: ['children'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFolderDto,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    Object.assign(folder, dto);
    return this.folderRepository.save(folder);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    await this.folderRepository.remove(folder);
  }

  /** Deep-clones a folder and all its subfolders, preserving hierarchy */
  @Post(':id/clone')
  async clone(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return this.deepCloneFolder(folder, folder.parentId, user.id);
  }

  @Patch('reorder')
  async reorder(@CurrentUser() user: User, @Body() dto: ReorderDto): Promise<void> {
    for (const item of dto.items) {
      await this.folderRepository.update(
        { id: item.id, ownerId: user.id },
        { position: item.position },
      );
    }
  }

  /**
   * Recursively clones a folder and all its children.
   * Each cloned folder gets a new UUID and "(copy)" suffix.
   */
  private async deepCloneFolder(
    source: Folder,
    parentId: string | null,
    ownerId: string,
  ): Promise<Folder> {
    const clone = this.folderRepository.create({
      name: `${source.name} (copy)`,
      parentId,
      ownerId,
      isPublic: source.isPublic,
      position: source.position,
    });
    const saved = await this.folderRepository.save(clone);

    const children = await this.folderRepository.find({
      where: { parentId: source.id, ownerId },
    });
    for (const child of children) {
      await this.deepCloneFolder(child, saved.id, ownerId);
    }

    return saved;
  }
}
```

- [ ] **Step 5: Create `folder.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '../domain/folder.entity';
import { FolderController } from './folder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Folder])],
  controllers: [FolderController],
  exports: [TypeOrmModule],
})
export class FolderModule {}
```

- [ ] **Step 6: Register FolderModule in `app.module.ts`**

Add `FolderModule` to the `imports` array:

```typescript
import { FolderModule } from './modules/folder/presentation/folder.module';

// In imports array:
FolderModule,
```

- [ ] **Step 7: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: implement folder CRUD, clone, and reorder endpoints"
```

---

### Task 10: Folder controller tests

**Files:**
- Create: `backend/test/folder.controller.spec.ts`

- [ ] **Step 1: Write folder controller tests**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FolderController } from '../src/modules/folder/presentation/folder.controller';
import { Folder } from '../src/modules/folder/domain/folder.entity';
import { User } from '../src/modules/auth/domain/user.entity';

const mockUser = { id: 'user-1', email: 'a@b.com', name: 'A' } as User;

describe('FolderController', () => {
  let controller: FolderController;
  let repo: jest.Mocked<Partial<Repository<Folder>>>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolderController],
      providers: [{ provide: getRepositoryToken(Folder), useValue: repo }],
    }).compile();

    controller = module.get<FolderController>(FolderController);
  });

  describe('list', () => {
    it('should return root folders when no parentId', async () => {
      const folders = [{ id: 'f-1', name: 'Docs' }] as Folder[];
      repo.find!.mockResolvedValue(folders);

      const result = await controller.list(mockUser);

      expect(result).toEqual(folders);
    });
  });

  describe('create', () => {
    it('should create and return a folder', async () => {
      const folder = { id: 'f-1', name: 'New', ownerId: 'user-1' } as Folder;
      repo.create!.mockReturnValue(folder);
      repo.save!.mockResolvedValue(folder);

      const result = await controller.create(mockUser, { name: 'New' });

      expect(result.name).toBe('New');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing folder', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(controller.findOne(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the folder', async () => {
      const folder = { id: 'f-1' } as Folder;
      repo.findOne!.mockResolvedValue(folder);
      repo.remove!.mockResolvedValue(folder);

      await expect(controller.remove(mockUser, 'f-1')).resolves.toBeUndefined();
    });
  });

  describe('reorder', () => {
    it('should update positions for each item', async () => {
      repo.update!.mockResolvedValue({ affected: 1 } as never);

      await controller.reorder(mockUser, {
        items: [
          { id: 'f-1', position: 0 },
          { id: 'f-2', position: 1 },
        ],
      });

      expect(repo.update).toHaveBeenCalledTimes(2);
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd backend && npx jest test/folder.controller.spec.ts --verbose
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: add folder controller unit tests"
```

---

## Phase 4: File Module

### Task 11: File entity + migration

**Files:**
- Create: `backend/src/modules/file/domain/file.entity.ts`

- [ ] **Step 1: Create `file.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { Folder } from '../../folder/domain/folder.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  /** Display name (can be renamed by user) */
  name: string;

  @Column()
  /** Original filename from the upload */
  originalName: string;

  @Column()
  /** MIME type detected at upload time */
  mimeType: string;

  @Column()
  /** File extension including dot, e.g. ".pdf" */
  extension: string;

  @Column({ type: 'bigint' })
  /** File size in bytes */
  size: number;

  @Column()
  /** Object key in MinIO storage */
  storagePath: string;

  @Column({ nullable: true })
  /** Compressed thumbnail path in MinIO. Only populated for image files. */
  thumbnailPath: string | null;

  @Column({ type: 'uuid', nullable: true })
  folderId: string | null;

  @ManyToOne(() => Folder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'folderId' })
  folder: Folder | null;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ default: false })
  /** Whether this file is publicly accessible without authentication */
  isPublic: boolean;

  @Column({ default: 0 })
  /** Sort position within the parent folder */
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Note: named `FileEntity` to avoid collision with the global `File` type.

- [ ] **Step 2: Generate and run migration**

```bash
cd backend && npm run migration:generate -- src/migrations/CreateFiles
cd backend && npm run migration:run
```

- [ ] **Step 3: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add File entity with MinIO storage fields"
```

---

### Task 12: MinIO provider

**Files:**
- Create: `backend/src/modules/file/infrastructure/minio.provider.ts`

- [ ] **Step 1: Create `minio.provider.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class MinioProvider implements OnModuleInit {
  private client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
    const port = this.configService.getOrThrow<string>('MINIO_PORT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';

    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.client = new S3Client({
      endpoint: `${protocol}://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  /** Creates the storage bucket on startup if it doesn't exist */
  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  /** Uploads a file buffer to MinIO and returns the storage key */
  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }

  /** Downloads a file from MinIO as a readable stream */
  async download(key: string): Promise<Readable> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return response.Body as Readable;
  }

  /** Deletes a file from MinIO */
  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /** Copies a file within MinIO, returning the new key */
  async copy(sourceKey: string, destKey: string): Promise<string> {
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destKey,
      }),
    );
    return destKey;
  }
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add MinIO S3 storage provider"
```

---

### Task 13: File controller (upload, download, CRUD, clone, reorder)

**Files:**
- Create: `backend/src/modules/file/presentation/dto/update-file.dto.ts`
- Create: `backend/src/modules/file/presentation/dto/reorder.dto.ts`
- Create: `backend/src/modules/file/presentation/file.controller.ts`
- Create: `backend/src/modules/file/presentation/file.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `update-file.dto.ts`**

```typescript
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
```

- [ ] **Step 2: Create `reorder.dto.ts`** (same structure as folder's)

```typescript
import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderItemDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsInt()
  position: number;
}

export class FileReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
```

- [ ] **Step 3: Create `file.controller.ts`**

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FileEntity } from '../domain/file.entity';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileReorderDto } from './dto/reorder.dto';
import { MinioProvider } from '../infrastructure/minio.provider';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly minioProvider: MinioProvider,
    @InjectQueue('image-compression')
    private readonly compressionQueue: Queue,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('folderId') folderId?: string,
  ): Promise<FileEntity[]> {
    return this.fileRepository.find({
      where: {
        ownerId: user.id,
        folderId: folderId || IsNull(),
      },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  /** Handles multipart file upload to MinIO. Max 50MB. */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
  ): Promise<FileEntity> {
    const ext = extname(file.originalname);
    const storageKey = `${user.id}/${uuidv4()}${ext}`;

    await this.minioProvider.upload(storageKey, file.buffer, file.mimetype);

    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      extension: ext,
      size: file.size,
      storagePath: storageKey,
      folderId: folderId || null,
      ownerId: user.id,
    });
    const saved = await this.fileRepository.save(fileEntity);

    if (file.mimetype.startsWith('image/')) {
      await this.compressionQueue.add('compress', {
        fileId: saved.id,
        storageKey,
        mimeType: file.mimetype,
      });
    }

    return saved;
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  /** Streams the file content from MinIO to the client */
  @Get(':id/download')
  async download(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const stream = await this.minioProvider.download(file.storagePath);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });
    stream.pipe(res);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    Object.assign(file, dto);
    return this.fileRepository.save(file);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    await this.minioProvider.delete(file.storagePath);
    if (file.thumbnailPath) {
      await this.minioProvider.delete(file.thumbnailPath);
    }
    await this.fileRepository.remove(file);
  }

  /** Clones a file by copying it in MinIO and creating a new DB record */
  @Post(':id/clone')
  async clone(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id, ownerId: user.id },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const newKey = `${user.id}/${uuidv4()}${file.extension}`;
    await this.minioProvider.copy(file.storagePath, newKey);

    const clone = this.fileRepository.create({
      name: `${file.name} (copy)`,
      originalName: file.originalName,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      storagePath: newKey,
      thumbnailPath: null,
      folderId: file.folderId,
      ownerId: user.id,
      isPublic: file.isPublic,
      position: file.position,
    });
    return this.fileRepository.save(clone);
  }

  @Patch('reorder')
  async reorder(@CurrentUser() user: User, @Body() dto: FileReorderDto): Promise<void> {
    for (const item of dto.items) {
      await this.fileRepository.update(
        { id: item.id, ownerId: user.id },
        { position: item.position },
      );
    }
  }
}
```

- [ ] **Step 4: Create `file.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { FileEntity } from '../domain/file.entity';
import { FileController } from './file.controller';
import { MinioProvider } from '../infrastructure/minio.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    BullModule.registerQueue({ name: 'image-compression' }),
  ],
  controllers: [FileController],
  providers: [MinioProvider],
  exports: [TypeOrmModule, MinioProvider],
})
export class FileModule {}
```

- [ ] **Step 5: Register FileModule and Bull in `app.module.ts`**

```typescript
import { BullModule } from '@nestjs/bull';
import { FileModule } from './modules/file/presentation/file.module';

// Add to imports array:
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
}),
FileModule,
```

- [ ] **Step 6: Install multer types if not present**

```bash
cd backend && npm install -D @types/multer
```

- [ ] **Step 7: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: implement file upload, download, CRUD, clone, and reorder"
```

---

### Task 14: File controller tests

**Files:**
- Create: `backend/test/file.controller.spec.ts`

- [ ] **Step 1: Write file controller tests**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { FileController } from '../src/modules/file/presentation/file.controller';
import { FileEntity } from '../src/modules/file/domain/file.entity';
import { MinioProvider } from '../src/modules/file/infrastructure/minio.provider';
import { User } from '../src/modules/auth/domain/user.entity';

const mockUser = { id: 'user-1', email: 'a@b.com', name: 'A' } as User;

describe('FileController', () => {
  let controller: FileController;
  let repo: jest.Mocked<Partial<Repository<FileEntity>>>;
  let minioProvider: jest.Mocked<Partial<MinioProvider>>;
  let queue: { add: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };
    minioProvider = {
      upload: jest.fn().mockResolvedValue('key'),
      download: jest.fn(),
      delete: jest.fn(),
      copy: jest.fn().mockResolvedValue('new-key'),
    };
    queue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        { provide: getRepositoryToken(FileEntity), useValue: repo },
        { provide: MinioProvider, useValue: minioProvider },
        { provide: getQueueToken('image-compression'), useValue: queue },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  describe('upload', () => {
    it('should upload a file and enqueue compression for images', async () => {
      const multerFile = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      const saved = { id: 'f-1', name: 'photo.jpg', mimeType: 'image/jpeg' } as FileEntity;
      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await controller.upload(mockUser, multerFile);

      expect(result.id).toBe('f-1');
      expect(minioProvider.upload).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalledWith('compress', expect.objectContaining({ fileId: 'f-1' }));
    });

    it('should not enqueue compression for non-image files', async () => {
      const multerFile = {
        originalname: 'doc.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      const saved = { id: 'f-2', name: 'doc.pdf', mimeType: 'application/pdf' } as FileEntity;
      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      await controller.upload(mockUser, multerFile);

      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing file', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(controller.findOne(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('clone', () => {
    it('should copy file in MinIO and create new record', async () => {
      const file = {
        id: 'f-1',
        name: 'photo.jpg',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        extension: '.jpg',
        size: 1024,
        storagePath: 'user-1/abc.jpg',
        folderId: null,
        ownerId: 'user-1',
        isPublic: false,
        position: 0,
      } as FileEntity;

      repo.findOne!.mockResolvedValue(file);
      const cloned = { ...file, id: 'f-2', name: 'photo.jpg (copy)' } as FileEntity;
      repo.create!.mockReturnValue(cloned);
      repo.save!.mockResolvedValue(cloned);

      const result = await controller.clone(mockUser, 'f-1');

      expect(result.name).toBe('photo.jpg (copy)');
      expect(minioProvider.copy).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd backend && npx jest test/file.controller.spec.ts --verbose
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: add file controller unit tests"
```

---

## Phase 5: Sharing Module

### Task 15: SharedAccess entity + permission enum + migration

**Files:**
- Create: `backend/src/modules/sharing/domain/permission.enum.ts`
- Create: `backend/src/modules/sharing/domain/shared-access.entity.ts`

- [ ] **Step 1: Create `permission.enum.ts`**

```typescript
export enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
}
```

- [ ] **Step 2: Create `shared-access.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { Folder } from '../../folder/domain/folder.entity';
import { FileEntity } from '../../file/domain/file.entity';
import { Permission } from './permission.enum';

@Entity('shared_access')
@Check(`("fileId" IS NOT NULL AND "folderId" IS NULL) OR ("fileId" IS NULL AND "folderId" IS NOT NULL)`)
export class SharedAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  /** FK to the shared file. Exactly one of fileId/folderId must be set. */
  fileId: string | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: FileEntity | null;

  @Column({ type: 'uuid', nullable: true })
  /** FK to the shared folder. Exactly one of fileId/folderId must be set. */
  folderId: string | null;

  @ManyToOne(() => Folder, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'folderId' })
  folder: Folder | null;

  @Column()
  /** Email of the user access is granted to. Allows sharing with non-registered users. */
  grantedToEmail: string;

  @Column({ type: 'uuid', nullable: true })
  /** Populated when the invited user has a registered account */
  grantedToUserId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'grantedToUserId' })
  grantedToUser: User | null;

  @Column({ type: 'enum', enum: Permission })
  /** Access level: view-only or edit */
  permission: Permission;

  @Column({ unique: true })
  /** Token for public link sharing */
  shareToken: string;

  @Column({ type: 'uuid' })
  grantedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grantedById' })
  grantedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 3: Generate and run migration**

```bash
cd backend && npm run migration:generate -- src/migrations/CreateSharedAccess
cd backend && npm run migration:run
```

- [ ] **Step 4: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add SharedAccess entity with check constraint"
```

---

### Task 16: Sharing controller

**Files:**
- Create: `backend/src/modules/sharing/presentation/dto/grant-access.dto.ts`
- Create: `backend/src/modules/sharing/presentation/sharing.controller.ts`
- Create: `backend/src/modules/sharing/presentation/sharing.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `grant-access.dto.ts`**

```typescript
import { IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permission } from '../../domain/permission.enum';

export class GrantAccessDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiProperty({ example: 'invited@example.com' })
  @IsEmail()
  grantedToEmail: string;

  @ApiProperty({ enum: Permission })
  @IsEnum(Permission)
  permission: Permission;
}
```

- [ ] **Step 2: Create `sharing.controller.ts`**

```typescript
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { SharedAccess } from '../domain/shared-access.entity';
import { GrantAccessDto } from './dto/grant-access.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';
import { Public } from '../../../shared/decorators/public.decorator';

@ApiTags('sharing')
@Controller()
export class SharingController {
  constructor(
    @InjectRepository(SharedAccess)
    private readonly sharedAccessRepository: Repository<SharedAccess>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Grants access to a file or folder by email.
   * If the recipient has an account, links grantedToUserId.
   * Generates a unique shareToken for public link access.
   */
  @ApiBearerAuth()
  @Post('sharing')
  async grantAccess(
    @CurrentUser() user: User,
    @Body() dto: GrantAccessDto,
  ): Promise<SharedAccess> {
    if ((!dto.fileId && !dto.folderId) || (dto.fileId && dto.folderId)) {
      throw new BadRequestException('Exactly one of fileId or folderId must be provided');
    }

    const recipient = await this.userRepository.findOne({
      where: { email: dto.grantedToEmail },
    });

    const share = this.sharedAccessRepository.create({
      fileId: dto.fileId || null,
      folderId: dto.folderId || null,
      grantedToEmail: dto.grantedToEmail,
      grantedToUserId: recipient?.id || null,
      permission: dto.permission,
      shareToken: uuidv4(),
      grantedById: user.id,
    });

    return this.sharedAccessRepository.save(share);
  }

  /** Lists all shares for a specific file or folder */
  @ApiBearerAuth()
  @Get('sharing/resource')
  async listByResource(
    @CurrentUser() user: User,
    @Query('fileId') fileId?: string,
    @Query('folderId') folderId?: string,
  ): Promise<SharedAccess[]> {
    if (!fileId && !folderId) {
      throw new BadRequestException('Provide fileId or folderId');
    }
    const where: Record<string, unknown> = { grantedById: user.id };
    if (fileId) where.fileId = fileId;
    if (folderId) where.folderId = folderId;

    return this.sharedAccessRepository.find({
      where,
      relations: ['grantedToUser'],
    });
  }

  /** Revokes a previously granted share */
  @ApiBearerAuth()
  @Delete('sharing/:id')
  async revoke(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const share = await this.sharedAccessRepository.findOne({
      where: { id, grantedById: user.id },
    });
    if (!share) {
      throw new NotFoundException('Share not found');
    }
    await this.sharedAccessRepository.remove(share);
  }

  /** Returns all files and folders shared with the current user */
  @ApiBearerAuth()
  @Get('sharing/shared-with-me')
  async sharedWithMe(@CurrentUser() user: User): Promise<SharedAccess[]> {
    return this.sharedAccessRepository.find({
      where: [
        { grantedToUserId: user.id },
        { grantedToEmail: user.email },
      ],
      relations: ['file', 'folder', 'grantedBy'],
    });
  }

  /** Public endpoint: access a shared resource via its share token */
  @Public()
  @Get('public/:shareToken')
  async accessPublicLink(
    @Param('shareToken') shareToken: string,
  ): Promise<SharedAccess> {
    const share = await this.sharedAccessRepository.findOne({
      where: { shareToken },
      relations: ['file', 'folder'],
    });
    if (!share) {
      throw new NotFoundException('Share link not found or expired');
    }
    return share;
  }
}
```

- [ ] **Step 3: Create `sharing.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedAccess } from '../domain/shared-access.entity';
import { User } from '../../auth/domain/user.entity';
import { SharingController } from './sharing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SharedAccess, User])],
  controllers: [SharingController],
})
export class SharingModule {}
```

- [ ] **Step 4: Register SharingModule in `app.module.ts`**

```typescript
import { SharingModule } from './modules/sharing/presentation/sharing.module';

// Add to imports array:
SharingModule,
```

- [ ] **Step 5: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: implement sharing with email-based access and public links"
```

---

### Task 17: Sharing controller tests

**Files:**
- Create: `backend/test/sharing.controller.spec.ts`

- [ ] **Step 1: Write sharing controller tests**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharingController } from '../src/modules/sharing/presentation/sharing.controller';
import { SharedAccess } from '../src/modules/sharing/domain/shared-access.entity';
import { User } from '../src/modules/auth/domain/user.entity';
import { Permission } from '../src/modules/sharing/domain/permission.enum';

const mockUser = { id: 'user-1', email: 'owner@test.com', name: 'Owner' } as User;

describe('SharingController', () => {
  let controller: SharingController;
  let shareRepo: jest.Mocked<Partial<Repository<SharedAccess>>>;
  let userRepo: jest.Mocked<Partial<Repository<User>>>;

  beforeEach(async () => {
    shareRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharingController],
      providers: [
        { provide: getRepositoryToken(SharedAccess), useValue: shareRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    controller = module.get<SharingController>(SharingController);
  });

  describe('grantAccess', () => {
    it('should create a share for a file', async () => {
      userRepo.findOne!.mockResolvedValue(null);
      const share = { id: 's-1', fileId: 'f-1', folderId: null } as SharedAccess;
      shareRepo.create!.mockReturnValue(share);
      shareRepo.save!.mockResolvedValue(share);

      const result = await controller.grantAccess(mockUser, {
        fileId: 'f-1',
        grantedToEmail: 'guest@test.com',
        permission: Permission.VIEW,
      });

      expect(result.fileId).toBe('f-1');
    });

    it('should throw BadRequestException when both fileId and folderId provided', async () => {
      await expect(
        controller.grantAccess(mockUser, {
          fileId: 'f-1',
          folderId: 'fo-1',
          grantedToEmail: 'guest@test.com',
          permission: Permission.VIEW,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should link grantedToUserId when recipient has an account', async () => {
      const recipient = { id: 'user-2', email: 'guest@test.com' } as User;
      userRepo.findOne!.mockResolvedValue(recipient);
      const share = { id: 's-1', grantedToUserId: 'user-2' } as SharedAccess;
      shareRepo.create!.mockReturnValue(share);
      shareRepo.save!.mockResolvedValue(share);

      await controller.grantAccess(mockUser, {
        fileId: 'f-1',
        grantedToEmail: 'guest@test.com',
        permission: Permission.EDIT,
      });

      expect(shareRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ grantedToUserId: 'user-2' }),
      );
    });
  });

  describe('revoke', () => {
    it('should throw NotFoundException for unknown share', async () => {
      shareRepo.findOne!.mockResolvedValue(null);

      await expect(controller.revoke(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('accessPublicLink', () => {
    it('should return share with relations for valid token', async () => {
      const share = { id: 's-1', shareToken: 'tok-1' } as SharedAccess;
      shareRepo.findOne!.mockResolvedValue(share);

      const result = await controller.accessPublicLink('tok-1');

      expect(result.shareToken).toBe('tok-1');
    });

    it('should throw NotFoundException for invalid token', async () => {
      shareRepo.findOne!.mockResolvedValue(null);

      await expect(controller.accessPublicLink('bad-token')).rejects.toThrow(NotFoundException);
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd backend && npx jest test/sharing.controller.spec.ts --verbose
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: add sharing controller unit tests"
```

---

## Phase 6: Search + Background Jobs

### Task 18: Search controller

**Files:**
- Create: `backend/src/modules/search/presentation/search.controller.ts`
- Create: `backend/src/modules/search/presentation/search.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `search.controller.ts`**

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Folder } from '../../folder/domain/folder.entity';
import { FileEntity } from '../../file/domain/file.entity';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../auth/domain/user.entity';

interface SearchResult {
  files: FileEntity[];
  folders: Folder[];
}

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  /** Searches files and folders by name using case-insensitive partial match */
  @Get()
  async search(
    @CurrentUser() user: User,
    @Query('q') query: string,
  ): Promise<SearchResult> {
    if (!query || query.trim().length === 0) {
      return { files: [], folders: [] };
    }

    const [files, folders] = await Promise.all([
      this.fileRepository.find({
        where: { ownerId: user.id, name: ILike(`%${query}%`) },
        take: 50,
      }),
      this.folderRepository.find({
        where: { ownerId: user.id, name: ILike(`%${query}%`) },
        take: 50,
      }),
    ]);

    return { files, folders };
  }
}
```

- [ ] **Step 2: Create `search.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../../file/domain/file.entity';
import { Folder } from '../../folder/domain/folder.entity';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, Folder])],
  controllers: [SearchController],
})
export class SearchModule {}
```

- [ ] **Step 3: Register SearchModule in `app.module.ts`**

```typescript
import { SearchModule } from './modules/search/presentation/search.module';

// Add to imports:
SearchModule,
```

- [ ] **Step 4: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: implement search endpoint for files and folders"
```

---

### Task 19: Background image compression job

**Files:**
- Create: `backend/src/modules/jobs/infrastructure/image-compression.processor.ts`
- Create: `backend/src/modules/jobs/presentation/jobs.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `image-compression.processor.ts`**

```typescript
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import * as sharp from 'sharp';
import { FileEntity } from '../../file/domain/file.entity';
import { MinioProvider } from '../../file/infrastructure/minio.provider';

interface CompressionJobData {
  fileId: string;
  storageKey: string;
  mimeType: string;
}

@Processor('image-compression')
export class ImageCompressionProcessor {
  private readonly logger = new Logger(ImageCompressionProcessor.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly minioProvider: MinioProvider,
  ) {}

  /**
   * Processes an image compression job:
   * 1. Downloads the original image from MinIO
   * 2. Resizes to max 400px width using Sharp
   * 3. Uploads the thumbnail back to MinIO
   * 4. Updates the file record with the thumbnail path
   */
  @Process('compress')
  async handleCompression(job: Job<CompressionJobData>): Promise<void> {
    const { fileId, storageKey, mimeType } = job.data;
    this.logger.log(`Compressing image: ${fileId}`);

    const stream = await this.minioProvider.download(storageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const originalBuffer = Buffer.concat(chunks);

    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const thumbnailKey = storageKey.replace(/(\.[^.]+)$/, '_thumb$1');
    await this.minioProvider.upload(thumbnailKey, thumbnailBuffer, mimeType);

    await this.fileRepository.update(fileId, { thumbnailPath: thumbnailKey });
    this.logger.log(`Thumbnail saved: ${thumbnailKey}`);
  }
}
```

- [ ] **Step 2: Create `jobs.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../../file/domain/file.entity';
import { MinioProvider } from '../../file/infrastructure/minio.provider';
import { ImageCompressionProcessor } from '../infrastructure/image-compression.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    BullModule.registerQueue({ name: 'image-compression' }),
  ],
  providers: [ImageCompressionProcessor, MinioProvider],
})
export class JobsModule {}
```

- [ ] **Step 3: Register JobsModule in `app.module.ts`**

```typescript
import { JobsModule } from './modules/jobs/presentation/jobs.module';

// Add to imports:
JobsModule,
```

- [ ] **Step 4: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add background image compression job with Bull and Sharp"
```

---

### Task 20: Global exception filter

**Files:**
- Create: `backend/src/shared/filters/http-exception.filter.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create `http-exception.filter.ts`**

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = typeof responseBody === 'string' ? responseBody : (responseBody as Record<string, unknown>).message as string;
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

- [ ] **Step 2: Register as global filter in `app.module.ts`**

```typescript
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

// Add to providers:
{ provide: APP_FILTER, useClass: GlobalExceptionFilter },
```

- [ ] **Step 3: Verify typecheck**

```bash
cd backend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add global exception filter"
```

---

## Phase 7: Frontend Infrastructure

### Task 21: Scaffold React project with Vite

**Files:**
- Create: `frontend/` (Vite scaffold)

- [ ] **Step 1: Create Vite React TypeScript project**

```bash
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend && npm install react-router-dom @tanstack/react-query axios
```

- [ ] **Step 3: Install dev dependencies**

```bash
cd frontend && npm install -D @types/react @types/react-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event jest ts-jest @types/jest jest-environment-jsdom identity-obj-proxy
```

- [ ] **Step 4: Ensure strict TypeScript in `frontend/tsconfig.json`**

Verify/add in `compilerOptions`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

- [ ] **Step 5: Verify typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold React frontend with Vite"
```

---

### Task 22: Frontend ESLint + Prettier

**Files:**
- Create: `frontend/.prettierrc`
- Modify: `frontend/eslint.config.js` (or `.eslintrc.js`)

- [ ] **Step 1: Install ESLint + Prettier deps**

```bash
cd frontend && npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

- [ ] **Step 3: Configure ESLint**

If Vite created `eslint.config.js` (flat config), replace it. If it created `.eslintrc.js`, update it. Target config:

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
  settings: {
    react: { version: 'detect' },
  },
};
```

- [ ] **Step 4: Add scripts to `frontend/package.json`**

```json
{
  "lint": "eslint src --ext .ts,.tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 5: Run format + lint**

```bash
cd frontend && npm run format && npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: configure ESLint and Prettier for frontend"
```

---

### Task 23: Shared types + Axios instance

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/services/api.ts`

- [ ] **Step 1: Create shared TypeScript types**

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  isPublic: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  storagePath: string;
  thumbnailPath: string | null;
  folderId: string | null;
  ownerId: string;
  isPublic: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
}

export interface SharedAccess {
  id: string;
  fileId: string | null;
  folderId: string | null;
  grantedToEmail: string;
  grantedToUserId: string | null;
  permission: Permission;
  shareToken: string;
  grantedById: string;
  grantedBy?: User;
  file?: FileItem;
  folder?: Folder;
  createdAt: string;
}

export interface SearchResult {
  files: FileItem[];
  folders: Folder[];
}

export interface AuthResponse {
  token: string;
}
```

- [ ] **Step 2: Create Axios instance with JWT interceptor**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

- [ ] **Step 3: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add shared types and Axios API client with JWT interceptor"
```

---

### Task 24: API service functions

**Files:**
- Create: `frontend/src/services/auth.api.ts`
- Create: `frontend/src/services/folders.api.ts`
- Create: `frontend/src/services/files.api.ts`
- Create: `frontend/src/services/sharing.api.ts`
- Create: `frontend/src/services/search.api.ts`

- [ ] **Step 1: Create `auth.api.ts`**

```typescript
import api from './api';
import { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
```

- [ ] **Step 2: Create `folders.api.ts`**

```typescript
import api from './api';
import { Folder } from '../types';

export const foldersApi = {
  list: (parentId?: string) =>
    api.get<Folder[]>('/folders', { params: { parentId } }).then((r) => r.data),

  get: (id: string) => api.get<Folder>(`/folders/${id}`).then((r) => r.data),

  create: (data: { name: string; parentId?: string }) =>
    api.post<Folder>('/folders', data).then((r) => r.data),

  update: (id: string, data: { name?: string; parentId?: string | null; isPublic?: boolean }) =>
    api.patch<Folder>(`/folders/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/folders/${id}`),

  clone: (id: string) => api.post<Folder>(`/folders/${id}/clone`).then((r) => r.data),

  reorder: (items: { id: string; position: number }[]) =>
    api.patch('/folders/reorder', { items }),
};
```

- [ ] **Step 3: Create `files.api.ts`**

```typescript
import api from './api';
import { FileItem } from '../types';

export const filesApi = {
  list: (folderId?: string) =>
    api.get<FileItem[]>('/files', { params: { folderId } }).then((r) => r.data),

  get: (id: string) => api.get<FileItem>(`/files/${id}`).then((r) => r.data),

  upload: (file: File, folderId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    return api
      .post<FileItem>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  download: (id: string) =>
    api.get(`/files/${id}/download`, { responseType: 'blob' }).then((r) => r.data),

  update: (id: string, data: { name?: string; folderId?: string | null; isPublic?: boolean }) =>
    api.patch<FileItem>(`/files/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/files/${id}`),

  clone: (id: string) => api.post<FileItem>(`/files/${id}/clone`).then((r) => r.data),

  reorder: (items: { id: string; position: number }[]) =>
    api.patch('/files/reorder', { items }),
};
```

- [ ] **Step 4: Create `sharing.api.ts`**

```typescript
import api from './api';
import { SharedAccess, Permission } from '../types';

export const sharingApi = {
  grant: (data: { fileId?: string; folderId?: string; grantedToEmail: string; permission: Permission }) =>
    api.post<SharedAccess>('/sharing', data).then((r) => r.data),

  listByResource: (params: { fileId?: string; folderId?: string }) =>
    api.get<SharedAccess[]>('/sharing/resource', { params }).then((r) => r.data),

  revoke: (id: string) => api.delete(`/sharing/${id}`),

  sharedWithMe: () =>
    api.get<SharedAccess[]>('/sharing/shared-with-me').then((r) => r.data),

  accessPublicLink: (shareToken: string) =>
    api.get<SharedAccess>(`/public/${shareToken}`).then((r) => r.data),
};
```

- [ ] **Step 5: Create `search.api.ts`**

```typescript
import api from './api';
import { SearchResult } from '../types';

export const searchApi = {
  search: (q: string) =>
    api.get<SearchResult>('/search', { params: { q } }).then((r) => r.data),
};
```

- [ ] **Step 6: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add API service functions for all backend endpoints"
```

---

### Task 25: React Query hooks

**Files:**
- Create: `frontend/src/hooks/useFolders.ts`
- Create: `frontend/src/hooks/useFiles.ts`
- Create: `frontend/src/hooks/useSharing.ts`
- Create: `frontend/src/hooks/useSearch.ts`

- [ ] **Step 1: Create `useFolders.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '../services/folders.api';

export function useFolders(parentId?: string) {
  return useQuery({
    queryKey: ['folders', parentId ?? 'root'],
    queryFn: () => foldersApi.list(parentId),
  });
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: ['folder', id],
    queryFn: () => foldersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foldersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; parentId?: string | null; isPublic?: boolean }) =>
      foldersApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foldersApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useCloneFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foldersApi.clone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useReorderFolders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: foldersApi.reorder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] }),
  });
}
```

- [ ] **Step 2: Create `useFiles.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../services/files.api';

export function useFiles(folderId?: string) {
  return useQuery({
    queryKey: ['files', folderId ?? 'root'],
    queryFn: () => filesApi.list(folderId),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string }) =>
      filesApi.upload(file, folderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; folderId?: string | null; isPublic?: boolean }) =>
      filesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: filesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}

export function useCloneFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: filesApi.clone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      const blob = await filesApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useReorderFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: filesApi.reorder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  });
}
```

- [ ] **Step 3: Create `useSharing.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingApi } from '../services/sharing.api';
import { Permission } from '../types';

export function useSharesByResource(params: { fileId?: string; folderId?: string }) {
  return useQuery({
    queryKey: ['shares', params],
    queryFn: () => sharingApi.listByResource(params),
    enabled: !!params.fileId || !!params.folderId,
  });
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ['shared-with-me'],
    queryFn: sharingApi.sharedWithMe,
  });
}

export function useGrantAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fileId?: string; folderId?: string; grantedToEmail: string; permission: Permission }) =>
      sharingApi.grant(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shares'] }),
  });
}

export function useRevokeAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sharingApi.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shares'] }),
  });
}

export function usePublicLink(shareToken: string) {
  return useQuery({
    queryKey: ['public-link', shareToken],
    queryFn: () => sharingApi.accessPublicLink(shareToken),
    enabled: !!shareToken,
  });
}
```

- [ ] **Step 4: Create `useSearch.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/search.api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.length > 0,
  });
}
```

- [ ] **Step 5: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add React Query hooks for all API domains"
```

---

## Phase 8: Frontend Auth

### Task 26: Auth context + useAuth hook

**Files:**
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/hooks/useAuth.ts`

- [ ] **Step 1: Create `AuthContext.tsx`**

```tsx
import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../services/auth.api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi
        .me()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await authApi.login({ email, password });
    localStorage.setItem('token', token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { token } = await authApi.register({ email, password, name });
    localStorage.setItem('token', token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 2: Create `useAuth.ts`**

```typescript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add auth context with login, register, and logout"
```

---

### Task 27: Login + Register pages

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`

- [ ] **Step 1: Create `LoginPage.tsx`**

```tsx
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 24px' }}>Login</button>
      </form>
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `RegisterPage.tsx`**

```tsx
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
      navigate('/');
    } catch {
      setError('Registration failed. Email may already be in use.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 24px' }}>Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add login and register pages"
```

---

### Task 28: Router + App setup with providers

**Files:**
- Create: `frontend/src/routes/AppRouter.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create `AppRouter.tsx`**

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SharedWithMePage } from '../pages/SharedWithMePage';
import { PublicLinkPage } from '../pages/PublicLinkPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/public/:shareToken" element={<PublicLinkPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/folder/:folderId"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shared-with-me"
        element={
          <ProtectedRoute>
            <SharedWithMePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

- [ ] **Step 2: Create placeholder pages**

Create minimal placeholder files for `DashboardPage.tsx`, `SharedWithMePage.tsx`, and `PublicLinkPage.tsx` so the router compiles:

`frontend/src/pages/DashboardPage.tsx`:
```tsx
export function DashboardPage() {
  return <div>Dashboard — TODO</div>;
}
```

`frontend/src/pages/SharedWithMePage.tsx`:
```tsx
export function SharedWithMePage() {
  return <div>Shared with me — TODO</div>;
}
```

`frontend/src/pages/PublicLinkPage.tsx`:
```tsx
export function PublicLinkPage() {
  return <div>Public link — TODO</div>;
}
```

- [ ] **Step 3: Update `App.tsx`**

```tsx
import { AppRouter } from './routes/AppRouter';

export function App() {
  return <AppRouter />;
}
```

- [ ] **Step 4: Update `main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { App } from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 5: Verify typecheck + dev server starts**

```bash
cd frontend && npm run typecheck && npm run dev
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: wire up React Router, React Query, and auth providers"
```

---

## Phase 9: Dashboard UI

### Task 29: Layout components (Header + Sidebar)

**Files:**
- Create: `frontend/src/components/layout/Header.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create `Header.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../common/SearchBar';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #ddd' }}>
      <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
        File Manager
      </h2>
      <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>{user?.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `SearchBar.tsx`**

Create `frontend/src/components/common/SearchBar.tsx`:

```tsx
import { FormEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: 400, margin: '0 16px' }}>
      <input
        type="text"
        placeholder="Search files and folders..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: 8 }}
      />
    </form>
  );
}
```

- [ ] **Step 3: Create `Sidebar.tsx`**

```tsx
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const linkStyle = (isActive: boolean) => ({
    display: 'block',
    padding: '8px 16px',
    textDecoration: 'none',
    backgroundColor: isActive ? '#e8f0fe' : 'transparent',
    color: '#333',
  });

  return (
    <nav style={{ width: 220, borderRight: '1px solid #ddd', minHeight: '100vh', paddingTop: 16 }}>
      <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
        My Files
      </NavLink>
      <NavLink to="/shared-with-me" style={({ isActive }) => linkStyle(isActive)}>
        Shared with me
      </NavLink>
    </nav>
  );
}
```

- [ ] **Step 4: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Header, Sidebar, and SearchBar layout components"
```

---

### Task 30: Common components (Modal, ContextMenu)

**Files:**
- Create: `frontend/src/components/common/Modal.tsx`
- Create: `frontend/src/components/common/ContextMenu.tsx`

- [ ] **Step 1: Create `Modal.tsx`**

```tsx
import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div style={{ background: 'white', borderRadius: 8, padding: 24, minWidth: 360, maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ContextMenu.tsx`**

```tsx
import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: x, top: y, background: 'white',
        border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1001, minWidth: 150,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          onClick={() => { item.onClick(); onClose(); }}
          style={{
            padding: '8px 16px', cursor: 'pointer',
            color: item.danger ? 'red' : '#333',
          }}
          onMouseEnter={(e) => { (e.target as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
          onMouseLeave={(e) => { (e.target as HTMLDivElement).style.backgroundColor = 'white'; }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Modal and ContextMenu common components"
```

---

### Task 31: FileCard, FileGrid, FolderBreadcrumb

**Files:**
- Create: `frontend/src/components/files/FileCard.tsx`
- Create: `frontend/src/components/files/FileGrid.tsx`
- Create: `frontend/src/components/folders/FolderBreadcrumb.tsx`

- [ ] **Step 1: Create `FileCard.tsx`**

```tsx
import { MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileItem, Folder } from '../../types';
import { ContextMenu, ContextMenuItem } from '../common/ContextMenu';

interface FileCardProps {
  item: FileItem | Folder;
  type: 'file' | 'folder';
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
  onTogglePublic: (id: string, isPublic: boolean) => void;
  onShare: (id: string) => void;
}

export function FileCard({ item, type, onRename, onDelete, onClone, onTogglePublic, onShare }: FileCardProps) {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    if (type === 'folder') {
      navigate(`/folder/${item.id}`);
    }
  };

  const menuItems: ContextMenuItem[] = [
    { label: 'Rename', onClick: () => { const newName = prompt('New name:', item.name); if (newName) onRename(item.id, newName); } },
    { label: 'Clone', onClick: () => onClone(item.id) },
    { label: item.isPublic ? 'Make Private' : 'Make Public', onClick: () => onTogglePublic(item.id, !item.isPublic) },
    { label: 'Share', onClick: () => onShare(item.id) },
    { label: 'Delete', onClick: () => onDelete(item.id), danger: true },
  ];

  const icon = type === 'folder' ? '\uD83D\uDCC1' : '\uD83D\uDCC4';

  return (
    <>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          border: '1px solid #ddd', borderRadius: 8, padding: 16,
          cursor: type === 'folder' ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, minWidth: 120,
        }}
      >
        <span style={{ fontSize: 40 }}>{icon}</span>
        <span style={{ fontSize: 14, textAlign: 'center', wordBreak: 'break-word' }}>
          {item.name}
        </span>
        {item.isPublic && <span style={{ fontSize: 10, color: '#666' }}>Public</span>}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Create `FileGrid.tsx`**

```tsx
import { FileItem, Folder } from '../../types';
import { FileCard } from './FileCard';

interface FileGridProps {
  folders: Folder[];
  files: FileItem[];
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onCloneFolder: (id: string) => void;
  onToggleFolderPublic: (id: string, isPublic: boolean) => void;
  onRenameFile: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onCloneFile: (id: string) => void;
  onToggleFilePublic: (id: string, isPublic: boolean) => void;
  onShare: (id: string, type: 'file' | 'folder') => void;
}

export function FileGrid({
  folders, files,
  onRenameFolder, onDeleteFolder, onCloneFolder, onToggleFolderPublic,
  onRenameFile, onDeleteFile, onCloneFile, onToggleFilePublic,
  onShare,
}: FileGridProps) {
  if (folders.length === 0 && files.length === 0) {
    return <p style={{ padding: 24, color: '#888' }}>This folder is empty</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 16 }}>
      {folders.map((folder) => (
        <FileCard
          key={folder.id}
          item={folder}
          type="folder"
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
          onClone={onCloneFolder}
          onTogglePublic={onToggleFolderPublic}
          onShare={(id) => onShare(id, 'folder')}
        />
      ))}
      {files.map((file) => (
        <FileCard
          key={file.id}
          item={file}
          type="file"
          onRename={onRenameFile}
          onDelete={onDeleteFile}
          onClone={onCloneFile}
          onTogglePublic={onToggleFilePublic}
          onShare={(id) => onShare(id, 'file')}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create `FolderBreadcrumb.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { Folder } from '../../types';

interface FolderBreadcrumbProps {
  path: Folder[];
}

export function FolderBreadcrumb({ path }: FolderBreadcrumbProps) {
  return (
    <nav style={{ padding: '8px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#1a73e8' }}>My Files</Link>
      {path.map((folder) => (
        <span key={folder.id}>
          <span style={{ margin: '0 4px', color: '#888' }}>/</span>
          <Link to={`/folder/${folder.id}`} style={{ textDecoration: 'none', color: '#1a73e8' }}>
            {folder.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add FileCard, FileGrid, and FolderBreadcrumb components"
```

---

### Task 32: FileUpload component

**Files:**
- Create: `frontend/src/components/files/FileUpload.tsx`

- [ ] **Step 1: Create `FileUpload.tsx`**

```tsx
import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { useUploadFile } from '../../hooks/useFiles';

interface FileUploadProps {
  folderId?: string;
}

export function FileUpload({ folderId }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadFile();

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      uploadMutation.mutate({ file, folderId });
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragging ? '#1a73e8' : '#ccc'}`,
        borderRadius: 8, padding: 24, textAlign: 'center',
        cursor: 'pointer', margin: 16,
        backgroundColor: isDragging ? '#e8f0fe' : 'transparent',
      }}
    >
      <input ref={inputRef} type="file" multiple hidden onChange={handleChange} />
      <p style={{ margin: 0 }}>
        {uploadMutation.isPending ? 'Uploading...' : 'Drop files here or click to upload'}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add drag-and-drop file upload component"
```

---

### Task 33: DashboardPage (wiring everything together)

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Implement `DashboardPage.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { FileGrid } from '../components/files/FileGrid';
import { FileUpload } from '../components/files/FileUpload';
import { FolderBreadcrumb } from '../components/folders/FolderBreadcrumb';
import { ShareDialog } from '../components/sharing/ShareDialog';
import { Modal } from '../components/common/Modal';
import { useFolders, useCreateFolder, useUpdateFolder, useDeleteFolder, useCloneFolder } from '../hooks/useFolders';
import { useFiles, useUpdateFile, useDeleteFile, useCloneFile } from '../hooks/useFiles';
import { useSearch } from '../hooks/useSearch';
import { useFolder } from '../hooks/useFolders';
import { Folder } from '../types';

export function DashboardPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const { data: folders = [], isLoading: foldersLoading } = useFolders(folderId);
  const { data: files = [], isLoading: filesLoading } = useFiles(folderId);
  const { data: currentFolder } = useFolder(folderId || '');
  const { data: searchResults } = useSearch(searchQuery);

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const cloneFolder = useCloneFolder();
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();
  const cloneFile = useCloneFile();

  const [shareTarget, setShareTarget] = useState<{ id: string; type: 'file' | 'folder' } | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const breadcrumbPath: Folder[] = currentFolder ? [currentFolder] : [];

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder.mutate({ name: newFolderName.trim(), parentId: folderId });
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const displayFolders = searchQuery ? (searchResults?.folders || []) : folders;
  const displayFiles = searchQuery ? (searchResults?.files || []) : files;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <FolderBreadcrumb path={breadcrumbPath} />
            <button onClick={() => setShowCreateFolder(true)} style={{ padding: '6px 16px' }}>
              New Folder
            </button>
          </div>

          {!searchQuery && <FileUpload folderId={folderId} />}

          {foldersLoading || filesLoading ? (
            <p style={{ padding: 24 }}>Loading...</p>
          ) : (
            <FileGrid
              folders={displayFolders}
              files={displayFiles}
              onRenameFolder={(id, name) => updateFolder.mutate({ id, name })}
              onDeleteFolder={(id) => deleteFolder.mutate(id)}
              onCloneFolder={(id) => cloneFolder.mutate(id)}
              onToggleFolderPublic={(id, isPublic) => updateFolder.mutate({ id, isPublic })}
              onRenameFile={(id, name) => updateFile.mutate({ id, name })}
              onDeleteFile={(id) => deleteFile.mutate(id)}
              onCloneFile={(id) => cloneFile.mutate(id)}
              onToggleFilePublic={(id, isPublic) => updateFile.mutate({ id, isPublic })}
              onShare={(id, type) => setShareTarget({ id, type })}
            />
          )}

          <Modal isOpen={showCreateFolder} onClose={() => setShowCreateFolder(false)} title="New Folder">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
            />
            <button onClick={handleCreateFolder} style={{ padding: '6px 16px' }}>
              Create
            </button>
          </Modal>

          {shareTarget && (
            <ShareDialog
              resourceId={shareTarget.id}
              resourceType={shareTarget.type}
              onClose={() => setShareTarget(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

Note: This will fail because `ShareDialog` doesn't exist yet. That's expected — it gets created in the next task.

- [ ] **Step 3: Commit (after ShareDialog is created in Task 34)**

Commit deferred to end of Task 34.

---

### Task 34: ShareDialog component

**Files:**
- Create: `frontend/src/components/sharing/ShareDialog.tsx`

- [ ] **Step 1: Create `ShareDialog.tsx`**

```tsx
import { FormEvent, useState } from 'react';
import { Modal } from '../common/Modal';
import { useSharesByResource, useGrantAccess, useRevokeAccess } from '../../hooks/useSharing';
import { Permission } from '../../types';

interface ShareDialogProps {
  resourceId: string;
  resourceType: 'file' | 'folder';
  onClose: () => void;
}

export function ShareDialog({ resourceId, resourceType, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>(Permission.VIEW);

  const queryParams = resourceType === 'file'
    ? { fileId: resourceId }
    : { folderId: resourceId };

  const { data: shares = [] } = useSharesByResource(queryParams);
  const grantAccess = useGrantAccess();
  const revokeAccess = useRevokeAccess();

  const handleGrant = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    grantAccess.mutate({
      ...queryParams,
      grantedToEmail: email.trim(),
      permission,
    });
    setEmail('');
  };

  const shareLink = shares.length > 0
    ? `${window.location.origin}/public/${shares[0].shareToken}`
    : null;

  return (
    <Modal isOpen onClose={onClose} title="Share">
      <form onSubmit={handleGrant} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          style={{ flex: 1, padding: 8 }}
        />
        <select value={permission} onChange={(e) => setPermission(e.target.value as Permission)} style={{ padding: 8 }}>
          <option value={Permission.VIEW}>View</option>
          <option value={Permission.EDIT}>Edit</option>
        </select>
        <button type="submit" style={{ padding: '8px 16px' }}>Share</button>
      </form>

      {shares.length > 0 && (
        <div>
          <h4 style={{ margin: '8px 0' }}>People with access</h4>
          {shares.map((share) => (
            <div key={share.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span>{share.grantedToEmail} ({share.permission})</span>
              <button
                onClick={() => revokeAccess.mutate(share.id)}
                style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {shareLink && (
        <div style={{ marginTop: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#666' }}>Public link:</p>
          <input
            type="text"
            readOnly
            value={shareLink}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            style={{ width: '100%', padding: 4, border: '1px solid #ddd' }}
          />
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 3: Commit (includes DashboardPage from Task 33)**

```bash
git add -A && git commit -m "feat: implement DashboardPage with FileGrid, upload, and ShareDialog"
```

---

### Task 35: SharedWithMe + PublicLink pages

**Files:**
- Modify: `frontend/src/pages/SharedWithMePage.tsx`
- Modify: `frontend/src/pages/PublicLinkPage.tsx`

- [ ] **Step 1: Implement `SharedWithMePage.tsx`**

```tsx
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useSharedWithMe } from '../hooks/useSharing';

export function SharedWithMePage() {
  const { data: shares = [], isLoading } = useSharedWithMe();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 24 }}>
          <h2>Shared with me</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : shares.length === 0 ? (
            <p style={{ color: '#888' }}>Nothing has been shared with you yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>Name</th>
                  <th style={{ padding: 8 }}>Type</th>
                  <th style={{ padding: 8 }}>Permission</th>
                  <th style={{ padding: 8 }}>Shared by</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((share) => (
                  <tr key={share.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>
                      {share.file?.name || share.folder?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: 8 }}>{share.fileId ? 'File' : 'Folder'}</td>
                    <td style={{ padding: 8 }}>{share.permission}</td>
                    <td style={{ padding: 8 }}>{share.grantedBy?.name || share.grantedBy?.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `PublicLinkPage.tsx`**

```tsx
import { useParams } from 'react-router-dom';
import { usePublicLink } from '../hooks/useSharing';

export function PublicLinkPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: share, isLoading, error } = usePublicLink(shareToken || '');

  if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error || !share) return <div style={{ padding: 24 }}>Link not found or expired</div>;

  const name = share.file?.name || share.folder?.name || 'Shared item';
  const type = share.fileId ? 'File' : 'Folder';

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h1>Shared {type}</h1>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24 }}>
        <h2>{name}</h2>
        <p>Type: {type}</p>
        <p>Permission: {share.permission}</p>
        {share.file && (
          <div>
            <p>Size: {(share.file.size / 1024).toFixed(1)} KB</p>
            <p>Uploaded: {new Date(share.file.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd frontend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: implement SharedWithMe and PublicLink pages"
```

---

## Phase 10: Frontend Tests

### Task 36: Jest configuration for frontend

**Files:**
- Create: `frontend/jest.config.ts`

- [ ] **Step 1: Create `jest.config.ts`**

```typescript
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
};
```

- [ ] **Step 2: Add test script to `frontend/package.json`**

```json
{
  "test": "jest"
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: configure Jest for frontend with jsdom"
```

---

### Task 37: Frontend component tests

**Files:**
- Create: `frontend/src/__tests__/LoginPage.test.tsx`
- Create: `frontend/src/__tests__/SearchBar.test.tsx`

- [ ] **Step 1: Write LoginPage test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';

const mockLogin = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthContext.Provider value={{ user: null, isLoading: false, login: mockLogin, register: jest.fn(), logout: jest.fn() }}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls login on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<LoginPage />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
  });
});
```

- [ ] **Step 2: Write SearchBar test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../components/common/SearchBar';

describe('SearchBar', () => {
  it('calls onSearch on form submit', async () => {
    const onSearch = jest.fn();
    const onChange = jest.fn();

    render(<SearchBar value="test query" onChange={onChange} onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveValue('test query');

    await userEvent.type(input, '{enter}');
    expect(onSearch).toHaveBeenCalledWith('test query');
  });
});
```

- [ ] **Step 3: Run frontend tests**

```bash
cd frontend && npm test -- --verbose
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test: add frontend component tests for LoginPage and SearchBar"
```

---

## Phase 11: Final Wiring

### Task 38: Backend README + final app.module.ts verification

**Files:**
- Modify: `backend/src/app.module.ts` (verify all modules are imported)

- [ ] **Step 1: Verify final `app.module.ts` has all imports**

The final `app.module.ts` should import:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD, APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { FolderModule } from './modules/folder/presentation/folder.module';
import { FileModule } from './modules/file/presentation/file.module';
import { SharingModule } from './modules/sharing/presentation/sharing.module';
import { SearchModule } from './modules/search/presentation/search.module';
import { JobsModule } from './modules/jobs/presentation/jobs.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRoot(dataSourceOptions),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    AuthModule,
    FolderModule,
    FileModule,
    SharingModule,
    SearchModule,
    JobsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, transform: true }) },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Run full backend test suite**

```bash
cd backend && npx jest --verbose
```

Expected: all tests pass.

- [ ] **Step 3: Run full typecheck on both projects**

```bash
cd backend && npm run typecheck && cd ../frontend && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: verify final module wiring and run all tests"
```

---

### Task 39: Project README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# File Manager

A multi-user file storage service with folder management, file sharing, and public link access.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose

## Quick Start

1. Start infrastructure:

```bash
docker compose up -d
```

2. Backend:

```bash
cd backend
cp ../.env.example ../.env
npm install
npm run migration:run
npm run start:dev
```

API runs on http://localhost:3001/api
Swagger docs at http://localhost:3001/api/docs

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Tech Stack

- **Backend:** NestJS, TypeORM, PostgreSQL, MinIO (S3), Redis, Bull, Sharp
- **Frontend:** React, TypeScript, React Query, React Router DOM, Axios, Vite
- **Testing:** Jest
```

- [ ] **Step 2: Commit**

```bash
git add README.md && git commit -m "docs: add project README with setup instructions"
```
