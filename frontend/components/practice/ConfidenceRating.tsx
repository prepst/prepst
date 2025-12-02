"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface ConfidenceRatingProps {
  onSelect: (confidence: number) => void;
  defaultScore?: number;
}

export function ConfidenceRating({
  onSelect,
  defaultScore = 3,
}: ConfidenceRatingProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const ratings = [
    { value: 1, label: "Guessing", color: "text-red-500" },
    { value: 2, label: "Unsure", color: "text-orange-500" },
    { value: 3, label: "Somewhat Sure", color: "text-yellow-500" },
    { value: 4, label: "Confident", color: "text-green-500" },
    { value: 5, label: "Very Confident", color: "text-blue-500" },
  ];

  const handleSelect = (value: number) => {
    setSelectedRating(value);
    onSelect(value);
  };

  return (
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
            key={rating.value}
            onClick={() => handleSelect(rating.value)}
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

      <p className="text-xs text-muted-foreground mt-2">
        Default: {defaultScore} -{" "}
        {ratings.find((r) => r.value === defaultScore)?.label}
      </p>
    </div>
  );
}
