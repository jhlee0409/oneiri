import type React from "react"
import { cn } from "@/lib/utils"

interface GridContainerProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function GridContainer({ children, className, fullWidth = false }: GridContainerProps) {
  if (fullWidth) {
    return <div className={cn("w-full max-w-screen mx-auto", className)}>{children}</div>
  }

  return (
    <div
      className={cn(
        "w-full max-w-container mx-auto",
        "px-grid-margin", // 320px 마진
        className,
      )}
    >
      {children}
    </div>
  )
}
