# Dockerfile — runs clinic-project (Next.js + Prisma) for local/demo use.
# Place this file in the root of "clinic-project", next to package.json.
#
# Build once inside Linux, run anywhere Docker runs — including a Windows
# laptop via Docker Desktop — without touching your existing node_modules.

FROM node:20-bookworm-slim

WORKDIR /app

# Prisma's query engine needs openssl + ca-certificates to talk to Postgres
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first so this layer is cached when only source changes
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the project source
COPY . .

# Placeholder so `prisma generate` (which reads prisma.config.ts) has a URL
# to parse during the build. The REAL url is supplied at container runtime
# via docker-compose, so this value is never used to actually connect.
ARG DATABASE_URL="postgresql://postgres:postgres@db:5432/clinic?schema=public"
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Apply any pending Prisma migrations, then start the production server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]