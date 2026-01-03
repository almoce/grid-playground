import type { GridConfig } from "./grid-playground"

interface GridOverlayProps {
  config: GridConfig
}

export function GridOverlay({ config }: GridOverlayProps) {
  const totalCells = config.columns * config.rows

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
      }}
    >
      {Array.from({ length: totalCells }).map((_, i) => {
        const row = Math.floor(i / config.columns) + 1
        const col = (i % config.columns) + 1
        return (
          <div key={i} className="border border-border/30 flex items-center justify-center">
            <span className="text-[8px] md:text-[10px] text-muted-foreground/30 font-mono select-none hidden md:block">
              {row},{col}
            </span>
          </div>
        )
      })}
    </div>
  )
}
