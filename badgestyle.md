# Badge Style Guide

This document explains the badge/pill component styling patterns used throughout the application. Badges are small, rounded components used for labels, tags, status indicators, and categorization.

## Custom Inline Badge (Mock Exam Style)

### Complete Structure

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
  <Zap className="w-3.5 h-3.5 text-primary" />
  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
    Full-Length Practice Test
  </span>
</div>
```

### Style Breakdown

#### Container

```tsx
className =
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit";
```

**Layout:**

- **`inline-flex`** - Inline flex container

  - Allows badge to sit inline with text
  - Maintains flex properties for internal alignment

- **`items-center`** - Vertical centering

  - Aligns icon and text vertically

- **`gap-2`** - 8px spacing between icon and text
  - Creates comfortable visual separation

**Spacing:**

- **`px-3`** - Horizontal padding of 12px

  - Left and right padding for text breathing room

- **`py-1.5`** - Vertical padding of 6px
  - Top and bottom padding
  - Creates compact, pill-shaped appearance

**Shape:**

- **`rounded-full`** - Fully rounded (pill shape)
  - Creates smooth, modern appearance
  - Essential for badge/pill aesthetic

**Colors:**

- **`bg-primary/10`** - 10% opacity primary background

  - Subtle background tint
  - Theme-aware color

- **`border border-primary/20`** - 20% opacity primary border
  - Slightly stronger than background
  - Creates definition without harshness
  - Complements background color

**Sizing:**

- **`w-fit`** - Width fits content
  - Badge only takes up necessary space
  - Prevents unnecessary stretching

#### Icon Styling

```tsx
<Zap className="w-3.5 h-3.5 text-primary" />
```

- **`w-3.5 h-3.5`** - 14px × 14px icon size

  - Small, proportional to badge size
  - Doesn't overwhelm text

- **`text-primary`** - Primary color
  - Matches badge theme
  - Creates visual consistency

#### Text Styling

```tsx
<span className="text-xs font-semibold text-primary uppercase tracking-wide">
  Full-Length Practice Test
</span>
```

- **`text-xs`** - Extra small text (12px)

  - Appropriate for badge size
  - Maintains readability

- **`font-semibold`** - Semi-bold weight (600)

  - Creates visual emphasis
  - Improves readability at small size

- **`text-primary`** - Primary color text

  - Matches icon and border
  - Theme consistency

- **`uppercase`** - Uppercase transformation

  - Creates label-like appearance
  - Common for badges/tags

- **`tracking-wide`** - Letter spacing (0.025em)
  - Improves readability of uppercase text
  - Creates premium, polished look

## Badge Component (UI Library)

### Component Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Default Badge</Badge>
<Badge variant="secondary">Secondary Badge</Badge>
<Badge variant="outline">Outline Badge</Badge>
<Badge variant="destructive">Destructive Badge</Badge>
```

### Base Styles

The Badge component uses these base classes:

```tsx
"inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden";
```

**Key Features:**

- **`inline-flex`** - Inline flex layout
- **`items-center justify-center`** - Perfect centering
- **`rounded-full`** - Pill shape
- **`px-2 py-0.5`** - Compact padding (8px × 2px)
- **`text-xs`** - Small text size
- **`font-medium`** - Medium weight (500)
- **`w-fit`** - Fits content width
- **`whitespace-nowrap`** - Prevents text wrapping
- **`shrink-0`** - Prevents shrinking in flex layouts
- **`gap-1`** - 4px gap for icon spacing
- **`[&>svg]:size-3`** - 12px icon size
- **`transition-[color,box-shadow]`** - Smooth transitions

### Variants

#### Default Variant

```tsx
<Badge variant="default">Default</Badge>
```

**Styles:**

- `border-transparent` - No visible border
- `bg-primary` - Primary color background
- `text-primary-foreground` - Contrasting text
- `[a&]:hover:bg-primary/90` - Darker on hover (when used as link)

#### Secondary Variant

```tsx
<Badge variant="secondary">Secondary</Badge>
```

**Styles:**

- `border-transparent` - No visible border
- `bg-secondary` - Secondary color background
- `text-secondary-foreground` - Contrasting text
- `[a&]:hover:bg-secondary/90` - Darker on hover

#### Outline Variant

```tsx
<Badge variant="outline">Outline</Badge>
```

**Styles:**

- `text-foreground` - Theme-aware text color
- `[a&]:hover:bg-accent` - Accent background on hover
- `[a&]:hover:text-accent-foreground` - Accent text on hover
- Border uses default border color

#### Destructive Variant

```tsx
<Badge variant="destructive">Destructive</Badge>
```

**Styles:**

- `border-transparent` - No visible border
- `bg-destructive` - Destructive/error color
- `text-white` - White text for contrast
- `[a&]:hover:bg-destructive/90` - Darker on hover
- `dark:bg-destructive/60` - Reduced opacity in dark mode

### Badge with Icon

```tsx
<Badge variant="outline">
  <Icon className="w-3 h-3" />
  Label
</Badge>
```

Icons automatically receive:

- `size-3` (12px) sizing
- `pointer-events-none` - Prevents icon from intercepting clicks
- Proper spacing via `gap-1`

## Custom Badge Variations

### Status Badge (Priority)

```tsx
<Badge
  variant="outline"
  className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 font-medium"
>
  Important
</Badge>
```

**Color Variations:**

- **Important**: Red tones
- **New**: Blue tones (`border-blue-200 bg-blue-50 text-blue-700`)
- **Delayed**: Yellow tones (`border-yellow-200 bg-yellow-50 text-yellow-700`)

### Question Counter Badge

```tsx
<Badge
  variant="secondary"
  className="font-mono font-medium bg-secondary/50 hover:bg-secondary/50"
>
  <span className="text-foreground">{currentIndex + 1}</span>
  <span className="text-muted-foreground mx-1">/</span>
  <span className="text-muted-foreground">{totalQuestions}</span>
</Badge>
```

**Features:**

- **`font-mono`** - Monospace font for numbers
- **`bg-secondary/50`** - Semi-transparent background
- Mixed text colors for visual hierarchy

### Timer Badge

```tsx
<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border shadow-sm transition-all duration-300 bg-orange-500/5 border-orange-500/20 ring-1 ring-orange-500/10">
  <div className="px-2 min-w-[60px] text-center">
    <span className="text-sm font-mono font-bold tabular-nums tracking-tight text-orange-600 dark:text-orange-400">
      {formatTime(time)}
    </span>
  </div>
</div>
```

**Features:**

- **`bg-orange-500/5`** - Very subtle orange background
- **`border-orange-500/20`** - Orange border
- **`ring-1 ring-orange-500/10`** - Additional ring for depth
- **`font-mono tabular-nums`** - Monospace with tabular numbers
- **`shadow-sm`** - Subtle shadow

### Streak Badge

```tsx
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
  <Flame className="w-4 h-4 text-orange-500" />
  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
    {streak}
  </span>
</div>
```

**Features:**

- **`bg-orange-500/10`** - Orange background tint
- **`border-orange-500/20`** - Orange border
- Icon + text combination
- Gamification styling

## Size Variations

### Small Badge

```tsx
className = "px-2 py-0.5 text-xs";
```

- Minimal padding
- Extra small text
- Compact appearance

### Medium Badge (Default)

```tsx
className = "px-3 py-1.5 text-xs";
```

- Standard padding
- Extra small text
- Balanced appearance

### Large Badge

```tsx
className = "px-4 py-2 text-sm";
```

- Generous padding
- Small text
- More prominent appearance

## Color Patterns

### Primary Theme Badge

```tsx
className = "bg-primary/10 border border-primary/20 text-primary";
```

- Subtle primary background
- Primary border
- Primary text

### Success Badge

```tsx
className =
  "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
```

- Green tones
- Success/positive states

### Warning Badge

```tsx
className =
  "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400";
```

- Yellow/amber tones
- Warning states

### Error Badge

```tsx
className =
  "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400";
```

- Red tones
- Error/destructive states

### Info Badge

```tsx
className =
  "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400";
```

- Blue tones
- Informational states

## Typography Patterns

### Uppercase Label

```tsx
className = "text-xs font-semibold uppercase tracking-wide";
```

- Uppercase transformation
- Wide letter spacing
- Common for category labels

### Regular Text

```tsx
className = "text-xs font-medium";
```

- Standard casing
- Medium weight
- Common for status badges

### Number Badge

```tsx
className = "text-xs font-mono font-bold tabular-nums";
```

- Monospace font
- Tabular numbers (prevent layout shift)
- Bold weight
- Common for counters

## Usage Guidelines

### When to Use Badges

1. **Labels** - Categorize content (e.g., "Full-Length Practice Test")
2. **Status Indicators** - Show state (e.g., "In Progress", "Completed")
3. **Counters** - Display numbers (e.g., "5/10", "Streak: 3")
4. **Tags** - Add metadata (e.g., "Important", "New")
5. **Pills** - Visual grouping (e.g., skill tags, topics)

### Best Practices

1. **Consistency** - Use same style for similar purposes
2. **Contrast** - Ensure sufficient contrast for readability
3. **Size** - Keep badges small and unobtrusive
4. **Spacing** - Maintain consistent gaps between badges
5. **Color** - Use semantic colors (green=success, red=error)
6. **Accessibility** - Ensure badges are readable and have proper contrast

### Accessibility

- **Contrast Ratios** - Ensure WCAG AA compliance (4.5:1 for text)
- **Focus States** - Badge component includes focus-visible styles
- **ARIA Labels** - Use appropriate aria-label for icon-only badges
- **Screen Readers** - Ensure badge text is descriptive

## Complete Examples

### Custom Badge with Icon

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
  <Icon className="w-3.5 h-3.5 text-primary" />
  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
    Label Text
  </span>
</div>
```

### Badge Component with Custom Styling

```tsx
<Badge
  variant="outline"
  className="bg-primary/10 border-primary/20 text-primary font-semibold uppercase tracking-wide"
>
  <Icon className="w-3.5 h-3.5" />
  Custom Badge
</Badge>
```

### Status Badge Collection

```tsx
<div className="flex flex-wrap gap-2">
  <Badge
    variant="outline"
    className="bg-green-50 border-green-200 text-green-700"
  >
    Active
  </Badge>
  <Badge
    variant="outline"
    className="bg-yellow-50 border-yellow-200 text-yellow-700"
  >
    Pending
  </Badge>
  <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
    Error
  </Badge>
</div>
```

## Comparison: Custom vs Component

### Custom Inline Badge

**Pros:**

- Full control over styling
- Can customize every aspect
- No component overhead

**Cons:**

- More verbose
- Less consistent
- Harder to maintain

### Badge Component

**Pros:**

- Consistent styling
- Built-in variants
- Accessibility features
- Easier maintenance

**Cons:**

- Less flexible
- May need className overrides

## Migration Guide

### Converting Custom Badge to Component

**Before (Custom):**

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
  <Icon className="w-3.5 h-3.5 text-primary" />
  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
    Label
  </span>
</div>
```

**After (Component):**

```tsx
<Badge
  variant="outline"
  className="bg-primary/10 border-primary/20 text-primary font-semibold uppercase tracking-wide px-3 py-1.5"
>
  <Icon className="w-3.5 h-3.5" />
  Label
</Badge>
```

Full-Length Practice Test
