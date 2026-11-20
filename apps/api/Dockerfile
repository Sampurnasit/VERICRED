FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate
WORKDIR /app

# Stage 1: Dependencies installation
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/crypto/package.json ./packages/crypto/
COPY packages/credential-schema/package.json ./packages/credential-schema/
COPY packages/contract-client/package.json ./packages/contract-client/
COPY apps/api/package.json ./apps/api/
COPY zk/package.json ./zk/
COPY blockchain/package.json ./blockchain/

RUN pnpm install --frozen-lockfile

# Stage 2: Build source code & compile Prisma
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps ./apps
COPY . .

# Generate Prisma client
RUN pnpm --filter @vericred/api db:generate

# Build shared packages and API application
RUN pnpm --filter @vericred/shared build
RUN pnpm --filter @vericred/crypto build
RUN pnpm --filter @vericred/credential-schema build
RUN pnpm --filter @vericred/api build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Install pnpm for runtime scripts (like migrations/seed)
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 vericred

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/zk/build/verification_key.json ./zk/build/verification_key.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

USER vericred
EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
