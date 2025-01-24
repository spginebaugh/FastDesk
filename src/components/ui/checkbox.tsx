"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "border-primary bg-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        neon: "border-accent bg-background data-[state=checked]:border-accent data-[state=checked]:bg-accent/10 data-[state=checked]:text-accent data-[state=checked]:shadow-accent/30",
        gradient: "border-transparent bg-gradient-to-r from-gradients-primary-start to-gradients-primary-end data-[state=checked]:from-gradients-primary-start data-[state=checked]:to-gradients-primary-end data-[state=checked]:text-white",
      },
      glow: {
        true: "data-[state=checked]:animate-glow",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      glow: false,
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, glow, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, glow }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
