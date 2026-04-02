# Frontend (React + Vite)

UI layer for the Beat the Backlog Quiz application.

It fetches question sets and questions from the FastAPI backend, supports category switching, handles answer submission, and renders instant correctness + explanation feedback.

## Scripts

- npm run dev: start local dev server
- npm run lint: run ESLint
- npm run test: run Vitest in watch mode
- npm run test:run: run Vitest once for CI and verification
- npm run build: produce production assets in dist
- npm run preview: preview a production build locally

## Environment Variables

Create env files inside frontend:

- .env (local development)
- .env.production (production build)
- .env.production.example (template)

Variables:

- VITE_API_URL (required for deployment)
- VITE_API_TIMEOUT_MS (optional, default 10000)

## Local Development

```bash
npm install
npm run dev
```

Default URL: http://127.0.0.1:5173

## Frontend Verification

```bash
npm run lint
npm run test:run
npm run build
```

## Deployment Notes

- Build base path is /quiz in vite.config.js
- Use `npm run build:deploy` to produce a zip for website delivery (default: `frontend/../dist-deploy.zip`)
- Preferred: upload and extract `dist-deploy.zip` into /public/quiz
- Fallback: upload dist contents (not the dist folder itself) into /public/quiz
- Keep an SPA rewrite rule file in /public/quiz for deep-link refresh support
- Use `npm run build:deploy:local` to keep zip in `frontend/dist-deploy.zip`

## Troubleshooting

- If the app loads forever, verify VITE_API_URL points to a reachable backend
- If console errors mention browser extensions, verify network failures in DevTools Network tab before debugging app code
