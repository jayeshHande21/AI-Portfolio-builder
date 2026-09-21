# Installation Notes

Initial setup for **FotoOwl Portfolio Builder** (Phase 1 foundation).

## Runtime

| Requirement | Installed / verified |
|---|---|
| Node.js 20+ | Node `v24.16.0` |
| Package manager | npm |
| Scaffold | Vite + React + TypeScript (not CRA) |

## Dependencies installed

### Runtime

- `react` / `react-dom`
- `@puckeditor/core@0.23.0` — Canvas / editor foundation (replaceable via adapter)
- `zustand` — editor / portfolio runtime state
- `zod` — Blueprint + patch validation (strict TypeScript enabled)
- `lucide-react` — editor icons

### Dev

- `vitest` — unit tests (ready; no component tests yet)
- TypeScript, Vite, `@vitejs/plugin-react`, oxlint

## Explicitly NOT installed

Per architecture constraints, deferred until their phase:

- `@dnd-kit/react` (only if Puck DnD is insufficient)
- Next.js
- `@puckeditor/plugin-ai` / `@puckeditor/cloud-client`
- GSAP, Three.js
- AWS SDK, Redis / PostgreSQL clients
- Playwright
- Tailwind / other UI frameworks
- React Testing Library (add when component tests begin)

## Architecture constraints

```text
Portfolio Blueprint  →  Puck Adapter  →  Puck  →  React Canvas
```

- Blueprint is the source of truth (independent of Puck, AI models, S3, build).
- Puck is editor-only; AI is our own Orchestrator / Section / Style / Code stack.
- Canvas is independent of AI implementation, deployment, and database.

## TypeScript

`tsconfig.app.json` has `"strict": true` (required for Zod) plus `noUncheckedIndexedAccess`.

## Folder structure

See `src/` — canvas, blueprint, components, editor, themes, ai, assets, styles.
Puck adapter stub: `src/canvas/puck/adapter.ts`.

## Commands

```bash
cd fotoowl-portfolio-builder
cp .env.example .env   # then set OPENAI_API_KEY for real Section AI
npm run dev            # Vite + /api/ai/section LLM middleware
npm run build          # typecheck + production build
npm run test           # vitest
npm run lint           # oxlint
```

### Section AI (real LLM)

1. Copy `.env.example` → `.env`
2. Set `OPENAI_API_KEY` (OpenAI or any OpenAI-compatible provider via `OPENAI_BASE_URL` / `OPENAI_MODEL`)
3. Restart `npm run dev`
4. Select a section → sparkles → free-form prompt (e.g. “use a red background”)

Without a key, the app falls back to the local keyword planner.
LLM keys are server-only — never use a `VITE_` prefix for secrets.

### V2 Code AI (custom React components)

1. Select a section → sparkles
2. Click **Generate a brand-new custom component** (or type that phrase)
3. Code AI generates TSX + CSS → sandbox validate → register `custom.*` → replace section on Canvas

Works without an API key via a local template; with `OPENAI_API_KEY` the LLM designs the component.
Generated code cannot use fetch/eval/non-react imports.

## Next: first POC

```text
Sample Theme → Blueprint → Zod → Registry → Puck Adapter → Puck → Canvas
```

Sections: Hero · About · Gallery · Footer. No AI / S3 yet.
