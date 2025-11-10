# Generate PR Summary

Copy the PR template and fill it out with actual content from git, keeping all headings and checklists intact.

**Reference:** See `.github/PULL_REQUEST_TEMPLATE.md` for the PR template structure.

## What it does:

1. Copy `.github/PULL_REQUEST_TEMPLATE.md` to `PR_SUMMARY.md` in the project root
2. Fill out the template with actual git information:
   - Keep ALL headings and checklists exactly as they are
   - Replace placeholder text with actual content
   - Remove placeholder instruction lines (e.g., "If no docs changed, write...")
   - Use "N/A" for sections that don't apply (but keep the section structure)

## Usage:

```
/generate-pr-summary
```

## Implementation:

When this command is invoked, the AI agent should:

1. **Copy the template:**
   - Read `.github/PULL_REQUEST_TEMPLATE.md`
   - Write it to `PR_SUMMARY.md` in the project root

2. **Gather git information (compare against main/master, NOT HEAD):**
   - Detect base branch: `git branch -r | grep -E 'origin/(main|master)' | head -1` (defaults to main)
   - Get changed files: `git diff --name-only origin/main` (or origin/master)
   - Get diff stat: `git diff --stat origin/main` (or origin/master)
   - Get commit messages: `git log --oneline origin/main..HEAD` (or origin/master..HEAD)
   - Get full commit messages: `git log origin/main..HEAD --pretty=%B` (for Summary section)
   - Get current branch: `git rev-parse --abbrev-ref HEAD`
   - Get repository info (for GitHub MCP): `git remote get-url origin` (extract owner/repo from URL)

3. **Fill out each section:**
   - **Summary:**
     - Use commit messages from this PR (origin/main..HEAD)
     - For multiple commits, synthesize into a cohesive summary rather than listing each commit
     - Extract issue references from commit messages (e.g., "Fixes #123", "Closes #456")
   - **Changes:**
     - **Areas touched:** Group changed files into high-level functional areas:
       - **Backend:** API routes, server logic, database schema, migrations
       - **Frontend:** UI components, pages, client-side code
       - **Infrastructure:** Config files, CI/CD, tooling, scripts (includes configuration files)
       - **Documentation:** Docs, README, guides
       - **Testing:** Test files, test infrastructure
       - **Format:** List only high-level areas (e.g., "Backend, Frontend, Infrastructure")
       - **Optional subcategories:** Only include brief subcategories in parentheses if they add clarity (e.g., "Backend (API, database)" is acceptable, but avoid "Backend (API routes, server logic, database schema, migrations)")
       - **Limit areas:** If you have 4+ areas, consider grouping related ones (e.g., "Configuration" should be part of "Infrastructure")
       - Only list areas that have significant changes (not every touched category)
       - Keep it simple - reviewers need to know the scope, not every detail
       - **Avoid listing too many areas** - if you have 5+ areas, you're probably being too granular
     - **Key files modified:**
       - For small PRs (< 10 files): List key files with change counts from `git diff --stat origin/main`
       - For large PRs (≥ 10 files): Group by category (e.g., "5 files in Backend (API routes, database schema)", "3 files in Frontend (UI components)")
       - Focus on what reviewers need to know, not exhaustive detail
       - Only include files changed vs main/master (not all files in repo)
     - **Breaking changes:** State if breaking changes exist (check for migrations, schema changes, etc.)
   - **Context & Impact:** Fill based on actual changes - focus on what reviewers should pay attention to
   - **Documentation:** Check boxes if docs changed, list doc files, or "N/A - No documentation changes"
   - **Visual Changes:** "N/A - No visual changes" if no UI files, or describe changes
   - **Linked Work:**
     - **If GitHub MCP is available:**
       - Get repository owner/name from `git remote get-url origin`
       - Use `mcp_github_search_issues` to search for related issues using keywords from commit messages or changed files
       - Use `mcp_github_list_issues` to check open issues in the repository
       - Search for issues that might be related to the changes
     - **Always check commit messages** for issue references (e.g., "Fixes #123", "Closes #456")
     - Fill each bullet with issue/PR numbers or "N/A - None"
     - Use GitHub linking syntax: "Closes #123", "Fixes #456", "Related to #789"
   - **Breaking Changes:** Check appropriate box
   - **Ready for Review?:** Check appropriate status box
   - **Additional notes:** Fill with actual notes or "N/A - None" (not both)

4. **Remove placeholder instruction lines:**
   - "If no docs changed, write 'N/A' or 'No documentation changes'"
   - "If no visual changes, write 'N/A' or 'No visual changes'"
   - "If none, write 'N/A' or 'None'"
   - "Always check one of the above options"

## Critical Rules:

- ✅ **DO compare against main/master** (not HEAD) - only show files changed in this PR
- ✅ **DO keep all headings and checklists** exactly as they are
- ✅ **DO remove placeholder instruction lines** completely
- ✅ **DO replace placeholder text** with actual information
- ✅ **DO keep bullet point structure** even when using "N/A"
- ✅ **DO group "Areas touched"** into high-level functional areas (Backend, Frontend, Infrastructure, Documentation, Testing)
- ✅ **DO keep "Areas touched" simple** - list only high-level areas (e.g., "Backend, Frontend, Infrastructure")
- ✅ **DO limit "Areas touched"** - if you have 4+ areas, consider grouping related ones (e.g., "Configuration" is part of "Infrastructure")
- ✅ **DO use minimal subcategories** - only include brief subcategories in parentheses if they add clarity (e.g., "Backend (API, database)")
- ✅ **DO summarize file listings** for large PRs - group by category instead of listing every file
- ✅ **DO focus on what reviewers need to know** - prioritize clarity and usefulness over exhaustive detail
- ✅ **DO use GitHub MCP tools** if available to find related issues automatically (requires repository owner/name from git remote)
- ✅ **DO search for related issues** using commit messages and changed files as keywords
- ✅ **DO synthesize multiple commits** in Summary section - create cohesive summary rather than listing each commit
- ❌ **DO NOT delete any sections** - keep all headings
- ❌ **DO NOT include files** that exist in main/master - only changed/added files
- ❌ **DO NOT write both notes and "N/A"** - choose one
- ❌ **DO NOT list every category** in "Areas touched" - only significant areas
- ❌ **DO NOT list too many areas** - if you have 5+ areas, you're being too granular (group related ones)
- ❌ **DO NOT separate "Configuration" from "Infrastructure"** - config files are part of infrastructure
- ❌ **DO NOT include verbose subcategories** in "Areas touched" - keep it simple (e.g., avoid "Backend (API routes, server logic, database schema, migrations)")
- ❌ **DO NOT list every file** for large PRs - group and summarize instead

## Examples:

### Summary Section:

**Before:**

```markdown
- Brief summary of the change and the problem it solves
- Link to related issue (e.g., "Closes #123" or "Fixes #456")
```

**After:**

```markdown
- Added user authentication system with login and registration endpoints
- Closes #123
```

### Changes Section:

**Before:**

```markdown
- Areas touched (config, UI, API, database, docs, etc.)
- Key files modified (use `git diff --stat` output)
- Breaking changes or migrations required (if any)
```

**After (small PR - < 10 files):**

```markdown
- Areas touched: Backend, Documentation
- Key files modified:
  - `src/server/api/routers/auth.ts` (45 insertions, 2 deletions)
  - `src/server/db/schema.ts` (12 insertions)
  - `README.md` (5 insertions)
- Breaking changes or migrations required: Database migration required
```

**After (large PR - ≥ 10 files):**

```markdown
- Areas touched: Backend, Infrastructure, Documentation
- Key files modified:
  - Backend: 8 files (API routes, database schema, server logic)
  - Infrastructure: 5 files (config files, CI/CD workflows, tooling scripts)
  - Documentation: 3 files (README, API docs, setup guides)
- Breaking changes or migrations required: Database migration required
```

**Optional (with minimal subcategories for clarity):**

```markdown
- Areas touched: Backend (API, database), Infrastructure (config, scripts), Documentation
```

**❌ Too verbose (avoid this):**

```markdown
- Areas touched: Backend (API routes, server logic, database schema, migrations), Frontend (UI components, pages, client-side code), Infrastructure (config files, CI/CD, tooling, scripts)
```

**❌ Wrong (too granular):**

```markdown
- Areas touched: config, UI, API, database, docs, testing, CI/CD, tooling, scripts
- Key files modified:
  - `.cursor/commands/docs-update.md` (42 insertions)
  - `.cursor/commands/finalize.md` (32 insertions)
  - `.cursor/commands/fix-pr-comments.md` (127 insertions)
    ... (50+ more files listed individually)
```

**✅ Correct (high-level grouping):**

```markdown
- Areas touched: Infrastructure, Documentation
- Key files modified:
  - Infrastructure: 12 files (Cursor commands, scripts, config)
  - Documentation: 4 files (guides, README)
```

**✅ Also acceptable (minimal subcategories):**

```markdown
- Areas touched: Infrastructure (tooling, scripts), Documentation
- Key files modified:
  - Infrastructure: 12 files (Cursor commands, scripts, config)
  - Documentation: 4 files (guides, README)
```

### Documentation Section:

**Before (with instruction line):**

```markdown
- [ ] Code comments, README, API docs, or user-facing docs
- Links to updated documentation files
- If no docs changed, write "N/A" or "No documentation changes"
```

**After (docs changed):**

```markdown
- [x] Code comments, README, API docs, or user-facing docs
- Links to updated documentation files: `README.md`, `.docs/api/auth.md`
```

**After (no docs changed):**

```markdown
- [ ] Code comments, README, API docs, or user-facing docs
- Links to updated documentation files: N/A - No documentation changes
```

### Additional Notes Section:

**Before:**

```markdown
- Questions for reviewers, known issues, or follow-up work
- If none, write "N/A" or "None"
```

**After (with notes):**

```markdown
- This PR introduces a new authentication system that requires database migration
- Reviewers should test login and registration flows
```

**After (no notes):**

```markdown
- N/A - None
```

**❌ Wrong (don't do this):**

```markdown
- This PR introduces a new authentication system
- N/A - None
```

## Guidance for Analyzing Changes:

When filling out the "Changes" section, analyze at a higher level:

1. **Group related files** into functional areas rather than listing every category touched
2. **Focus on what matters** - reviewers need to understand the scope, not every detail
3. **Summarize large PRs** - if there are many files, group them by category with counts
4. **Be selective** - only list areas with significant changes, not every minor touch
5. **Use meaningful groupings** - "Backend" is more useful than "API, database, server logic" separately

**Example analysis:**

- Changed files: `src/server/api/routers/auth.ts`, `src/server/db/schema.ts`, `src/server/api/routers/user.ts`
- Analysis: These are all backend changes (API and database)
- **Best result:** "Areas touched: Backend"
- **Acceptable:** "Areas touched: Backend (API, database)" - only if subcategories add clarity
- **Avoid:** "Areas touched: API, database, server logic" - too granular
- **Avoid:** "Areas touched: Backend (API routes, server logic, database schema, migrations)" - too verbose

## Output:

The file `PR_SUMMARY.md` will be created in the project root with:

- All sections filled out with actual content
- Placeholder instruction lines removed
- High-level "Areas touched" groupings (not granular categories)
- Summarized file listings for large PRs (grouped by category)
- Only files changed vs main/master included
- Ready to copy-paste into GitHub PR draft
