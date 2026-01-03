"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NumberControlProps {
  label: string
  value: number
  onDecrement: () => void
  onIncrement: () => void
}

export function NumberControl({
  label,
  value,
  onDecrement,
  onIncrement,
}: NumberControlProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2">
      <span className="text-xs text-muted-foreground font-mono md:min-w-[70px] uppercase">{label}</span>
      <div className="flex items-center w-full md:w-auto">
        <Button
          variant="secondary"
          onClick={onDecrement}
          className="flex-1 md:flex-none h-10 w-auto md:h-8 md:w-8 rounded-none rounded-l-md border border-border touch-manipulation p-0 hover:bg-secondary/80"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="flex-1 md:flex-none h-10 w-auto md:h-8 md:w-8 min-w-10 flex items-center justify-center bg-background border-y border-border text-sm font-mono z-10">
          {value}
        </span>
        <Button
          variant="secondary"
          onClick={onIncrement}
          className="flex-1 md:flex-none h-10 w-auto md:h-8 md:w-8 rounded-none rounded-r-md border border-border touch-manipulation p-0 hover:bg-secondary/80"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
