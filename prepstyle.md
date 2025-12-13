# PrepStyle - Practice Page Styling Guide

Complete styling documentation for the Practice Session page (`/practice/[sessionId]`). Use this guide to replicate similar pages with consistent styling.

## Table of Contents

1. [Layout Structure](#layout-structure)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Header Component](#header-component)
5. [Footer Component](#footer-component)
6. [Question Panel](#question-panel)
7. [Answer Panel](#answer-panel)
8. [Question List Sidebar](#question-list-sidebar)
9. [Timer Components](#timer-components)
10. [Confidence Rating](#confidence-rating)
11. [AI Feedback Display](#ai-feedback-display)
12. [Custom CSS](#custom-css)
13. [Animations & Transitions](#animations--transitions)

---

## Layout Structure

### Main Container

```tsx
<div className="h-screen bg-background flex flex-col overflow-hidden">
```

**Key Properties:**

- Full viewport height (`h-screen`)
- Background color: `bg-background`
- Flex column layout
- Hidden overflow

### Three-Panel Layout

```tsx
<div className="flex-1 flex overflow-hidden">
  {/* Left: Question Panel - Flexible width */}
  <div className="flex-1 flex flex-col min-w-0">{/* QuestionPanel */}</div>

  {/* Draggable Divider */}
  <div className="w-1 bg-border hover:bg-primary cursor-col-resize" />

  {/* Right: Answer Panel - Dynamic width */}
  <div
    className="border-l border-border bg-card/50 backdrop-blur-sm flex flex-col"
    style={{ width: `${dividerPosition}px` }}
  >
    {/* AnswerPanel */}
  </div>
</div>
```

**Divider Styling:**

- Width: `1px` (`w-1`)
- Background: `bg-border`
- Hover: `hover:bg-primary`
- Cursor: `cursor-col-resize`
- Transition: `transition-colors`

---

## Color Palette

### Primary Colors

- **Primary**: `#866ffe` (purple) - Used for main actions, selected states
- **Background**: `bg-background` - Main page background
- **Card**: `bg-card` - Panel backgrounds
- **Muted**: `bg-muted` - Subtle backgrounds

### Status Colors

- **Success/Correct**:
  - Green: `bg-green-500`, `text-green-500`, `border-green-500`
  - Opacity variants: `bg-green-500/10`, `border-green-500/20`
- **Error/Wrong**:
  - Red: `bg-red-500`, `text-red-500`, `border-red-500`
  - Opacity variants: `bg-red-500/10`, `border-red-500/20`
- **Destructive**: `bg-destructive`, `text-destructive`

### Difficulty Colors

- **Easy**: `bg-emerald-500`, `text-emerald-600 dark:text-emerald-400`
- **Medium**: `bg-amber-500`, `text-amber-600 dark:text-amber-400`
- **Hard**: `bg-rose-500`, `text-rose-600 dark:text-rose-400`

### Timer Colors

- **Timer Mode**: `bg-orange-500/5 border-orange-500/20 ring-1 ring-orange-500/10`
- **Stopwatch Mode**: `bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/10`

### Gamification Colors

- **Streak**: `bg-orange-500/10 border border-orange-500/20`, `text-orange-600 dark:text-orange-400`
- **Score**: `bg-yellow-500/10 border border-yellow-500/20`, `text-yellow-700 dark:text-yellow-400`

---

## Typography

### Font Sizes

- **Extra Small**: `text-[10px]` - Labels, metadata
- **Small**: `text-sm` - Secondary text, badges
- **Base**: `text-base` - Default body text
- **Large**: `text-lg` - Headings, important text
- **Extra Large**: `text-xl` - Question stems
- **3XL**: `text-3xl` - Large inputs (SPR answers)

### Font Weights

- **Medium**: `font-medium` - Regular emphasis
- **Semibold**: `font-semibold` - Headings, labels
- **Bold**: `font-bold` - Strong emphasis, numbers
- **Mono**: `font-mono` - Numbers, timers, codes

### Font Families

- **Default**: System font stack
- **Mono**: `font-mono` - For timers, question numbers, tabular numbers (`tabular-nums`)

### Text Colors

- **Foreground**: `text-foreground` - Primary text
- **Muted**: `text-muted-foreground` - Secondary text
- **Primary**: `text-primary` - Accent text

---

## Header Component

### Container

```tsx
<div className="relative z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
  <div className="flex items-center justify-between px-6 h-16">
```

**Properties:**

- Height: `h-16` (64px)
- Padding: `px-6` (24px horizontal)
- Background: `bg-background/80` with `backdrop-blur-xl`
- Border: `border-b border-border/40`
- Z-index: `z-50`

### Branding Section

```tsx
<div className="flex items-center gap-3">
  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
    <span className="font-bold text-primary">P</span>
  </div>
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-foreground leading-none">
      Practice Session
    </span>
    <span className="text-[10px] text-muted-foreground font-medium mt-1">
      SAT Prep
    </span>
  </div>
</div>
```

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

### Timer Display (Active)

```tsx
<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border shadow-sm transition-all duration-300 bg-orange-500/5 border-orange-500/20 ring-1 ring-orange-500/10">
  <div className="px-2 min-w-[60px] text-center">
    <span className="text-sm font-mono font-bold tabular-nums tracking-tight text-orange-600 dark:text-orange-400">
      {formatTime(time)}
    </span>
  </div>
  {/* Control buttons */}
</div>
```

### Gamification Stats

```tsx
{
  /* Streak */
}
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
  <Flame className="w-4 h-4 text-orange-500" />
  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
    {streak}
  </span>
</div>;

{
  /* Score */
}
<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
  <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400 tabular-nums">
    {score}
  </span>
</div>;
```

### Progress Bar

```tsx
<div className="absolute bottom-0 left-0 w-full h-[3px] bg-muted/20 overflow-hidden">
  <div
    className="relative h-full transition-all duration-700 ease-out overflow-hidden"
    style={{ width: `${progress}%` }}
  >
    {/* Main gradient fill */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />

    {/* Secondary gradient layer */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80 opacity-60" />

    {/* Animated shine effect */}
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s ease-in-out infinite",
      }}
    />

    {/* Glow effect */}
    <div className="absolute top-0 right-0 w-8 h-full bg-primary/60 blur-md transition-all duration-700" />

    {/* Animated particles */}
    <div className="absolute top-0 right-0 w-12 h-full overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/70 blur-[3px] animate-pulse" />
    </div>
  </div>
</div>
```

**Key Features:**

- Height: `3px`
- Gradient fill with multiple layers
- Animated shimmer effect
- Glow particles at leading edge
- Smooth transitions (`duration-700 ease-out`)

---

## Footer Component

### Container

```tsx
<div className="relative z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 supports-[backdrop-filter]:bg-background/60">
  <div className="flex items-center justify-between px-6 h-16">
```

### Back Button

```tsx
<Button
  variant="outline"
  className="h-10 px-4 border-border/60 bg-background/50 hover:bg-accent transition-all"
  disabled={isFirstQuestion}
>
  <ChevronLeft className="w-4 h-4 mr-2" />
  Back
</Button>
```

### Question Counter (Center)

```tsx
<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/40 backdrop-blur-sm">
    <span className="text-sm font-medium text-muted-foreground">Question</span>
    <span className="text-sm font-bold text-foreground tabular-nums">
      {currentIndex + 1}
    </span>
    <span className="text-sm font-medium text-muted-foreground">of</span>
    <span className="text-sm font-bold text-foreground tabular-nums">
      {totalQuestions}
    </span>
  </div>
</div>
```

### Primary Action Button

```tsx
<Button
  className="h-10 px-6 font-semibold transition-all shadow-sm text-white hover:opacity-90"
  style={{ backgroundColor: "#866ffe" }}
>
  <ChevronRight className="w-4 h-4 mr-2" />
  Next Question
</Button>
```

**Properties:**

- Height: `h-10` (40px)
- Padding: `px-6` (24px horizontal)
- Background: `#866ffe` (custom purple)
- Shadow: `shadow-sm`
- Hover: `hover:opacity-90`

### Skip Button

```tsx
<Button
  variant="outline"
  className="h-10 px-4 border-border/60 bg-background/50 hover:bg-muted/80 text-foreground transition-all"
>
  Skip
</Button>
```

---

## Question Panel

### Container

```tsx
<div className="flex-1 overflow-y-auto p-8 lg:p-12">
  <div className="max-w-3xl mx-auto space-y-8">
```

**Properties:**

- Padding: `p-8` (32px), `lg:p-12` (48px on large screens)
- Max width: `max-w-3xl` (768px)
- Centered: `mx-auto`
- Vertical spacing: `space-y-8` (32px)

### Question Meta Badges

```tsx
<div className="flex items-center gap-4">
  {/* Difficulty Badge */}
  <Badge
    variant="outline"
    className="pl-2 pr-3 py-1 gap-2 border-border bg-card text-foreground font-medium"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    Easy
  </Badge>

  {/* Topic Badge */}
  <Badge
    variant="outline"
    className="pl-2 pr-3 py-1 gap-1.5 border-border bg-card text-foreground font-medium"
  >
    <Tag className="w-3 h-3 text-muted-foreground" />
    <span className="text-sm">{topicName}</span>
  </Badge>
</div>
```

### Stimulus (Passage)

```tsx
<div className="relative pl-6 border-l-4 border-primary/20">
  <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
    {/* HTML content */}
  </div>
</div>
```

**Properties:**

- Left padding: `pl-6` (24px)
- Left border: `border-l-4 border-primary/20`
- Typography: `prose prose-lg` (Tailwind Typography)
- Text color: `text-muted-foreground`
- Line height: `leading-relaxed`

### Question Stem

```tsx
<div className="prose prose-xl dark:prose-invert max-w-none text-foreground font-medium leading-relaxed tracking-tight">
  {/* HTML content */}
</div>
```

**Properties:**

- Typography: `prose prose-xl`
- Text color: `text-foreground`
- Font weight: `font-medium`
- Line height: `leading-relaxed`
- Letter spacing: `tracking-tight`

---

## Answer Panel

### Container

```tsx
<div className="p-8 flex-1 overflow-y-auto">
```

### Section Header

```tsx
<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
  Select an Answer
</h3>
```

### Student Produced Response (SPR) Input

```tsx
<Input className="text-3xl h-20 text-center font-mono tracking-widest bg-card border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all" />
```

**Properties:**

- Font size: `text-3xl`
- Height: `h-20` (80px)
- Text align: `text-center`
- Font: `font-mono`
- Letter spacing: `tracking-widest`
- Border: `border-2`
- Border radius: `rounded-2xl`
- Focus ring: `focus:ring-4 focus:ring-primary/10`

### Multiple Choice Options

```tsx
<div className="space-y-3">
  {options.map((option, index) => (
    <div
      className={`
        group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out
        ${
          isCorrect
            ? "border-green-500 bg-green-500/10 ring-1 ring-green-500/20"
            : ""
        }
        ${isWrong ? "border-red-500 bg-red-500/10 ring-1 ring-red-500/20" : ""}
        ${
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.01] shadow-sm"
            : ""
        }
        ${
          !isSelected && !showFeedback
            ? "border-border bg-card hover:border-primary/50 hover:bg-accent hover:scale-[1.005]"
            : ""
        }
      `}
    >
      {/* Label Badge */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors bg-primary text-primary-foreground">
        {label}
      </div>

      {/* Answer Content */}
      <div className="flex-1 text-foreground font-medium">
        {/* HTML content */}
      </div>

      {/* Feedback Icon */}
      {isCorrect && <Check className="w-5 h-5 text-green-500" />}
      {isWrong && <X className="w-5 h-5 text-red-500" />}
    </div>
  ))}
</div>
```

**State Styles:**

- **Selected**: `border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.01] shadow-sm`
- **Correct**: `border-green-500 bg-green-500/10 ring-1 ring-green-500/20`
- **Wrong**: `border-red-500 bg-red-500/10 ring-1 ring-red-500/20`
- **Correct Answer (not selected)**: `border-green-500 bg-green-500/10 ring-1 ring-green-500/20 border-dashed`
- **Hover**: `hover:border-primary/50 hover:bg-accent hover:scale-[1.005]`

**Label Badge States:**

- **Selected**: `border-transparent bg-primary text-primary-foreground`
- **Correct**: `border-transparent bg-green-500 text-white`
- **Wrong**: `border-transparent bg-red-500 text-white`
- **Default**: `border-border bg-muted text-muted-foreground group-hover:bg-background`

### Feedback Section

```tsx
<div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
  <div
    className={`
    rounded-2xl p-6 border
    ${
      answer.isCorrect
        ? "bg-green-500/10 border-green-500/20"
        : "bg-destructive/10 border-destructive/20"
    }
  `}
  >
    <div className="flex items-center gap-4">
      <div
        className={`
        h-12 w-12 rounded-full flex items-center justify-center
        ${
          answer.isCorrect
            ? "bg-green-500 text-white"
            : "bg-destructive text-white"
        }
      `}
      >
        {answer.isCorrect ? (
          <Check className="w-6 h-6" />
        ) : (
          <X className="w-6 h-6" />
        )}
      </div>
      <div>
        <h4 className="text-lg font-bold text-foreground">
          {answer.isCorrect ? "Excellent Work!" : "Not Quite Right"}
        </h4>
        <p className="text-muted-foreground">
          {answer.isCorrect
            ? "You nailed this concept."
            : "Review the explanation below to understand why."}
        </p>
      </div>
    </div>
  </div>
</div>
```

### Action Buttons

```tsx
<div className="grid gap-3">
  {/* Primary Action */}
  <Button size="lg" className="w-full font-semibold h-12 text-base shadow-sm">
    AI Explanation
  </Button>

  {/* Secondary Actions */}
  <div className="grid grid-cols-2 gap-3">
    <Button variant="outline" className="h-12">
      Practice Similar
    </Button>
    <Button variant="outline" className="h-12">
      Save Question
    </Button>
  </div>
</div>
```

---

## Question List Sidebar

### Container

```tsx
<div className="w-[400px] border-r border-border bg-background/95 backdrop-blur-xl flex flex-col h-full shadow-xl z-20">
```

**Properties:**

- Width: `w-[400px]` (400px fixed)
- Background: `bg-background/95 backdrop-blur-xl`
- Shadow: `shadow-xl`
- Z-index: `z-20`

### Header

```tsx
<div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
  <div>
    <h3 className="text-base font-semibold text-foreground">
      Question Navigator
    </h3>
    <p className="text-xs text-muted-foreground">
      {questions.length} questions total
    </p>
  </div>
</div>
```

### Question Items

```tsx
<button
  className={`
    group w-full p-3 rounded-xl text-left transition-all duration-200 border
    ${
      isCurrent
        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
        : ""
    }
    ${isMarked ? "border-orange-500/30 bg-orange-500/5" : ""}
    ${
      isCorrect
        ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
        : ""
    }
    ${
      isWrong
        ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
        : ""
    }
    ${isAnswered ? "border-border bg-muted/30 hover:bg-muted/50" : ""}
    ${
      !isAnswered && !isCurrent
        ? "border-transparent hover:bg-accent hover:border-border"
        : ""
    }
  `}
>
  <div className="flex items-center justify-between gap-3">
    {/* Question Number */}
    <div
      className={`
      flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-medium transition-colors
      ${isCurrent ? "bg-primary text-primary-foreground" : ""}
      ${isAnswered ? "bg-secondary text-secondary-foreground" : ""}
      ${
        !isAnswered && !isCurrent
          ? "bg-muted text-muted-foreground group-hover:bg-muted/80"
          : ""
      }
    `}
    >
      {index + 1}
    </div>

    {/* Topic & Difficulty */}
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-medium truncate">{topicName}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-600">
        Easy
      </span>
    </div>

    {/* Status Icons */}
    <div className="shrink-0 flex items-center gap-1">
      {isMarked && <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />}
      {isCorrect && <Check className="w-4 h-4 text-green-500" />}
      {isWrong && <X className="w-4 h-4 text-destructive" />}
      {isCurrent && !isAnswered && (
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </div>
  </div>
</button>
```

**State Styles:**

- **Current**: `border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-sm`
- **Marked**: `border-orange-500/30 bg-orange-500/5`
- **Correct**: `border-green-500/20 bg-green-500/5 hover:bg-green-500/10`
- **Wrong**: `border-destructive/20 bg-destructive/5 hover:bg-destructive/10`
- **Answered**: `border-border bg-muted/30 hover:bg-muted/50`
- **Unanswered**: `border-transparent hover:bg-accent hover:border-border`

---

## Timer Components

### Timer Button (Inactive)

```tsx
<Button
  variant="outline"
  size="sm"
  className="h-9 rounded-full border-border/60 bg-background/50 hover:bg-accent gap-2 px-4 shadow-sm"
>
  <Clock className="w-4 h-4 text-muted-foreground" />
  <span className="text-xs font-medium text-muted-foreground">Timer</span>
</Button>
```

### Timer Display (Active)

```tsx
<div
  className={`
  flex items-center gap-1.5 px-2 py-1.5 rounded-full border shadow-sm transition-all duration-300
  ${
    timerMode === "timer"
      ? "bg-orange-500/5 border-orange-500/20 ring-1 ring-orange-500/10"
      : "bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/10"
  }
`}
>
  <div className="px-2 min-w-[60px] text-center">
    <span
      className={`
      text-sm font-mono font-bold tabular-nums tracking-tight
      ${
        timerMode === "timer"
          ? "text-orange-600 dark:text-orange-400"
          : "text-blue-600 dark:text-blue-400"
      }
    `}
    >
      {formatTime(time)}
    </span>
  </div>

  <div className="h-4 w-px bg-border/50" />

  {/* Control buttons */}
  <Button
    variant="ghost"
    size="icon"
    className="h-6 w-6 rounded-full hover:bg-background/80"
  >
    {/* Icons */}
  </Button>
</div>
```

### Timer Config Modal

```tsx
<div className="w-64">
  {/* Time Input */}
  <div className="bg-muted rounded-lg p-2 mb-1">
    <input className="w-12 text-2xl font-bold text-center bg-transparent text-foreground outline-none p-0 border-none focus:ring-0" />
  </div>
  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
    hr
  </span>
</div>
```

### Timer Options

```tsx
<Button
  variant="outline"
  className="h-auto py-4 justify-start px-4 border-border hover:bg-accent hover:text-accent-foreground"
>
  <div className="flex items-center gap-3">
    <div className="p-2 bg-primary/10 rounded-full text-primary">
      <Clock className="w-5 h-5" />
    </div>
    <div className="flex flex-col items-start">
      <span className="font-semibold text-sm text-foreground">Stopwatch</span>
      <span className="text-xs text-muted-foreground font-normal">
        Count up
      </span>
    </div>
  </div>
</Button>
```

---

## Confidence Rating

### Container

```tsx
<div className="mt-4 p-4 bg-muted/30 rounded-lg">
  <p className="text-sm font-medium text-foreground mb-2">
    How confident were you? (Optional)
  </p>
  <p className="text-xs text-muted-foreground mb-3">
    This helps analyze your learning progress and mastery level
  </p>

  <div className="flex items-center gap-2">
    {ratings.map((rating) => (
      <button
        className={`
          flex items-center gap-1 p-2 rounded-lg transition-all
          ${
            selectedRating === rating.value
              ? "bg-background border-2 border-primary shadow-sm"
              : "hover:bg-background hover:border-primary/50 border-2 border-transparent"
          }
        `}
      >
        <Star
          className={`
          w-4 h-4 transition-all
          ${
            selectedRating !== null && selectedRating >= rating.value
              ? rating.color
              : "text-muted-foreground/30"
          }
          ${
            selectedRating !== null && selectedRating >= rating.value
              ? "fill-current"
              : ""
          }
        `}
        />
        <span className="text-xs font-medium text-foreground">
          {rating.value}
        </span>
      </button>
    ))}
  </div>
</div>
```

**Rating Colors:**

- 1 (Guessing): `text-red-500`
- 2 (Unsure): `text-orange-500`
- 3 (Somewhat Sure): `text-yellow-500`
- 4 (Confident): `text-green-500`
- 5 (Very Confident): `text-blue-500`

---

## AI Feedback Display

### Container

```tsx
<Card className="mt-6 p-6 shadow-sm border-border/80">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-base font-semibold tracking-tight">
        AI Tutor Feedback
      </h4>
      <p className="text-xs text-muted-foreground">
        Personalized insights powered by PrepSt AI
      </p>
    </div>
    <Badge variant="secondary" className="text-[10px]">
      {isCorrect ? "Correct Attempt" : "Review & Improve"}
    </Badge>
  </div>

  <Separator className="my-5" />
</Card>
```

### Explanation Section

```tsx
<div className="mb-5 rounded-lg p-4 bg-accent/40 border border-accent">
  <div className="flex items-center gap-2 mb-2">
    <BookOpen className="w-4 h-4 text-purple-600" />
    <h5 className="font-semibold">Explanation</h5>
  </div>
  <p className="text-sm leading-relaxed text-muted-foreground">
    {feedback.explanation}
  </p>
</div>
```

### Hints Section

```tsx
<div className="mb-5 rounded-lg p-4 bg-amber-500/10 border border-amber-500/20">
  <div className="flex items-center gap-2 mb-3">
    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    <h5 className="font-semibold text-foreground">Strategic Hints</h5>
  </div>
  <ol className="space-y-3 list-decimal pl-5 marker:text-amber-600 marker:dark:text-amber-400">
    {feedback.hints.map((hint, i) => (
      <li className="text-sm leading-relaxed text-muted-foreground">{hint}</li>
    ))}
  </ol>
</div>
```

### Learning Points Section

```tsx
<div className="mb-5 rounded-lg p-4 bg-emerald-500/10 border border-emerald-500/20">
  <div className="flex items-center gap-2 mb-3">
    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    <h5 className="font-semibold text-foreground">Key Learning Points</h5>
  </div>
  <ul className="space-y-2">
    {feedback.learning_points.map((point, i) => (
      <li className="flex items-start gap-3">
        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        <span className="text-sm leading-relaxed text-muted-foreground">
          {point}
        </span>
      </li>
    ))}
  </ul>
</div>
```

### Key Concepts

```tsx
<div className="flex flex-wrap items-center gap-2">
  <span className="text-xs font-semibold text-muted-foreground">
    Related Concepts:
  </span>
  {feedback.key_concepts.map((concept, i) => (
    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
      {concept}
    </Badge>
  ))}
</div>
```

---

## Custom CSS

### File: `practice-session.css`

```css
/* Question stem styling - make paragraphs display inline */
.question-stem p {
  display: inline !important;
  margin: 0 !important;
}

/* Answer choice label styling - make all text inline */
.answer-choice-label p,
.answer-choice-label span {
  display: inline !important;
  margin: 0 !important;
  font-size: inherit !important;
  font-family: inherit !important;
}

/* Normalize font styling for math expressions */
.question-stem span,
.answer-choice-label span {
  font-family: inherit !important;
  font-size: inherit !important;
}
```

---

## Animations & Transitions

### Common Transitions

- **Duration 200ms**: `transition-all duration-200` - Quick interactions
- **Duration 300ms**: `transition-all duration-300` - Standard transitions
- **Duration 500ms**: `transition-all duration-500` - Smooth animations
- **Duration 700ms**: `transition-all duration-700 ease-out` - Progress animations

### Easing Functions

- **Default**: `ease-in-out`
- **Smooth**: `ease-out` - For progress bars

### Animation Classes

- **Fade In**: `animate-in fade-in`
- **Slide In**: `slide-in-from-bottom-8`, `slide-in-from-bottom-4`
- **Pulse**: `animate-pulse` - For active indicators
- **Spin**: `animate-spin` - For loading spinners

### Scale Effects

- **Hover Scale**: `hover:scale-[1.005]` - Subtle hover
- **Selected Scale**: `scale-[1.01]` - Selected state

### Shimmer Animation (Progress Bar)

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

---

## Spacing System

### Padding

- **xs**: `p-2` (8px)
- **sm**: `p-3` (12px)
- **md**: `p-4` (16px)
- **lg**: `p-6` (24px)
- **xl**: `p-8` (32px)
- **2xl**: `p-12` (48px)

### Gaps

- **xs**: `gap-1` (4px)
- **sm**: `gap-2` (8px)
- **md**: `gap-3` (12px)
- **lg**: `gap-4` (16px)
- **xl**: `gap-6` (24px)

### Margins

- **xs**: `mb-2` (8px)
- **sm**: `mb-3` (12px)
- **md**: `mb-4` (16px)
- **lg**: `mb-6` (24px)
- **xl**: `mb-8` (32px)

---

## Border Radius

- **sm**: `rounded` (4px)
- **md**: `rounded-lg` (8px)
- **lg**: `rounded-xl` (12px)
- **xl**: `rounded-2xl` (16px)
- **full**: `rounded-full` - For pills, badges, buttons

---

## Shadows

- **sm**: `shadow-sm` - Subtle elevation
- **md**: `shadow-md` - Standard elevation
- **xl**: `shadow-xl` - High elevation (sidebars, modals)

---

## Backdrop Effects

- **Blur**: `backdrop-blur-sm`, `backdrop-blur-xl`
- **Background Opacity**: `bg-background/80`, `bg-background/95`
- **Support Check**: `supports-[backdrop-filter]:bg-background/60`

---

## Z-Index Layers

- **Base**: `z-0` (default)
- **Elevated**: `z-20` (sidebars)
- **Top**: `z-50` (headers, footers, modals)

---

## Responsive Breakpoints

- **sm**: `640px` - Small screens
- **md**: `768px` - Medium screens
- **lg**: `1024px` - Large screens

**Example:**

```tsx
<div className="p-8 lg:p-12">{/* Padding increases on large screens */}</div>
```

---

## Accessibility

### Focus States

- **Ring**: `focus:ring-4 focus:ring-primary/10`
- **Border**: `focus:border-primary`

### Disabled States

- **Opacity**: `opacity-50`
- **Cursor**: `cursor-not-allowed`

### Screen Reader Support

- Use semantic HTML elements
- Include `aria-label` attributes where needed
- Maintain proper heading hierarchy

---

## Key Design Principles

1. **Glassmorphism**: Use backdrop blur and semi-transparent backgrounds
2. **Subtle Elevation**: Use shadows and borders for depth
3. **Smooth Transitions**: All interactive elements have transitions
4. **Color Coding**: Consistent color system for states (correct/wrong/selected)
5. **Typography Hierarchy**: Clear distinction between headings, body, and metadata
6. **Spacing Consistency**: Use Tailwind's spacing scale consistently
7. **Responsive Design**: Mobile-first approach with breakpoint adjustments
8. **Dark Mode Support**: All colors have dark mode variants using `dark:` prefix

---

## Component Import Paths

```tsx
import { PracticeHeader } from "@/components/practice/PracticeHeader";
import { PracticeFooter } from "@/components/practice/PracticeFooter";
import { QuestionPanel } from "@/components/practice/QuestionPanel";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { QuestionListSidebar } from "@/components/practice/QuestionListSidebar";
import { ConfidenceRating } from "@/components/practice/ConfidenceRating";
import { AIFeedbackDisplay } from "@/components/practice/AIFeedbackDisplay";
import { TimerConfig } from "@/components/practice/TimerModal";
```

---

## Usage Example

To replicate a similar page:

1. Use the main container structure with `h-screen bg-background flex flex-col overflow-hidden`
2. Implement header with backdrop blur: `bg-background/80 backdrop-blur-xl`
3. Use the three-panel layout (question panel, divider, answer panel)
4. Apply consistent spacing using Tailwind's spacing scale
5. Use the color palette defined above for states
6. Include smooth transitions on all interactive elements
7. Implement the progress bar with shimmer animation
8. Use glassmorphism effects for panels and overlays
9. Follow the typography hierarchy
10. Ensure dark mode support with `dark:` variants

---

_Last Updated: Based on practice session page implementation_

