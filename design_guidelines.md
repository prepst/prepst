# Design Guidelines (PrepSt)

These guidelines describe the **UI/UX baseline** for this repo. They consolidate patterns already used across the app and documented in:

- `billion_dollar_design.md`
- `prepstyle.md`
- `cardstyle.md`
- `badgestyle.md`
- `gradientcardstyle.md`

## Goals

- **Premium, theme-aware UI**: dark mode is first-class.
- **Consistency**: spacing, radius, shadows, and state styling should feel uniform across pages.
- **Clarity**: strong hierarchy; quiet backgrounds; obvious primary actions.
- **Accessibility**: readable contrast, clear focus states, and predictable interactions.

## Foundations

### Use semantic tokens (not hardcoded neutrals)

- **Do** use theme tokens for structure:
  - Backgrounds: `bg-background`, `bg-card`, `bg-muted/30`
  - Text: `text-foreground`, `text-muted-foreground`
  - Borders: `border-border`
- **Avoid** hardcoded grays/whites for structural UI:
  - Avoid: `bg-white`, `text-gray-900`, `border-gray-200`

### Brand color usage

- Prefer **semantic** `primary` tokens for most UI.
- If you need a *fixed* brand color for a key CTA, the project’s brand purple is `#866ffe` (see `billion_dollar_design.md` / `prepstyle.md`). Keep this usage limited to truly primary CTAs.

## Layout & spacing

### Page roots

- Use `min-h-screen bg-background` for standard pages.
- Use `h-screen bg-background flex flex-col overflow-hidden` for “app-like” full-height flows (e.g., practice experience).

### Container widths

- Prefer `max-w-6xl` / `max-w-7xl` for dashboards and multi-column layouts.
- Use narrower widths only when the content is reading-focused.

### Spacing rhythm

- Prefer generous spacing over dense UI.
- Common comfortable defaults:
  - Page padding: `px-6 py-12`
  - Section spacing: `space-y-12` (or `space-y-16` for hero-like sections)
  - Card padding: `p-6` or `p-8`

## Surfaces: cards, panels, glass

### Default card

- Radius: `rounded-2xl` or `rounded-3xl`
- Border: `border border-border`
- Shadow: `shadow-sm` baseline; use `shadow-md`/`shadow-xl` for elevated surfaces

### Glassmorphism surface

Use for sticky headers, overlays, and “premium” panels:

```tsx
<div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl" />
```

Reference: `cardstyle.md`, `prepstyle.md`.

### Gradient CTA card (use sparingly)

Reserved for high-signal CTAs (one per page/section max):

- `bg-gradient-to-br from-primary/5 via-primary/10 to-transparent`
- Large soft blur blobs behind content

Reference: `gradientcardstyle.md`.

## Typography

### Hierarchy

- Page title: `text-4xl font-extrabold tracking-tight text-foreground`
- Section header: `text-2xl font-bold text-foreground`
- Subtext/description: `text-lg text-muted-foreground`
- Labels/metadata: `text-xs font-bold text-muted-foreground uppercase tracking-wider`

### Numbers

Use monospace + tabular numbers anywhere values update:

- `font-mono tabular-nums`

## Buttons & actions

### Primary action

- Use the shadcn `Button` primary variant for standard CTAs.
- For “hero” CTAs, size up and add subtle depth:
  - Height `h-12` to `h-14`
  - Shadow tint `shadow-lg shadow-primary/25`
  - Subtle hover scale `hover:scale-105` (ensure disabled state cancels scale)

Reference: `gradientcardstyle.md`, `prepstyle.md`.

### Secondary actions

- Prefer `variant="outline"` or `variant="ghost"` over custom colors.
- Avoid stacking many “primary-looking” buttons together.

## Badges, status, and semantic colors

### Status badge pattern (dot + outline)

Use `Badge variant="outline"` with a small dot indicator:

```tsx
<Badge variant="outline" className="pl-2 pr-3 py-1 gap-2 border-border bg-card text-foreground font-medium">
  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
  Easy
</Badge>
```

### Semantic color rules

When applying non-token colors (success/warn/error), use **opacity-based backgrounds** so dark mode stays readable:

- Success: `bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400`
- Warning: `bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400`
- Error: `bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400`

Avoid bright “light theme” pills like `bg-blue-50`.

Reference: `badgestyle.md`, `prepstyle.md`, `billion_dollar_design.md`.

## Interaction & motion

### Clickable surfaces

- Use shadow/scale very lightly:
  - `hover:shadow-md transition-all duration-300 hover:scale-[1.01]`
- Prefer `transition-colors` when only colors change (more performant than `transition-all`).

### Loading/async

- Use visible disabled styles (`disabled:opacity-70`) and prevent hover transforms when disabled.
- For spinners/icons: `animate-spin` / `animate-pulse` as appropriate.

## Data & empty states

- Don’t show “bare text” empty states.
- Prefer a bordered, dashed container with muted icon + text:
  - `bg-muted/10 rounded-2xl border-2 border-dashed border-border`

Reference: `billion_dollar_design.md`.

## Accessibility baseline

- Ensure text on tinted backgrounds remains readable in both themes.
- Always keep focus styles (don’t remove rings):
  - Prefer `focus-visible:ring-[3px] focus-visible:ring-ring/50` patterns from shadcn components.
- Icons-only buttons need `aria-label`.
- Avoid interaction that relies on color alone; pair with icon/text.

