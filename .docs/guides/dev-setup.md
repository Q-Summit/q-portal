# Development Setup Guide

Complete setup instructions for Q Portal development environment.

## Prerequisites

- **Bun** - Fast JavaScript runtime and package manager
- **Git** - Version control
- **Turso Account** - For database hosting (free tier available)

## Installation Steps

### 1. Install Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify installation: `bun --version`

### 2. Clone the Repository

```bash
git clone https://github.com/Q-Summit/q-portal.git
cd q-portal
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Set Up Turso Database

1. Sign up at [https://turso.tech/](https://turso.tech/)
2. Create a database in the dashboard
3. Copy the **Database URL** (starts with `libsql://`) and generate an **Auth Token**

**Alternative:** For local development, use a local SQLite file:

```env
DATABASE_URL=file:./db.sqlite
DATABASE_TOKEN=
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Turso credentials:

```env
DATABASE_URL=libsql://your-database-url
DATABASE_TOKEN=your-database-token
NODE_ENV=development
```

See `.env.example` for detailed explanations.

### 6. Set Up Database Schema

```bash
bun run db:push
```

Optional: `bun run db:setup` for interactive database setup with mock data.

### 7. Verify Installation

```bash
bun run typecheck
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the Q-Portal landing page with a tRPC greeting.

### 8. Run Tests

```bash
bun test                   # Run unit, integration, and component tests (E2E excluded)
bun run test:unit          # Unit tests only
bun run test:integration   # Integration tests only
bun run test:component     # Component tests only
bun run test:watch         # Watch mode

bun run test:e2e           # E2E tests (Playwright only - separate from bun test)
```
**Note:** Before running E2E tests, install Playwright browsers:
```bash
bun run test:e2e:install
```

For detailed testing information, see [test/README.md](../../test/README.md).

## Troubleshooting

### Bun: command not found

- Restart terminal after installation
- Add to PATH: `export PATH="$HOME/.bun/bin:$PATH"` (add to `~/.bashrc` or `~/.zshrc`)

### Cannot connect to database

- Verify `DATABASE_URL` and `DATABASE_TOKEN` in `.env`
- Check Turso dashboard to ensure database is active

### TypeScript errors

```bash
rm -rf node_modules bun.lockb && bun install
rm -rf .next && bun run typecheck
```

### Port 3000 already in use

```bash
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 bun run dev
```

## See Also

- **[Commands Reference](./commands.md)** - Complete command reference
- **[README.md](../../README.md)** - Project overview
- **[Documentation Guide](../DOCUMENTATION_GUIDE.md)** - Documentation standards
