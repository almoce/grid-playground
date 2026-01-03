"use client"

import type { GridConfig } from "./grid-playground"
import { X, Minus, Plus } from "lucide-react"

interface GridSettingsProps {
  config: GridConfig
  onConfigChange: (config: GridConfig) => void
  onClose: () => void
}

const GUTTER_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12]

function NumberControl({
  label,
  sublabel,
  value,
  min,
  max,
  onDecrement,
  onIncrement,
}: {
  label: string
  sublabel?: string
  value: number
  min: number
  max: number
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center">
        <button
          onClick={onDecrement}
          disabled={value <= min}
          className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-l-md bg-secondary hover:bg-secondary/80 border border-border active:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="h-11 w-12 md:h-9 md:w-10 flex items-center justify-center bg-background border-y border-border text-sm font-mono">
          {value}
        </span>
        <button
          onClick={onIncrement}
          disabled={value >= max}
          className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-r-md bg-secondary hover:bg-secondary/80 border border-border active:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function GridSettings({ config, onConfigChange, onClose }: GridSettingsProps) {
  const updateConfig = (updates: Partial<GridConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 h-auto md:relative md:inset-auto md:h-auto md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col z-50 md:z-auto rounded-t-2xl md:rounded-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Grid Settings</h2>
        <button
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-secondary md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 divide-y divide-border">
        <NumberControl
          label="Columns"
          sublabel="grid-cols-{n}"
          value={config.columns}
          min={1}
          max={24}
          onDecrement={() => updateConfig({ columns: Math.max(1, config.columns - 1) })}
          onIncrement={() => updateConfig({ columns: Math.min(24, config.columns + 1) })}
        />

        <NumberControl
          label="Rows"
          sublabel="grid-rows-{n}"
          value={config.rows}
          min={1}
          max={24}
          onDecrement={() => updateConfig({ rows: Math.max(1, config.rows - 1) })}
          onIncrement={() => updateConfig({ rows: Math.min(24, config.rows + 1) })}
        />

        {/* Gutter / Gap control */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-medium text-foreground">Gutter</span>
              <p className="text-xs text-muted-foreground mt-0.5">gap-{config.gutter}</p>
            </div>
            <code className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
              {config.gutter === 0 ? "0px" : `${config.gutter * 4}px`}
            </code>
          </div>
          <div className="flex flex-wrap gap-2">
            {GUTTER_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => updateConfig({ gutter: g })}
                className={`h-11 w-11 md:h-9 md:w-9 flex items-center justify-center rounded-md text-sm font-mono transition-colors ${
                  config.gutter === g
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Preview section */}
        <div className="py-4">
          <span className="text-sm font-medium text-foreground mb-3 block">Preview Classes</span>
          <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs text-muted-foreground space-y-1">
            <p>
              <span className="text-foreground">grid-cols-{config.columns}</span>
            </p>
            <p>
              <span className="text-foreground">grid-rows-{config.rows}</span>
            </p>
            {config.gutter > 0 && (
              <p>
                <span className="text-foreground">gap-{config.gutter}</span>
              </p>
            )}
          </div>
        </div>

        {/* Presets */}
        <div className="py-4">
          <span className="text-sm font-medium text-foreground mb-3 block">Presets</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateConfig({ columns: 12, rows: 12, gutter: 0 })}
              className="h-11 md:h-9 px-3 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              12×12
            </button>
            <button
              onClick={() => updateConfig({ columns: 12, rows: 6, gutter: 4 })}
              className="h-11 md:h-9 px-3 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              12×6 + gap
            </button>
            <button
              onClick={() => updateConfig({ columns: 4, rows: 4, gutter: 2 })}
              className="h-11 md:h-9 px-3 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              4×4
            </button>
            <button
              onClick={() => updateConfig({ columns: 3, rows: 3, gutter: 4 })}
              className="h-11 md:h-9 px-3 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              3×3
            </button>
          </div>
        </div>
      </div>

      {/* Safe area for iOS */}
      <div className="pb-safe" />
    </div>
  )
}
