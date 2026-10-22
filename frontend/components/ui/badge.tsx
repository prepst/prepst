import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-[#9ed4f3] bg-[#d7eefb] text-[#0c3d5c] dark:border-[#1d9bf0]/45 dark:bg-[#1d9bf0]/20 dark:text-[#d7eefb]",
        secondary:
          "border-[#e1e8ed] bg-[#f7f9f9] text-[#0f1419] dark:border-white/15 dark:bg-white/10 dark:text-[#e7e9ea]",
        destructive:
          "border-[#f7b3b8] bg-[#fde8ea] text-[#9f1239] dark:border-[#f4212e]/40 dark:bg-[#f4212e]/15 dark:text-[#ffd0d4]",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
