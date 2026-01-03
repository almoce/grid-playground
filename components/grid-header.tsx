"use client"

import { Code, TableColumnsSplit } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GridConfig } from "./grid-playground"

interface GridHeaderProps {
  gridConfig: GridConfig
  showSettings: boolean
  showCode: boolean
  onToggleSettings: () => void
  onToggleCode: () => void
}

export function GridHeader({
  gridConfig,
  showSettings,
  showCode,
  onToggleSettings,
  onToggleCode,
}: GridHeaderProps) {
  return (
    <header className="border-b border-border px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 md:h-6 md:w-6 text-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <h1 className="text-base md:text-lg font-semibold text-foreground">
              <span className="md:hidden">Grid</span>
              <span className="hidden md:inline">Grid Playground</span>
            </h1>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md font-mono">
            {gridConfig.columns}×{gridConfig.rows}
            {gridConfig.gutter > 0 && <span className="text-foreground/60">gap-{gridConfig.gutter}</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleSettings}
            variant={showSettings ? "default" : "secondary"}
            className="min-h-[44px] gap-2"
          >
            <TableColumnsSplit className="h-4 w-4"/> 
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            onClick={onToggleCode}
            variant={showCode ? "default" : "secondary"}
            className="min-h-[44px] gap-2"
          >
            <Code className="h-4 w-4"/> 
            <span className="hidden sm:inline">Code</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
