# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env vars for Prisma
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/nist_csf_assessment?schema=public"
ENV PGHOST="db"
ENV PGUSER="postgres"
ENV PGPASSWORD="postgres"
ENV PGDATABASE="nist_csf_assessment"
ENV NEXTAUTH_SECRET="nist-csf-local-secret-key"
ENV NEXTAUTH_URL="http://localhost:3000"

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@neondatabase ./node_modules/@neondatabase
COPY --from=builder /app/node_modules/ws ./node_modules/ws
COPY --from=builder /app/package.json ./package.json

# Install only production deps needed for seed
RUN apk add --no-cache libc6-compat
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

EXPOSE 3000

# Start script: run migrations, seed, then start app
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
