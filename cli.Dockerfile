# CLI Dockerfile for Azure GenAI Image Studio
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY cli/package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app
COPY cli/package*.json ./
RUN npm ci
COPY cli/ ./
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 cliuser
RUN adduser --system --uid 1001 cliuser

# Copy built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create directories for assets and projects
RUN mkdir -p /app/assets /app/projects
RUN chown -R cliuser:cliuser /app

USER cliuser

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]
