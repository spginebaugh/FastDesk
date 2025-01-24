import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-background px-3 py-1 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-light/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
        default: "h-9",
        sm: "h-8 text-xs",
        lg: "h-10 text-base",
        xl: "h-12 text-lg px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, glow, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
