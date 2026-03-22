# MunkyAI App and Feature Overview

## Purpose
MunkyAI is an idea-development workspace built around a tree of thinking blocks. The app helps you:
- Create projects
- Break ideas into nested blocks
- Expand and refine blocks with AI
- Generate shareable artifact drafts in Markdown

The current app is a single-route experience focused on ideation workflows.

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (utility styling)
- Motion (animations)
- Lucide React (icons)
- Google GenAI SDK for Gemini-powered features

## High-Level Architecture
The app follows a feature-first structure:
- App entry and routing are minimal
- The ideation domain lives under src/features/ideation
- Feature internals are split into components, hooks, services, types, and utils

Main ownership boundaries:
- src/main.tsx bootstraps React and global styles
- src/App.tsx composes the top-level app shell (currently just routes)
- src/app/routes/AppRoutes.tsx selects the route component (currently IdeationWorkspace)
- src/features/ideation owns the full product behavior

## Current User Experience Layout
The workspace is a 3-panel layout:
- Left sidebar: project switcher, search, and block tree
- Center panel: selected block editor and artifact preview
- Right sidebar: AI actions and AI output

Resizable dividers allow users to adjust left/right panel widths.

## Core Domain Model
Primary types in the ideation feature:
- Project: id, name, createdAt
- ThinkingBlock: id, projectId, parentId, title, summary, content, tags, maturityState
- MaturityState: Exploratory, Developing, Validated, Locked
- AiOutput: typed AI result payload for expand/clarify/suggest

How blocks work:
- Blocks form a parent-child tree via parentId
- Root blocks have parentId = null
- The selected block drives both editor content and available AI actions

## Startup and Data Lifecycle
At startup, the app:
1. Reads localStorage for projects, active project, blocks, and panel widths
2. Falls back to seed data if nothing is saved
3. Renders the full ideation workspace

Persistence behavior:
- Any changes to projects, active project, blocks, or panel widths are saved to localStorage
- This makes the prototype stateful without a backend

Storage keys are centralized in src/features/ideation/constants.ts for consistency.

## Feature Breakdown

### 1) Project Management
Implemented in the left sidebar + workspace hook.

Capabilities:
- Switch active project
- Create project from AI-generated scaffold (name + initial blocks)
- Delete project with confirmation
- Guardrail: cannot delete the final remaining project

Creation flow:
1. User opens New Project modal
2. User enters an idea statement
3. AI returns projectName + 4-6 starter blocks
4. App creates one root block and AI-generated child blocks
5. New project becomes active and selected

### 2) Block Tree Management
Implemented in BlockTree + workspace hook + blockTree utility.

Capabilities:
- Display nested block hierarchy
- Expand/collapse nodes
- Add root blocks
- Add child blocks
- Select block for editing
- Delete block with confirmation

Deletion behavior:
- Deleting a block removes all descendants recursively for that project
- If the selected block is deleted, selection is cleared

### 3) Block Editing
Implemented in the center panel through BlockEditor.

Editable fields:
- Title
- Summary
- Notes/content
- Maturity state
- Tags (add with Enter, remove individually)

This is where manual editing and AI-assisted refinement converge.

### 4) AI Assistant Actions
Implemented in the right sidebar and workspace hook via ideationAiService.

Actions:
- Expand: returns richer summary/content for selected block
- Clarify: returns follow-up questions
- Suggest: returns candidate child blocks
- Artifact: generates polished Markdown from selected block + direct children

Typed AI output handling:
- Expand/clarify/suggest are stored in aiOutput and rendered conditionally
- Expand can be applied directly into the selected block
- Suggest items can be inserted into the tree as child blocks
- Artifact is stored as artifactDraft and displayed in editor panel

### 5) Artifact Preview and Export
Implemented in ArtifactPreview + shared download utility.

Capabilities:
- Preview generated artifact markdown inside the editor panel
- Export artifact as a .md file to local machine

Filename behavior:
- Derived from block title in lowercase with spaces converted to dashes
- Suffix: -artifact.md

### 6) Resizable Panels
Implemented in useResizablePanels.

Behavior:
- Mouse drag on left/right dividers updates widths live
- Width constraints prevent unusable layout sizes
- Saved to localStorage and restored on next load

## AI Service Contract
The ideation AI service is the single integration point to Gemini.

Current methods:
- generateProjectStructure(idea)
- expandBlock(block)
- clarifyBlock(block)
- suggestChildren(block)
- generateArtifact(block, children)

Important implementation details:
- Uses process.env.GEMINI_API_KEY
- Throws AI not configured when key is missing
- Most methods request JSON output with response schemas for safer parsing
- Artifact generation returns raw Markdown text

## How Everything Ties Together
End-to-end flow:
1. Routing loads IdeationWorkspace
2. useIdeationWorkspace initializes all app state and actions
3. Left sidebar controls project context and block navigation
4. Center panel edits the selected block and shows artifact output
5. Right sidebar triggers AI operations against the selected block
6. AI results feed back into block state or artifact draft
7. State changes are persisted locally for continuity

Design pattern in practice:
- UI components are mostly presentational and event-driven
- Hook acts as feature controller/state orchestrator
- Service isolates external AI calls
- Utils handle pure helper behavior

## Current Constraints and Risks
Prototype-level constraints:
- No backend, collaboration, or auth
- Data only in localStorage (device/browser scoped)
- Error handling is mostly alert + console
- ID generation uses Math.random (collision risk is low but non-zero)
- Environment variable access is process.env in client code, which may require build-time mapping depending on setup

AI-specific risks:
- Response quality can vary
- Generated structure/content may need user review before adoption
- Failed AI calls currently show generic alerts

## Suggested Future Feature Directions

### Product and UX
- Multi-page routing (dashboard, project detail, settings)
- Rich block metadata (owner, status, due date, confidence)
- Drag-and-drop tree restructuring
- Keyboard shortcuts and command palette
- Undo/redo history
- Advanced search and tag filtering

### AI Workflows
- Context-aware artifact generation from deeper descendants, not just direct children
- AI-assisted maturity scoring
- Compare two AI drafts and merge
- Prompt templates by project type (startup, research, writing)
- Conversation log per block for AI traceability

### Data and Platform
- Replace localStorage with backend persistence
- Project import/export bundle format
- Version snapshots and restore
- Team collaboration and comments

### Architecture and Reliability
- Add centralized error boundary and toast system
- Add runtime validation for parsed AI responses
- Add tests around workspace hook behavior and tree deletion logic
- Migrate environment key access to Vite-style env handling if needed

## Practical Planning Map for New Work
Use this quick map when deciding where to add code:
- New ideation-only UI: src/features/ideation/components
- New ideation-only state logic: src/features/ideation/hooks
- New AI or persistence logic: src/features/ideation/services
- New ideation-only helper transforms: src/features/ideation/utils
- Shared reusable utilities: src/utils
- New route-level composition: src/app/routes

## File Index (Current Key Files)
- src/main.tsx
- src/App.tsx
- src/app/routes/AppRoutes.tsx
- src/features/ideation/components/IdeationWorkspace.tsx
- src/features/ideation/hooks/useIdeationWorkspace.ts
- src/features/ideation/hooks/useResizablePanels.ts
- src/features/ideation/services/ideationAiService.ts
- src/features/ideation/components/LeftSidebar.tsx
- src/features/ideation/components/CenterPanel.tsx
- src/features/ideation/components/RightSidebar.tsx
- src/features/ideation/components/BlockTree.tsx
- src/features/ideation/components/BlockEditor.tsx
- src/features/ideation/components/ArtifactPreview.tsx
- src/features/ideation/components/modals/NewProjectModal.tsx
- src/features/ideation/components/modals/DeleteBlockConfirmModal.tsx
- src/features/ideation/components/modals/DeleteProjectConfirmModal.tsx
- src/features/ideation/constants.ts
- src/features/ideation/types.ts
- src/features/ideation/utils/blockTree.ts
- src/utils/downloadTextFile.ts
- src/utils/createId.ts

## Discussion Prompts for Future Ideation
Use these prompts when planning updates:
- Which parts of the ideation loop should be AI-first vs manual-first?
- Should blocks support multiple artifact formats (PRD, brief, pitch, spec)?
- What data model changes are needed before adding collaboration?
- Which workflows need auditability (AI prompts, applied changes, exports)?
- What should become reusable shared UI vs remain ideation-specific?

---

If you want, this document can be extended with a feature backlog template, effort estimates, and a phased roadmap section next.