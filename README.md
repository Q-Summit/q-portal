# Q Portal

> **Note**: This project is under active development. Features and documentation may change.

## Overview

Q-Portal is the central hub for Q-Summit's internal tools and automation, optimizing workflows and enhancing operational efficiency across teams. Built with modern web technologies, it provides a unified platform for managing internal processes, tools, and resources.

### Features

- **Centralized Hub** - Single platform for all internal tools and automation
- **Workflow Optimization** - Streamlined processes for enhanced operational efficiency
- **Team Collaboration** - Tools designed to improve cross-team coordination
- **Slack Integration** - Send messages to Slack channels via Web API
- **Type-safe APIs** - End-to-end type safety with tRPC
- **Modern Stack** - Next.js 16 with App Router and React 19
- **Database** - Turso (distributed SQLite) with Drizzle ORM
- **Developer Experience** - Bun runtime, TypeScript, ESLint, Prettier
- **Code Quality** - Automated checks and reviews

### Tech Stack

- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[Bun](https://bun.sh)** - Fast JavaScript runtime and package manager
- **[Next.js 16](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Zod](https://zod.dev)** - TypeScript-first schema validation
- **[Drizzle ORM](https://orm.drizzle.team)** - Type-safe ORM for database operations
- **[Turso/LibSQL](https://turso.tech)** - Edge database with SQLite compatibility

---

## Project Structure

```
q-portal/
├── .docs/                      # Documentation
│   └── guides/
├── .cursor/                    # Cursor IDE configuration
│   ├── commands/
│   └── rules/
├── .github/
│   └── workflows/              # GitHub Actions
├── scripts/                    # Development scripts
├── src/
│   ├── app/                    # Next.js application pages
│   │   ├── api/                # tRPC API configuration
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── server/                 # Server-side code
│   │   ├── api/
│   │   │   └── routers/        # tRPC routers
│   │   └── db/                 # Database schema
│   └── env.js
├── LICENSE
└── package.json
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) - Fast JavaScript runtime and package manager
- [Turso](https://turso.tech) account for database (free tier available)

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/Q-Summit/q-portal.git
cd q-portal
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

```bash
cp .env.example .env
```

4. **Set up the database**

```bash
bun run db:push
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

#### Required for Local Development

- **`DATABASE_URL`** - Your database URL (e.g., `libsql://your-database-url` for Turso or `file:./db.sqlite` for local SQLite)
- **`NODE_ENV`** - Environment mode (`development`, `test`, or `production`)
- **`BETTER_AUTH_SECRET`** - A random string used to encrypt session tokens (Generate via bunx auth secret)
- **`BETTER_AUTH_URL`** - The full base URL of your application (e.g., http://localhost:3000 for dev)
- **`GOOGLE_CLIENT_ID`** - The Client ID from the `q-summit-dev` Google Cloud Console project
- **`GOOGLE_CLIENT_SECRET`** - The Client Secret from the `q-summit-dev` Google Cloud Console project

#### Optional / Feature-specific

- **`DATABASE_TOKEN`** - Your Turso database authentication token (only required for remote Turso databases, not needed for local file-based databases)

See [.env.example](.env.example) for a template with detailed explanations.

5. **Start the development server**

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

---

## Testing

Q Portal uses `bun test` for unit, integration, and component tests, and Playwright for end-to-end tests.

```bash
bun test                   # Run unit, integration, and component tests (E2E excluded)
bun run test:unit          # Unit tests only
bun run test:integration   # Integration tests only
bun run test:component     # Component tests only
bun run test:watch         # Watch mode

bun run test:e2e           # E2E tests (Playwright only - separate from bun test)
```

For detailed testing information, see [test/README.md](test/README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Resources

### Documentation

- **[Development Setup](.docs/guides/dev-setup.md)** - Complete setup instructions
- **[Commands Reference](.docs/guides/commands.md)** - Complete command reference
- **[Slack Setup Guide](.docs/guides/setup-slack.md)** - Slack integration setup and configuration
- **[Documentation Guide](.docs/DOCUMENTATION_GUIDE.md)** - Documentation standards and best practices
- **[Test Documentation](test/README.md)** - Test structure and organization guide
- **[Contributing Guide](CONTRIBUTING.md)** - Contributing guidelines and testing standards

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

Copyright (c) 2025 Q-Summit
