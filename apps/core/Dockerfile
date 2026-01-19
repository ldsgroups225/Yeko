# Development Dockerfile for yeko-core
FROM node:22-slim AS base

# Install CA certificates for TLS/SSL support (needed for Neon DB)
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Install pnpm via npm (more reliable than corepack in Docker)
RUN npm install -g pnpm@10.28.0

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Install app-specific dev dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Copy app-specific source code
COPY apps/core ./apps/core

# Set working directory to workspace root (not app-specific for pnpm workspace support)
WORKDIR /app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Run development server with hot reload using startup script
COPY apps/core/start-dev.sh /start-dev.sh
RUN chmod +x /start-dev.sh
CMD ["/start-dev.sh"]
