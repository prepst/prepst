"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: React.ReactNode;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, children, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            checked ? "" : "bg-gray-200",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className
          )}
          style={checked ? { backgroundColor: "#866ffe" } : undefined}
        >
          <span
            className={cn(
              "inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition-transform",
              checked ? "translate-x-5" : "translate-x-0.5"
            )}
          >
            {children}
          </span>
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
