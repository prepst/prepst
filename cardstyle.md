# Card Style Guide

## Profile Card Style

This document explains the styling used for the profile card component and similar card elements throughout the application.

### Base Card Structure

```tsx
<div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
```

### Style Breakdown

#### Background & Glassmorphism

- **`bg-card/50`** - Semi-transparent card background (50% opacity)
  - Creates a glassmorphic effect when combined with backdrop-blur
  - Allows underlying content to show through subtly
- **`backdrop-blur-xl`** - Large backdrop blur effect
  - Blurs content behind the card
  - Creates depth and modern glassmorphism aesthetic
  - `xl` = 24px blur radius

#### Borders

- **`border border-border/50`** - Subtle border with 50% opacity
  - Uses theme-aware border color
  - Semi-transparent for softer appearance
  - Helps define card edges without being too harsh

#### Shape & Spacing

- **`rounded-3xl`** - Large border radius (1.5rem / 24px)
  - Creates soft, modern rounded corners
  - More rounded than `rounded-2xl` for a friendlier appearance
- **`p-8`** - Padding of 2rem (32px) on all sides
  - Generous spacing for content
  - Creates breathing room inside the card

#### Shadow System

**`shadow-xl`** - Extra-large shadow

This Tailwind class translates to:

```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

**Shadow Breakdown:**

- **First shadow** (20px blur, 25px spread): Creates the main depth effect
- **Second shadow** (10px blur, 10px spread): Adds subtle definition
- **Negative spread** (-5px): Pulls shadow inward slightly for a more refined look
- **Opacity**: 10% and 4% black for subtle, non-intrusive shadows

**Shadow Scale Reference:**

- `shadow-sm` - Small shadow (0 1px 2px)
- `shadow` - Default shadow (0 1px 3px)
- `shadow-md` - Medium shadow (0 4px 6px)
- `shadow-lg` - Large shadow (0 10px 15px)
- `shadow-xl` - Extra-large shadow (0 20px 25px) ← **Current**
- `shadow-2xl` - 2X extra-large shadow (0 25px 50px)

#### Layout & Positioning

- **`flex flex-col`** - Vertical flexbox layout
- **`items-center`** - Centers items horizontally
- **`text-center`** - Centers text content
- **`relative`** - Establishes positioning context for absolute children
- **`overflow-hidden`** - Clips content that exceeds card boundaries

### Enhanced Shadow Options

#### Colored Shadow (Theme-Aware)

```tsx
className = "shadow-xl shadow-primary/10";
```

- Adds a subtle primary color tint to the shadow
- Creates brand consistency

#### Custom Shadow Intensity

```tsx
// More subtle
className="shadow-lg"

// More dramatic
className="shadow-2xl"

// Custom CSS shadow
style={{
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
}}
```

#### Shadow with Glow Effect

```tsx
className = "shadow-xl shadow-primary/20";
```

- Creates a glowing effect around the card
- Useful for highlighted or active states

### Complete Card Example

```tsx
<div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
  {/* Background Effects */}
  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />

  {/* Content */}
  <div className="relative z-10">{/* Card content here */}</div>
</div>
```

### Design Principles

1. **Layering**: Use `relative` parent with `absolute` children for layered effects
2. **Depth**: Combine backdrop-blur with shadow-xl for 3D appearance
3. **Transparency**: Use opacity variants (`/50`, `/10`) for subtle effects
4. **Consistency**: Maintain consistent border radius (`rounded-3xl`) and padding (`p-8`) across similar cards
5. **Accessibility**: Ensure sufficient contrast when using semi-transparent backgrounds

### When to Use This Style

- **Profile cards** - User information display
- **Feature cards** - Highlighting key features
- **Stat cards** - Displaying metrics and data
- **Content cards** - General content containers
- **Modal backgrounds** - Overlay content

### Alternative Styles

#### Minimal Card

```tsx
className = "bg-card border border-border rounded-2xl p-6 shadow-sm";
```

#### Elevated Card

```tsx
className =
  "bg-card border border-border rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-shadow";
```

#### Glass Card (More Transparent)

```tsx
className =
  "bg-card/30 backdrop-blur-2xl border border-border/30 rounded-3xl p-8 shadow-xl";
```
