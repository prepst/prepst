# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAT Prep ("Prep St") — a full-stack SAT test preparation platform. pnpm monorepo with two workspaces: `frontend` (Next.js 16 + React 19) and `backend` (Python FastAPI + Supabase).

## Commands

```bash
# Development (runs both frontend and backend)
pnpm dev

# Run individually
pnpm dev:frontend          # Next.js on :3000 (uses Turbopack)
pnpm dev:backend           # FastAPI on :8000 (uvicorn with --reload, uses backend/venv)

# Build & lint
pnpm build
pnpm lint

# Generate OpenAPI types (backend must be running on :8000)
pnpm --filter frontend generate:api-types
```

## Code Style Rules

- Don't make trivial comments
- Build incrementally — don't make big changes all at once
- Don't remove code unless specifically asked
- If instructions conflict or you're unsure, ask for clarification

## Architecture

### Frontend (`frontend/`)
- **Framework**: Next.js 16 with App Router, Turbopack, React 19
- **UI**: shadcn/ui (new-york style) + Tailwind CSS v4 + Radix primitives + Lucide icons. Additional registry: `@magicui`
- **State/Data**: TanStack React Query for server state, React Context for auth/theme/onboarding
- **Auth**: Supabase Auth (email/password, Google OAuth, OTP verification) via `contexts/AuthContext.tsx`
- **API Client**: `lib/api.ts` — centralized fetch wrapper that auto-attaches Supabase Bearer tokens. All API calls go through `api.get()`, `api.post()`, `api.patch()`, `api.delete()` or named methods
- **React Query hooks**: `hooks/queries/` for data fetching, `hooks/mutations/` for mutations. Import from their respective `index.ts` barrel files
- **Types**: Auto-generated from backend OpenAPI schema at `lib/types/api.generated.ts` (DO NOT EDIT). Re-exported via `lib/types/index.ts`. Use `components["schemas"]["TypeName"]` pattern for accessing generated types
- **Key routes**: `/dashboard`, `/practice`, `/study-plan`, `/mock-exam`, `/diagnostic-test`, `/admin`, `/onboard`, `/login`, `/signup`

### Backend (`backend/`)
- **Framework**: FastAPI with Pydantic v2 models, uvicorn server
- **Database**: Supabase (Postgres) via `supabase-py` client. DB client from `app/db.py` → `get_db()` dependency
- **Config**: `pydantic-settings` with `.env` file support (`app/config.py`)
- **Structure**:
  - `app/api/` — FastAPI route modules (auth, study_plans, practice_sessions, mock_exams, analytics, diagnostic_test, admin_questions, questions, vocabulary, ai_feedback, manim, webhooks)
  - `app/models/` — Pydantic request/response schemas
  - `app/services/` — Business logic (OpenAI integration, BKT mastery tracking, analytics, predictions, streaks, achievements)
- **All routes** are mounted under `/api` prefix in `app/main.py`
- **AI**: OpenAI API (`gpt-4o-mini` default) for feedback, chat, answer validation
- **Manim**: Video generation service, can run locally or proxy to Railway via Modal

### Engine (`engine/`)
- Standalone Python analytics/prediction engine with BKT (Bayesian Knowledge Tracing), cognition, velocity, and prediction engines
- Has its own API layer (`engine/api/`) separate from the main backend

## OpenAPI Types Workflow

When backend models change:
1. Ensure backend is running locally (`pnpm dev:backend`)
2. Run `pnpm --filter frontend generate:api-types`
3. Update re-exports in `frontend/lib/types/index.ts` if needed
4. Use generated types in frontend — never duplicate type definitions that exist in `api.generated.ts`

## Environment Variables

**Frontend** (NEXT_PUBLIC_*): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Backend** (.env): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `CORS_ORIGINS`, `DISCORD_WEBHOOK_URL`, `MANIM_SERVICE_URL`
