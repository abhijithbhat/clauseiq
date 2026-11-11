# ClauseIQ (v0.1 Prototype)

ClauseIQ helps Indian health insurance policyholders review claim repudiations and short-payments with deterministic statutory rule checks (IRDAI Master Circular 2024, Insurance Act Section 45, Insurance Ombudsman Rules 2017) and verbatim, verified clause citations.

> **Disclaimer:** ClauseIQ is an assistive tool and does not provide legal advice. It cannot guarantee any outcome. Please review everything and file it yourself.

---

## Setup, Testing, and Deployment (8 Steps)

### 1. Clone and configure environment variables
```bash
git clone <your-repo-url> && cd clauseiq
cp .env.example .env
```
Edit `.env` to set `GEMINI_API_KEY` (leave `CORS_ORIGINS` unset or include `http://localhost:8080`):
- `LLM_PROVIDER`: `gemini` (default)
- `GEMINI_API_KEY`: Gemini API key for live document extraction and drafting
- `LLM_MODEL_EXTRACT` / `LLM_MODEL_WRITE`: defaults to `gemini-2.5-flash`
- `DATABASE_URL`: defaults to `sqlite:///./clauseiq.db`
- `MAX_UPLOAD_MB`: max upload size per PDF in MB (`10`)
- `DELETE_UPLOADS`: delete raw uploads immediately after parsing (`true`)
- `CORS_ORIGINS`: comma-separated allowed origins (defaults to `localhost:5173,localhost:8080,127.0.0.1:8080,127.0.0.1:5173`)
- `DEMO_MODE`: serve cached/demo analysis without LLM calls (`false`)
- `VITE_API_BASE_URL` *(frontend)*: defaults to `http://localhost:8000`

### 2. Option A — One-command local startup with Docker
```bash
docker-compose up --build   # or: docker compose up --build
```
- Backend API: `http://localhost:8000` (`GET /health`)
- Frontend UI: `http://localhost:8080`

### 3. Option B — Local backend setup (without Docker)
Install Tesseract OCR (`brew install tesseract` on macOS, or `sudo apt-get install tesseract-ocr` on Debian/Ubuntu), then create a Python virtual environment:
```bash
python3 -m venv venv
./venv/bin/pip install -r backend/requirements.txt
./venv/bin/python -m uvicorn backend.app.main:app --reload --port 8000
```

### 4. Option B — Local frontend setup (without Docker)
```bash
cd frontend
bun install --frozen-lockfile   # or: npm install
npm run dev
```
Open `http://localhost:8080`. Offline demo cases run locally in the UI even when the backend is offline.

### 5. Run backend tests
```bash
./venv/bin/python -m pytest backend/tests
```

### 6. Run frontend tests, typecheck, and build
```bash
cd frontend
npm test
./node_modules/.bin/tsc --noEmit
npm run build
```

### 7. Deploy backend on Render (Free Tier Docker)
1. Create a **Web Service** in Render connected to this repository with **Runtime: Docker** (uses root `Dockerfile`, which installs `tesseract-ocr` and binds `${PORT:-8000}`).
2. Set `GEMINI_API_KEY`, `DELETE_UPLOADS=true`, and `CORS_ORIGINS=<your-frontend-url>` in Render environment variables, and set the health check path to `/health`.

### 8. Deploy frontend on Cloudflare
1. Set `VITE_API_BASE_URL` to your deployed Render backend URL.
2. Build in `frontend/` with `npm run build` (generates `.output/public` and `.output/server` with `wrangler.json`).
3. Deploy via Cloudflare Workers/Pages (`cd frontend && npx wrangler deploy` or connect GitHub with build command `npm run build` and root directory `frontend`).
