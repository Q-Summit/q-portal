# Test Documentation

This directory contains shared test utilities and example tests for the Q Portal project.

## Test Organization

Tests should be organized in `__tests__` directories directly at implementation locations (e.g., `src/app/__tests__/`, `src/components/__tests__/`).

## Test File Naming

- `*.unit.test.ts` - Unit tests (individual functions/modules)
- `*.integration.test.ts` - Integration tests (component interactions, database)
- `*.component.test.ts` / `*.component.test.tsx` - Component tests (React components)
- `*.e2e.test.ts` - E2E tests (Playwright only)

## Running Tests

```bash
bun test                    # Run unit, integration, and component tests (E2E excluded)
bun run test:unit          # Unit tests only
bun run test:integration   # Integration tests only
bun run test:component     # Component tests only
bun run test:watch         # Watch mode
bun run test:e2e           # E2E tests (Playwright only)
bun run test:e2e:install   # Install Playwright browsers (one-time setup)
```

## Test Configuration

- **DOM Environment**: Automatically configured via `test/setup-dom.ts` (preloaded by `bunfig.toml`)
- **E2E Exclusion**: E2E tests are excluded from `bun test` via `bunfig.toml` and include a guard to exit when run with Bun

## Test Database

Tests use in-memory SQLite via LibSQL/Turso local mode. Each call to `createTestDb()` creates a new unique in-memory database:

- If called in `beforeAll`, all tests in that suite share the same database
- If called in each test, each test gets its own isolated database

## Shared Utilities

Import from `@/test/utils`:

```typescript
import {
  createTestDb,
  createTestDbWithMigrations,
  cleanupTestDb,
} from "@/test/utils";

// Create test database
const { db, client } = createTestDb();

// Create with migrations
const { db, client } = await createTestDbWithMigrations();

// Cleanup
await cleanupTestDb(db, client);
```

## Example Tests

Example tests are provided in `test/`:

- `test/example.unit.test.ts` - Unit test example
- `test/example.integration.test.ts` - Integration test example
- `test/example.component.test.tsx` - Component test example
- `test/example.e2e.test.ts` - E2E test example

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test databases in `afterAll` hooks when using `beforeAll` (connections are automatically closed, but explicit cleanup ensures resources are freed)
3. **Naming**: Use descriptive test names
4. **Organization**: Place tests in `__tests__` directories at implementation locations
5. **Types**: Use appropriate test types based on what you're testing
6. **Utilities**: Use shared utilities from `test/utils.ts` for common operations

## Additional Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test) - Official Bun test documentation
- [Playwright Documentation](https://playwright.dev) - Playwright e2e testing documentation
- [React Testing Library](https://testing-library.com/react) - React component testing documentation
