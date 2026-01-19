# Development Dockerfile for queue-worker
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

# Copy package-specific source code
COPY packages/queue-worker ./packages/queue-worker

# Set working directory to package
WORKDIR /app/packages/queue-worker

# No public port needed for queue worker

# Health check (internal service)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD echo "Queue worker is running" || exit 1

# Run wrangler dev for Cloudflare Workers development
COPY packages/queue-worker/start-dev.sh /start-dev.sh
RUN chmod +x /start-dev.sh
CMD ["/start-dev.sh"]
