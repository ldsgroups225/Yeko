# saas-kit

[![Watch the video](https://img.youtube.com/vi/TWQv_tr5ABI/maxresdefault.jpg)](https://www.youtube.com/watch?v=TWQv_tr5ABI&t=1s)

A monorepo SaaS application with user-facing frontend and data service backend.

## Docker Development (Recommended)

For a consistent development environment with hot-reload, use Docker:

```bash
# Quick start with all services
make docker-up

# Access applications:
# yeko-core: http://localhost:3000
# yeko-school: http://localhost:3001
# yeko-teacher: http://localhost:3002
# data-service: http://localhost:8787

# Tunneling (ngrok):
# See [NGROK.md](./NGROK.md) for tunnel configuration.

# Stop all services
make docker-down

# View all available commands
make help
```

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

## Local Development

### Setup
```bash
pnpm run setup
```

### User Application
```bash
pnpm run dev:user-application
```

### Data Service
```bash
pnpm run dev:data-service
```

## Deployment

### User Application (Cloudflare)
```bash
pnpm run deploy:user-application
```

### Data Service
```bash
pnpm run deploy:data-service
```

## Working with Individual Apps

You can also navigate into any sub-application directory and work with it independently in your IDE:

```bash
cd packages/user-application
# Open in your preferred IDE
```
