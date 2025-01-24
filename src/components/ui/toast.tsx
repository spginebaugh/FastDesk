import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-secondary bg-background text-primary dark:border-secondary-dark dark:bg-background-alt dark:text-primary-light",
        destructive:
          "group border-semantic-error bg-background text-semantic-error dark:border-semantic-error/50 dark:bg-background-alt dark:text-semantic-error",
        success: "group border-semantic-success bg-background text-semantic-success dark:border-semantic-success/50 dark:bg-background-alt dark:text-semantic-success",
        warning: "group border-semantic-warning bg-background text-semantic-warning dark:border-semantic-warning/50 dark:bg-background-alt dark:text-semantic-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-secondary bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary/10 focus:outline-none focus:ring-1 focus:ring-primary disabled:pointer-events-none disabled:opacity-50",
      "dark:border-secondary-dark dark:hover:bg-secondary-dark/20 dark:focus:ring-primary-light",
      "group-[.destructive]:border-semantic-error/30 group-[.destructive]:hover:border-semantic-error/30 group-[.destructive]:hover:bg-semantic-error/10 group-[.destructive]:hover:text-semantic-error group-[.destructive]:focus:ring-semantic-error",
      "group-[.success]:border-semantic-success/30 group-[.success]:hover:border-semantic-success/30 group-[.success]:hover:bg-semantic-success/10 group-[.success]:hover:text-semantic-success group-[.success]:focus:ring-semantic-success",
      "group-[.warning]:border-semantic-warning/30 group-[.warning]:hover:border-semantic-warning/30 group-[.warning]:hover:bg-semantic-warning/10 group-[.warning]:hover:text-semantic-warning group-[.warning]:focus:ring-semantic-warning",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-secondary-light opacity-0 transition-opacity hover:text-primary focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      "dark:text-secondary-light/80 dark:hover:text-primary-light",
      "group-[.destructive]:text-semantic-error/80 group-[.destructive]:hover:text-semantic-error group-[.destructive]:focus:ring-semantic-error",
      "group-[.success]:text-semantic-success/80 group-[.success]:hover:text-semantic-success group-[.success]:focus:ring-semantic-success",
      "group-[.warning]:text-semantic-warning/80 group-[.warning]:hover:text-semantic-warning group-[.warning]:focus:ring-semantic-warning",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-primary dark:text-primary-light [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-secondary-light dark:text-secondary opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
