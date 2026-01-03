"use client"

import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NumberControl } from "./number-control"
import type { Block, GridConfig } from "./grid-playground"

export interface EditBlockProps {
  selectedBlock: Block
  gridConfig: GridConfig
  onUpdateBlock: (id: string, updates: Partial<Block>) => void
  onDeleteBlock: (id: string) => void
  onClose: () => void
}

export function EditBlock({
  selectedBlock,
  gridConfig,
  onUpdateBlock,
  onDeleteBlock,
  onClose,
}: EditBlockProps) {
  const maxCol = gridConfig.columns
  const maxRow = gridConfig.rows

  return (
    <div
      className="
        fixed z-50 bg-card duration-200 animate-in
        
        /* Mobile: Bottom sheet styles */
        bottom-0 left-0 right-0 border-t border-border rounded-t-2xl
        slide-in-from-bottom
        
        /* Desktop: Modal styles */
        md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto 
        md:-translate-x-1/2 md:-translate-y-1/2 
        md:w-full md:max-w-md 
        md:border md:rounded-lg md:shadow-lg 
        md:fade-in md:zoom-in-95 md:slide-in-from-bottom-0
      "
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium">Edit Block</h3>
        <button
          onClick={onClose}
          className="h-10 w-10 md:h-8 md:w-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberControl
            label="col-start"
            value={selectedBlock.colStart}
            onDecrement={() =>
              onUpdateBlock(selectedBlock.id, { colStart: Math.max(1, selectedBlock.colStart - 1) })
            }
            onIncrement={() =>
              onUpdateBlock(selectedBlock.id, { colStart: Math.min(maxCol, selectedBlock.colStart + 1) })
            }
          />
          <NumberControl
            label="col-span"
            value={selectedBlock.colSpan}
            onDecrement={() =>
              onUpdateBlock(selectedBlock.id, { colSpan: Math.max(1, selectedBlock.colSpan - 1) })
            }
            onIncrement={() =>
              onUpdateBlock(selectedBlock.id, {
                colSpan: Math.min(maxCol - selectedBlock.colStart + 1, selectedBlock.colSpan + 1),
              })
            }
          />
          <NumberControl
            label="row-start"
            value={selectedBlock.rowStart}
            onDecrement={() =>
              onUpdateBlock(selectedBlock.id, { rowStart: Math.max(1, selectedBlock.rowStart - 1) })
            }
            onIncrement={() =>
              onUpdateBlock(selectedBlock.id, { rowStart: Math.min(maxRow, selectedBlock.rowStart + 1) })
            }
          />
          <NumberControl
            label="row-span"
            value={selectedBlock.rowSpan}
            onDecrement={() =>
              onUpdateBlock(selectedBlock.id, { rowSpan: Math.max(1, selectedBlock.rowSpan - 1) })
            }
            onIncrement={() =>
              onUpdateBlock(selectedBlock.id, {
                rowSpan: Math.min(maxRow - selectedBlock.rowStart + 1, selectedBlock.rowSpan + 1),
              })
            }
          />
        </div>

        <Button
          onClick={() => {
            onDeleteBlock(selectedBlock.id)
            onClose()
          }}
          variant="destructive"
          className="w-full min-h-[44px] md:min-h-10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Block
        </Button>
      </div>

      {/* Safe area spacer for mobile */}
      <div className="md:hidden h-safe-area-inset-bottom" />
    </div>
  )
}
