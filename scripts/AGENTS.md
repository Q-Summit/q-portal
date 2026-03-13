# SCRIPTS

Automation suite for development workflows, code reviews, and PR management.

## OVERVIEW

13+ shell/TypeScript scripts for quality gates, CodeRabbit reviews, and PR comment automation.

## SCRIPTS

| Category    | Script                     | Purpose                                                         |
| ----------- | -------------------------- | --------------------------------------------------------------- |
| **Quality** | `finalize.sh`              | Quality gate: typecheck, lint, format, markdown validation      |
| **Docs**    | `check-docs.sh`            | Analyzes git diff, suggests documentation updates by category   |
| **DB**      | `setup-db.ts`              | Interactive DB initialization with presets (full, empty, clean) |
| **E2E**     | `test-server.sh`           | Starts dev server on port 9999 for Playwright tests             |
| **Review**  | `review-run.sh`            | CodeRabbit CLI wrapper: task (uncommitted) or pr (vs main)      |
| **Review**  | `review-read.sh`           | Reads latest CodeRabbit review with formatted stats             |
| **Review**  | `review-cleanup.sh`        | Removes old `.coderabbit/` review files                         |
| **PR**      | `pr-comments-fetch.sh`     | Lists open PRs via GitHub API                                   |
| **PR**      | `pr-comments-get.sh`       | Fetches PR review comments in structured format                 |
| **PR**      | `pr-comments-resolve.sh`   | Marks PR comments as resolved after fixes                       |
| **PR**      | `pr-comments-dismiss.sh`   | Dismisses PR review comments                                    |
| **PR**      | `pr-comments-cleanup.sh`   | Removes old PR comment files                                    |
| **PR**      | `pr-comments-detect.sh`    | Detects which PR comments need attention                        |
| **Lib**     | `lib/review-utils.sh`      | Shared review utilities (auth, output formatting)               |
| **Lib**     | `lib/pr-comments-utils.sh` | Shared PR comment utilities (API calls, parsing)                |

## CONVENTIONS

- **Mode flags**: `finalize.sh [ci|agent]` - ci for read-only, agent for auto-fix
- **Review types**: `review-run.sh [task|pr]` - task reviews uncommitted, pr reviews vs main
- **Shared libs**: Source from `lib/` for common utilities, API handling, formatting
- **Output**: Reviews save to `.coderabbit/`, PR comments to `.github/pr-comments/`
- **Exit codes**: Non-zero on failure for CI integration

## USAGE

Scripts are invoked via package.json npm scripts, not directly:

```bash
# Quality gates
bun run agent:finalize      # Runs check (format + typecheck + lint)
bun run check               # Same as agent:finalize
bun run docs:check          # Runs check-docs.sh

# Code reviews
bun run review:task         # Review uncommitted files
bun run review:pr           # Review all files vs main
bun run review:read         # Read latest review
bun run review:cleanup      # Clean old reviews

# PR comments
bun run pr:list             # List open PRs
bun run pr:comments:get     # Fetch PR comments
bun run pr:comments:resolve # Resolve comments
bun run pr:comments:cleanup # Clean old comment files

# Database
bun run db:setup            # Interactive DB setup
```
