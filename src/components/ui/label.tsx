"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), "bg-transparent px-1 pointer-events-none", className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
