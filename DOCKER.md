# Docker Development Environment for Yeko Project

This guide covers how to use Docker for developing and deploying the Yeko monorepo applications.

## Overview

The Yeko project uses Docker to provide a consistent development environment across all machines. The setup includes:

- **Development Environment**: Hot-reload containers with volume mounts
- **Production Environment**: Optimized multi-stage builds
- **Service Orchestration**: Docker Compose for managing all services
- **Utility Scripts**: Makefile commands for common operations

## Architecture

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
│              External Services                              │
│         - Neon PostgreSQL (cloud-based)                    │
│         - Cloudflare R2 Storage                          │
│         - Cloudflare Queues                              │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker Desktop (or Docker Engine) installed
- Docker Compose (included with Docker Desktop)
- Make (for using utility commands)
- Sufficient disk space (~2GB for all images)

## Quick Start

### Development Environment

1. **Start all services:**
   ```bash
   make docker-up
   # or
   docker compose up -d
   ```

2. **View running services:**
   ```bash
   make docker-status
   ```

3. **View logs:**
   ```bash
   make docker-logs
   ```

4. **Stop all services:**
   ```bash
   make docker-down
   ```

### Access Points

Once started, you can access the applications at:

- **yeko-core**: http://localhost:3000
- **yeko-school**: http://localhost:3001  
- **yeko-teacher**: http://localhost:3002
- **data-service**: http://localhost:8787

## Development Workflow

### Starting Services

```bash
# Start all services
make docker-up

# Start specific service
make core-up
make school-up
make teacher-up
make data-up
make worker-up
```

### Hot Reload

Code changes are automatically reflected in the running containers thanks to volume mounts. No rebuild is required for:

- Component changes
- Style updates
- Configuration modifications
- Route additions

### Viewing Logs

```bash
# View all logs
make docker-logs

# View specific service logs
docker compose logs -f yeko-core
docker compose logs -f yeko-school
```

### Rebuilding Services

When you need to rebuild (e.g., after dependency changes):

```bash
# Rebuild all services
make docker-rebuild

# Rebuild specific service
docker compose build yeko-core
docker compose up -d yeko-core
```

### Accessing Containers

For debugging or running commands inside containers:

```bash
# Open shell in core container
make shell-core

# Open shell in any container
docker compose exec yeko-core sh
docker compose exec yeko-school sh
```

## Production Deployment

### Building Production Images

```bash
# Build all production images
make prod-build

# Build specific production image
docker compose -f docker-compose.prod.yml build yeko-core
```

### Starting Production Services

```bash
# Start all production services
make docker-prod-up

# Start specific production service
docker compose -f docker-compose.prod.yml up -d yeko-core
```

### Production Environment Variables

Production services use `.env.prod` files in each app directory. Key variables:

- `NODE_ENV=production`
- `BETTER_AUTH_URL` (production URL)
- `APP_URL` (production URL)
- Database credentials
- Cloudflare credentials

## Environment Configuration

### Development Environment Files

Each application has its own `.env` file:

- `apps/core/.env`
- `apps/school/.env`
- `apps/teacher/.env`
- `apps/data-service/.env`
- `packages/queue-worker/.env`

### Production Environment Files

Create `.env.prod` files for production deployment:

```bash
# Example apps/core/.env.prod
NODE_ENV=production
BETTER_AUTH_URL=https://core.yeko.com
APP_URL=https://core.yeko.com
DATABASE_HOST=your-production-neon-host
# ... other production variables
```

## Utility Commands

### Makefile Commands

The Makefile provides convenient aliases:

```bash
# Development
make help          # Show all commands
make dev           # Start development services
make stop          # Stop development services
make logs          # View logs
make rebuild       # Rebuild and restart
make clean         # Clean containers and images
make health        # Check service health

# Production
make prod          # Start production services
make prod-stop     # Stop production services
make prod-build    # Build production images

# Advanced
make docker-pull   # Pull latest base images
make docker-backup # Backup volumes
make docker-restore # Restore from backup
```

### Docker Compose Commands

```bash
# Development
docker compose up -d                    # Start services
docker compose down                      # Stop services
docker compose logs -f                   # Follow logs
docker compose ps                        # Show status
docker compose exec <service> sh         # Enter container
docker compose build <service>           # Build service
docker compose restart <service>         # Restart service

# Production
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using ports
   lsof -i :3000
   lsof -i :3001
   lsof -i :3002
   lsof -i :8787
   ```

2. **Container won't start:**
   ```bash
   # Check logs
   docker compose logs <service-name>
   
   # Check container status
   docker compose ps
   ```

3. **Build failures:**
   ```bash
   # Clean and rebuild
   make docker-clean
   make docker-rebuild
   ```

4. **Permission issues:**
   ```bash
   # Fix Docker permissions (Linux/Mac)
   sudo chown -R $USER:$USER ./
   ```

### Performance Tips

1. **Use volume caching:** The Dockerfiles are optimized with layer caching
2. **Limit resources:** Production containers have memory limits configured
3. **Monitor health:** Use `make health` to check service status
4. **Clean regularly:** Use `make docker-clean` to remove unused images

### Debugging

1. **Enter container:**
   ```bash
   make shell-core
   # Once inside:
   ps aux
   ls -la
   cat package.json
   ```

2. **Check network:**
   ```bash
   make network
   ```

3. **Inspect volumes:**
   ```bash
   docker volume ls
   docker volume inspect yeko_node_modules_core
   ```

## File Structure

```
Yeko/
├── Dockerfile.base                    # Base development image
├── docker-compose.yml                 # Development services
├── docker-compose.prod.yml           # Production services
├── Makefile                           # Utility commands
├── .dockerignore                      # Root exclusions
├── apps/
│   ├── core/
│   │   ├── Dockerfile                 # Development
│   │   ├── Dockerfile.prod           # Production
│   │   ├── .dockerignore             # App exclusions
│   │   └── .env                      # Development env
│   ├── school/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.prod
│   │   ├── .dockerignore
│   │   └── .env
│   ├── teacher/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.prod
│   │   ├── .dockerignore
│   │   └── .env
│   └── data-service/
│       ├── Dockerfile
│       ├── Dockerfile.prod
│       ├── .dockerignore
│       └── .env
└── packages/
    └── queue-worker/
        ├── Dockerfile
        ├── Dockerfile.prod
        ├── .dockerignore
        └── .env
```

## Security Considerations

- **Non-root users:** All production containers run as non-root users
- **Minimal images:** Use Alpine Linux for smaller attack surface
- **Environment variables:** Sensitive data in `.env` files, not in images
- **Health checks:** All services have health checks for monitoring
- **Resource limits:** Production containers have memory limits

## Best Practices

1. **Use volume mounts for development:** Enables hot-reload
2. **Use multi-stage builds for production:** Reduces image size
3. **Keep .dockerignore updated:** Excludes unnecessary files
4. **Use specific image tags:** Avoid `latest` in production
5. **Monitor container health:** Use health checks and monitoring
6. **Regular cleanup:** Remove unused images and containers

## Contributing

When modifying Docker setup:

1. Update relevant Dockerfiles
2. Test both development and production builds
3. Update this documentation
4. Update Makefile if adding new commands
5. Test with `make docker-rebuild`

## Support

For Docker-related issues:

1. Check this documentation first
2. Run `make health` to check service status
3. Review container logs with `make docker-logs`
4. Check the troubleshooting section above
5. Contact the DevOps team for persistent issues
