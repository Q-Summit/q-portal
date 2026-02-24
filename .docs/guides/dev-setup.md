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
bun test                   # Run unit and integration tests (E2E excluded)
bun run test:unit          # Unit tests only
bun run test:integration   # Integration tests only
bun run test:watch         # Watch mode

bun run test:e2e           # E2E tests (Playwright only - separate from bun test)
bun run test:stories       # Storybook story tests (UI components; Vitest)
```

**Note:** Before running E2E tests, install Playwright browsers:

```bash
bun run test:e2e:install
```

For detailed testing information, see [test/README.md](../../test/README.md).

### 9. Visual testing (Storybook & Chromatic)

- **Run Storybook locally:** `bun run storybook` (opens at http://localhost:6006). Use it to develop and review UI components in isolation. **For the test widget and coverage:** open the **Local** URL (http://127.0.0.1:6006 or http://localhost:6006) in your browser—**not** the "On your network" URL—or the test runner cannot fetch the story index and coverage stays NaN%.
- **CI:** The Chromatic workflow runs on push. Chromatic posts a **UI Tests** status check on pull requests. Unreviewed visual changes keep the check pending until someone reviews in Chromatic (accept or deny). Require the **Chromatic / UI Test** check in branch protection so merges need approval in Chromatic.

**Story-based UI testing:** Use the **test widget** at the bottom of the Storybook sidebar to run tests on stories (pass/fail, a11y, coverage). Add `play` functions for interaction tests; import `expect`, `fn`, `userEvent`, `within` from `storybook/test`. Run the same tests from the CLI with `bun run test:stories` (Vitest; useful for CI). **Testing strategy:** Bun tests (`bun test`) for unit and integration; Storybook/Vitest for UI components; Playwright for E2E.

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

### Storybook test widget: "Failed to fetch story index" / Coverage NaN%

If the test widget shows "Failed to fetch story index" or "No test files found", and coverage shows **NaN%**, the test runner (Vitest) cannot reach Storybook’s story index.

**Why this happens:** In `@storybook/addon-vitest`, the Storybook **manager** (browser) sets the story index URL from `window.location.href` (i.e. the address in your browser). The **Node** process (Vitest) then fetches that URL to load the story list. If you opened Storybook via the "On your network" URL (e.g. `http://192.168.x.x:6006`), or if `localhost` resolves differently in Node (e.g. IPv6 vs IPv4), that fetch can fail and coverage becomes NaN. See [Vitest addon docs](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index#storybookurl) for `storybookUrl` and debugging.

- **Fix:** Open Storybook in the browser at **http://127.0.0.1:6006** or **http://localhost:6006** (or your port if different), not the network URL (e.g. http://your-server-ip:6006). The runner runs on the same machine and must be able to fetch the story index. After opening that URL, click **Run tests** in the test widget again.
- **Different port:** If you run Storybook on another port (e.g. `storybook dev -p 6007`), set **STORYBOOK_PORT** so the test runner uses the same port: `STORYBOOK_PORT=6007 bun run storybook`, or when running story tests: `STORYBOOK_PORT=6007 bun run test:stories`.
- **Coverage:** Coverage appears only after tests run successfully. Once the story index is fetched and tests run, the Coverage checkbox will show a percentage instead of NaN%.

## See Also

- **[Commands Reference](./commands.md)** - Complete command reference (includes Storybook and Chromatic commands)
- **[README.md](../../README.md)** - Project overview
- **[Documentation Guide](../DOCUMENTATION_GUIDE.md)** - Documentation standards
