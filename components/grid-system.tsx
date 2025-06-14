import type React from "react"
import { cn } from "@/lib/utils"

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: number
  gap?: string
}

export function Grid({ children, className, cols = 12, gap = "gap-grid" }: GridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-oneiri", // 12컬럼 그리드
        gap, // 24px 거터
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ColProps {
  children: React.ReactNode
  span: number
  start?: number
  className?: string
}

export function Col({ children, span, start, className }: ColProps) {
  const colSpan = `col-span-${span}`
  const colStart = start ? `col-start-${start}` : ""

  return <div className={cn(colSpan, colStart, className)}>{children}</div>
}
