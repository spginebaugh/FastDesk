"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-muted p-1 text-secondary-light dark:text-secondary transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        neon: "bg-background/50 border border-accent shadow-accent/30 backdrop-blur-sm",
        gradient: "bg-gradient-to-r from-gradients-primary-start/10 to-gradients-primary-end/10 backdrop-blur-sm",
        cyber: "bg-background/80 border-2 border-accent shadow-[inset_0_0_15px_rgba(45,226,230,0.2)] backdrop-blur-md",
        retro: "bg-gradient-to-r from-gradients-primary-start/20 via-accent/20 to-gradients-primary-end/20 bg-[length:200%_100%] animate-gradient",
      },
      glow: {
        true: "animate-pulse-slow",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      glow: false,
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted/50 data-[state=active]:bg-background data-[state=active]:text-foreground",
        neon: "hover:text-accent data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-accent/30",
        gradient: "hover:bg-gradient-to-r hover:from-gradients-primary-start/5 hover:to-gradients-primary-end/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gradients-primary-start/20 data-[state=active]:to-gradients-primary-end/20",
        cyber: "hover:bg-accent/5 hover:text-accent data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-accent/30",
        retro: "hover:text-primary data-[state=active]:bg-gradient-to-r data-[state=active]:from-gradients-primary-start/20 data-[state=active]:via-accent/20 data-[state=active]:to-gradients-primary-end/20 data-[state=active]:animate-gradient",
      },
      glow: {
        true: "data-[state=active]:animate-pulse-slow",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      glow: false,
    },
  }
)

const Tabs = TabsPrimitive.Root

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, glow, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, glow }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, glow, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, glow }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
