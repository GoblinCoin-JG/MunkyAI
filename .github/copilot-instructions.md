# Copilot Project Instructions

You are assisting on a React + TypeScript web app.

Your primary architectural responsibility is to keep the codebase organized, modular, and scalable as the app grows.

## First-priority rule

Before making architecture, refactor, feature placement, naming, or file-organization decisions, consult the instruction files in `.github/instructions/`.

Use them as follows:

- `.github/instructions/architecture.instructions.md`
  - Use when deciding overall app structure, folder placement, ownership boundaries, entry-point responsibilities, or shared-vs-feature organization.
- `.github/instructions/feature-structure.instructions.md`
  - Use when creating or expanding a feature folder under `src/features/`.
- `.github/instructions/refactor.instructions.md`
  - Use when splitting large files, moving code, extracting hooks/components/services, or cleaning up structure.
- `.github/instructions/naming.instructions.md`
  - Use when naming files, components, hooks, services, folders, types, and exports.

If multiple instruction files apply, follow all relevant files together.

## Core Principles

- Keep `main.tsx` minimal
- Keep `App.tsx` focused on app shell concerns
- Organize code by feature
- Separate shared code from feature-specific code
- Avoid large multi-responsibility files
- Preserve existing behavior when refactoring
- Prefer incremental, readable changes over overengineered abstractions

## Required Architecture Rules

### `main.tsx`
`main.tsx` must remain minimal.

It should only do things like:
- import global styles
- create the React root
- render `App`
- wrap top-level providers if needed

It must NOT become a dumping ground for:
- feature UI
- business logic
- API calls
- large state logic
- page composition beyond root bootstrapping

### `App.tsx`
`App.tsx` should contain only high-level app structure such as:
- app shell
- route composition
- top-level layout
- provider composition if appropriate

Do not place feature internals directly in `App.tsx` unless the app is still extremely small and temporary.

### Feature-first organization
New functionality should generally be placed under:

`src/features/<feature-name>/`

Each feature should own its own:
- components
- hooks
- services
- types
- feature entry points

### Shared code
Use shared folders only for code that is truly reusable across features:

- `src/components/ui/` → generic reusable UI
- `src/components/layout/` → shared layout pieces
- `src/hooks/` → shared hooks
- `src/services/` → shared/global services
- `src/utils/` → pure helper utilities
- `src/types/` → global/shared types

Do not move feature-specific code into shared folders prematurely.

## Preferred Folder Shape

Use this structure unless there is a strong reason not to:

```txt
src/
  main.tsx
  App.tsx

  app/
    providers/
    routes/
    store/

  features/
    <feature-name>/
      components/
      hooks/
      services/
      types.ts
      index.ts

  components/
    ui/
    layout/

  hooks/
  services/
  utils/
  types/
  styles/
```

## File Responsibility Rules

Use this decision framework when creating or moving code:

- app entry logic → `main.tsx`
- app shell / top-level composition → `App.tsx`
- route-level composition → `app/routes/` or feature page entry
- feature-only UI → `features/<feature>/components/`
- feature-only hooks → `features/<feature>/hooks/`
- feature-only service/API logic → `features/<feature>/services/`
- reusable UI → `components/ui/`
- reusable layout pieces → `components/layout/`
- shared hooks → `hooks/`
- shared services → `services/`
- shared utilities → `utils/`
- shared types → `types/`

## Refactoring Rules

When refactoring:
1. Identify distinct responsibilities in the source file
2. Split by responsibility and feature ownership
3. Preserve behavior
4. Update imports cleanly
5. Avoid introducing unnecessary libraries
6. Keep the result easy to understand

## Size and Complexity Guidance

If a file is becoming hard to scan or contains multiple responsibilities, split it.

Warning signs:
- UI + API + business rules mixed together
- multiple unrelated components in one file
- state management and layout tightly coupled
- repeated JSX blocks that should be components
- repeated logic that should be hooks or utilities

## Coding Style Preferences

- Prefer one main exported component per file
- Keep components focused
- Keep functions small and intention-revealing
- Use TypeScript types clearly
- Keep naming consistent
- Avoid generic names like `helpers.ts`, `stuff.ts`, `misc.ts`, `temp.ts`
- Avoid deeply nested folders unless clearly justified

## When adding a new feature

Before implementing:
1. Identify whether it is a new feature or part of an existing one
2. Create or use the appropriate feature folder
3. Place related files together
4. Only promote code to shared folders if it is truly reused
5. Check `.github/instructions/feature-structure.instructions.md` and `.github/instructions/naming.instructions.md`

## When refactoring existing code

Before implementing:
1. Check `.github/instructions/refactor.instructions.md`
2. Check `.github/instructions/architecture.instructions.md`
3. Create a file move plan
4. Preserve behavior while improving structure

## What to avoid

- bloated `main.tsx`
- bloated `App.tsx`
- giant `components/` folder with no boundaries
- API calls scattered across UI files
- feature logic stored in global folders without reason
- premature abstraction
- unnecessary enterprise patterns for a small app

## Refactor Behavior

When asked to refactor, always:
- explain the current structural problem briefly
- propose a target file layout
- move code according to feature ownership
- preserve functionality
- keep the result practical for a growing app
