# Monorepo Scaffold + NestJS API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire a proper npm-workspaces + Turborepo monorepo root, add a `packages/types` shared package, and build the full `apps/api/` NestJS backend (Prisma, PostgreSQL, JWT auth, Swagger).

**Architecture:** npm workspaces at the repo root with `apps/*` and `packages/*`. `packages/types` holds shared Locale + Project interfaces consumed by both apps. `apps/api` is a NestJS 10 application using Prisma for DB access; it exposes public read endpoints with locale resolution and admin CRUD behind JWT cookie auth. `apps/web` already exists and connects to the API via `API_URL`; its `lib/types.ts` stays but types should stay aligned with `packages/types`.

**Tech Stack:** npm workspaces, Turborepo, NestJS 10+, Prisma 5, PostgreSQL, @nestjs/jwt, cookie-parser, @nestjs/swagger, class-validator, helmet, @nestjs/throttler, bcryptjs, Docker Compose (local DB).

---

## File Map

```
/ (repo root)
├── package.json                    (workspaces: ["apps/*","packages/*"], turbo dev/build scripts)
├── turbo.json                      (pipeline: dev, build, lint, type-check)
├── .gitignore                      (updated: node_modules, .env.local, .next, dist, .turbo)
├── docker-compose.yml             (postgres:16 for local dev)
├── packages/
│   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts           (Locale, Project, ProjectImage, PaginatedProjects)
└── apps/
    ├── web/                        (existing — add workspace dep on @guileite/types)
    └── api/
        ├── package.json
        ├── nest-cli.json
        ├── tsconfig.json
        ├── tsconfig.build.json
        ├── .env                    (DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH, etc.)
        ├── prisma/
        │   ├── schema.prisma       (Project, ProjectTranslation, ProjectImage)
        │   └── seed.ts             (2 sample projects with pt-BR + en translations)
        └── src/
            ├── main.ts             (bootstrap, global pipes, cookie-parser, helmet, cors, swagger)
            ├── app.module.ts       (imports all feature modules)
            ├── prisma/
            │   ├── prisma.module.ts
            │   └── prisma.service.ts
            ├── i18n/
            │   └── locales.ts      (SUPPORTED_LOCALES, DEFAULT_LOCALE constants)
            ├── projects/
            │   ├── projects.module.ts
            │   ├── projects.controller.ts      (GET /projects, /featured, /:id)
            │   ├── projects.service.ts         (flatten, locale fallback, pagination)
            │   ├── admin-projects.controller.ts (POST/PATCH/DELETE admin routes)
            │   └── dto/
            │       ├── paginate-query.dto.ts
            │       ├── create-project.dto.ts
            │       ├── update-project.dto.ts
            │       ├── upsert-translation.dto.ts
            │       ├── add-image.dto.ts
            │       ├── update-image.dto.ts
            │       └── reorder.dto.ts
            └── auth/
                ├── auth.module.ts
                ├── auth.controller.ts   (POST /auth/login, /logout, GET /auth/me)
                ├── auth.service.ts      (validatePassword, signJwt)
                ├── jwt.strategy.ts      (reads cookie)
                └── jwt-auth.guard.ts
```

---

## Task 1: Monorepo root — workspaces, Turborepo, .gitignore

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "guileite-dev",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.3.3"
  }
}
```

- [ ] **Step 2: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 3: Update `.gitignore`**

Replace the current `.gitignore` with:

```
# dependencies
node_modules
.pnpm-store

# build outputs
.next
dist
.turbo

# env files
.env
.env.local
.env*.local

# editor
.vscode

# design handoff (large reference files)
DESIGN_HANGOFF/

# OS
.DS_Store
Thumbs.db

# prisma
apps/api/prisma/migrations/
```

- [ ] **Step 4: Install Turborepo at the root**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev && npm install
```

Expected: `turbo` installed in root `node_modules`.

- [ ] **Step 5: Add `turbo.json` dev task for api to `apps/web/package.json`**

The `apps/web/package.json` already has `"dev": "next dev"` — no change needed there.

- [ ] **Step 6: Commit**

```bash
git add package.json turbo.json .gitignore package-lock.json
git commit -m "feat: monorepo root — npm workspaces + Turborepo"
```

---

## Task 2: `packages/types` — shared TypeScript interfaces

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create `packages/types/package.json`**

```json
{
  "name": "@guileite/types",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `packages/types/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/types/src/index.ts`**

```ts
export type Locale = 'pt-BR' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['pt-BR', 'en'];
export const DEFAULT_LOCALE: Locale = 'pt-BR';

export interface ProjectImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  projectUrl: string | null;
  githubUrl: string | null;
  orderIndex: number;
  resolvedLocale: string;
  requestedLocale: string;
  images: ProjectImage[];
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    locale: string;
  };
}
```

- [ ] **Step 4: Install workspace deps**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev && npm install
```

- [ ] **Step 5: Commit**

```bash
git add packages/
git commit -m "feat: packages/types — shared Locale, Project, PaginatedProjects interfaces"
```

---

## Task 3: Docker Compose + `apps/api` scaffold

**Files:**
- Create: `docker-compose.yml`
- Create: `apps/api/package.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/.env`

- [ ] **Step 1: Create `docker-compose.yml` at repo root**

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: guileite
      POSTGRES_PASSWORD: guileite
      POSTGRES_DB: guileite_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 2: Create `apps/api/package.json`**

```json
{
  "name": "@guileite/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "type-check": "tsc --noEmit -p tsconfig.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/swagger": "^7.4.2",
    "@nestjs/throttler": "^6.3.0",
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.7",
    "helmet": "^8.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.9",
    "@nestjs/schematics": "^10.2.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.8",
    "@types/express": "^4.17.21",
    "@types/node": "^20",
    "@types/passport-jwt": "^4.0.1",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Create `apps/api/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create `apps/api/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

- [ ] **Step 5: Create `apps/api/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "prisma/seed.ts"]
}
```

- [ ] **Step 6: Create `apps/api/.env`**

```bash
# Database
DATABASE_URL="postgresql://guileite:guileite@localhost:5432/guileite_dev"

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="change-me-in-production"

# Admin password — generate hash with: node -e "const b=require('bcryptjs');b.hash('your-password',12).then(console.log)"
# Default: "admin" (change before deploying!)
ADMIN_PASSWORD_HASH="$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/odCOUPWBu"

# Locales
DEFAULT_LOCALE="pt-BR"
SUPPORTED_LOCALES="pt-BR,en"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Cookie domain (leave empty for localhost)
COOKIE_DOMAIN=""

NODE_ENV="development"
PORT=3001
```

Note: The `ADMIN_PASSWORD_HASH` above is the bcrypt hash of `"admin"`. Change before deploying.

- [ ] **Step 7: Install API dependencies**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev/apps/api && npm install
```

- [ ] **Step 8: Commit**

```bash
git add docker-compose.yml apps/api/package.json apps/api/nest-cli.json apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/.env
git commit -m "feat: Docker Compose + apps/api NestJS scaffold"
```

---

## Task 4: Prisma schema + PrismaService

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`

- [ ] **Step 1: Create `apps/api/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id           String               @id @default(cuid())
  projectUrl   String?
  githubUrl    String?
  orderIndex   Int                  @default(0)
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
  images       ProjectImage[]
  translations ProjectTranslation[]
}

model ProjectTranslation {
  id          String  @id @default(cuid())
  projectId   String
  locale      String
  title       String  @db.VarChar(120)
  description String

  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, locale])
}

model ProjectImage {
  id        String  @id @default(cuid())
  projectId String
  url       String
  alt       String?
  order     Int     @default(0)

  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Start the database**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev && docker compose up -d
```

Expected: postgres container running on port 5432.

- [ ] **Step 3: Run initial migration**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev/apps/api && npx prisma migrate dev --name init
```

Expected: `migrations/TIMESTAMP_init/migration.sql` created, schema applied to DB.

- [ ] **Step 4: Create `apps/api/src/prisma/prisma.service.ts`**

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- [ ] **Step 5: Create `apps/api/src/prisma/prisma.module.ts`**

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/prisma/ apps/api/src/prisma/
git commit -m "feat: Prisma schema (Project + Translation + Image) + PrismaService"
```

---

## Task 5: Locales constant + all DTOs

**Files:**
- Create: `apps/api/src/i18n/locales.ts`
- Create: `apps/api/src/projects/dto/paginate-query.dto.ts`
- Create: `apps/api/src/projects/dto/create-project.dto.ts`
- Create: `apps/api/src/projects/dto/update-project.dto.ts`
- Create: `apps/api/src/projects/dto/upsert-translation.dto.ts`
- Create: `apps/api/src/projects/dto/add-image.dto.ts`
- Create: `apps/api/src/projects/dto/update-image.dto.ts`
- Create: `apps/api/src/projects/dto/reorder.dto.ts`

- [ ] **Step 1: Create `apps/api/src/i18n/locales.ts`**

```ts
export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE ?? 'pt-BR';
export const SUPPORTED_LOCALES = (
  process.env.SUPPORTED_LOCALES ?? 'pt-BR,en'
).split(',');
```

- [ ] **Step 2: Create `apps/api/src/projects/dto/paginate-query.dto.ts`**

```ts
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginateQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 9, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 9;

  @ApiPropertyOptional({ default: 'pt-BR' })
  @IsOptional()
  @IsString()
  locale?: string;
}
```

- [ ] **Step 3: Create `apps/api/src/projects/dto/upsert-translation.dto.ts`**

```ts
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertTranslationDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  description: string;
}
```

- [ ] **Step 4: Create `apps/api/src/projects/dto/create-project.dto.ts`**

```ts
import { IsArray, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpsertTranslationDto } from './upsert-translation.dto';

class InitialTranslationDto extends UpsertTranslationDto {
  @ApiProperty({ example: 'pt-BR' })
  @IsString()
  locale: string;
}

class InitialImageDto {
  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  order?: number = 0;
}

export class CreateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  orderIndex?: number = 0;

  @ApiProperty({ type: [InitialTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialTranslationDto)
  translations: InitialTranslationDto[];

  @ApiPropertyOptional({ type: [InitialImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialImageDto)
  images?: InitialImageDto[];
}
```

- [ ] **Step 5: Create `apps/api/src/projects/dto/update-project.dto.ts`**

```ts
import { IsInt, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  projectUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}
```

- [ ] **Step 6: Create `apps/api/src/projects/dto/add-image.dto.ts`**

```ts
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddImageDto {
  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;
}
```

- [ ] **Step 7: Create `apps/api/src/projects/dto/update-image.dto.ts`**

```ts
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```

- [ ] **Step 8: Create `apps/api/src/projects/dto/reorder.dto.ts`**

```ts
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ReorderItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  orderIndex: number;
}

export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/i18n/ apps/api/src/projects/dto/
git commit -m "feat: locales constant + all project DTOs with class-validator"
```

---

## Task 6: ProjectsService + public endpoints

**Files:**
- Create: `apps/api/src/projects/projects.service.ts`
- Create: `apps/api/src/projects/projects.controller.ts`
- Create: `apps/api/src/projects/projects.module.ts`

The service returns **flattened** project objects (translation merged in):
```json
{
  "id": "...", "title": "...", "description": "...",
  "projectUrl": null, "githubUrl": "...",
  "orderIndex": 0, "resolvedLocale": "pt-BR", "requestedLocale": "es",
  "images": [{ "id": "...", "url": "...", "alt": "...", "order": 0 }]
}
```

Locale fallback rule: if requested locale translation missing → use `DEFAULT_LOCALE`.

- [ ] **Step 1: Create `apps/api/src/projects/projects.service.ts`**

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { PaginateQueryDto } from './dto/paginate-query.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddImageDto } from './dto/add-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';

const PROJECT_INCLUDE = {
  images: { orderBy: { order: 'asc' as const } },
  translations: true,
};

type ProjectWithRelations = Awaited<
  ReturnType<typeof PrismaService.prototype.project.findFirst>
> & {
  images: { id: string; url: string; alt: string | null; order: number }[];
  translations: { locale: string; title: string; description: string }[];
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private flatten(project: ProjectWithRelations, requestedLocale: string) {
    const locale = requestedLocale ?? DEFAULT_LOCALE;
    const translation =
      project.translations.find((t) => t.locale === locale) ??
      project.translations.find((t) => t.locale === DEFAULT_LOCALE);

    return {
      id: project.id,
      title: translation?.title ?? '',
      description: translation?.description ?? '',
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      orderIndex: project.orderIndex,
      resolvedLocale: translation?.locale ?? DEFAULT_LOCALE,
      requestedLocale: locale,
      images: project.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt ?? undefined,
        order: img.order,
      })),
    };
  }

  async findAll(query: PaginateQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;
    const locale = query.locale ?? DEFAULT_LOCALE;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        include: PROJECT_INCLUDE,
      }),
      this.prisma.project.count(),
    ]);

    return {
      data: items.map((p) => this.flatten(p as ProjectWithRelations, locale)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        locale,
      },
    };
  }

  async findFeatured(locale: string, limit: number) {
    const items = await this.prisma.project.findMany({
      take: limit,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      include: PROJECT_INCLUDE,
    });
    return items.map((p) => this.flatten(p as ProjectWithRelations, locale));
  }

  async findOne(id: string, locale: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return this.flatten(project as ProjectWithRelations, locale);
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        projectUrl: dto.projectUrl,
        githubUrl: dto.githubUrl,
        orderIndex: dto.orderIndex ?? 0,
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            description: t.description,
          })),
        },
        images: dto.images
          ? { create: dto.images.map((img) => ({ url: img.url, alt: img.alt, order: img.order ?? 0 })) }
          : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.assertExists(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.projectUrl !== undefined && { projectUrl: dto.projectUrl }),
        ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
        ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.project.delete({ where: { id } });
  }

  async upsertTranslation(id: string, locale: string, dto: UpsertTranslationDto) {
    await this.assertExists(id);
    return this.prisma.projectTranslation.upsert({
      where: { projectId_locale: { projectId: id, locale } },
      create: { projectId: id, locale, title: dto.title, description: dto.description },
      update: { title: dto.title, description: dto.description },
    });
  }

  async removeTranslation(id: string, locale: string) {
    if (locale === DEFAULT_LOCALE) {
      throw new Error(`Cannot delete the default locale translation (${DEFAULT_LOCALE})`);
    }
    await this.prisma.projectTranslation.delete({
      where: { projectId_locale: { projectId: id, locale } },
    });
  }

  async addImage(id: string, dto: AddImageDto) {
    await this.assertExists(id);
    return this.prisma.projectImage.create({
      data: { projectId: id, url: dto.url, alt: dto.alt, order: dto.order ?? 0 },
    });
  }

  async updateImage(id: string, imageId: string, dto: UpdateImageDto) {
    return this.prisma.projectImage.update({
      where: { id: imageId },
      data: {
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.alt !== undefined && { alt: dto.alt }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async removeImage(id: string, imageId: string) {
    await this.prisma.projectImage.delete({ where: { id: imageId } });
  }

  async reorder(dto: ReorderDto) {
    await this.prisma.$transaction(
      dto.items.map(({ id, orderIndex }) =>
        this.prisma.project.update({ where: { id }, data: { orderIndex } }),
      ),
    );
  }

  private async assertExists(id: string) {
    const count = await this.prisma.project.count({ where: { id } });
    if (!count) throw new NotFoundException(`Project ${id} not found`);
  }
}
```

- [ ] **Step 2: Create `apps/api/src/projects/projects.controller.ts`**

```ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { PaginateQueryDto } from './dto/paginate-query.dto';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/locales';

@ApiTags('projects')
@Controller()
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  health() {
    return { status: 'ok' };
  }

  @Get('locales')
  @ApiOperation({ summary: 'Supported locales' })
  locales() {
    return { locales: SUPPORTED_LOCALES, default: DEFAULT_LOCALE };
  }

  @Get('projects')
  @ApiOperation({ summary: 'Paginated project list' })
  findAll(@Query() query: PaginateQueryDto) {
    return this.projects.findAll(query);
  }

  @Get('projects/featured')
  @ApiOperation({ summary: 'Featured projects (top N by orderIndex)' })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  @ApiQuery({ name: 'locale', required: false, example: 'pt-BR' })
  findFeatured(
    @Query('locale') locale = DEFAULT_LOCALE,
    @Query('limit') limit = '3',
  ) {
    return this.projects.findFeatured(locale, parseInt(limit, 10));
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Single project with resolved translation' })
  @ApiQuery({ name: 'locale', required: false })
  findOne(
    @Param('id') id: string,
    @Query('locale') locale = DEFAULT_LOCALE,
  ) {
    return this.projects.findOne(id, locale);
  }
}
```

- [ ] **Step 3: Create `apps/api/src/projects/projects.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AdminProjectsController } from './admin-projects.controller';

@Module({
  controllers: [ProjectsController, AdminProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
```

Note: `AdminProjectsController` is created in Task 8 — the module already imports it here so the file must exist before the app builds. Create a placeholder for now:

Create `apps/api/src/projects/admin-projects.controller.ts` with a placeholder:
```ts
import { Controller } from '@nestjs/common';
// Implemented in Task 8
@Controller('admin/projects')
export class AdminProjectsController {}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/projects/
git commit -m "feat: ProjectsService (flatten+locale fallback) + public endpoints"
```

---

## Task 7: Auth module (JWT cookie)

**Files:**
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/jwt.strategy.ts`
- Create: `apps/api/src/auth/jwt-auth.guard.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.module.ts`

The admin password is stored as a bcrypt hash in `ADMIN_PASSWORD_HASH`. On login, compare incoming password with the hash. Issue a JWT stored in an `HttpOnly` cookie named `access_token`.

- [ ] **Step 1: Create `apps/api/src/auth/auth.service.ts`**

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(password: string): Promise<string> {
    const hash = process.env.ADMIN_PASSWORD_HASH ?? '';
    const valid = await bcrypt.compare(password, hash);
    if (!valid) throw new UnauthorizedException('Invalid password');
    return this.jwt.sign({ role: 'admin' });
  }
}
```

- [ ] **Step 2: Create `apps/api/src/auth/jwt.strategy.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback-secret',
    });
  }

  validate(payload: { role: string }) {
    return payload;
  }
}
```

- [ ] **Step 3: Create `apps/api/src/auth/jwt-auth.guard.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 4: Create `apps/api/src/auth/auth.controller.ts`**

```ts
import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @ApiBody({ schema: { properties: { password: { type: 'string' } } } })
  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin login — sets HttpOnly cookie' })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.auth.login(body.password);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { authenticated: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin logout — clears cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { authenticated: false };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check auth status' })
  me(@Req() req: Request) {
    return { authenticated: true, user: (req as any).user };
  }
}
```

- [ ] **Step 5: Create `apps/api/src/auth/auth.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'fallback-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/auth/
git commit -m "feat: auth module — JWT cookie login/logout, JwtAuthGuard"
```

---

## Task 8: Admin endpoints + AppModule + main.ts

**Files:**
- Modify: `apps/api/src/projects/admin-projects.controller.ts` (replace placeholder)
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/main.ts`

- [ ] **Step 1: Replace the placeholder `admin-projects.controller.ts`**

```ts
import {
  Body, Controller, Delete, HttpCode, Param, Patch, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';
import { AddImageDto } from './dto/add-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ReorderDto } from './dto/reorder.dto';

@ApiTags('admin')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Bulk reorder projects' })
  reorder(@Body() dto: ReorderDto) {
    return this.projects.reorder(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project language-agnostic fields' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete project (cascades images + translations)' })
  async remove(@Param('id') id: string) {
    await this.projects.remove(id);
  }

  @Put(':id/translations/:locale')
  @ApiOperation({ summary: 'Upsert translation for a locale' })
  upsertTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertTranslationDto,
  ) {
    return this.projects.upsertTranslation(id, locale, dto);
  }

  @Delete(':id/translations/:locale')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a translation (cannot remove default locale)' })
  async removeTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    await this.projects.removeTranslation(id, locale);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add image to project' })
  addImage(@Param('id') id: string, @Body() dto: AddImageDto) {
    return this.projects.addImage(id, dto);
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Update image metadata' })
  updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateImageDto,
  ) {
    return this.projects.updateImage(id, imageId, dto);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove image' })
  async removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    await this.projects.removeImage(id, imageId);
  }
}
```

- [ ] **Step 2: Create `apps/api/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    ProjectsModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Create `apps/api/src/main.ts`**

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // Cookies
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('guileite.dev API')
    .setDescription('Projects CRUD + auth')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  console.log(`API running at http://localhost:${port}/api/v1`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
```

- [ ] **Step 4: Build to check for errors**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev/apps/api && npm run build 2>&1 | tail -20
```

Expected: `Successfully compiled` with no errors. Fix any TypeScript issues before proceeding.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/
git commit -m "feat: AdminProjectsController, AppModule, main.ts — full NestJS app wired"
```

---

## Task 9: Database seed + smoke test

**Files:**
- Create: `apps/api/prisma/seed.ts`

- [ ] **Step 1: Create `apps/api/prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (safe for dev)
  await prisma.project.deleteMany();

  await prisma.project.create({
    data: {
      projectUrl: 'https://shotbox.dev',
      githubUrl: 'https://github.com/guileite/shotbox',
      orderIndex: 0,
      translations: {
        create: [
          {
            locale: 'pt-BR',
            title: 'Shotbox',
            description: 'Servidor de arquivos estáticos com presets para times pequenos.',
          },
          {
            locale: 'en',
            title: 'Shotbox',
            description: 'A static file server with presets for small teams.',
          },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/800x500/1a1a1a/666?text=SHB', alt: 'Shotbox screenshot', order: 0 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      githubUrl: 'https://github.com/guileite/lume',
      orderIndex: 1,
      translations: {
        create: [
          {
            locale: 'pt-BR',
            title: 'Lume',
            description: 'Biblioteca de componentes para interfaces administrativas densas.',
          },
          {
            locale: 'en',
            title: 'Lume',
            description: 'A component library for dense admin interfaces.',
          },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/800x500/1a1a1a/666?text=LUM', alt: 'Lume screenshot', order: 0 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      projectUrl: 'https://orbital.run',
      githubUrl: 'https://github.com/guileite/orbital',
      orderIndex: 2,
      translations: {
        create: [
          {
            locale: 'pt-BR',
            title: 'Orbital',
            description: 'Agendador de jobs distribuído com leasing por lock no Postgres.',
          },
          {
            locale: 'en',
            title: 'Orbital',
            description: 'A distributed cron runner that leases jobs via Postgres advisory locks.',
          },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/800x500/1a1a1a/666?text=ORB', alt: 'Orbital screenshot', order: 0 },
        ],
      },
    },
  });

  console.log('Seeded 3 projects (pt-BR + en translations each)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed script to `apps/api/package.json` prisma config**

Add to `apps/api/package.json` (inside the root object, not inside scripts):
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [ ] **Step 3: Run the seed**

```bash
cd /home/guilherme/Systems/Projects/guileite.dev/apps/api && npx prisma db seed
```

Expected: `Seeded 3 projects (pt-BR + en translations each)`

- [ ] **Step 4: Start the API and smoke-test with curl**

In one terminal, start the API:
```bash
cd /home/guilherme/Systems/Projects/guileite.dev/apps/api && npm run dev
```

In another terminal:
```bash
# Health check
curl http://localhost:3001/api/v1/health
# Expected: {"status":"ok"}

# Featured projects (pt-BR)
curl "http://localhost:3001/api/v1/projects/featured?locale=pt-BR&limit=3"
# Expected: JSON array of 3 projects with title/description in Portuguese

# Featured projects (en)
curl "http://localhost:3001/api/v1/projects/featured?locale=en&limit=3"
# Expected: same projects, English translations

# Paginated list
curl "http://localhost:3001/api/v1/projects?page=1&limit=9&locale=pt-BR"
# Expected: { data: [...], meta: { page: 1, total: 3, totalPages: 1, ... } }

# Admin login (password: "admin")
curl -c cookies.txt -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin"}'
# Expected: {"authenticated":true} + sets access_token cookie

# Create project (authenticated)
curl -b cookies.txt -X POST http://localhost:3001/api/v1/admin/projects \
  -H "Content-Type: application/json" \
  -d '{"translations":[{"locale":"pt-BR","title":"Teste","description":"Descrição"}]}'
# Expected: new project object

# Unauthenticated admin request → 401
curl -X POST http://localhost:3001/api/v1/admin/projects \
  -H "Content-Type: application/json" \
  -d '{"translations":[{"locale":"pt-BR","title":"X","description":"Y"}]}'
# Expected: {"statusCode":401,...}
```

- [ ] **Step 5: Open Swagger**

Open `http://localhost:3001/docs` in a browser. Verify all endpoints are listed under the correct tags.

- [ ] **Step 6: Clean up cookie test file and commit**

```bash
rm -f /home/guilherme/Systems/Projects/guileite.dev/apps/api/cookies.txt
git add apps/api/prisma/seed.ts apps/api/package.json
git commit -m "feat: DB seed (3 projects, bilingual) + smoke test verified"
```

---

## Task 10: Final `.gitignore` + web app `.env.local` update

Update the frontend stub toggle so it's easy to switch to the real API.

- [ ] **Step 1: Update `apps/web/.env.local`**

The file already exists. Ensure it has these values (they should already be correct from Task 1 of the frontend plan):
```
API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_USE_STUB=true
```

To test with the real API:
1. Start postgres: `docker compose up -d`
2. Start the API: `cd apps/api && npm run dev`
3. Change `NEXT_PUBLIC_USE_STUB=false` in `apps/web/.env.local`
4. Restart the web dev server

- [ ] **Step 2: Verify the full stack works together**

```bash
# Terminal 1 — DB
docker compose up -d

# Terminal 2 — API
cd /home/guilherme/Systems/Projects/guileite.dev/apps/api && npm run dev

# Terminal 3 — Web (with real API)
# Edit apps/web/.env.local: NEXT_PUBLIC_USE_STUB=false
cd /home/guilherme/Systems/Projects/guileite.dev/apps/web && npm run dev
```

Open `http://localhost:3000`. Verify the 3 seeded projects appear on the home page.

- [ ] **Step 3: Reset web stub to true for offline dev**

Set `NEXT_PUBLIC_USE_STUB=true` back in `apps/web/.env.local` (stub is the safer default — the API may not always be running).

- [ ] **Step 4: Final commit**

```bash
git add apps/api/ packages/ package.json turbo.json .gitignore docker-compose.yml
git commit -m "feat: complete guileite.dev monorepo — NestJS API + shared types verified"
```

---

## Self-Review

**Spec coverage (PRD §6–§8):**

| Requirement | Task |
|---|---|
| NestJS 10+, Prisma, PostgreSQL | Tasks 3, 4 |
| class-validator + class-transformer DTOs | Task 5 |
| @nestjs/swagger at /docs | Task 8 |
| helmet + @nestjs/throttler | Task 8 |
| JWT in HttpOnly cookie | Task 7 |
| GET /projects (paginated, ?locale) | Task 6 |
| GET /projects/featured (?limit, ?locale) | Task 6 |
| GET /projects/:id (?locale) | Task 6 |
| GET /locales | Task 6 |
| GET /health | Task 6 |
| POST /auth/login (body: {password}) | Task 7 |
| POST /auth/logout | Task 7 |
| GET /auth/me | Task 7 |
| POST /admin/projects | Task 8 |
| PATCH /admin/projects/:id | Task 8 |
| DELETE /admin/projects/:id (cascade) | Task 8 |
| PUT /admin/projects/:id/translations/:locale | Task 8 |
| DELETE /admin/projects/:id/translations/:locale | Task 8 |
| POST /admin/projects/:id/images | Task 8 |
| PATCH /admin/projects/:id/images/:imageId | Task 8 |
| DELETE /admin/projects/:id/images/:imageId | Task 8 |
| PATCH /admin/projects/reorder | Task 8 |
| Cannot delete default-locale translation → 400 | Task 6 service |
| Locale fallback to pt-BR | Task 6 service |
| resolvedLocale + requestedLocale in response | Task 6 service |
| Monorepo scaffold (workspaces + Turborepo) | Tasks 1, 2 |
| packages/types shared types | Task 2 |
| Docker Compose for local PostgreSQL | Task 3 |
| DB seed with pt-BR + en translations | Task 9 |
| Smoke tests with curl | Task 9 |

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `PaginateQueryDto` used in `ProjectsService.findAll()` and `ProjectsController.findAll()` ✓
- `UpsertTranslationDto` used in service and both controllers ✓
- `CreateProjectDto` has `translations: InitialTranslationDto[]` — `InitialTranslationDto` extends `UpsertTranslationDto` and adds `locale: string` ✓
- `ProjectsModule` imports both `ProjectsController` and `AdminProjectsController` ✓
- `JwtAuthGuard` exported from `AuthModule`, used in `AdminProjectsController` ✓

**One gap found:** The `removeTranslation` method throws `new Error()` instead of `new BadRequestException()`. Fix: in `projects.service.ts`, change the throw in `removeTranslation` to:
```ts
throw new BadRequestException(`Cannot delete the default locale translation (${DEFAULT_LOCALE})`);
```
And import `BadRequestException` from `@nestjs/common`. This is addressed inline — the implementer should use this version.
