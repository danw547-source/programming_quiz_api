# Beat the Backlog Quiz

A full-stack quiz platform built to showcase production-style engineering decisions, not just UI polish.

This project combines a FastAPI backend, SQLAlchemy + Alembic persistence, and a React + Vite frontend to deliver category-based quiz rounds with immediate feedback, retry flows, and cheat-sheet support.

## Why This Project Exists

This repository is designed as a portfolio artifact for engineering interviews and technical reviews. It emphasizes:

- Clean architecture and separation of concerns
- Testable business logic and API contracts
- Migration discipline and data integrity
- Observable, production-aware HTTP behavior
- A responsive, user-friendly frontend experience

## Architecture At A Glance

Backend layers:

- Controllers: HTTP routing and response modeling
- Services: Core quiz behavior and orchestration
- Repositories: Data access abstractions
- Models: Domain rules and answer checking
- Dependencies: Request-scoped composition

Frontend layers:

- UI components in frontend/src/components
- API client in frontend/src/services/quizService.js
- Theme and category state orchestration in frontend/src/App.jsx

## Notable Features

- Question sets across programming and music theory categories
- Randomized question order per round
- Retry-missed-questions flow
- Cheat sheet dialog scoped to the active question context
- Structured response validation via Pydantic schemas
- Request observability with request IDs
- Built-in rate limiting (default: 120 requests per minute per client)
- CI workflow for backend tests + frontend lint/test/build

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | /question-sets | List available question sets |
| GET | /questions | Fetch questions, optional question_set filter |
| GET | /cheat-sheet | Fetch answer + explanation data for a question set |
| POST | /answer/{question_id} | Submit an answer and receive correctness feedback |
| GET | /docs | Swagger UI |
| GET | /redoc | ReDoc |

Common response headers:

- X-Request-ID
- X-RateLimit-Limit
- X-RateLimit-Remaining
- Retry-After (when rate-limited)

## Data Integrity And Validation Guarantees

Validation is enforced at multiple layers:

- Seed JSON payload validation in app/repositories/json_question_repository.py
- Duplicate question ID detection during seed load
- Required, non-empty text fields for prompts and explanations
- Option list validation (minimum length, no blanks, unique values)
- Answer-must-exist-in-options validation
- Database constraints for non-blank fields and normalized question sets

## Migration Strategy

Migrations are centralized around a JSON-seed model:

- 20260316_0001: base questions table
- 20260316_0002: constraints and indexing
- 20260316_0003: idempotent seed sync from app/data/questions.json
- 20260316_0004 to 20260316_0007: intentional compatibility no-ops

Why keep no-op migrations:

- Preserves historical revision continuity across existing environments
- Avoids rebasing already-shared migration history
- Makes roll-forward paths deterministic for collaborators and CI

## Project Structure

| Path | Purpose |
|---|---|
| app | FastAPI backend code |
| app/data/questions.json | Seed data source |
| alembic | Migration scripts |
| tests | Backend unit and integration tests |
| frontend | React application |
| scripts | One-command dev and verification helpers |
| .github/workflows/ci.yml | Continuous integration pipeline |

## Quick Start

### 1) Clone

```bash
git clone https://github.com/danw547-source/programming_quiz_api.git
cd programming_quiz_api
```

### 2) Install dependencies

Backend:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
cd ..
```

### 3) Start both apps in one command

Windows PowerShell:

```powershell
./scripts/dev.ps1
```

macOS/Linux:

```bash
bash ./scripts/dev.sh
```

Default URLs:

- Backend: http://127.0.0.1:8000
- Frontend: http://127.0.0.1:5173

## Quick Verify (Single Command)

Windows PowerShell:

```powershell
./scripts/verify.ps1
```

macOS/Linux:

```bash
bash ./scripts/verify.sh
```

These run:

- Backend tests
- Frontend lint
- Frontend tests
- Frontend production build

## Environment Variables

Backend variables:

- DATABASE_URL (optional)
- QUESTION_SEED_FILE (optional)
- LOG_LEVEL (optional, default INFO)
- RATE_LIMIT_REQUESTS_PER_MINUTE (optional, default 120)

Frontend variables (frontend/.env*):

- VITE_API_URL (required for deployment)
- VITE_API_TIMEOUT_MS (optional, default 10000)

## Testing

Backend:

```bash
python -m pytest tests/ -q
```

Frontend:

```bash
cd frontend
npm run lint
npm run test:run
npm run build
```

## Deployment Notes

- Frontend production build base path is /quiz (see frontend/vite.config.js)
- Upload frontend/dist contents into /public/quiz on the host
- Keep an SPA rewrite rule file in the deployed /quiz directory

## License

This project is licensed under the MIT License. See LICENSE.
