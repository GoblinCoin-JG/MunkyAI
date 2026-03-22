# Architecture Instructions

Follow a feature-first React + TypeScript architecture.

## When to use this file

Use this file when deciding:
- where code should live
- whether code belongs in app shell, shared folders, or a feature folder
- how much responsibility `main.tsx` and `App.tsx` should have
- whether something should stay local to a feature or move to shared code

## High-level rules

- Keep entry files small
- Keep feature code together
- Separate app shell from feature implementation
- Separate shared code from feature-owned code
- Optimize for maintainability and growth

## Entry points

### `src/main.tsx`
Allowed responsibilities:
- React root creation
- strict mode wrapper
- global styles
- provider bootstrapping

Disallowed responsibilities:
- page UI
- feature UI
- feature state logic
- API logic
- domain/business logic

### `src/App.tsx`
Allowed responsibilities:
- top-level app shell
- routes
- layout frame
- global composition

Disallowed responsibilities:
- large feature internals
- deeply embedded business logic
- feature-specific helpers unless temporary and very small

## Feature folders

Every meaningful feature should live in:

`src/features/<feature-name>/`

Typical structure:

```txt
src/features/<feature-name>/
  components/
  hooks/
  services/
  types.ts
  index.ts
```

Optional additions if needed:

```txt
  utils/
  constants.ts
  page.tsx
  state/
```

Only add subfolders when the feature complexity justifies them.

## Shared folders

Use shared folders only for genuinely reusable code.

### Shared UI
- buttons
- inputs
- cards
- modals
- generic form controls

### Shared layout
- header
- sidebar
- page container
- shell layout

### Shared hooks
- `useDebounce`
- `useLocalStorage`
- `useMediaQuery`

### Shared services
- API client
- auth client
- storage abstractions

### Shared utils
- formatting
- parsing
- pure transforms
- className merging

## Decision rule

Before creating a file, ask:

1. Does this belong to one feature only?
   - put it in that feature

2. Is this reused across features?
   - put it in a shared folder

3. Is this top-level app composition?
   - put it in `App.tsx` or `app/`

If uncertain, prefer feature ownership first.
