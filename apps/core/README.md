# Yeko Core

Modern school management system built with React, TanStack Router, and Cloudflare Workers.

## Features

- 🏫 **School Management**: Create, update, and manage multiple schools
- 👥 **User Management**: Role-based access control with better-auth
- 📊 **Dashboard**: Real-time statistics and system health monitoring
- 🔍 **Advanced Search**: Debounced search with filtering and sorting
- 📤 **Import/Export**: Excel import/export using typed-xlsx
- 🎨 **Modern UI**: Beautiful interface with shadcn/ui components
- ⚡ **Performance**: Virtual scrolling for large lists, skeleton loaders
- 🔐 **Authentication**: Secure auth with better-auth and session caching

## Tech Stack

- **Frontend**: React 18, TypeScript, TanStack Router
- **Backend**: Cloudflare Workers, TanStack Start
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: better-auth with React Query caching
- **UI**: shadcn/ui, Tailwind CSS
- **State**: React Query (TanStack Query)
- **Logging**: LogTape

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Environment Variables

```env
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=yeko_core
```

## Project Structure

```
apps/core/
├── src/
│   ├── components/      # Reusable UI components
│   ├── core/           # Server functions and middleware
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # React Query options
│   ├── lib/            # Utilities and helpers
│   ├── routes/         # File-based routing
│   └── schemas/        # Zod validation schemas
├── public/             # Static assets
└── package.json
```

## Key Features

### School Management

- Create schools with logo upload
- Edit school details
- Delete with confirmation (requires typing school code)
- Filter by status (active/inactive/suspended)
- Search by name or code
- Export to Excel
- Import from Excel

### Authentication

- Session-based auth with better-auth
- React Query caching (5min stale time)
- Auto token refresh
- Protected routes

### Performance

- Debounced search (500ms)
- Skeleton loaders instead of spinners
- Virtual scrolling for large lists
- Optimistic updates

## Development

### Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm typecheck    # Run TypeScript checks
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix linting issues
pnpm test         # Run tests
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/core/functions/schools.test.ts
```

## Deployment

Built for Cloudflare Workers:

```bash
# Build
pnpm build

# Deploy
pnpm deploy
```

## License

MIT
