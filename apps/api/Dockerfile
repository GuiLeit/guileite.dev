FROM node:20-slim AS base

# ---- deps ----
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
COPY turbo.json ./

RUN npm ci

# ---- builder ----
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npx turbo run build --filter=@guileite/api

# ---- runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY apps/api/package.json ./

USER nestjs
EXPOSE 3001

CMD ["node", "dist/main"]
