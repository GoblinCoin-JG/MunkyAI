# MunkyAI App Style Guide (for AI Prototyping)

This guide captures the current visual and interaction style of MunkyAI so you can generate matching components in another app.

## 1) Design Direction

- Product feel: Focused, technical, "creative IDE" workspace.
- Tone: Minimal, high-contrast, utilitarian with subtle glow accents.
- Density: Compact controls, small labels, large editing surfaces.
- Surface style: Layered dark zinc panels with soft borders.

## 2) Color System

### Core surfaces

- App background: `zinc-950`
- Secondary panel surface: `zinc-900/50`
- Card/input surface: `zinc-900/50` or `zinc-800`
- Dividers/borders: `zinc-800` (sometimes `zinc-700` for inputs)

### Text hierarchy

- Primary text: `zinc-100` to `white`
- Secondary body text: `zinc-300` to `zinc-400`
- Muted/meta labels: `zinc-500`

### Accent and status

- Primary accent: `blue-500` / `blue-400`
- Action button accent: `blue-600` hover `blue-500`
- Maturity/status chips:
  - Exploratory: blue (`text-blue-400 border-blue-400/30 bg-blue-400/10`)
  - Developing: yellow (`text-yellow-400 border-yellow-400/30 bg-yellow-400/10`)
  - Validated: green (`text-green-400 border-green-400/30 bg-green-400/10`)
  - Locked: purple (`text-purple-400 border-purple-400/30 bg-purple-400/10`)
- Danger action: red hover states (`hover:text-red-400`)

### Selection and highlights

- Text selection: `selection:bg-blue-500/30`
- Selected row/item: `bg-zinc-800 text-blue-400`
- Hover backgrounds: `hover:bg-zinc-800`, `hover:bg-zinc-700`

## 3) Typography

- Base family: sans-serif (`font-sans`).
- Heading style:
  - Small app headers: `text-sm font-bold tracking-tight`
  - Modal title: `text-xl font-bold`
- Label/meta style:
  - `text-[10px] uppercase tracking-widest font-bold text-zinc-500`
- Body copy:
  - Inputs/body text generally `text-sm`
  - Supporting content often `text-xs` or `text-[11px]`

## 4) Spacing and Layout

- Overall app: full viewport height, 3-column layout with resizable sidebars.
- Common spacing scale in use: `p-3`, `p-4`, `p-6`, `p-8`, gaps `gap-2`, `gap-3`, `gap-4`, `gap-8`.
- Radius language:
  - Small controls: `rounded-md`
  - Cards/panels: `rounded-lg`
  - Modal/chunky surfaces: `rounded-xl` to `rounded-2xl`
- Borders are almost always visible and subtle (`border-zinc-800`).

## 5) Component Visual Patterns

### Sidebars

- Background: `bg-zinc-900/50`
- Edge border: left/right `border-zinc-800`
- Header bars: `p-4 border-b border-zinc-800`
- Footer/meta strips: `border-t border-zinc-800`

### Inputs

- Inputs/selects/textareas use dark surface + subtle border.
- Focus language:
  - Border tint: `focus:border-blue-500/50`
  - Ring tint: `focus:ring-1 focus:ring-blue-500/20`
  - Outline removed: `outline-none`

### Buttons

- Neutral controls: `bg-zinc-800 hover:bg-zinc-700`
- Primary action: `bg-blue-600 hover:bg-blue-500 text-white`
- Danger intent: neutral background + red text on hover.
- Most controls use `transition-colors` or `transition-all`.

### Tree/list items

- Compact rows with icon + title + hover actions.
- Action icons hidden until hover (`opacity-0 group-hover:opacity-100`).
- Selected state adds blue text + darker row background.

### Modal

- Full-screen scrim: `bg-black/80 backdrop-blur-sm`
- Modal panel: `bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl`

## 6) Motion Language

- Animation library: `motion/react`.
- Motion style: short, subtle, directional.
- Typical transitions:
  - Enter panels/cards: fade + slight slide (`opacity + x/y`)
  - Loading icon: continuous rotate loop (1s linear, infinite)
- Animations should support clarity, not decoration.

## 7) Iconography

- Icon set: `lucide-react`.
- Typical icon sizes: 14, 16, 18, 20, 24, 48.
- Color-coded icons communicate intent (blue/yellow/green/purple/red).

## 8) Scrollbar Treatment

Use a custom thin scrollbar style on scrolling panes.

- Width/height: `6px`
- Track: transparent
- Thumb: `#27272a`
- Thumb hover: `#3f3f46`
- Fully rounded thumb (`border-radius: 10px`)

## 9) Markdown/Artifact Rendering Style

When rendering markdown content in this design language, use:

- H1: white, larger, bold
- H2: white with bottom border (`zinc-800`)
- H3: blue accent heading
- Paragraph/list text: `text-sm text-zinc-300`
- Relaxed line-height and clear section spacing

## 10) AI Prompt Template for Prototyping

Use this prompt in another AI app to generate matching components:

```text
Create a React + Tailwind component that matches this style:
- Dark "idea IDE" interface, high contrast, compact controls
- Base surfaces: zinc-950 background, zinc-900/50 panels, zinc-800 controls
- Borders: subtle zinc-800 lines on most containers
- Primary accent: blue-500/blue-400, with blue-600 CTA buttons
- Text hierarchy: white/zinc-100 primary, zinc-300 secondary, zinc-500 meta labels
- Labels should be tiny uppercase with wide tracking (10px, tracking-widest, bold)
- Rounded language: md for controls, lg/xl/2xl for cards and modals
- Include lucide-react icons and subtle motion/react transitions (fade/slide)
- Hover states should lighten surfaces (zinc-800 -> zinc-700)
- Focus states should use blue border/ring tints (blue-500/50, blue-500/20)
- Keep layout dense and productivity-oriented, not marketing-style
- Maintain accessible contrast and keyboard focus behavior
```

## 11) Quick Build Checklist

- Use Tailwind dark zinc palette first, then add blue accents.
- Keep controls compact (`text-xs`/`text-sm`, tight paddings).
- Add borders to define panel boundaries.
- Reserve bright color mostly for action/status.
- Add only subtle, purposeful motion.
- Keep the result functional and tool-like.
