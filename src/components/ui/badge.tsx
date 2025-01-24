import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-secondary/50",
        destructive:
          "bg-semantic-error text-white hover:bg-semantic-error/80 hover:shadow-semantic-error/50",
        success:
          "bg-semantic-success text-white hover:bg-semantic-success/80 hover:shadow-semantic-success/50",
        warning:
          "bg-semantic-warning text-background hover:bg-semantic-warning/80 hover:shadow-semantic-warning/50",
        outline: 
          "border-2 border-border bg-background text-foreground hover:border-accent hover:text-accent hover:shadow-accent/30",
        neon:
          "border-2 border-accent bg-background text-accent hover:bg-accent/10 hover:shadow-accent/50",
        ghost:
          "bg-background/50 text-foreground hover:bg-accent/10 hover:text-accent",
        gradient:
          "bg-gradient-to-r from-gradients-primary-start to-gradients-primary-end text-white hover:shadow-primary/50",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
      glow: {
        true: "animate-glow",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, glow, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, glow }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 