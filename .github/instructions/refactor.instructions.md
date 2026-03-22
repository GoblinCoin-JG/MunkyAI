# Refactor Instructions

## When to use this file

Use this file when:
- splitting a large file
- cleaning up `main.tsx` or `App.tsx`
- extracting components, hooks, services, types, or utilities
- moving code into feature folders
- untangling mixed UI/state/API logic

Use this alongside `.github/instructions/architecture.instructions.md` for placement decisions.

## Refactor workflow

When given a large file:

1. Identify the file's current responsibilities
2. Group code by:
   - app entry concerns
   - layout concerns
   - feature concerns
   - state logic
   - API/data logic
   - utilities
   - types
3. Determine the owning feature for each part
4. Move code into the proper destination
5. Update imports and exports
6. Keep behavior unchanged

## Specific rules for large files

If a file contains:
- more than one major component
- repeated JSX sections
- embedded fetch/API logic
- embedded transformation helpers
- large inline types
- unrelated feature responsibilities

Then split it.

## Extraction rules

### Extract to component when:
- JSX is large or repeated
- a UI section has a clear responsibility
- a section can be named cleanly

### Extract to custom hook when:
- stateful behavior is reusable
- logic is cluttering the component body
- async loading, filtering, or derived state is substantial

### Extract to service when:
- logic communicates with backend/storage
- async domain logic does not belong in rendering
- fetch or persistence concerns are mixed into components

### Extract to utils when:
- logic is pure
- logic is stateless
- logic is formatting/transformation oriented

### Extract to types when:
- types are reused
- inline types reduce readability
- domain models deserve naming

## Refactor priorities

Priority order:
1. preserve behavior
2. improve file responsibility boundaries
3. improve readability
4. improve future extensibility

Do not perform broad rewrites unless requested.

Prefer focused structural cleanup over speculative redesign.
