# Agents (Repo Workflow)

This file is for humans and coding agents working in this repo. It describes **how to make changes safely**, how to run the app, and the project conventions that matter most.

## Repo structure

- `frontend/`: Next.js (App Router) + Tailwind + shadcn/ui.
- `backend/`: FastAPI app.
- Root `package.json`: pnpm workspaces orchestrating common scripts.

## Common commands (pnpm workspaces)

- **Install**: `pnpm install`
- **Dev (both)**: `pnpm dev`
  - Note: this runs backend and frontend concurrently (see root `package.json`).
- **Dev (frontend only)**: `pnpm dev:frontend`
- **Dev (backend only)**: `pnpm dev:backend`
- **Lint**: `pnpm lint`
- **Build**: `pnpm build`

## Frontend conventions

### UI / styling

- Follow `design_guidelines.md` and the existing style docs:
  - `billion_dollar_design.md`, `prepstyle.md`, `cardstyle.md`, `badgestyle.md`, `gradientcardstyle.md`
- Prefer **semantic Tailwind tokens** (`bg-background`, `text-foreground`, `border-border`) over hardcoded grays/whites.
- Use shadcn/ui components first; override with `className` only when needed.

### OpenAPI generated types (important)

This repo uses OpenAPI-generated types to keep frontend/backend contracts aligned.

- **Generated file (do not edit)**: `frontend/lib/types/api.generated.ts`
- **Re-exports/extensions**: `frontend/lib/types/index.ts`

When backend APIs change:

1. Start the backend so `http://localhost:8000/openapi.json` is available.
2. Generate types:
   - `pnpm --filter frontend generate:api-types`
3. Update frontend code to use the generated types (avoid duplicating schema types by hand).

## Backend conventions

- FastAPI + Pydantic models.
- Keep API behavior explicit and type-safe; validate inputs and return structured errors.
- If you add/modify routes, confirm they appear in the OpenAPI schema and then regenerate frontend types as above.

## Change management guidelines (for agents)

- **Build incrementally**: small diffs that are easy to review; avoid large refactors unless requested.
- **Don’t delete code** unless explicitly asked; prefer deprecating or leaving compatibility paths.
- **Avoid “trivial comments”**: comments should add information not obvious from the code.
- **Testing/lint**: run `pnpm lint` after meaningful frontend changes; run a narrow check when possible.

## Git workflow expectations (for agents)

- Commit in small logical units with descriptive messages.
- Push to the current working branch (don’t switch branches unless instructed).

