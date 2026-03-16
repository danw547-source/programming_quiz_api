# Contributing

Thanks for contributing.

## Setup

1. Create and activate a Python virtual environment.
2. Install backend dependencies with pip install -r requirements.txt.
3. Install frontend dependencies in frontend with npm install.

## Development Workflow

1. Create a feature branch from main.
2. Keep commits focused and descriptive.
3. Add or update tests for behavior changes.
4. Run local checks before opening a pull request.

## Required Local Checks

Backend:

- python -m pytest tests/ -q

Frontend:

- npm run lint
- npm run test:run
- npm run build

## Pull Request Expectations

- Describe the change and why it is needed.
- Include screenshots or GIFs for UI changes.
- Note any migration or environment variable changes.
- Ensure CI is green before merge.
