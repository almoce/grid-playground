"use client"

import type { Block, GridConfig } from "./grid-playground"
import { Copy, Check, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CodePanelProps {
  blocks: Block[]
  onClose: () => void
  gridConfig: GridConfig
}

export function CodePanel({ blocks, onClose, gridConfig }: CodePanelProps) {
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<"tailwind" | "css">("tailwind")

  const generateTailwindCode = () => {
    const gridClasses = [
      "grid",
      `grid-cols-${gridConfig.columns}`,
      `grid-rows-${gridConfig.rows}`,
      gridConfig.gutter > 0 ? `gap-${gridConfig.gutter}` : null,
    ]
      .filter(Boolean)
      .join(" ")

    const blockDivs = blocks
      .map((block, index) => {
        const classes = `col-start-${block.colStart} col-span-${block.colSpan} row-start-${block.rowStart} row-span-${block.rowSpan}`
        return `  <div className="${classes}">
    Block ${index + 1}
  </div>`
      })
      .join("\n")

    return `<div className="${gridClasses}">
${blockDivs}
</div>`
  }

  const generateCssCode = () => {
    const gap = gridConfig.gutter * 4 // Assuming 4px scale
    const containerStyle = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${gridConfig.columns}, 1fr);
  grid-template-rows: repeat(${gridConfig.rows}, 1fr);
  gap: ${gap}px;
  width: 100%;
  height: 100%;
}`

    const blockStyles = blocks.map((block, index) => {
      return `.block-${index + 1} {
  grid-column: ${block.colStart} / span ${block.colSpan};
  grid-row: ${block.rowStart} / span ${block.rowSpan};
}`
    }).join("\n")

    const htmlBlocks = blocks.map((_, index) => `  <div class="block-${index + 1}">Block ${index + 1}</div>`).join("\n")

    return `<style>
${containerStyle}
${blockStyles}
</style>

<div class="grid-container">
${htmlBlocks}
</div>`
  }

  const code = mode === "tailwind" ? generateTailwindCode() : generateCssCode()

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 h-[70vh] md:relative md:inset-auto md:h-auto md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col z-50 md:z-auto rounded-t-2xl md:rounded-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-foreground">Generated Code</h2>
          <div className="flex p-0.5 bg-secondary rounded-lg">
            <button
              onClick={() => setMode("tailwind")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                mode === "tailwind"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tailwind
            </button>
            <button
              onClick={() => setMode("css")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                mode === "css"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CSS/HTML
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 min-h-[44px] md:min-h-0 px-3 md:px-2 py-1 text-sm md:text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 md:h-3.5 md:w-3.5 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 md:h-3.5 md:w-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-secondary md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm md:text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </div>

      {/* Quick Reference - updated with dynamic config */}
      <div className="border-t border-border px-4 py-3">
        <h3 className="text-sm md:text-xs font-medium text-foreground mb-2">Grid Container</h3>
        <div className="space-y-1.5 text-sm md:text-xs text-muted-foreground font-mono mb-3">
          <p>
            <span className="text-foreground">grid-cols-{gridConfig.columns}</span> — {gridConfig.columns} columns
          </p>
          <p>
            <span className="text-foreground">grid-rows-{gridConfig.rows}</span> — {gridConfig.rows} rows
          </p>
          {gridConfig.gutter > 0 && (
            <p>
              <span className="text-foreground">gap-{gridConfig.gutter}</span> — {gridConfig.gutter * 4}px gutter
            </p>
          )}
        </div>

        <h3 className="text-sm md:text-xs font-medium text-foreground mb-2">Block Classes</h3>
        <div className="space-y-1.5 text-sm md:text-xs text-muted-foreground font-mono">
          <p>
            <span className="text-foreground">col-start-{"{n}"}</span> — Start at column n
          </p>
          <p>
            <span className="text-foreground">col-span-{"{n}"}</span> — Span n columns
          </p>
          <p>
            <span className="text-foreground">row-start-{"{n}"}</span> — Start at row n
          </p>
          <p>
            <span className="text-foreground">row-span-{"{n}"}</span> — Span n rows
          </p>
        </div>
      </div>

      {/* Safe area for iOS */}
      <div className="pb-safe" />
    </div>
  )
}
