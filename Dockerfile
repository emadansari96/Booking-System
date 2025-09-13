# Multi-stage build for NestJS application
FROM oven/bun:1.0-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun run build

# Production stage
FROM oven/bun:1.0-alpine AS production

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start application
CMD ["bun", "run", "start:prod"]
