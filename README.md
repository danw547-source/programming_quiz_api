# Programming Concepts Quiz

Full-stack quiz application with a FastAPI backend and a React + Vite frontend.

The app serves SOLID-focused quiz questions from a database, validates answers instantly, and returns explanations and score feedback per question.

## Tech Stack

- Python 3.14
- FastAPI + Uvicorn
- SQLAlchemy + SQLite
- Alembic
- Pytest
- React 19 + Vite
- Tailwind CSS
- Axios

## Project Structure

| Path | Purpose |
|---|---|
| `app/` | FastAPI backend (controllers, services, repositories, models) |
| `app/database.py` | SQLAlchemy engine, session, models, and bootstrap logic |
| `alembic/` | Database migration scripts |
| `alembic.ini` | Alembic configuration |
| `app/data/questions.json` | Seed data used to populate an empty database |
| `frontend/` | React + Vite quiz UI |
| `tests/` | Backend unit tests |

## Backend Architecture

The backend follows a layered design to keep responsibilities separated:

| Layer | Responsibility |
|---|---|
| Controllers | HTTP routes and request/response handling |
| Services | Core quiz logic |
| Repositories | Data access abstraction over the database |
| Models | Domain behavior (for example, answer validation) |
| Dependencies | Request-scoped dependency wiring |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/question-sets` | Fetch available quiz question sets |
| `GET` | `/questions` | Fetch quiz questions, optionally filtered by `question_set` |
| `POST` | `/answer/{question_id}` | Submit selected answer as JSON body |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc |

Example filtered questions request:

```http
GET /questions?question_set=solid
```

Example answer request body:

```json
{
	"answer": "Single Responsibility Principle"
}
```

## Local Development

### 1) Clone

```bash
git clone https://github.com/danw547-source/programming_quiz_api.git
cd programming_quiz_api
```

### 2) Backend setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

On first startup, the API runs Alembic migrations and seeds `quiz.db` from `app/data/questions.json` if the database is empty.

## Database Migrations

From the repository root:

```bash
alembic upgrade head
```

Create a new migration:

```bash
alembic revision -m "describe change"
```

Apply one rollback step:

```bash
alembic downgrade -1
```

### 3) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

## Environment Variables

Frontend API configuration lives under `frontend/`:

- `.env` for local development
- `.env.production` for production builds
- `.env.production.example` as the tracked template

Key variables:

- `DATABASE_URL` (optional): SQLAlchemy connection string. Defaults to a local SQLite database.
- `QUESTION_SEED_FILE` (optional): path to the JSON seed file used when bootstrapping an empty database.
- `VITE_API_URL` (required): backend base URL
- `VITE_API_TIMEOUT_MS` (optional): request timeout in milliseconds (defaults to `10000`)

## Testing

Run backend tests from the repository root:

```bash
pytest tests/ -v
```

## Deployment Notes

- Frontend production build is configured for `/quiz/` in `frontend/vite.config.js`.
- Upload the contents of `frontend/dist/` into `/public/quiz/` on your host.
- Keep `.htaccess` in `/public/quiz/` so SPA routing resolves correctly on refresh/direct URLs.
- Current production frontend is configured to call Render-hosted backend via `VITE_API_URL`.

## Repository Highlights

- FastAPI API with clean separation of concerns
- Database-backed question repository with `question_set` support
- Alembic-managed schema with constraints and a `question_set,id` composite index
- Immediate answer validation with explanation feedback
- Theme-aware, responsive frontend UX
- Unit tests for core quiz behavior
