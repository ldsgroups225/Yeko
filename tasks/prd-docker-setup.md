# PRD: Docker Development Environment for Yeko Monorepo

## Introduction/Overview

Yeko is a TanStack Start monorepo with multiple applications (yeko-core, yeko-school, yeko-teacher, data-service, queue-worker) and shared packages. The goal is to create a complete Docker development environment that allows developers to work with all services in containers while maintaining hot-reload capabilities. Changes made locally should reflect immediately in the Docker containers without requiring rebuilds.

## Goals

1. **Development Environment**: Create Docker setup that supports hot-reload for all applications and packages
2. **Service Orchestration**: Use Docker Compose to manage all services (apps, workers, databases)
3. **Code Sync**: Mount local source code as volumes to enable instant code changes
4. **Environment Consistency**: Ensure all developers have the same development environment
5. **Production Ready**: Include production Docker setup for deployment
6. **Easy Startup**: Single command to start all services with proper dependencies

## User Stories

1. As a developer, I want to run `docker-compose up -d` and have all services running
2. As a developer, I want code changes to reflect immediately in containers without rebuilding
3. As a developer, I want to view logs from all services in one place
4. As a developer, I want to run individual services or all services as needed
5. As a DevOps engineer, I want production-ready Docker images for deployment

## Functional Requirements

### 1. Base Development Dockerfile
- Multi-stage build with Node.js 22 Alpine
- Install pnpm and enable corepack
- Copy package files and install dependencies
- Set up proper workspace configuration
- Configure volume mounts for hot-reload
- Expose appropriate ports (3000, 3001, 3002, 8787)

### 2. Application-Specific Dockerfiles
- **yeko-core**: TanStack Start dev server on port 3000
- **yeko-school**: TanStack Start dev server on port 3001
- **yeko-teacher**: TanStack Start dev server on port 3002
- **data-service**: Hono/Cloudflare Worker dev server
- **queue-worker**: Cloudflare Worker for background tasks

### 3. Docker Compose Configuration (Development)
- Service definition for each application
- Volume mounts for source code and node_modules
- Environment variable injection from .env files
- Network configuration for inter-service communication
- Health checks for all services
- Proper service dependencies

### 4. Production Dockerfiles
- Optimized multi-stage builds
- No development dependencies
- Production build commands
- Wrangler deployment support
- Small final image size

### 5. Docker Compose Configuration (Production)
- Production builds
- No source code mounts
- Environment variables from production config
- External database connections
- Proper restart policies

### 6. Utility Scripts
- `make docker-up`: Start all development services
- `make docker-down`: Stop and remove containers
- `make docker-logs`: View logs from all services
- `make docker-rebuild`: Rebuild and restart services

## Non-Goals (Out of Scope)

- CI/CD pipeline configuration (GitHub Actions, GitLab CI, etc.)
- Kubernetes deployment manifests
- Docker Registry management
- Multi-cloud deployment
- Container monitoring (Prometheus, Grafana)
- Container logging aggregation (ELK, etc.)

## Design Considerations

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ yeko-core    │  │ yeko-school   │  │ yeko-teacher │ │
│  │ (port: 3000) │  │ (port: 3001) │  │ (port: 3002) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ data-service │  │ queue-worker │                     │
│  │ (port: 8787) │  │ (no public) │                     │
│  └──────────────┘  └──────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│              External Services (Out of Scope)              │
│         - Neon PostgreSQL (cloud-based)                    │
│         - Cloudflare R2 Storage                          │
│         - Cloudflare Queues                              │
└─────────────────────────────────────────────────────────────┘
```

### Volume Mounts Strategy

- `/app` - Root workspace mount
- `/app/node_modules` - Cached node_modules (not mounted from host)
- `/app/packages/*` - Package source code
- `/app/apps/*` - Application source code

### Environment Variables

- Each app has its own `.env` file
- Docker Compose reads from respective `.env` files
- Sensitive variables should use Docker secrets or external secret management

## Technical Considerations

### Dependencies
- pnpm 10.26.0 (already defined in package.json)
- Node.js 22 (Alpine for smaller image size)
- Cloudflare Wrangler for Workers
- Vite dev servers with HMR

### Known Constraints
1. Cloudflare Workers use local emulation with `wrangler dev --x-remote-bindings`
2. Database is Neon PostgreSQL (external, not in Docker)
3. R2 Storage is Cloudflare-managed (external)
4. Queue binding only available in Cloudflare Workers environment

### Port Allocation
- yeko-core: 3000
- yeko-school: 3001
- yeko-teacher: 3002
- data-service: 8787
- queue-worker: No public port (background)

### Hot Reload Configuration
- Vite dev servers have HMR enabled by default
- Volume mounts ensure code changes are visible
- Watch mode for worker builds

## Success Metrics

1. **Single Command Startup**: `docker-compose up -d` successfully starts all services
2. **Hot Reload**: Code changes reflect in containers within 5 seconds
3. **Service Health**: All services pass health checks after startup
4. **Build Time**: Development Dockerfile builds in < 2 minutes on first run
5. **Production Ready**: Production images build successfully and deploy to Cloudflare Workers

## Open Questions

1. Should we include a local PostgreSQL instance for development, or continue using Neon?
2. Should the production Docker images include the Cloudflare Workers deployment (wrangler deploy) or just the build artifacts?
3. Should we set up a reverse proxy (nginx) to route traffic to different apps?
4. Should we include a development database seed script?
5. What's the preferred way to handle Cloudflare credentials in Docker (environment variables, secrets, or config file)?
