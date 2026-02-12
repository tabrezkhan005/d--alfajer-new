"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/src/lib/utils"

const containerVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      mode: {
        default: "relative inline-flex",
        fullscreen: "fixed inset-0 z-[9999] h-screen w-screen bg-background/80 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      mode: "default",
    },
  }
)

const spinnerVariants = cva(
  "relative flex items-center justify-center",
  {
    variants: {
      size: {
        xs: "w-4 h-4",
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
        "2xl": "w-24 h-24",
      },
      variant: {
        default: "text-primary",
        primary: "text-primary",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants>, VariantProps<typeof containerVariants> {}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size, variant, mode, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ mode }), className)}
        {...props}
      >
        <motion.div
          className={cn(
            "rounded-full border-[3px] border-t-transparent border-current", // Simple spinner border
            spinnerVariants({ size, variant })
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    )
  }
)
Loader.displayName = "Loader"

// Simple, minimal full page loader
const FullPageLoader = () => {
    return (
        <Loader mode="fullscreen" size="xl" />
    )
}

export { Loader, FullPageLoader, spinnerVariants, containerVariants }
