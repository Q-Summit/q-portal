# Commands Reference

Complete reference for all available commands in Q-Portal.

## Development

| Command             | Description              |
| ------------------- | ------------------------ |
| `bun run dev`       | Start development server |
| `bun run build`     | Build for production     |
| `bun run start`     | Start production server  |
| `bun run lint`      | Run ESLint               |
| `bun run typecheck` | TypeScript type checking |
| `bun run check`     | Run typecheck and lint   |

## Database

| Command               | Description                                 |
| --------------------- | ------------------------------------------- |
| `bun run db:setup`    | Interactive database setup                  |
| `bun run db:generate` | Generate database migrations                |
| `bun run db:migrate`  | Run database migrations                     |
| `bun run db:push`     | Push schema changes to database             |
| `bun run db:studio`   | Open Drizzle Studio for database management |

## Testing

| Command                    | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `bun test`                 | Run unit, integration, and component tests (E2E excluded) |
| `bun run test:unit`        | Run unit tests only                                       |
| `bun run test:integration` | Run integration tests only                                |
| `bun run test:component`   | Run component tests only                                  |
| `bun run test:watch`       | Run tests in watch mode                                   |
| `bun run test:e2e`         | Run E2E tests (Playwright only - separate from bun test)  |
| `bun run test:e2e:install` | Install Playwright browsers (one-time setup)              |

## Code Quality

| Command                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `bun run format:check`   | Check code formatting with Prettier              |
| `bun run format:write`   | Format code with Prettier                        |
| `bun run agent:finalize` | Run all quality checks (typecheck, lint, format) |

## Documentation & Reviews

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `bun run docs:check`     | Check documentation updates needed |
| `bun run review:task`    | Review uncommitted changes         |
| `bun run review:pr`      | Review PR changes                  |
| `bun run review:read`    | Read latest review results         |
| `bun run review:cleanup` | Clean up review files              |

## PR Comments

| Command                                   | Description                       |
| ----------------------------------------- | --------------------------------- |
| `bun run pr:comments`                     | Get PR comments                   |
| `bun run pr:comments:detect`              | Detect unresolved PR comments     |
| `bun run pr:comments:resolve`             | Resolve PR comments               |
| `bun run pr:comments:resolve:interactive` | Resolve PR comments interactively |
| `bun run pr:comments:dismiss`             | Dismiss PR comments               |
| `bun run pr:comments:cleanup`             | Clean up PR comment files         |
| `bun run pr:list`                         | List PR comments                  |

## See Also

- **[Development Setup](./dev-setup.md)** - Complete setup instructions
- **[README.md](../../README.md)** - Project overview
- **[Documentation Guide](../DOCUMENTATION_GUIDE.md)** - Documentation standards
