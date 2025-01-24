"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-border dark:bg-border/50",
        neon: "bg-accent shadow-accent/30",
        gradient: "bg-gradient-to-r from-gradients-primary-start to-gradients-primary-end",
        cyber: "bg-accent/50 shadow-accent/50 backdrop-blur-sm",
        retro: "bg-gradient-to-r from-gradients-primary-start via-accent to-gradients-primary-end bg-[length:200%_100%] animate-gradient",
      },
      glow: {
        true: "animate-pulse-slow",
        false: "",
      },
      pulse: {
        true: "animate-pulse",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      glow: false,
      pulse: false,
    },
  }
)

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant,
  glow,
  pulse,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant, glow, pulse }),
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
