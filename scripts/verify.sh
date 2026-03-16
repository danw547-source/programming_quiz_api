#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_EXE="${PYTHON_EXE:-python3}"

cd "$ROOT_DIR"
$PYTHON_EXE -m pytest tests/ -q

cd "$ROOT_DIR/frontend"
npm run lint
npm run test:run
npm run build
