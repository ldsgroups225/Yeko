# Ngrok Tunnel Setup

This project uses `ngrok` to expose local services to the internet. This is particularly useful for testing webhooks, mobile apps, or sharing your local progress.

## Configuration

The tunnels are configured in `ngrok.yml` at the root of the project.

### Services Exposed:
- **yeko-core**: http://localhost:3000
- **yeko-school**: http://localhost:3001
- **yeko-teacher**: http://localhost:3002
- **data-service**: http://localhost:8787

## Usage

### Using Make (Recommended)

```bash
# Start all tunnels
make tunnel

# Start specific tunnels
make tunnel-core
make tunnel-school
make tunnel-teacher
make tunnel-data
```

### Using pnpm

```bash
# Start all tunnels
pnpm tunnel

# Start specific tunnels
pnpm tunnel:core
pnpm tunnel:school
pnpm tunnel:teacher
pnpm tunnel:data
```

## Important: Environment Variables

When using ngrok, you often need to update your `.env` files so that the application knows its public URL (for authentication redirects, etc.).

For example, in `apps/core/.env`:
```env
BETTER_AUTH_URL=https://your-ngrok-subdomain.ngrok-free.app
APP_URL=https://your-ngrok-subdomain.ngrok-free.app
```

Remember to restart your Docker containers after changing `.env` files:
```bash
make docker-up
```
