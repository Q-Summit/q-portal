# Contributing to Q Portal

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## House Rules (for PRs and Issues)

### 👥 Prevent Work Duplication

Before submitting a new issue or PR, check if it already exists in the [Issues](https://github.com/Q-Summit/q-portal/issues) or [Pull Requests](https://github.com/Q-Summit/q-portal/pulls).

### ✅ Work Only on Approved Issues

For feature requests, please wait for a core team member to approve and remove the `🚨 needs approval` label before you start coding or submitting a PR.

For bugs, security, performance, documentation, etc., you can start coding immediately—even if the `🚨 needs approval` label is present.

### 👀 Think Like a Reviewer

Put yourself in the reviewer's shoes. What would you want to know if reading this for the first time? Are there key decisions, goals, or constraints that need clarification? Does the PR assume knowledge that isn't obvious? Are there related issues or previous PRs that should be linked?

### 🧵 Bring in Context from Private Channels

If the task originated from a private conversation (e.g., Slack), take a moment to extract the relevant details and include them in the GitHub issue or PR. Avoid sharing sensitive information, but make sure important reasoning is captured.

### 📚 Treat It Like Documentation

GitHub is a shared source of truth. Every issue and PR contributes to the long-term understanding of the codebase. Write clearly enough that someone—possibly you—can revisit it months later and still understand what happened and why.

### ✅ Summarize Your PR at the Top

Even if the code changes are minor or self-explanatory, a short written summary helps reviewers quickly understand the intent.

### 🔗 Use GitHub Keywords to Auto-Link Issues

Use phrases like "Closes #123" or "Fixes #456" in your PR descriptions. This automatically links your PR to the related issue and closes it once merged.

### 🧪 Mention What Was Tested (and How)

Explain how you validated your changes. It doesn't need to be exhaustive—just enough to give reviewers confidence that things were tested and work as expected.

> Example:  
> "Tested locally with mock data and confirmed the flow works on staging."

## Development Setup

Before contributing, set up your development environment:

1. **Install Bun**: See [Development Setup Guide](.docs/guides/dev-setup.md) for installation instructions
2. **Clone the repository**: `git clone https://github.com/Q-Summit/q-portal.git`
3. **Install dependencies**: `bun install`
4. **Set up environment variables**: Copy `.env.example` to `.env` and configure your Turso database
5. **Set up database**: `bun run db:push`
6. **Verify installation**: `bun run typecheck && bun run dev`

See [Development Setup Guide](.docs/guides/dev-setup.md) for complete setup instructions.

## Pull Request Process

1. **Fork and Clone**: Fork the repository and clone your fork locally.
2. **Create a Branch**: Create a new branch for your feature or bug fix.
3. **Set Up Development Environment**: See [Development Setup Guide](.docs/guides/dev-setup.md).
4. **Implement Changes**: Make your code changes following the project's coding standards.
5. **Run Quality Checks**: Before submitting, run `bun run agent:finalize` (runs typecheck, lint, and format checks).
6. **Run Tests**: Ensure all tests pass. See [Test Documentation](test/README.md) for details.
7. **Build**: Ensure you can make a full production build with `bun run build`.
8. **Commit and Push**: Commit your changes with a descriptive message and push to your fork.
9. **Open a Pull Request**: Open a PR from your branch.
10. **Review Process**: Address any feedback promptly.
11. **Merge**: Once approved, your PR will be merged by a team member.

### Making a Pull Request

- [Check the "Allow edits from maintainers" option](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork) when creating your PR.
- If your PR refers to or fixes an issue, add `refs #XXX` or `fixes #XXX` to the PR description.
- Keep your branches updated (e.g., click the `Update branch` button on the GitHub PR page).

## Additional Resources

- [Development Setup Guide](.docs/guides/dev-setup.md) - Complete setup instructions
- [Test Documentation](test/README.md) - Test structure and organization
- [Commands Reference](.docs/guides/commands.md) - All available commands
- [Documentation Guide](.docs/DOCUMENTATION_GUIDE.md) - Documentation standards
- [README.md](README.md) - Project overview

Thank you for contributing to Q Portal!
