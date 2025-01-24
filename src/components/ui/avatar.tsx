"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "ring-2 ring-border bg-muted",
        outline: "ring-2 ring-border bg-background",
        neon: "ring-2 ring-accent bg-background shadow-accent/30",
        gradient: "bg-gradient-to-r from-gradients-primary-start to-gradients-primary-end p-[2px]",
      },
      size: {
        default: "h-10 w-10",
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
      glow: {
        true: "hover:animate-glow",
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

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, variant, size, glow, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ variant, size, glow, className }))}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full rounded-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted/50 font-medium text-secondary-light dark:text-secondary",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback } 