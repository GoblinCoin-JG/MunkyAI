# Feature Structure Instructions

## When to use this file

Use this file when:
- adding a new feature
- expanding an existing feature
- deciding the internal structure of a feature folder
- determining whether code belongs inside a feature or should be promoted to shared code

When naming new files or folders, also consult `.github/instructions/naming.instructions.md`.

## Default pattern

For each feature, use:

```txt
src/features/<feature-name>/
  components/
  hooks/
  services/
  types.ts
  index.ts
```

## Folder responsibilities

### `components/`
Feature-specific UI only.

Examples:
- `ChatPanel.tsx`
- `ProjectList.tsx`
- `EditorToolbar.tsx`

### `hooks/`
Feature-specific hooks only.

Examples:
- `useChatSession.ts`
- `useProjectFilters.ts`
- `useEditorState.ts`

### `services/`
Feature-specific service logic only.

Examples:
- `chatApi.ts`
- `projectStorage.ts`
- `editorSerialization.ts`

### `types.ts`
Feature-specific TypeScript types.

Examples:
- request/response models
- feature view models
- state types
- domain enums specific to that feature

### `index.ts`
Public exports for the feature.

Only export what should be consumed outside the feature.

## Keep cohesion high

A feature folder should feel like a self-contained unit.

When possible, someone should be able to understand the feature mostly by looking inside that folder.

## Do not leak too early into shared folders

Do not move code into global folders just because it might be reusable later.

Promote code to shared folders only when:
- it is already reused
- or it is clearly generic and intentionally reusable

## Page-level features

If a feature corresponds to a route or screen, it may have a top-level file such as:

- `DashboardPage.tsx`
- `SettingsPage.tsx`
- `EditorPage.tsx`

Keep route/page orchestration there, and delegate implementation details to subcomponents/hooks/services.
