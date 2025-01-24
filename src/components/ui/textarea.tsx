import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-300 placeholder:text-secondary-light/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        neon: "border-accent text-accent placeholder:text-accent/50 focus-visible:border-accent focus-visible:shadow-accent/30",
        ghost: "border-transparent bg-background/50 focus-visible:bg-background",
        gradient: "border-transparent bg-gradient-to-r from-gradients-primary-start/10 to-gradients-primary-end/10 focus-visible:from-gradients-primary-start/20 focus-visible:to-gradients-primary-end/20",
      },
      glow: {
        true: "focus:animate-glow",
        false: "",
      },
      size: {
        default: "min-h-[60px]",
        sm: "min-h-[40px] text-xs",
        lg: "min-h-[80px] text-base",
        xl: "min-h-[120px] text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, glow, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
