# Gradient Card Style Guide

This document explains the gradient card styling with animated blur effects and interactive button styles used in call-to-action sections.

## Complete Gradient Card Structure

```tsx
<div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 md:p-12 shadow-xl">
  {/* Background Blur Effects */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
  <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

  {/* Content */}
  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
    {/* Left Content */}
    <div className="flex-1 space-y-4">
      {/* Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Ready to test your skills?
        </h2>
      </div>

      {/* Description and Bullet Points */}
      <div className="space-y-2 pl-14">
        <p className="text-muted-foreground leading-relaxed text-lg">
          Simulate real exam conditions and get instant feedback on your
          performance.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>2+ hours recommended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Quiet environment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Cannot be paused</span>
          </div>
        </div>
      </div>
    </div>

    {/* Right Content - Button */}
    <Button
      onClick={createMockExam}
      disabled={isCreating}
      className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shrink-0 rounded-xl"
    >
      {isCreating ? (
        <>
          <Zap className="w-5 h-5 mr-2 animate-pulse" />
          Preparing Exam...
        </>
      ) : (
        <>
          <Award className="w-5 h-5 mr-2" />
          Start Mock Exam
        </>
      )}
    </Button>
  </div>
</div>
```

## Card Container Styles

### Base Container

```tsx
className =
  "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 md:p-12 shadow-xl";
```

#### Positioning & Overflow

- **`relative`** - Establishes positioning context for absolute children
- **`overflow-hidden`** - Clips blur effects that extend beyond card boundaries
  - Essential for containing the large blur circles

#### Shape & Borders

- **`rounded-3xl`** - Large border radius (24px)

  - Creates soft, modern appearance
  - Matches the premium feel of the card

- **`border border-border`** - Theme-aware border
  - Subtle definition without harshness
  - Uses CSS variable for theme consistency

#### Gradient Background

- **`bg-gradient-to-br`** - Diagonal gradient (bottom-right direction)

  - Creates depth and visual interest
  - More dynamic than horizontal/vertical gradients

- **`from-primary/5`** - Starting color (5% opacity primary)

  - Very subtle tint at the top-left

- **`via-primary/10`** - Middle color (10% opacity primary)

  - Slightly stronger in the center

- **`to-transparent`** - Ending color (fully transparent)
  - Fades to nothing at bottom-right
  - Creates elegant fade effect

#### Spacing

- **`p-8 md:p-12`** - Responsive padding
  - Mobile: 32px (2rem)
  - Desktop: 48px (3rem)
  - Generous spacing for premium feel

#### Shadow

- **`shadow-xl`** - Extra-large shadow
  - Creates floating effect
  - Adds depth and elevation

## Background Blur Effects

### Top-Right Blur Circle

```tsx
<div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
```

**Style Breakdown:**

- **`absolute top-0 right-0`** - Positions at top-right corner
- **`w-96 h-96`** - Large size (384px × 384px)
  - Creates substantial glow area
- **`bg-primary/10`** - 10% opacity primary color
  - Subtle color tint
- **`rounded-full`** - Perfect circle
- **`blur-3xl`** - Maximum blur (64px)
  - Creates soft, diffused glow
- **`-translate-y-1/2 translate-x-1/2`** - Centers circle on corner
  - Moves half its width/height
  - Creates seamless edge glow

### Bottom-Left Blur Circle

```tsx
<div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
```

**Style Breakdown:**

- **`absolute bottom-0 left-0`** - Positions at bottom-left corner
- **`w-72 h-72`** - Medium size (288px × 288px)
  - Slightly smaller for visual balance
- **`bg-purple-500/10`** - 10% opacity purple
  - Complementary color to primary
  - Creates color harmony
- **`blur-3xl`** - Maximum blur
- **`translate-y-1/2 -translate-x-1/2`** - Centers on opposite corner

**Design Purpose:**

- Creates ambient lighting effect
- Adds depth without being distracting
- Complements the gradient background
- Provides visual interest in empty space

## Content Layout

### Content Container

```tsx
className =
  "relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8";
```

- **`relative z-10`** - Ensures content appears above blur effects
- **`flex flex-col lg:flex-row`** - Responsive layout
  - Stacked on mobile
  - Side-by-side on desktop
- **`items-start lg:items-center`** - Vertical alignment
  - Top-aligned on mobile
  - Center-aligned on desktop
- **`justify-between`** - Space between content and button
- **`gap-8`** - 32px spacing between flex items

## Icon Badge Style

```tsx
<div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
  <Target className="w-5 h-5 text-primary" />
</div>
```

**Style Breakdown:**

- **`w-10 h-10`** - 40px × 40px square
- **`rounded-xl`** - 12px border radius
  - Softer than sharp corners
  - Modern, friendly appearance
- **`bg-primary/20`** - 20% opacity primary background
  - Subtle background tint
  - Complements icon color
- **`flex items-center justify-center`** - Centers icon perfectly
- **Icon size**: `w-5 h-5` (20px) - 50% of container

## Bullet Point Style

```tsx
<div className="flex items-center gap-1.5">
  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
  <span>2+ hours recommended</span>
</div>
```

**Style Breakdown:**

- **`flex items-center`** - Horizontal alignment
- **`gap-1.5`** - 6px spacing between dot and text
- **Dot**: `w-1.5 h-1.5` (6px) - Small, subtle indicator
- **`rounded-full`** - Perfect circle
- **`bg-primary`** - Full opacity primary color
  - Creates clear visual indicator
  - Matches theme colors

## Button Styles & Animations

### Base Button

```tsx
className =
  "h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shrink-0 rounded-xl";
```

### Button Style Breakdown

#### Size & Spacing

- **`h-14`** - Height of 56px (3.5rem)
  - Large, prominent button
  - Easy to click/tap
- **`px-8`** - Horizontal padding of 32px
  - Generous spacing around text
  - Comfortable click area

#### Typography

- **`text-lg`** - Large text size (18px)
  - Clear, readable text
  - Matches button prominence
- **`font-semibold`** - Semi-bold weight (600)
  - Strong visual hierarchy
  - Clear call-to-action

#### Colors

- **`bg-primary`** - Primary color background
  - Theme-aware primary color
  - Brand consistency
- **`hover:bg-primary/90`** - 90% opacity on hover
  - Slight darkening effect
  - Visual feedback
- **`text-primary-foreground`** - Contrasting text color
  - Ensures readability
  - Theme-aware foreground

#### Shadows

- **`shadow-lg`** - Large shadow
  - Creates elevation
  - Makes button appear raised
- **`shadow-primary/25`** - Colored shadow tint
  - 25% opacity primary color
  - Creates glow effect
  - Enhances brand presence

#### Animations & Transitions

- **`transition-all`** - Smooth transitions for all properties

  - Duration: 150ms (default)
  - Easing: ease-in-out (default)
  - Applies to all animatable properties

- **`hover:scale-105`** - Scale up 5% on hover

  - Creates interactive feedback
  - Makes button feel responsive
  - Subtle but noticeable

- **`disabled:opacity-70`** - Reduced opacity when disabled

  - Visual indication of disabled state
  - Still visible but clearly inactive

- **`disabled:hover:scale-100`** - Prevents scaling when disabled
  - Overrides hover scale effect
  - Maintains disabled appearance

#### Layout

- **`shrink-0`** - Prevents button from shrinking
  - Maintains button size in flex layouts
  - Ensures consistent appearance

#### Shape

- **`rounded-xl`** - 12px border radius
  - Modern, friendly appearance
  - Matches card's rounded aesthetic

### Button Icon Animations

#### Loading State (with Pulse Animation)

```tsx
{
  isCreating ? (
    <>
      <Zap className="w-5 h-5 mr-2 animate-pulse" />
      Preparing Exam...
    </>
  ) : (
    <>
      <Award className="w-5 h-5 mr-2" />
      Start Mock Exam
    </>
  );
}
```

**Animation Details:**

- **`animate-pulse`** - Tailwind pulse animation
  - Opacity animates between 1.0 and 0.5
  - Duration: 2s
  - Infinite loop
  - Creates breathing/pulsing effect
  - Indicates loading/processing state

**Icon Sizing:**

- **`w-5 h-5`** - 20px × 20px icons
- **`mr-2`** - 8px right margin
  - Spacing between icon and text

## Animation Timing Reference

### Transition Durations

- **`transition-all`** - Default 150ms
- **`transition-all duration-200`** - 200ms (slightly slower)
- **`transition-all duration-300`** - 300ms (more noticeable)

### Scale Values

- **`hover:scale-105`** - 5% larger (subtle)
- **`hover:scale-110`** - 10% larger (more pronounced)
- **`hover:scale-[1.02]`** - 2% larger (very subtle)

### Opacity Values

- **`opacity-70`** - 70% opacity (disabled state)
- **`opacity-50`** - 50% opacity (more faded)
- **`opacity-30`** - 30% opacity (very faded)

## Usage Guidelines

### When to Use This Style

1. **Call-to-Action Cards** - Primary actions users should take
2. **Feature Highlights** - Showcasing key features
3. **Promotional Sections** - Drawing attention to important content
4. **Interactive Elements** - Cards with primary buttons

### Best Practices

1. **Limit Usage** - Use sparingly for maximum impact
2. **Content Balance** - Ensure content doesn't compete with effects
3. **Performance** - Blur effects can be GPU-intensive on low-end devices
4. **Accessibility** - Ensure sufficient contrast for text readability
5. **Responsive Design** - Test blur effects on various screen sizes

## Alternative Variations

### Subtle Gradient Card

```tsx
className =
  "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/3 via-primary/5 to-transparent p-8 shadow-lg";
```

### Stronger Gradient Card

```tsx
className =
  "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-primary/15 to-transparent p-8 shadow-2xl";
```

### Single Blur Effect

```tsx
<div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
```

### Animated Blur (CSS)

```css
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
}

.blur-animated {
  animation: pulse-glow 3s ease-in-out infinite;
}
```

## Performance Considerations

1. **Blur Effects** - `blur-3xl` is GPU-intensive

   - Use sparingly
   - Consider reducing blur on mobile devices

2. **Multiple Blurs** - Two blur effects can impact performance

   - Monitor performance on lower-end devices
   - Consider reducing blur intensity if needed

3. **Transitions** - `transition-all` animates all properties

   - More performant: specify exact properties
   - Example: `transition-colors transition-transform`

4. **Scale Animations** - `hover:scale-105` uses transform
   - Transform is GPU-accelerated
   - Generally performant

## Complete Example with All Features

```tsx
<div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 md:p-12 shadow-xl">
  {/* Background Blur Effects */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
  <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

  {/* Content */}
  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Title</h2>
      </div>
      <div className="space-y-2 pl-14">
        <p className="text-muted-foreground leading-relaxed text-lg">
          Description text here.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Bullet point</span>
          </div>
        </div>
      </div>
    </div>
    <Button className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shrink-0 rounded-xl">
      <Icon className="w-5 h-5 mr-2" />
      Button Text
    </Button>
  </div>
</div>
```
