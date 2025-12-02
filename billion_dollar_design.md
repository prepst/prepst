# Billion Dollar UI Design System

This document outlines the design principles and standards applied to the "Billion Dollar UI Upgrade" for the PrepSt application. These rules ensure a premium, cohesive, and fully theme-aware (Dark/Light mode) user experience.

## 1. Layout & Spacing
*   **Canvas:** Use `min-h-screen bg-background` for all page roots.
*   **Container Width:** Prefer `max-w-6xl` or `max-w-7xl` to allow content to breathe. Avoid narrow `max-w-4xl` unless reading-focused.
*   **Vertical Rhythm:** Use generous spacing.
    *   Page padding: `py-12 px-6`.
    *   Section spacing: `space-y-12` or `space-y-16`.
    *   Card internal padding: `p-6` or `p-8`.

## 2. Color & Theming (Dark Mode Native)
*   **Semantic Colors Only:** Never use hardcoded hex or tailwind colors (e.g., `bg-white`, `text-gray-900`) for structural elements.
    *   **Backgrounds:** `bg-background`, `bg-card`, `bg-muted/30`.
    *   **Text:** `text-foreground`, `text-muted-foreground`.
    *   **Borders:** `border-border`.
*   **Opacity-Based Accents:** For colored backgrounds, use opacity to ensure compatibility with dark mode.
    *   ❌ Bad: `bg-blue-50 text-blue-700` (Too bright in dark mode).
    *   ✅ Good: `bg-blue-500/10 text-blue-600 dark:text-blue-400`.
*   **Brand Identity:**
    *   **Primary Action:** Solid brand color `#866ffe` with hover `#7a5ffe` and `text-white`.
    *   **Secondary/Ghost:** `variant="outline"` or `variant="ghost"` using standard shadcn tokens.

## 3. Typography
*   **Headings:**
    *   `text-4xl font-extrabold tracking-tight text-foreground` for page titles.
    *   `text-2xl font-bold text-foreground` for section headers.
*   **Subtext:** `text-lg text-muted-foreground` for page descriptions.
*   **Data/Labels:**
    *   **Values:** `text-3xl font-black tracking-tight`.
    *   **Labels:** `text-xs font-bold text-muted-foreground uppercase tracking-wider`.
*   **Numbers:** Use `font-mono tabular-nums` for timers, scores, and data to prevent layout shifts.

## 4. Component Styling
*   **Cards & Surfaces:**
    *   Radius: `rounded-2xl` or `rounded-3xl`.
    *   Borders: `border border-border`.
    *   Shadows: `shadow-sm` for static, `shadow-md` or `shadow-xl` for floating/interactive elements.
    *   **Glassmorphism:** Use `bg-background/80 backdrop-blur-xl border-b border-border/40` for sticky headers.
*   **Interactivity:**
    *   Clickable Cards: `hover:shadow-md transition-all duration-300 hover:scale-[1.01]`.
    *   List Items: `hover:bg-muted/50 transition-colors`.

## 5. Data Visualization
*   **Charts:**
    *   Clean, minimal axes (hide tick lines where possible).
    *   Use CSS variables for colors: `stroke="hsl(var(--primary))"`.
*   **Empty States:**
    *   Never use a simple text alert.
    *   Use a visual component: Large muted icon, centered text, `bg-muted/10`, `rounded-2xl`, `border-2 border-dashed border-border`.

## 6. Specific Patterns
*   **Status Badges:** Outline style `variant="outline"` with a colored dot indicator (e.g., `w-1.5 h-1.5 rounded-full bg-emerald-500`) inside.
*   **Progress Bars:** Place at the very bottom of headers or cards, thin (`h-1` or `h-2`), with a subtle glow.
*   **Icons:** Always wrap icons in a container (`w-10 h-10 rounded-xl flex items-center justify-center`) with a theme-aware background (`bg-primary/10`).

## Example Usage (Tailwind Class String)
```tsx
// A standard "Billion Dollar" Card
<div className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
    <Icon className="w-6 h-6 text-primary" />
  </div>
  <h3 className="text-xl font-bold text-foreground mb-2">Feature Title</h3>
  <p className="text-muted-foreground leading-relaxed">
    Description text that is easy to read and perfectly contrasted in both themes.
  </p>
</div>
```
