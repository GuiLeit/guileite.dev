# guileite.dev

Personal developer site — engineering-log aesthetic, bilingual (pt-BR / en), projects showcase.

**Stack:** Next.js 14 · NestJS 10 · Prisma 5 · PostgreSQL · Turborepo · TypeScript

---

## Monorepo structure

```
/
├── apps/
│   ├── web/          Next.js frontend  (port 3000)
│   └── api/          NestJS backend    (port 3001)
├── packages/
│   └── types/        Shared TypeScript interfaces
├── docker-compose.yml
├── package.json      (npm workspaces root)
└── turbo.json
```

---

## Local development

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### First-time setup

```bash
# 1. Install all dependencies (hoisted to root node_modules)
npm install

# 2. Copy the API env file and fill in your values
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — at minimum set a real JWT_SECRET and ADMIN_PASSWORD_HASH

# 3. Start the database
docker compose up -d

# 4. Run the initial migration
cd apps/api && npx prisma migrate dev

# 5. Seed the database with sample projects
npx prisma db seed
cd ../..
```

### Generate an admin password hash

```bash
node -e "const b=require('bcryptjs'); b.hash('your-password', 12).then(console.log)"
```

Paste the output into `ADMIN_PASSWORD_HASH` in `apps/api/.env`.

### Start both apps

```bash
npm run dev
# Web  → http://localhost:3000
# API  → http://localhost:3001/api/v1
# Docs → http://localhost:3001/docs
```

Or start individually:

```bash
# Frontend only (uses stub data, no API needed)
cd apps/web && npm run dev

# API only
cd apps/api && npm run dev
```

### Switching between stub and real API

The frontend has a stub that returns hardcoded project data so it works without the API running.

```bash
# apps/web/.env.local
NEXT_PUBLIC_USE_STUB=true   # use stub (default — safe offline)
NEXT_PUBLIC_USE_STUB=false  # use real API at API_URL
API_URL=http://localhost:3001/api/v1
```

---

## Environment variables

### `apps/api/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/guileite_dev` |
| `JWT_SECRET` | Secret for signing JWT tokens — keep long and random | `openssl rand -hex 64` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password | see above |
| `PORT` | API port | `3001` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `NODE_ENV` | `development` or `production` | `development` |

### `apps/web/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_USE_STUB` | `true` = stub data, `false` = real API |
| `API_URL` | Base URL of the NestJS API |

---

## API reference

Base path: `/api/v1`  
Swagger UI: `http://localhost:3001/docs`

### Public endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness probe |
| GET | `/locales` | Supported locales |
| GET | `/projects?page=1&limit=9&locale=pt-BR` | Paginated projects |
| GET | `/projects/featured?limit=3&locale=pt-BR` | Featured projects |
| GET | `/projects/:id?locale=pt-BR` | Single project |

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | `{ "password": "..." }` → sets `access_token` cookie |
| POST | `/auth/logout` | Clears cookie |
| GET | `/auth/me` | Check session (requires cookie) |

### Admin (requires login cookie)

| Method | Path | Description |
|---|---|---|
| POST | `/admin/projects` | Create project |
| PATCH | `/admin/projects/:id` | Update URLs / orderIndex |
| DELETE | `/admin/projects/:id` | Delete project (cascades) |
| PATCH | `/admin/projects/reorder` | Bulk reorder |
| PUT | `/admin/projects/:id/translations/:locale` | Upsert translation |
| DELETE | `/admin/projects/:id/translations/:locale` | Remove translation |
| POST | `/admin/projects/:id/images` | Add image |
| PATCH | `/admin/projects/:id/images/:imageId` | Update image |
| DELETE | `/admin/projects/:id/images/:imageId` | Remove image |

---

## Deployment

### Database

Provision a managed PostgreSQL instance (Railway, Supabase, Neon, etc.) and set `DATABASE_URL` in your API host's environment.

Run migrations against production:

```bash
DATABASE_URL="<prod-url>" npx prisma migrate deploy
```

### API (`apps/api`)

Any Node.js host (Railway, Render, Fly.io, VPS):

```bash
# Build
npm run build   # from apps/api/ — outputs to apps/api/dist/

# Start
node dist/main.js
```

Required env vars in production: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `CORS_ORIGIN`, `NODE_ENV=production`.

### Frontend (`apps/web`)

Deploy to Vercel (recommended for Next.js):

```bash
# From repo root
npx vercel
```

Set these in the Vercel project settings:

```
NEXT_PUBLIC_USE_STUB=false
API_URL=https://api.guileite.dev/api/v1   # your API URL
```

---

## Useful commands

```bash
npm run build         # build all packages
npm run type-check    # TypeScript check across all packages

# Database
cd apps/api
npx prisma studio           # GUI at http://localhost:5555
npx prisma migrate dev      # apply migrations in dev
npx prisma migrate deploy   # apply migrations in production
npx prisma db seed          # seed sample data
```
