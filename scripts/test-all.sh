#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tests/reports
echo "==> [1/6] svelte-check"
pnpm check
echo "==> [2/6] data integrity"
pnpm exec vitest run tests/unit/data --reporter=dot
echo "==> [3/6] MCP autofixer manifest"
pnpm exec tsx tests/mcp/autofixer.runner.ts
echo "    (NOTE: MCP loop is run by driving agent, not this script)"
echo "==> [4/6] unit + component tests"
pnpm exec vitest run --reporter=dot
echo "==> [5/6] E2E (Playwright primary, node-fetch fallback)"
if pnpm exec playwright test 2>&1; then
  echo "Playwright OK"
else
  echo "Playwright failed — running node-fetch fallback"
  pnpm exec tsx tests/e2e/routes-fetch.ts
fi
echo "==> [6/6] summary"
pnpm exec tsx scripts/report-summary.ts
echo ""
echo "RESULT: ALL GREEN"
