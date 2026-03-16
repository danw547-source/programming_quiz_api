# Programming Concepts Quiz

Full-stack quiz application with a FastAPI backend and a React + Vite frontend.

The app serves SOLID-focused quiz questions, validates answers instantly, and returns explanations and score feedback per question.

## Tech Stack

- Python 3.14
- FastAPI + Uvicorn
- Pytest
- React 19 + Vite
- Tailwind CSS
- Axios

## Project Structure

| Path | Purpose |
|---|---|
| `app/` | FastAPI backend (controllers, services, repositories, models) |
| `app/data/questions.json` | Quiz question source data |
| `frontend/` | React + Vite quiz UI |
| `tests/` | Backend unit tests |

## Backend Architecture

The backend follows a layered design to keep responsibilities separated:

| Layer | Responsibility |
|---|---|
| Controllers | HTTP routes and request/response handling |
| Services | Core quiz logic |
| Repositories | Data access abstraction |
| Models | Domain behavior (for example, answer validation) |
| Dependencies | Dependency wiring and singleton service setup |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/questions` | Fetch all quiz questions (without answers) |
| `POST` | `/answer/{question_id}` | Submit selected answer as JSON body |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc |

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
- Question repository abstraction and singleton service wiring
- Immediate answer validation with explanation feedback
- Theme-aware, responsive frontend UX
- Unit tests for core quiz behavior
