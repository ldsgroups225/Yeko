# Environment Variables Configuration

This document outlines the required environment variables for the Yeko project applications.

## Overview

Each application in the Yeko project has its own `.env` file for development and `.env.prod` file for production. These files contain sensitive configuration and should never be committed to version control.

## Application Environment Files

### Development Files
- `apps/core/.env` - Core application development variables
- `apps/school/.env` - School application development variables  
- `apps/teacher/.env` - Teacher application development variables
- `apps/data-service/.env` - Data service development variables
- `packages/queue-worker/.env` - Queue worker development variables

### Production Files
- `apps/core/.env.prod` - Core application production variables
- `apps/school/.env.prod` - School application production variables
- `apps/teacher/.env.prod` - Teacher application production variables
- `apps/data-service/.env.prod` - Data service production variables
- `packages/queue-worker/.env.prod` - Queue worker production variables

## Common Environment Variables

### Authentication
```bash
# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"  # Development
# BETTER_AUTH_URL="https://your-domain.com"  # Production

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database (Neon PostgreSQL)
```bash
# Neon Database Configuration
DATABASE_HOST="ep-your-host.neon.tech/neondb?sslmode=require"
DATABASE_USERNAME="neondb_owner"
DATABASE_PASSWORD="your-database-password"
```

### Cloudflare Services
```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://pub-your-bucket.r2.dev"
```

### Application Configuration
```bash
# App Settings
APP_NAME="Yeko Application"
APP_URL="http://localhost:3000"  # Development
# APP_URL="https://your-domain.com"  # Production

# Node Environment
NODE_ENV="development"  # Development
# NODE_ENV="production"  # Production
```

## Application-Specific Variables

### yeko-core (Port 3000)
```bash
# Core application specific variables
CORE_API_URL="http://localhost:3000/api"
CORE_WEBHOOK_SECRET="your-webhook-secret"
```

### yeko-school (Port 3001)
```bash
# School application specific variables
SCHOOL_API_URL="http://localhost:3001/api"
SCHOOL_FEATURE_FLAGS="feature1,feature2"
```

### yeko-teacher (Port 3002)
```bash
# Teacher application specific variables
TEACHER_API_URL="http://localhost:3002/api"
TEACHER_NOTIFICATION_SETTINGS="enabled"
```

### data-service (Port 8787)
```bash
# Data service specific variables
DATA_SERVICE_API_URL="http://localhost:8787"
DATA_SERVICE_CACHE_TTL="3600"
```

### queue-worker
```bash
# Queue worker specific variables
QUEUE_WORKER_CONCURRENCY="10"
QUEUE_WORKER_RETRY_ATTEMPTS="3"
```

## Docker Environment Variables

When using Docker, environment variables are automatically loaded from the respective `.env` files:

```bash
# Development Docker
docker compose up -d
# Loads: apps/core/.env, apps/school/.env, etc.

# Production Docker
docker compose -f docker-compose.prod.yml up -d
# Loads: apps/core/.env.prod, apps/school/.env.prod, etc.
```

## Security Best Practices

### 1. Never Commit Environment Files
```bash
# Add to .gitignore
.env
.env.*
.env.local
.env.production.local
```

### 2. Use Different Values for Development/Production
- Use different secrets between environments
- Use different database credentials
- Use different OAuth clients

### 3. Production Environment Setup
```bash
# Create production environment files
cp apps/core/.env.example apps/core/.env.prod
# Edit apps/core/.env.prod with production values
```

### 4. Environment Variable Validation
The applications validate required environment variables on startup. Missing variables will cause the application to fail with clear error messages.

## Required Variables by Application

### Minimum Required Variables
All applications require at minimum:
- `NODE_ENV`
- `BETTER_AUTH_SECRET`
- `DATABASE_HOST`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

### Optional Variables
- Google OAuth (for social login)
- Cloudflare R2 (for file storage)
- Application-specific features

## Troubleshooting

### Common Issues

1. **Missing Variables:**
   ```bash
   # Check which variables are missing
   docker compose logs yeko-core
   ```

2. **Invalid Database Connection:**
   ```bash
   # Test database connection
   psql "postgresql://username:password@host/database"
   ```

3. **OAuth Configuration:**
   ```bash
   # Verify OAuth redirect URLs match your environment
   # Development: http://localhost:3000/api/auth/callback/google
   # Production: https://your-domain.com/api/auth/callback/google
   ```

### Environment Variable Debugging

```bash
# Check loaded environment variables in container
make shell-core
env | grep -E "(BETTER_AUTH|DATABASE|NODE_ENV)"
```

## Setup Instructions

### Development Setup

1. Copy example environment files:
   ```bash
   cp apps/core/.env.example apps/core/.env
   # Repeat for other applications
   ```

2. Fill in your development values:
   ```bash
   # Edit each .env file with your development configuration
   ```

3. Start services:
   ```bash
   make docker-up
   ```

### Production Setup

1. Create production environment files:
   ```bash
   cp apps/core/.env.example apps/core/.env.prod
   # Repeat for other applications
   ```

2. Fill in production values:
   ```bash
   # Use production database, secrets, and URLs
   ```

3. Deploy:
   ```bash
   make docker-prod-up
   ```

## Support

For environment variable issues:

1. Check this documentation first
2. Verify all required variables are set
3. Check application logs for specific error messages
4. Ensure database connectivity
5. Contact the DevOps team for production environment setup
