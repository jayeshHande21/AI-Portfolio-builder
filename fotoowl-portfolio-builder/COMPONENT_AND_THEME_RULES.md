# FotoOwl Portfolio Builder — Component & Theme Rules

**Status:** Finalized foundation rules  
**Purpose:** Define the standards that every future FotoOwl portfolio theme, section, component, and AI-generated structure must follow.

This document is a development contract for the Portfolio Builder. Cursor and future contributors should follow these rules when implementing new components and themes.

---

## 1. Core Principle

The Portfolio Builder is based on one central concept:

> **The Portfolio Blueprint is the single source of truth.**

Themes, manual editing, Section AI, Full Portfolio AI, Canvas rendering, versioning, and publishing must work through the Blueprint.

```text
Theme
   ↓
Portfolio Blueprint

Manual Edit
   ↓
Blueprint Patch

Section AI
   ↓
Blueprint Patch

Full AI
   ↓
Blueprint

Blueprint
   ↓
React Renderer
   ↓
Canvas
   ↓
Build
   ↓
Production
```

Do not introduce a second source of truth based on raw HTML/CSS/DOM state.

---

# 2. Domain Boundary

The builder is specifically for **photographers and photography portfolios**.

The system may be flexible and allow arbitrary portfolio structures, but generated structures must remain relevant to the domain.

### Valid examples

- Hero
- About
- Portfolio / Work
- Featured Weddings
- Services
- Testimonials
- Client Stories
- Awards
- Publications
- Behind the Scenes
- Videos / Reels
- Instagram Feed
- Contact
- Booking CTA
- FAQ
- Team
- Custom photography-story sections

### Invalid direction

The system should not become a general-purpose application builder.

Examples of out-of-scope structures:

- CRM dashboards
- Accounting systems
- Inventory systems
- Food ordering systems
- General SaaS dashboards
- Arbitrary business applications

The Orchestrator/AI layer is responsible for enforcing this domain boundary.

---

# 3. Technology Foundation

Current Canvas direction:

```text
React
+
TypeScript
+
Vite
+
Puck
+
Zustand
+
Zod
```

### React

React is the primary rendering and editor technology.

### TypeScript

TypeScript is required for Blueprint, component contracts, editor state, and application logic.

### Vite

Vite is the editor/build tool.

### Puck

Puck is the initial visual-editor foundation.

**Important:** Puck is an editor implementation detail, not the source of truth.

Create an adapter boundary so the Blueprint is not tightly coupled to Puck.

```text
Portfolio Blueprint
       ↓
Puck Adapter
       ↓
Puck
       ↓
React Canvas
```

### Zustand

Use Zustand for editor/runtime state.

### Zod

Use Zod for runtime validation of Blueprint data and patches.

---

# 4. Source of Truth vs Runtime State

These must remain separate.

## Portfolio State / Blueprint

Persistent data:

- portfolio structure
- sections
- components
- content
- layout
- styles
- responsive configuration
- animation configuration
- asset references
- metadata that belongs to the portfolio

## Editor Runtime State

Temporary UI state:

- selected node
- hovered node
- dragged node
- current viewport
- zoom
- active panel
- open chat
- loading states
- temporary preview state

Example:

```text
Blueprint:
Hero → About → Gallery → Footer

Editor State:
selectedNodeId = about_01
viewport = mobile
```

Do not store editor runtime state inside the Portfolio Blueprint.

---

# 5. Portfolio Hierarchy

The standard hierarchy is:

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

A Node can represent:

- primitive element
- reusable component
- nested container
- custom AI-generated structure

The hierarchy should remain flexible enough to support new portfolio structures.

---

# 6. Node Contract

Every node should follow a predictable conceptual contract.

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

Not every node needs every property.

---

## 6.1 `id`

Every node must have a stable unique ID.

Examples:

```text
hero_01
about_01
gallery_01
heading_12
```

Rules:

- ID must be unique within the relevant Blueprint scope.
- ID must remain stable when the node is moved or reordered.
- AI, manual editing, patches, history, and debugging may depend on the ID.

Do not generate a new ID simply because a node changes position.

---

## 6.2 `type`

`type` describes the basic kind of node.

Examples:

```text
section
container
heading
text
image
video
button
component
```

Use a small, predictable vocabulary.

Do not create a new `type` for every visual variation.

---

## 6.3 `component`

Use `component` when the node maps to a registered higher-level component.

Examples:

```text
hero.editorial
hero.fullscreen
about.image_left
gallery.masonry
footer.minimal
```

The Component Registry maps these identifiers to React implementations.

---

# 7. Component Categories

The system should support three practical levels.

## Level 1 — Primitive Elements

Basic building blocks:

```text
Heading
Text
Image
Video
Button
Link
Icon
Divider
Spacer
```

These should be highly reusable.

---

## Level 2 — Registered Components

FotoOwl-created and maintained components.

Examples:

```text
Hero
About
Gallery
Testimonials
Services
Contact
Footer
```

They may have multiple variants.

Example:

```text
Hero
├── Fullscreen
├── Split
├── Editorial
└── Centered
```

These are the preferred components for normal V1 generation.

---

## Level 3 — Custom AI Structures / Components

The system must allow structures that are not explicitly predefined.

There are two different situations:

### A. New composition from existing primitives/components

Example:

```text
Custom Section
└── Container
    ├── Image
    ├── Heading
    ├── Story
    ├── Image
    └── CTA
```

This is expected in V1.

### B. Completely new React component

Example:

```text
AI request
   ↓
Code AI
   ↓
New React Component
   ↓
Sandbox Build
   ↓
Validation
   ↓
Canvas
```

This is a V2 capability and should be supported by the architecture without becoming the default V1 path.

---

# 8. Component Design Rules

Every future component should:

1. Have a clear responsibility.
2. Accept structured props.
3. Avoid embedding raw HTML strings as data.
4. Be responsive.
5. Be reusable where practical.
6. Have predictable variants.
7. Use design tokens.
8. Expose only safe/intentional configuration.
9. Work inside the Blueprint model.
10. Be renderable without knowing anything about AI.

A component should not call an AI model directly.

---

# 9. Props Rules

Props contain content and component configuration.

Example:

```json
{
  "props": {
    "title": "Stories Worth Remembering",
    "description": "We capture...",
    "image": "asset_102"
  }
}
```

Do not store:

```json
{
  "props": {
    "html": "<section>...</section>",
    "css": "..."
  }
}
```

The Blueprint describes the structure and data. The React component controls how those values become UI.

---

# 10. Layout Rules

Keep layout separate from visual styling.

## Layout properties

```text
display
direction
columns
rows
gap
alignment
justify
width
maxWidth
position
```

## Style properties

```text
color
background
font
border
radius
shadow
opacity
```

Example:

```json
{
  "layout": {
    "display": "grid",
    "columns": 2,
    "gap": "large"
  },
  "styles": {
    "background": "light"
  }
}
```

Do not mix layout semantics and visual styling unnecessarily.

---

# 11. Semantic Styling First

Prefer semantic design values where possible.

Examples:

```text
small
medium
large
full
wide
center
left
right
```

rather than exposing arbitrary values for every property.

However, the architecture should allow controlled numeric/custom values where a design genuinely requires them.

Rule:

> **Semantic values are the default; raw values are an escape hatch, not the primary API.**

---

# 12. Responsive Rules

Every component must support responsive behaviour.

At minimum:

```text
Desktop
Tablet
Mobile
```

Use:

```text
Base configuration
+
Responsive overrides
```

Example:

```json
{
  "layout": {
    "columns": 3
  },
  "responsive": {
    "mobile": {
      "layout": {
        "columns": 1
      }
    }
  }
}
```

Do not duplicate the complete component tree for each breakpoint.

---

# 13. Responsive Design Requirement

A component is not considered complete until it has a defined behaviour for smaller screens.

Every new theme and component should be checked for:

- text wrapping
- image scaling/cropping
- overflow
- spacing
- stacking
- navigation
- CTA placement
- readability
- touch interaction

The goal is to produce real responsive websites, not desktop designs that happen to shrink.

---

# 14. Animation Rules

Animation must be structured and controlled.

Conceptual model:

```text
animation
├── type
├── duration
├── trigger
└── direction
```

Examples:

```text
fade
fade-up
slide
reveal
scale
parallax
zoom
```

Do not put arbitrary JavaScript animation code into the Blueprint.

For V1:

- use controlled animation definitions
- reuse approved implementations
- keep animation behaviour predictable

Advanced custom animation logic belongs to the custom-component/V2 layer.

---

# 15. Third-Party Libraries

Do not allow every generated component to install arbitrary npm packages.

Use an approved dependency/implementation list.

Example future allowlist:

```text
GSAP
Swiper
Lottie
Lucide
```

A component should request an approved capability rather than freely installing random dependencies.

This protects:

- build reliability
- security
- bundle size
- maintenance
- reproducibility

---

# 16. Asset Rules

Assets must be referenced by stable IDs.

Example:

```json
{
  "props": {
    "asset_id": "asset_102"
  }
}
```

Do not duplicate full asset metadata throughout every component.

The portfolio maintains a separate asset collection.

Conceptually:

```text
Portfolio
├── Assets
│   ├── asset_102
│   ├── asset_103
│   └── asset_104
│
└── Sections
    └── Gallery
        ├── asset_102
        ├── asset_103
        └── asset_104
```

Assets may later include:

- image
- video
- logo
- icon
- font

---

# 17. Accessibility Rules

Every new component should follow basic accessibility standards.

At minimum:

- use semantic HTML where appropriate
- provide meaningful image alt text
- support keyboard interaction where relevant
- maintain focus visibility
- avoid inaccessible interaction patterns
- maintain readable contrast

Accessibility is part of the component contract, not a later cleanup task.

---

# 18. Theme Rules

FotoOwl will have approximately 30–40 predefined themes.

A theme is a **starting configuration**, not a separate website implementation.

Conceptually:

```text
Theme
   ↓
Initial Portfolio Blueprint
   ↓
User Customization
   ↓
Current Portfolio Blueprint
```

The original theme should never be mutated by one user's edits.

A user's portfolio becomes its own customized state.

---

# 19. Theme Composition Rules

Themes should reuse the common Component Registry.

Do not create 40 completely independent component implementations.

Preferred:

```text
Theme 01
Theme 02
Theme 03
...
Theme 40
        ↓
Shared Components
```

Each theme can configure:

- component selection
- variants
- design tokens
- layout
- content defaults
- animation defaults

---

# 20. Theme Design Tokens

Themes should use a consistent token model.

Examples:

```text
Colors
Typography
Spacing
Container widths
Border radius
Shadows
Breakpoints
```

Theme-specific values are allowed, but the token structure should remain consistent.

This allows AI and the editor to make global changes reliably.

---

# 21. AI Compatibility Rules

Every component must expose enough structured information for AI systems to understand:

- what the component does
- which props exist
- which variants exist
- which children are allowed
- which properties can be changed
- which properties should remain fixed
- responsive behaviour
- supported animations

AI should not need to inspect arbitrary React source code to understand normal component capabilities.

---

# 22. Section AI Rules

Section AI operates within a selected section.

It can:

- modify the current section
- replace the current section
- add/remove child elements
- reorder content
- change layout
- change styles
- change animation
- create a new structured composition

Typical flow:

```text
Selected Section
   ↓
Section AI
   ↓
Structured Patch
   ↓
Validate
   ↓
Portfolio Blueprint
   ↓
Canvas
```

Section AI should not unnecessarily regenerate the entire portfolio.

---

# 23. Full Portfolio AI Rules

Full Portfolio AI works at portfolio scope.

Typical flow:

```text
User Request
   ↓
Orchestrator
   ↓
Style AI
   ↓
Code AI where required
   ↓
Portfolio Blueprint
   ↓
Canvas
```

It should work against the current Blueprint when the portfolio already exists.

It should not create a separate portfolio representation.

---

# 24. Patch Rules

Manual edits and AI edits must ultimately use the same mutation mechanism.

```text
Manual Edit ─────┐
Section AI ──────┤
Full AI ──────────┤
                  ↓
                 Patch
                  ↓
               Validate
                  ↓
               Blueprint
```

Supported operations should include:

```text
add
update
delete
move
reorder
replace
```

Every patch must be validated before application.

---

# 25. Stable IDs and Patches

Patches must target stable node IDs.

Example:

```text
target = about_01
```

Avoid targeting elements only by array index where possible.

Bad:

```text
sections[3]
```

Preferred:

```text
section_id = about_01
```

This makes patches more reliable when sections are reordered.

---

# 26. No Raw DOM Mutation as the Source of Truth

Do not make direct DOM manipulation the persistence mechanism.

Bad:

```text
DOM changed
   ↓
try to reconstruct Blueprint
```

Preferred:

```text
Blueprint
   ↓
React Renderer
   ↓
DOM
```

or:

```text
User Action
   ↓
Patch
   ↓
Blueprint
   ↓
React Renderer
   ↓
DOM
```

---

# 27. Canvas Rules

The Canvas should render the current Blueprint.

```text
Blueprint
   ↓
Component Registry
   ↓
React Renderer
   ↓
Canvas
```

The Canvas should support:

- selection
- drag/drop
- responsive preview
- manual editing
- AI editing
- undo/redo
- preview
- publish

The portfolio preview should remain isolated from the editor UI, preferably using an iframe.

---

# 28. Editor Framework Boundary

Puck is the initial Canvas/editor foundation.

Keep an adapter:

```text
Portfolio Blueprint
   ↓
Puck Adapter
   ↓
Puck
```

Do not allow Puck-specific concepts to leak into the permanent domain model unless explicitly necessary.

This allows the editor framework to be replaced later without changing the entire Blueprint architecture.

---

# 29. Freeform Editor Rule

V1 is a structured website editor, not a Figma-style infinite canvas.

Prefer:

```text
Section
  ↓
Container
  ↓
Grid / Flex
  ↓
Nodes
```

Avoid making every element freely positioned with arbitrary X/Y coordinates.

The primary goal is responsive web layout.

---

# 30. V1 Component Strategy

V1 should provide:

```text
30–40 Themes
+
Registered Components
+
Primitive Elements
+
AI-generated compositions
+
Section AI
+
Full Portfolio AI
```

A user can create a completely new About section in V1 through structured composition.

Example:

```text
About
 └── Container
      ├── Image
      ├── Heading
      ├── Story
      ├── Awards
      └── CTA
```

This does not require a new React component for every design.

---

# 31. V2 Component Strategy

V2 can introduce:

```text
AI-generated React Components
+
Advanced custom interactions
+
Advanced animation logic
+
Controlled third-party libraries
```

Flow:

```text
User Request
   ↓
Code AI
   ↓
New React Component
   ↓
Sandbox Build
   ↓
Validation
   ↓
Canvas
```

V2 must reuse the same:

- Blueprint
- Canvas
- component registry concept
- patch system

Do not create a separate Canvas architecture for V2.

---

# 32. Raw Runtime HTML/JS

Unlimited raw HTML/CSS/JS execution is NOT the default V1 architecture.

Potential future flow:

```text
AI-generated code
   ↓
Isolated Sandbox
   ↓
Build
   ↓
Validation
   ↓
Production Artifact
```

If introduced, it must have controls for:

- dependency allowlisting
- network access
- filesystem access
- CPU
- memory
- execution time
- build timeouts
- security

---

# 33. Build Rules

Build is deterministic.

```text
Portfolio Blueprint
   ↓
Production Code
   ↓
Build Worker
   ↓
Build
```

Do not use an LLM as the compiler.

If compilation fails:

```text
Build Error
   ↓
Repair AI
   ↓
Code Patch
   ↓
Build Again
```

Repair attempts must be limited.

---

# 34. QA Rules

Use two levels.

## Deterministic QA

Check:

- Blueprint schema
- component validity
- type checking
- linting
- build validity
- asset references
- dependency validity

## Visual QA

Use browser rendering/screenshot analysis to inspect:

- layout
- spacing
- overflow
- alignment
- responsive behaviour
- visual hierarchy

AI should be used for visual judgement, not for deterministic checks that normal software can perform reliably.

---

# 35. Versioning Rules

Every meaningful portfolio change should be versionable.

Example:

```text
v1 — Theme selected
v2 — About updated
v3 — Hero updated
v4 — Gallery reordered
v5 — Full AI redesign
```

Manual and AI changes must participate in the same history system.

The history system should operate on Blueprint changes/patches.

---

# 36. Draft vs Production

The Canvas works on draft state.

Do not build and deploy after every Canvas update.

Preferred:

```text
Draft Blueprint
   ↓
Canvas
   ↓
User edits
   ↓
Preview
   ↓
Publish
   ↓
Build Worker
   ↓
QA
   ↓
S3
```

---

# 37. Final Production Rule

The published website is a production artifact derived from the Blueprint.

```text
Portfolio Blueprint
   ↓
Production Renderer
   ↓
Build
   ↓
Static Artifact
   ↓
S3
```

The published artifact is not used as the editing source of truth.

---

# 38. Rules for Adding a New Component

Before adding any new component, verify:

### Structure

- Does it fit the Portfolio Blueprint?
- Is the node type correct?
- Does it have a stable ID strategy?

### Content

- Are props structured?
- Are assets referenced by IDs?
- Is raw HTML avoided as stored data?

### Layout

- Is layout separate from style?
- Is the component responsive?

### Design

- Does it use design tokens?
- Does it follow FotoOwl's visual system?

### AI

- Can Section AI understand and modify it?
- Are allowed props and variants clear?

### Canvas

- Can it render inside the Canvas?
- Does it work inside the editor/iframe?

### Accessibility

- Is the component keyboard/accessibility friendly?

### Performance

- Does it introduce heavy dependencies or unnecessary rendering?

---

# 39. Rules for Adding a New Theme

Before adding a new theme, verify:

- It uses the shared Blueprint structure.
- It uses registered components where appropriate.
- It does not create duplicate component implementations unnecessarily.
- It uses the global design-token model.
- It works on desktop, tablet and mobile.
- Images and assets are referenced correctly.
- Animations follow the animation system.
- All sections remain photographer/portfolio relevant.
- It can be edited by Section AI.
- It can be updated manually in the Canvas.
- It does not break existing themes.

---

# 40. Architecture Boundaries

Keep these boundaries intact:

```text
AI
 ↓
Blueprint / Patch

Blueprint
 ↓
Renderer

Renderer
 ↓
Canvas

Blueprint
 ↓
Build

Build
 ↓
QA

QA
 ↓
Publish
```

Do not create direct shortcuts such as:

```text
AI
 ↓
DOM

AI
 ↓
S3

Canvas
 ↓
Production HTML as source of truth
```

---

# 41. Implementation Principle

When implementing a feature, prefer:

> **Extend the existing architecture rather than creating a parallel system.**

Before adding a new abstraction, check whether it can fit into:

- Portfolio Blueprint
- Component Registry
- Patch System
- Canvas State
- AI workflow

Avoid duplicating logic between:

- Theme flow
- Section AI
- Full AI
- Manual editor

---

# 42. Current Implementation Roadmap

The project sequence is:

```text
POC ✅
  ↓
Component & Theme Rules  ← current
  ↓
Phase 5 — Patch System
  ↓
Phase 6 — Editor State
  ↓
Phase 7 — Themes
  ↓
Phase 8 — Section AI
  ↓
Phase 9 — Full Portfolio AI
  ↓
Phase 10 — Build / Publish
  ↓
Phase 11 — QA
```

---

# 43. Current POC Status

The initial project setup and POC are complete.

Verified foundation:

```text
Node.js
Vite
React
TypeScript
Puck
Zustand
Zod
Lucide
Vitest
```

The POC has:

- Puck adapter boundary
- sample theme
- Hero
- About
- Gallery
- Footer
- Blueprint placeholders
- schema/validator placeholders
- project documentation

The next implementation step is the Patch System.

---

# 44. Cursor Development Rules

When working on this repository:

1. Read `PROJECT_CONTEXT.md`.
2. Read this file before adding themes/components.
3. Do not change the finalized architecture without a clear reason.
4. Do not introduce a new dependency when the existing stack can reasonably solve the problem.
5. Prefer small, testable changes.
6. Keep Blueprint logic independent from Puck.
7. Keep editor state separate from Portfolio state.
8. Write tests for Blueprint validation and patch operations.
9. Keep new components responsive.
10. Do not implement AI, S3, Build Worker, or advanced runtime code before their planned phase.
11. Do not introduce unrestricted runtime JavaScript.
12. Preserve backward compatibility for existing themes and Blueprint structures.

---

# 45. Final Rule

The system should always preserve this model:

```text
                 USER
                   │
        ┌──────────┴──────────┐
        │                     │
     Theme                 AI
        │                     │
        └──────────┬──────────┘
                   ↓
          PORTFOLIO BLUEPRINT
                   ↓
           COMPONENT REGISTRY
                   ↓
              REACT CANVAS
                   ↓
                DRAFT
                   ↓
               PUBLISH
                   ↓
             BUILD + QA
                   ↓
                  S3
```

The goal is:

> **Flexible portfolio creation without losing a structured source of truth, predictable rendering, responsive behaviour, or control over generated code.**
