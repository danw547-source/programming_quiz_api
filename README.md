# Programming Concepts Quiz API

A REST API built with FastAPI that serves programming quiz questions and validates answers.

## Tech Stack

- **Python 3.14**
- **FastAPI** — REST API framework
- **Uvicorn** — ASGI server
- **Pytest** — unit testing

## Architecture

This project follows an MVC-style layered architecture that enforces separation of concerns:

| Layer | Responsibility |
|---|---|
| Controllers | Handle HTTP requests and routing |
| Services | Business logic |
| Repositories | Data access |
| Models | Domain objects |
| Dependencies | Dependency injection |

## Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/questions` | Fetch all quiz questions |
| `POST` | `/answer/{question_id}` | Submit an answer for a question |
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/redoc` | ReDoc API documentation |

## Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/danw547-source/programming_quiz_api.git
cd programming_quiz_api
```

**2. Create and activate a virtual environment**
```bash
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run the server**
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Running Tests

```bash
pytest tests/ -v
```

## What This Project Demonstrates

- Python backend development
- FastAPI REST APIs
- MVC-style architecture
- SOLID principles
- Repository pattern
- Dependency injection
- Unit testing
