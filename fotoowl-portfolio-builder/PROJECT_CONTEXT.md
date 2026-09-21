# FotoOwl AI Portfolio Builder — Master Project Context

> Single source of product and architecture context for the FotoOwl photographer portfolio builder.
> Keep this document updated as decisions change. Implementation order is defined in §40.

---

## 1. Project Overview

We are building an **AI-powered portfolio builder for photographers** inside FotoOwl.

Photographers create and customize a professional portfolio in two ways:

### Flow A — Start with a predefined theme

FotoOwl provides approximately **30–40 predefined portfolio themes**.

The user selects a theme and immediately gets a working portfolio in the Canvas, then can:

- edit content manually
- rearrange sections/components
- change styles/layout
- edit a specific section using AI
- replace a section using AI
- add a new section using AI
- later use full-portfolio AI for broader changes

### Flow B — Build the entire portfolio with AI

The user starts with a chat and describes what portfolio they want.

Example:

> "Create a premium wedding photography portfolio with a cinematic hero, editorial typography, a masonry gallery, testimonials, and a simple contact section."

The AI plans and generates the portfolio structure and sends it to the Canvas.

---

## 2. The Most Important Architectural Principle

There is **one Portfolio Blueprint**.

It is the **single source of truth** for the portfolio.

Everything works around this same Blueprint:

```text
Theme
   ↓
Portfolio Blueprint

Manual Editing
   ↓
Portfolio Blueprint

Section AI
   ↓
Portfolio Blueprint

Full Portfolio AI
   ↓
Portfolio Blueprint

Portfolio Blueprint
   ↓
React Canvas
   ↓
Production Build
```

Do **not** create separate data models for:

- themes
- AI-generated portfolios
- Canvas
- manual editing
- published websites

They must all ultimately use the same Portfolio Blueprint.

---

## 3. Product Philosophy

The system should be:

**Flexible in design, controlled in execution.**

We allow the AI to create arbitrary portfolio structures, but the result must:

1. be relevant to a photographer/photography portfolio
2. use supported rendering capabilities
3. follow our technical and security rules

We do **not** want a generic "AI can build any software application" system.

- The AI can create new portfolio structures.
- It cannot freely create arbitrary backend applications or execute uncontrolled production JavaScript.

---

## 4. Two AI Workflows

### 4.1 Flow A — Theme + Section AI

```text
User
 ↓
Select Theme 12
 ↓
Portfolio Blueprint
 ↓
Canvas
```

User clicks About → Edit with AI:

> "Make this About section more premium and put the image on the left."

```text
Selected Section
 ↓
Section AI
 ↓
Section Patch
 ↓
Validate
 ↓
Update Portfolio Blueprint
 ↓
Canvas Update
```

**Section AI can:**

- modify an existing section
- replace an existing section
- add / remove elements/components
- change layout, typography/style, animation
- create a completely new section structure

Example:

> "Create a completely new About section with a large portrait, story text, awards and a CTA."

Supported in V1 through **arbitrary composition of supported primitives/components**.

The AI does **not** have to generate a brand-new React component for every new section.

### 4.2 Flow B — Full Portfolio AI

```text
User Request
 ↓
Orchestrator / Router
 ↓
Style AI
 ↓
Code AI where required
 ↓
Portfolio Blueprint
 ↓
Canvas
```

Example: `"Build me a luxury wedding portfolio"`

AI decides sections (Hero, About, Featured Work, Gallery, Testimonials, Services, Contact, Footer) plus layout, styles, content, and configuration. The Canvas renders the resulting Blueprint.

---

## 5. Difference Between the Two AI Flows

| | Section AI | Full Portfolio AI |
|---|---|---|
| **Scope** | One section | Entire portfolio |
| **Path** | Selected Section → Section AI → Section Patch | Entire Portfolio → Orchestrator → Style + Code → Blueprint |

Different workflows, **same** Blueprint system. Both modify the same Portfolio Blueprint.

---

## 6. AI Architecture

```text
                         USER REQUEST
                              │
                              ▼
                    ┌──────────────────┐
                    │   ORCHESTRATOR   │
                    │    / ROUTER      │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
            SECTION AI    STYLE AI      CODE AI
                                            │
                                            ▼
                                      Repair AI
                             │
                             ▼
                     PORTFOLIO BLUEPRINT
```

Also:

```text
Rendered Portfolio → Visual QA AI
Build Error → Repair AI → Code Patch
```

---

## 7. AI vs Normal Software

Do **not** turn every stage into an AI agent.

### AI responsibilities

- intent understanding, routing
- design / layout / content decisions
- component selection, structured composition
- code generation when required
- error interpretation, visual review

### Application responsibilities

- state, Blueprint storage, validation, rendering
- drag/drop, undo/redo
- build execution, dependency handling
- versioning, publishing, S3 deployment
- security, authentication, rate limiting

### Important rule

**Build/compile is not an AI operation.** It is a deterministic Build Worker. AI is used only when a build error needs diagnosis or repair.

---

## 8. Canvas Architecture

| Concern | Direction |
|---|---|
| Editor | React + TypeScript |
| Build tool | Vite |
| Visual editor foundation | Puck (initial POC) |
| State management | Zustand |
| Schema validation | Zod |
| Canvas isolation | iframe |
| Drag/drop | Puck first; evaluate `@dnd-kit/react` only if needed |

Do not introduce multiple editor/drag-drop systems without a concrete reason.

---

## 9. Important Puck Rule

Puck is an **editor framework**, not the application's source of truth.

Source of truth remains: **Portfolio Blueprint**

```text
Portfolio Blueprint
       ↓
Puck / Editor Layer
       ↓
React Components
       ↓
Canvas
```

- Do not redesign architecture around Puck's internal data model.
- Create an adapter/mapping layer if required.
- Editor framework must remain replaceable.

---

## 10. Why React

The Canvas needs selection, state, drag/drop, undo/redo, responsive previews, AI updates, component hierarchy, and interactive controls.

- **Do** use React + TypeScript for the editor.
- **Do not** build the main editor in vanilla HTML/CSS/JS.
- Published portfolios can still ship as static artifacts via Vite production build → S3.

---

## 11. Portfolio Blueprint

Central structured representation. Hierarchy:

```text
Portfolio
   ↓
Page
   ↓
Section
   ↓
Container / Layout
   ↓
Node
```

A Node can be a primitive, reusable component, nested container, or custom structured composition.

---

## 12. Node Model

```text
Node
├── id
├── type
├── component
├── props
├── layout
├── styles
├── animation
├── responsive
├── children
└── metadata
```

Not every node needs every field.

### Field meanings

| Field | Purpose |
|---|---|
| **id** | Stable identity (`about_01`, `hero_01`). Must remain stable when nodes move. |
| **type** | Category: `section`, `container`, `heading`, `text`, `image`, `video`, `button`, `component` |
| **component** | Optional registry id: `gallery.masonry`, `hero.editorial` |
| **props** | Content/config (JSON). Do **not** store raw HTML as primary content. |
| **layout** | `display`, `columns`, `rows`, `gap`, `alignment`, `direction`, `width`, `position` |
| **styles** | colors, background, typography, border, radius, shadow, opacity |
| **animation** | Structured: type, duration, trigger, direction |
| **responsive** | Device overrides: desktop / tablet / mobile (base + overrides, not full duplication) |
| **children** | Nested nodes |
| **metadata** | System-level info only — not temporary editor state |

---

## 13. Editor State vs Portfolio State

These are different. Do not mix them.

**Portfolio State** (persistent / publishable): sections, content, styles, layout, assets, responsive config, components.

**Editor State** (temporary / runtime): `selectedNode`, `hoveredNode`, `draggedNode`, `viewport`, `zoom`, `activePanel`, `chatOpen`.

---

## 14. Component Strategy

### Level 1 — Predefined components (V1 foundation)

FotoOwl-created and tested: Hero, About, Gallery, Testimonials, Services, Contact, Footer.

### Level 2 — Arbitrary composition (V1)

AI creates new structures by combining existing primitives/components.

### Level 3 — Custom AI-generated React component (primarily V2)

Code AI → Generate component → Build Sandbox → Validation → Canvas.

Do not make custom React code generation necessary for normal V1 editing.

---

## 15. V1 vs V2

### V1 — Implement now

- 30–40 Themes
- React Canvas + Portfolio Blueprint + Component Registry
- Section AI + Full Portfolio AI
- Arbitrary structured composition
- Manual editing, responsive layout, undo/redo
- Controlled animations

A user can create a completely new About section in V1 via composition of supported primitives/components.

### V2 — Later

- AI-generated React components
- Advanced custom interactions / animation generation
- Controlled custom libraries
- More advanced code generation

### Later / controlled runtime

AI-generated custom runtime HTML/CSS/JS only via sandboxed/controlled build. **Not** default V1 architecture.

---

## 16. Component Registry

Maps Blueprint component definitions to React implementations:

```text
Blueprint → hero.editorial → Component Registry → EditorialHero
```

Example families: Hero (Fullscreen / Split / Editorial / Centered), About (Image Left / Right / Centered), Gallery (Grid / Masonry / Editorial / Collage), Footer (Minimal / Large / Editorial).

Registry must be extendable.

---

## 17. Manual Editing, AI Editing & Patch System

Both use the **same mutation system**:

```text
Manual Edit ─────┐
                 ├──→ Patch → Blueprint
Section AI ──────┤
Full AI ─────────┘
```

Supported operations: `add`, `update`, `delete`, `move`, `reorder`, `replace`.

```text
Request → Patch → Validate → Apply → Blueprint → Canvas
```

Invalid patches must be rejected.

---

## 18. Canvas Behaviour

```text
Portfolio Blueprint → Component Registry → React Renderer → Canvas iframe
```

The DOM is **not** the source of truth. The Blueprint is.

Support:

- **Selection** → `selectedNodeId` → Controls / Section AI
- **Drag & Drop** → Blueprint tree via patches
- **Responsive view** → Desktop / Tablet / Mobile
- **Undo / Redo** → same patch/state system
- **Manual + AI editing** → both update Blueprint

### Do not build a Figma-style freeform canvas in V1

Prefer Section → Container → Grid/Flex → Components over unlimited absolute positioning. Goal: responsive websites.

---

## 19. Theme System

Themes are reusable starting configurations:

```text
Theme 12 → Initial Portfolio Blueprint → User Customization → Current Portfolio Blueprint
```

A user's customized portfolio must **not** mutate the original theme. The theme is the starting point; the portfolio becomes its own state.

---

## 20. Assets

Reference by IDs (`asset_102`), not duplicated image data in the Blueprint.

```text
Portfolio
├── Assets (asset_102, asset_103, …)
└── Sections → Gallery references asset IDs
```

Asset metadata is separate from visual layout definitions.

---

## 21. Responsive Design & Animation

**Responsive:** base config + overrides (do not duplicate the whole tree per device).

```json
{
  "layout": { "columns": 3 },
  "responsive": {
    "mobile": { "layout": { "columns": 1 } }
  }
}
```

**Animation:** structured + controlled registry for V1:

```text
animation:
  type: fade-up
  duration: medium
  trigger: scroll
```

---

## 22. Build, Publish & QA

Editing happens in **draft**. Do **not** build/upload to S3 after every Canvas change.

```text
Draft Blueprint → Canvas → User edits → Preview → Finalize / Publish
  → Build Worker → Production Artifact → S3
```

Build is deterministic. On error: Build Error → Repair AI → Code Patch → Build again (limited attempts).

### Deterministic QA

Blueprint validation, type checking, linting, build validation, asset validation, broken references.

### Visual QA

Production render → Screenshot → Visual QA AI → layout / spacing / responsive check.

CloudFront can sit in front of S3 for delivery.

---

## 23. Backend Direction

Compatible with existing FotoOwl backend:

```text
Python · FastAPI · Pydantic · PostgreSQL · Redis
```

Responsibilities: Blueprint/theme persistence, portfolio APIs, versioning, AI orchestration & patches, build/publish jobs, asset metadata.

**Never** put LLM API keys or model credentials in the React client. Frontend talks to backend via APIs.

---

## 24. Suggested Repository Structure

```text
fotoowl-portfolio-builder/
├── src/
│   ├── app/           # routes, providers
│   ├── canvas/        # Canvas, iframe, selection, viewport, drag-drop
│   ├── blueprint/     # types, schema, validator, patches, utils
│   ├── components/    # registry, primitives, hero, about, gallery, …
│   ├── editor/        # state, history, commands
│   ├── themes/        # theme-01.ts, …
│   ├── ai/            # api, types, adapters
│   ├── assets/
│   └── styles/
├── public/
├── tests/
├── package.json
└── tsconfig.json
```

---

## 25. Initial Dependencies

```text
React · TypeScript · Vite · Zustand · Zod · @puckeditor/core · lucide-react · Vitest
```

Do not add libraries unless a real requirement appears. DnD: test Puck first; evaluate `@dnd-kit/react` later if needed.

### Technology decisions

| Tech | Why |
|---|---|
| React | Interactive editor + component system |
| TypeScript | Type safety across Blueprint / components / editor |
| Vite | Lightweight editor + static production output |
| Puck | Initial visual-editor foundation (replaceable via adapter) |
| Zustand | Lightweight editor/application state |
| Zod | Runtime validation of Blueprint and patches |
| Python + FastAPI | AI/backend orchestration |
| PostgreSQL | Persistent portfolio/theme/version data |
| Redis | Async AI/build/publish jobs |
| S3 | Production artifacts |
| Playwright | Browser rendering, responsive checks, screenshots |

---

## 26. What We Are NOT Building in V1

- Unlimited arbitrary runtime JavaScript
- Full Figma-style freeform editor
- Unlimited third-party npm packages
- AI-generated backend applications
- Complex multi-page website builder (unless required)
- Custom component marketplace
- Voice editing / Image-to-website
- Advanced code sandbox exposed directly to users

---

## 27. Security Principle

Never allow AI-generated code to run with unrestricted access to the main application environment.

```text
AI-generated code → Isolated Build Sandbox → Validation → Production Artifact
```

Restrict: network, filesystem, dependencies, execution time, CPU, memory.

---

## 28. First Implementation Target

Do **not** start with the full AI system. Prove the core Canvas architecture first:

```text
Theme JSON → Portfolio Blueprint → Zod Validation → Component Registry → Puck → React Canvas
```

Sample theme only: **Hero · About · Gallery · Footer**

Then prove in order:

1. Select section → Change section → Blueprint changes → Canvas updates
2. Add new section → Blueprint changes → Canvas updates
3. Undo / Redo
4. Responsive view

Only after this works: AI integration.

---

## 29. Recommended Implementation Sequence

| Phase | Focus |
|---|---|
| **1** | Project setup — React + TypeScript + Vite — Puck POC |
| **2** | Portfolio Blueprint — Types — Zod Schema — Sample Theme |
| **3** | Component Registry — Hero, About, Gallery, Footer |
| **4** | Canvas — Render Blueprint — Selection — Basic Editing |
| **5** | Patch System — Update / Add / Delete / Move / Reorder |
| **6** | Editor State — Undo / Redo — Responsive View |
| **7** | Theme System — 30–40 Themes |
| **8** | Section AI — Prompt → Structured Patch → Canvas |
| **9** | Full Portfolio AI — Orchestrator — Style AI — Code AI |
| **10** | Build — QA — Publish — S3 |

---

## 30. Definition of Success

Architecture is correct when this full flow works:

```text
Select Theme → Canvas → Select About → Section AI
  → "Create a completely new About section"
  → Structured composition → Blueprint Patch → Canvas updates
  → Manual Gallery edit → Blueprint updates → Undo → Redo
  → Full AI: "Make the entire portfolio more premium"
  → Orchestrator → Style / Code → Blueprint → Canvas
  → Publish → Build → QA → S3
```

---

## 31. Final Architecture Diagram

```text
                              USER
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
             SELECT THEME                BUILD WITH AI
                  │                           │
             30–40 Themes                 AI Chat
                  │                           │
                  └─────────────┬─────────────┘
                                ▼
                       PORTFOLIO BLUEPRINT
                                │
                         ┌──────┴──────┐
                         │             │
                    Section AI      Full AI
                         │             │
                         │        Orchestrator
                         │             │
                         │       Style + Code
                         │             │
                         └──────┬──────┘
                                ▼
                         UPDATED BLUEPRINT
                                │
                                ▼
                       COMPONENT REGISTRY
                                │
                                ▼
                         REACT CANVAS
                                │
                                ▼
                              DRAFT
                                │
                          Preview / Edit
                                │
                             Publish
                                │
                                ▼
                          BUILD WORKER
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              Deterministic QA         Repair AI
                    │
                    ▼
                 Visual QA
                    │
                    ▼
             Production Artifact
                    │
                    ▼
                    S3
```

---

## 32. Final Principles

1. **One Portfolio Blueprint is the source of truth.**
2. Theme selection, manual editing, Section AI and Full AI all modify that same Blueprint.
3. React is the editor/rendering foundation.
4. Puck is an editor foundation, not the source of truth.
5. Use predefined components heavily; allow arbitrary structured composition.
6. V1: new sections via composition; custom AI React components primarily V2.
7. Do not use unrestricted runtime HTML/JS as the default architecture.
8. AI generates decisions/structures/patches; normal software executes and validates them.
9. Manual and AI editing use the same patch/state system.
10. Draft editing is separate from production publishing.
11. Production code is built in a controlled environment.
12. Do not over-engineer future functionality before the Canvas + Blueprint vertical slice works.

---

## 33. Immediate Next Steps (for Cursor / implementation)

Before writing large amounts of code:

1. Inspect the repository.
2. Confirm / set up React + Vite + TypeScript.
3. Create initial Blueprint types and Zod schema.
4. Create one sample theme.
5. Create a small Component Registry.
6. Integrate Puck as the first Canvas/editor POC.
7. Render Hero, About, Gallery and Footer from the Blueprint.
8. Prove selection and a simple Blueprint update.
9. Keep architecture modular so Puck can be replaced without changing the Blueprint.

**Do not** implement complete AI, build system, S3 deployment, or custom runtime in the first step.

**Immediate goal:** prove **Blueprint → Component Registry → React/Puck Canvas**.

---

## Analysis Snapshot (repo status)

| Item | Status |
|---|---|
| Repository | Empty — no `src`, `package.json`, or existing docs yet |
| Document | This file (`PROJECT_CONTEXT.md`) is the first project artifact |
| Recommended first build | Phase 1–4 vertical slice (setup → Blueprint → registry → Canvas) |
| Defer | AI orchestration, build worker, S3 publish, Level-3 codegen |

### Core takeaways

- **Blueprint-centric:** every path (theme, manual, section AI, full AI) converges on one schema.
- **Controlled flexibility:** V1 = composition + registry; not freeform codegen or Figma canvas.
- **Puck is replaceable:** adapter boundary; Blueprint never depends on Puck's model.
- **Patches unify mutations:** one validate → apply pipeline for humans and AI.
- **AI is a layer, not the runtime:** orchestration/patches yes; build/publish/state no.
