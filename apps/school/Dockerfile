# Development Dockerfile for yeko-school
FROM node:22-slim AS base

# Install CA certificates for TLS/SSL support (needed for Neon DB)
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Copy app-specific source code
COPY apps/school ./apps/school

# Set working directory to app
WORKDIR /app/apps/school

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

# Run development server with hot reload
COPY apps/school/start-dev.sh /start-dev.sh
RUN chmod +x /start-dev.sh
CMD ["/start-dev.sh"]
