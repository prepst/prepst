# QuestionPracticePopup Component Usage Guide

A lightweight, reusable component for practicing individual questions in a popup dialog. Perfect for revision dashboards, question banks, or any place where you want users to practice questions one at a time.

## Overview

The `QuestionPracticePopup` component provides a complete single-question practice experience with:

- Question display with formatting
- Answer selection (MC or SPR)
- Answer validation and correctness checking
- Explanation display (rationale)
- AI-generated feedback (optional)
- Clean, modern UI matching your design system

## Component Location

```
frontend/components/revision/QuestionPracticePopup.tsx
```

## Basic Usage

### 1. Import the Component

```typescript
import { QuestionPracticePopup } from "@/components/revision/QuestionPracticePopup";
import type { SessionQuestion } from "@/lib/types";
```

### 2. Set Up State

```typescript
const [selectedQuestion, setSelectedQuestion] =
  useState<SessionQuestion | null>(null);
const [isPopupOpen, setIsPopupOpen] = useState(false);
```

### 3. Render the Component

```typescript
{
  selectedQuestion && (
    <QuestionPracticePopup
      open={isPopupOpen}
      onOpenChange={setIsPopupOpen}
      question={selectedQuestion}
      onComplete={(isCorrect) => {
        // Handle completion
        console.log("Question answered correctly:", isCorrect);
        setIsPopupOpen(false);
      }}
    />
  );
}
```

## Props Interface

```typescript
interface QuestionPracticePopupProps {
  open: boolean; // Controls popup visibility
  onOpenChange: (open: boolean) => void; // Callback when popup opens/closes
  question: SessionQuestion; // The question to display
  onComplete?: (isCorrect: boolean) => void; // Optional: called when user clicks "Done"
}
```

### Props Details

| Prop           | Type                           | Required | Description                                                        |
| -------------- | ------------------------------ | -------- | ------------------------------------------------------------------ |
| `open`         | `boolean`                      | Yes      | Controls whether the popup dialog is visible                       |
| `onOpenChange` | `(open: boolean) => void`      | Yes      | Callback function called when popup should open/close              |
| `question`     | `SessionQuestion`              | Yes      | The question object to display and practice                        |
| `onComplete`   | `(isCorrect: boolean) => void` | No       | Optional callback when user completes the question (clicks "Done") |

## SessionQuestion Type Structure

The component requires a `SessionQuestion` object with the following structure:

```typescript
{
  session_question_id: string;      // Unique identifier for this question instance
  question: {
    id: string;                      // Question ID
    stem: string;                    // Question text (can include HTML/MathML)
    question_type: "mc" | "spr";    // Question type: multiple choice or student-produced response
    answer_options?: Record<string, any> | null;  // For MC: options like {"a": "...", "b": "..."}
    correct_answer: string[];        // Array of correct answers
    acceptable_answers?: string[] | null;  // Alternative acceptable answers (for SPR)
    rationale?: string | null;       // Explanation/rationale (can be HTML)
    difficulty?: string;             // Question difficulty
    // ... other question fields
  };
  topic: {
    id: string;                      // Topic ID
    name: string;                    // Topic name
    category_id?: string;            // Optional category ID
    weight_in_category?: number;     // Optional weight
  };
  status?: "not_started" | "in_progress" | "answered";  // Question status
  display_order?: number;           // Display order
  user_answer?: string[] | null;     // Previous user answer (if any)
  is_saved?: boolean;               // Whether question is saved/bookmarked
}
```

## Data Transformation Examples

### Example 1: From WrongAnswer or SavedQuestion

```typescript
const transformToSessionQuestion = (
  item: WrongAnswer | SavedQuestion
): SessionQuestion | null => {
  if (!item.question || !item.topic) {
    return null;
  }
  return {
    session_question_id: item.session_question_id,
    question: item.question as any,
    topic: {
      id: item.topic.id,
      name: item.topic.name,
      category_id: item.topic.category || "",
      weight_in_category: 0,
    } as any,
    status:
      item.user_answer && item.user_answer.length > 0
        ? "answered"
        : "not_started",
    display_order: 0,
    user_answer: item.user_answer,
    is_saved: "is_correct" in item ? false : true,
  } as SessionQuestion;
};
```

### Example 2: From a Question Bank

```typescript
const transformQuestionToSessionQuestion = (
  question: Question,
  topic: Topic
): SessionQuestion => {
  return {
    session_question_id: `temp-${question.id}`,
    question: question,
    topic: {
      id: topic.id,
      name: topic.name,
      category_id: topic.category_id || "",
      weight_in_category: 0,
    },
    status: "not_started",
    display_order: 0,
    user_answer: null,
    is_saved: false,
  };
};
```

## Complete Example

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionPracticePopup } from "@/components/revision/QuestionPracticePopup";
import type { SessionQuestion } from "@/lib/types";

export function MyQuestionList() {
  const [selectedQuestion, setSelectedQuestion] =
    useState<SessionQuestion | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Your question data
  const questions: SessionQuestion[] = [
    // ... your questions
  ];

  const handleQuestionClick = (question: SessionQuestion) => {
    setSelectedQuestion(question);
    setIsPopupOpen(true);
  };

  const handleComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      // Remove from list, show success message, etc.
      console.log("Great job! Question answered correctly.");
    } else {
      console.log("Keep practicing!");
    }
    setIsPopupOpen(false);
    setSelectedQuestion(null);
  };

  return (
    <div>
      <h2>Practice Questions</h2>
      <div className="space-y-4">
        {questions.map((question) => (
          <Button
            key={question.session_question_id}
            onClick={() => handleQuestionClick(question)}
          >
            Practice Question
          </Button>
        ))}
      </div>

      {/* The popup component */}
      {selectedQuestion && (
        <QuestionPracticePopup
          open={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          question={selectedQuestion}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
```

## Features

### ✅ What the Component Handles

- **Question Display**: Renders question stem with proper formatting (HTML/MathML support)
- **Answer Selection**:
  - Multiple choice (MC) with visual option selection
  - Student-produced response (SPR) with text input
- **Answer Validation**: Automatically checks if answer is correct
- **Feedback Display**: Shows correct/incorrect feedback with styling
- **Explanation**: Displays question rationale/explanation
- **AI Feedback**: Generates personalized AI feedback via API (optional)
- **State Management**: Manages all internal state (answer, feedback, loading)
- **UI Interactions**: Handles all button clicks and user interactions

### 🎨 UI Features

- Responsive dialog layout
- Question panel on the left, answer panel on the right
- Check Answer button (orange styling)
- Explanation button (outline style)
- AI Explanation button (purple styling)
- Done button (appears after feedback)
- Loading states for AI feedback generation
- Smooth animations and transitions

## Common Use Cases

### 1. Revision Dashboard

```typescript
// Show missed questions in a popup
const handleMissedQuestionClick = (wrongAnswer: WrongAnswer) => {
  const sessionQuestion = transformToSessionQuestion(wrongAnswer);
  if (sessionQuestion) {
    setSelectedQuestion(sessionQuestion);
    setIsPopupOpen(true);
  }
};
```

### 2. Question Bank Browser

```typescript
// Browse and practice questions from a question bank
const handleBrowseQuestion = (question: Question) => {
  const sessionQuestion = transformQuestionToSessionQuestion(question, topic);
  setSelectedQuestion(sessionQuestion);
  setIsPopupOpen(true);
};
```

### 3. Saved Questions Review

```typescript
// Review bookmarked/saved questions
const handleSavedQuestionClick = (savedQuestion: SavedQuestion) => {
  const sessionQuestion = transformToSessionQuestion(savedQuestion);
  if (sessionQuestion) {
    setSelectedQuestion(sessionQuestion);
    setIsPopupOpen(true);
  }
};
```

### 4. Quick Practice from Search Results

```typescript
// Practice questions from search results
const handleSearchResultClick = (searchResult: SearchResult) => {
  const sessionQuestion = {
    session_question_id: `search-${searchResult.id}`,
    question: searchResult.question,
    topic: searchResult.topic,
    status: "not_started",
    display_order: 0,
  };
  setSelectedQuestion(sessionQuestion);
  setIsPopupOpen(true);
};
```

## Answer Handling

### Multiple Choice Questions

- User selects an option (A, B, C, D, etc.)
- Component converts option ID to label for comparison
- Validates against correct_answer array
- Shows visual feedback (green for correct, red for incorrect)

### Student-Produced Response Questions

- User types their answer in a text input
- Component normalizes and compares the answer
- Supports multiple acceptable answers
- Case-insensitive comparison

## Callback Usage

### onComplete Callback

The `onComplete` callback receives a boolean indicating if the answer was correct:

```typescript
onComplete={(isCorrect) => {
  if (isCorrect) {
    // Remove from "missed questions" list
    removeFromMissedQuestions(question.session_question_id);

    // Show success message
    toast.success("Great job! Question answered correctly.");

    // Update statistics
    incrementCorrectAnswers();
  } else {
    // Keep in list, show encouragement
    toast.info("Keep practicing!");
  }

  // Close popup
  setIsPopupOpen(false);
  setSelectedQuestion(null);
}}
```

## Dependencies

The component uses these dependencies (already available in your project):

- `@/components/ui/dialog` - Dialog component
- `@/components/ui/button` - Button component
- `@/components/practice/QuestionPanel` - Question display
- `@/components/practice/AnswerPanel` - Answer selection
- `@/components/practice/AIFeedbackDisplay` - AI feedback display
- `@/lib/types` - TypeScript types
- `@/lib/config` - API configuration
- `@/lib/supabase` - Supabase client for AI feedback API

## Styling

The component uses your existing design system:

- Tailwind CSS classes
- Shadcn/ui components
- Consistent with `prepstyle.md` guidelines
- Responsive design (mobile-friendly)
- Dark mode support

## Notes

1. **Self-Contained**: The component manages all its own internal state
2. **No External Dependencies**: Works independently without requiring parent state management
3. **Reusable**: Can be used anywhere in your app
4. **Type-Safe**: Full TypeScript support with proper types
5. **Error Handling**: Includes error handling for API calls and edge cases

## Troubleshooting

### Question not displaying?

- Ensure `question.question.stem` is not null/undefined
- Check that `question.topic` exists

### Answer validation not working?

- Verify `question.question.correct_answer` is an array
- For MC questions, ensure `answer_options` is properly formatted
- Check browser console for errors

### Popup not opening?

- Ensure `open` prop is `true`
- Check that `onOpenChange` callback is working
- Verify `question` prop is not null

### AI feedback not loading?

- Check API configuration in `@/lib/config`
- Verify Supabase client is properly initialized
- Check network tab for API errors

## See Also

- `frontend/app/dashboard/revision/page.tsx` - Example usage in revision dashboard
- `frontend/components/practice/QuestionPanel.tsx` - Question display component
- `frontend/components/practice/AnswerPanel.tsx` - Answer selection component





