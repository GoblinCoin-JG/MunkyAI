# Naming Instructions

## When to use this file

Use this file when naming:
- files
- folders
- React components
- hooks
- services
- utility modules
- types
- exports

## General naming rules

- prefer explicit names over short clever names
- match file names to exported symbols when practical
- use domain language consistently
- avoid vague names

## Good examples

- `ProjectSidebar.tsx`
- `EditorCanvas.tsx`
- `useProjectSearch.ts`
- `projectApi.ts`
- `formatTimestamp.ts`

## Bad examples

- `Thing.tsx`
- `Helper.ts`
- `DataStuff.ts`
- `MiscUtils.ts`
- `TempComponent.tsx`

## Component naming

- use PascalCase
- name by responsibility, not appearance alone

Good:
- `SettingsPanel`
- `ChatMessageList`
- `FeatureCard`

Less good:
- `BlueBox`
- `LeftThing`
- `BigPanel`

## Hook naming

- always start with `use`
- describe the owned behavior

Good:
- `useAuthSession`
- `useSidebarState`
- `useFilteredProjects`

## Service naming

- use nouns tied to the domain or capability

Good:
- `authApi`
- `projectRepository`
- `editorStorage`

## Type naming

- use meaningful domain names
- avoid unnamed object types when they are important

Good:
- `ProjectSummary`
- `EditorState`
- `ChatMessage`
- `UserSettings`

## Folder naming

- use lowercase feature folders
- keep names short and domain-based

Examples:
- `auth`
- `projects`
- `editor`
- `chat`
- `settings`
