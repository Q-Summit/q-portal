# Documentation Validation

## Confirmed alignments
- `README.md` now documents the full testing workflow (`bun test`, Playwright, links to `test/README.md`) and explicitly links to `CONTRIBUTING.md`, which satisfies the documentation guide’s emphasis on cross-references and discoverability (see `.docs/DOCUMENTATION_GUIDE.md`).
- `CONTRIBUTING.md` introduces house rules, a PR checklist, quality checks, and direct links back to `.docs/guides/dev-setup.md`/`test/README.md`, so contributors have the onboarding path the guide recommends when adding a new root-level document.
- `test/README.md` organizes the test matrix, explains the `bunfig.toml` setup, and includes shared utilities plus example files, meeting the docs guide’s “add README for directories with multiple files” rule and keeping tests discoverable.

## Outstanding alignment items
- There is still no `CODE_OF_CONDUCT.md` or `SECURITY.md` at the repo root. OpenSource Together’s “Guide to Going Open Source” (and GitHub’s Open Source Guides) treat those community-health files as essential for a public release because they explain behavioral expectations and how to report vulnerabilities, so we should add minimal versions and link them from the README before cutting the initial commit.

## References
- `.docs/DOCUMENTATION_GUIDE.md`
- `https://opensource-together.com/oss-guide` (community-health files for an open-source launch)
- `https://opensource.guide/starting-a-project/` (README + CONTRIBUTING + CODE_OF_CONDUCT + SECURITY guidance)
