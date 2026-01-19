# Task List: Docker Development Environment Setup

## Relevant Files

- `Dockerfile.base` - Base Dockerfile for development with Node.js 22, pnpm, and workspace configuration
- `apps/core/Dockerfile` - Development Dockerfile for yeko-core application
- `apps/core/Dockerfile.prod` - Production Dockerfile for yeko-core application
- `apps/school/Dockerfile` - Development Dockerfile for yeko-school application
- `apps/school/Dockerfile.prod` - Production Dockerfile for yeko-school application
- `apps/teacher/Dockerfile` - Development Dockerfile for yeko-teacher application
- `apps/teacher/Dockerfile.prod` - Production Dockerfile for yeko-teacher application
- `apps/data-service/Dockerfile` - Development Dockerfile for data-service
- `apps/data-service/Dockerfile.prod` - Production Dockerfile for data-service
- `packages/queue-worker/Dockerfile` - Development Dockerfile for queue-worker
- `packages/queue-worker/Dockerfile.prod` - Production Dockerfile for queue-worker
- `docker-compose.yml` - Development Docker Compose configuration for all services
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `Makefile` - Updated with Docker utility commands
- `.dockerignore` - Docker ignore patterns for build context
- `apps/core/.dockerignore` - App-specific Docker ignore patterns
- `apps/school/.dockerignore` - App-specific Docker ignore patterns
- `apps/teacher/.dockerignore` - App-specific Docker ignore patterns
- `apps/data-service/.dockerignore` - App-specific Docker ignore patterns
- `packages/queue-worker/.dockerignore` - App-specific Docker ignore patterns
- `README.md` - Updated with Docker setup instructions

### Notes

- All Dockerfiles use multi-stage builds for optimization
- Development containers mount source code for hot-reload
- Production containers build optimized images with no development dependencies
- Docker Compose manages service orchestration and dependencies
- Environment variables are injected from existing .env files
- Health checks ensure services are ready before dependencies start

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/docker-setup`)
- [x] 1.0 Create base development Dockerfile
  - [x] 1.1 Create `Dockerfile.base` with Node.js 22 Alpine base image
  - [x] 1.2 Install libc6-compat for compatibility
  - [x] 1.3 Install and enable pnpm via corepack
  - [x] 1.4 Set working directory to /app
  - [x] 1.5 Copy pnpm-workspace.yaml and package.json files
  - [x] 1.6 Install dependencies with pnpm install --frozen-lockfile
  - [x] 1.7 Set up node_modules volume for caching
  - [x] 1.8 Define build stage for production
- [x] 2.0 Create application-specific development Dockerfiles
  - [x] 2.1 Create `apps/core/Dockerfile` extending base with dev command
  - [x] 2.2 Create `apps/school/Dockerfile` extending base with dev command
  - [x] 2.3 Create `apps/teacher/Dockerfile` extending base with dev command
  - [x] 2.4 Create `apps/data-service/Dockerfile` with wrangler dev
  - [x] 2.5 Create `packages/queue-worker/Dockerfile` with wrangler dev
- [x] 3.0 Create application-specific production Dockerfiles
  - [x] 3.1 Create `apps/core/Dockerfile.prod` with multi-stage build
  - [x] 3.2 Create `apps/school/Dockerfile.prod` with multi-stage build
  - [x] 3.3 Create `apps/teacher/Dockerfile.prod` with multi-stage build
  - [x] 3.4 Create `apps/data-service/Dockerfile.prod` optimized for Workers
  - [x] 3.5 Create `packages/queue-worker/Dockerfile.prod` optimized for Workers
- [x] 4.0 Create Docker Compose configuration for development
  - [x] 4.1 Create `docker-compose.yml` with network configuration
  - [x] 4.2 Define yeko-core service with volume mounts and port 3000
  - [x] 4.3 Define yeko-school service with volume mounts and port 3001
  - [x] 4.4 Define yeko-teacher service with volume mounts and port 3002
  - [x] 4.5 Define data-service service with port 8787 and wrangler dev
  - [x] 4.6 Define queue-worker service without public port
  - [x] 4.7 Configure environment variables from .env files
  - [x] 4.8 Set up health checks for all services
  - [x] 4.9 Configure service dependencies (depends_on)
- [x] 5.0 Create Docker Compose configuration for production
  - [x] 5.1 Create `docker-compose.prod.yml` with production builds
  - [x] 5.2 Define production services without source code mounts
  - [x] 5.3 Configure production environment variables
  - [x] 5.4 Set up restart policies (always)
  - [x] 5.5 Configure production service health checks
- [x] 6.0 Create .dockerignore files
  - [x] 6.1 Create root `.dockerignore` for common exclusions
  - [x] 6.2 Create `apps/core/.dockerignore` for core-specific exclusions
  - [x] 6.3 Create `apps/school/.dockerignore` for school-specific exclusions
  - [x] 6.4 Create `apps/teacher/.dockerignore` for teacher-specific exclusions
  - [x] 6.5 Create `apps/data-service/.dockerignore` for data-service exclusions
  - [x] 6.6 Create `packages/queue-worker/.dockerignore` for worker exclusions
- [x] 7.0 Create utility scripts and update Makefile
  - [x] 7.1 Add `docker-up` target to Makefile for starting services
  - [x] 7.2 Add `docker-down` target to Makefile for stopping services
  - [x] 7.3 Add `docker-logs` target to Makefile for viewing logs
  - [x] 7.4 Add `docker-rebuild` target to Makefile for rebuilding
  - [x] 7.5 Add `docker-clean` target to Makefile for cleaning containers and images
- [x] 8.0 Create Docker documentation
  - [x] 8.1 Create DOCKER.md with Docker setup instructions
  - [x] 8.2 Document development workflow (up, down, logs, rebuild)
  - [x] 8.3 Document production workflow (build, deploy)
  - [x] 8.4 Update main README.md with Docker section
  - [x] 8.5 Document environment variable requirements
