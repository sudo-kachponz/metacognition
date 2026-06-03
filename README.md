# BCI Speech Decoder Platform — Scaffold v0

> **Status: SCAFFOLD ONLY — NOT FOR CLINICAL USE**
>
> This repository is a development scaffold. The decoder models (EEG-Former, EEG-MAE, Decision Transformer) are referenced as interface contracts only. The EEG ingestion, preprocessing, and inference pipelines are **research-stubs** and must be validated against published benchmarks and a clinical pilot before any patient use.
>
> Regulators: Indonesia Permenkes 24/2022, SATUSEHAT FHIR alignment TBD.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend:** Python 3.11+, FastAPI, PyTorch, InfluxDB client, pylsl
- **Data:** PostgreSQL 16 (metadata), InfluxDB 2.x (time-series EEG)
- **Optional:** Ollama (Qwen3-8B) for the RL reward predictor — commented out by default
- **Deploy:** Docker Compose

## Layout

```
bci-platform/
├── frontend/          Next.js 14 App Router app
│   ├── app/
│   │   ├── page.tsx                 Landing / company profile
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           Protected dashboard shell
│   │   │   ├── page.tsx             Dashboard home
│   │   │   ├── live/page.tsx        Live decoder view
│   │   │   ├── calibration/page.tsx Impedance + calibration
│   │   │   ├── history/page.tsx     Session history
│   │   │   ├── settings/page.tsx
│   │   │   └── session/[sessionId]/page.tsx  Deep link
│   │   └── components/
│   ├── components/ui/                shadcn primitives
│   ├── lib/                          utilities, types
│   └── ...
├── backend/           FastAPI service
│   ├── app/
│   │   ├── main.py                   FastAPI app + routers
│   │   ├── api/                      route handlers
│   │   ├── core/                     config, security
│   │   ├── models/                   Pydantic + decoder registry
│   │   └── services/                 LSL, inference, storage
│   ├── pyproject.toml
│   └── Dockerfile
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Quick start (local dev)

```bash
# 1. Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs

# 3. Full stack
docker compose up -d
```

## Routing

| Path                          | Type     | Notes                                                |
|-------------------------------|----------|------------------------------------------------------|
| `/`                           | Public   | Landing page (Bahasa Indonesia, WCAG AA)             |
| `/dashboard`                  | Protected| Mock token check; replace with real auth (TODO)      |
| `/dashboard/live`             | Protected| Live EEG monitor + decoder selection                 |
| `/dashboard/calibration`      | Protected| Impedance + per-subject calibration                 |
| `/dashboard/history`          | Protected| Past sessions                                        |
| `/dashboard/settings`         | Protected| Patient/operator settings                            |
| `/dashboard/session/[id]`     | Protected| Deep link to a specific session                      |

## What's real vs. stubbed

| Interface                     | Status   | Notes                                                |
|-------------------------------|----------|------------------------------------------------------|
| FastAPI HTTP API              | Real     | Routes + Pydantic schemas                            |
| LSL WebSocket subscription    | Stub     | `services/lsl.py` returns mock frames                |
| Decoder inference             | Stub     | `services/inference.py` returns random logits        |
| Impedance monitoring          | Stub     | No real LiveAmp SDK bound yet                        |
| EEG storage (InfluxDB)        | Real     | Connection + write API, no schema migration yet      |
| Patient metadata (Postgres)   | Real     | SQLAlchemy models + migrations pending               |
| Mobile companion              | Planned  | Folder not generated yet                             |
| SATUSEHAT / FHIR integration  | Planned  | Not in this scaffold                                 |

## License

Apache 2.0 (code) / CC BY 4.0 (docs and datasets).
