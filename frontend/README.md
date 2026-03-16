# Frontend (React + Vite)

Quiz UI for the Programming Concepts Quiz project.

This app loads available question sets and questions from the FastAPI backend, lets users switch sets, submits answers, and shows instant correctness + explanation feedback.

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - build production assets into `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Environment Variables

Create env files in this folder (`frontend/`):

- `.env` for local development
- `.env.production` for production builds
- `.env.production.example` as reference template

Supported variables:

- `VITE_API_URL` (required)
	- Example local value: `http://127.0.0.1:8000`
	- Example production value: `https://programming-quiz-api.onrender.com`
- `VITE_API_TIMEOUT_MS` (optional)
	- Default is `10000`
	- Controls how long the UI waits before showing a timeout error

## Local Development

From the `frontend/` directory:

```bash
npm install
npm run dev
```

The dev server runs on `http://127.0.0.1:5173`.

## Production Build

```bash
npm run build
```

Important: `vite.config.js` is configured to use `/quiz/` as the production base path.

## Deploying to IONOS `/quiz`

1. Build with `npm run build`
2. Upload the contents of `dist/` (not the `dist` folder itself) into `/public/quiz/`
3. Ensure `/public/quiz/.htaccess` exists for SPA rewrites
4. Hard refresh the browser after upload

Expected deployed structure:

- `/public/quiz/index.html`
- `/public/quiz/assets/...`
- `/public/quiz/.htaccess`

## Troubleshooting

- If you see an endless loader, confirm `VITE_API_URL` points to a live backend and rebuild/re-upload.
- Error banners now include the exact endpoint URL and HTTP status to speed up debugging.
- A browser extension error in DevTools console can be unrelated to this app; verify failed network requests in the Network tab.
