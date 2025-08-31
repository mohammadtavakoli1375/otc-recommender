import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200",
        ghost: "hover:bg-gray-50",
        login: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-blue-500",
        register: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-green-500",
      },
      size: {
        sm: "h-9 px-3 rounded-lg",
        md: "h-10 px-4 rounded-xl",
        lg: "h-12 px-6 text-base rounded-2xl",
        auth: "h-14 px-8 text-lg rounded-2xl font-semibold"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "lg"
    }
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
