#!/bin/bash

# Kill any process running on port 9999 (in case of previous test run)
echo "Killing any process on port 9999..."
lsof -ti:9999 | xargs kill -9 2>/dev/null || true

# Start the dev server on port 9999 for E2E tests
# Playwright's webServer will automatically kill this process when tests complete
echo "Starting dev server on port 9999 for E2E tests..."
PORT=9999 bun run dev

